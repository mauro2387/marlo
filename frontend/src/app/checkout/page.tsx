'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ordersAPI, zonesAPI } from '@/lib/api-optimized';
import { couponsDB, usersDB, authDB, productsDB, ordersDB } from '@/lib/supabase-fetch';
import { generateOrderCode } from '@/utils/validators';
import { createPaymentPreference, buildPreferenceFromOrder } from '@/services/mercadopago';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';

// Importar MapLocationPicker dinámicamente para evitar SSR
const MapLocationPicker = dynamic(
  () => import('@/components/MapLocationPicker'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-lg p-8 text-center" style={{ height: '400px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2 mt-32"></div>
        <p className="text-gray-600 text-sm">Cargando mapa...</p>
      </div>
    )
  }
);

// Departamentos de Uruguay
const departamentos = [
  'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores',
  'Florida', 'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro',
  'Rivera', 'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
];

// Zonas de Maldonado para delivery
const zonasMaldonado = [
  'Centro', 'Punta del Este', 'La Barra', 'Manantiales', 'José Ignacio',
  'San Carlos', 'Piriápolis', 'Pan de Azúcar', 'Aiguá', 'Otro'
];

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  departamento: string;
  zona: string;
  direccion: string;
  referencias: string;
  notas: string;
  aliasTransferencia: string;
  mapsLink?: string;
}

interface FormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  departamento?: string;
  zona?: string;
  direccion?: string;
  aliasTransferencia?: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  cost: number;
  estimated_time: string;
  available: boolean;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  // Detectar si es canje de puntos
  const esCanjePuntos = searchParams.get('metodo') === 'puntos' || searchParams.get('puntos') === 'true';
  const canjeItem = esCanjePuntos ? items.find(item => item.esCanjeoPuntos) : null;
  const puntosUsados = canjeItem?.puntosRequeridos || 0;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mercadopago' | 'puntos'>(esCanjePuntos ? 'puntos' : 'efectivo');
  const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'retiro'>('delivery');
  
  // Límite de pedidos pendientes
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  const LIMITE_PEDIDOS_PENDIENTES = 2;
  
  // Cupones
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState<{ id: string; code: string; discount: number; usos_actuales: number; esEnvioGratis?: boolean } | null>(null);
  const [cuponError, setCuponError] = useState('');
  const [validandoCupon, setValidandoCupon] = useState(false);
  
  // Delivery
  const [zonasDelivery, setZonasDelivery] = useState<DeliveryZone[]>([]);
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number; address: string; zona?: string } | null>(null);
  
  // Form
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    departamento: 'Maldonado',
    zona: '',
    direccion: '',
    referencias: '',
    notas: '',
    aliasTransferencia: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const init = async () => {
      // Redirigir si carrito vacío
      if (items.length === 0) {
        router.push('/carrito');
        return;
      }
      
      // Pre-llenar datos del usuario
      if (user) {
        setFormData(prev => ({
          ...prev,
          nombre: user.nombre || '',
          email: user.email || '',
          telefono: user.telefono || ''
        }));
        
        // Verificar pedidos pendientes del usuario
        const { count } = await ordersDB.getPendingPaymentOrdersCount(user.id);
        setPedidosPendientes(count);
        
        // Si tiene el límite alcanzado, cambiar método de pago a mercadopago
        if (count >= 2 && !esCanjePuntos) {
          setMetodoPago('mercadopago');
        }
      }
      
      // Cargar zonas de delivery - OPTIMIZADO con caché
      const zones = await zonesAPI.getAll();
      setZonasDelivery(zones);
      
      setLoading(false);
    };
    
    init();
  }, [items, user, router]);

  // Actualizar costo de envío cuando cambia la zona
  useEffect(() => {
    if (tipoEntrega === 'retiro') {
      setCostoEnvio(0);
      return;
    }
    
    const zona = zonasDelivery.find(z => z.name === formData.zona);
    if (zona) {
      setCostoEnvio(zona.cost);
    } else {
      setCostoEnvio(0);
    }
  }, [formData.zona, tipoEntrega, zonasDelivery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLocationChange = (location: { lat: number; lng: number; address: string; zona?: string; mapsLink?: string }) => {
    setUbicacion(location);
    if (location.zona) {
      setFormData(prev => ({ 
        ...prev, 
        zona: location.zona || '', 
        direccion: location.address,
        ...(location.mapsLink && { mapsLink: location.mapsLink })
      }));
      const zonaSeleccionada = zonasDelivery.find(z => z.name === location.zona);
      if (zonaSeleccionada) {
        setCostoEnvio(zonaSeleccionada.cost);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^(\+598|0)?9\d{7}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Formato: 09X XXX XXX o +598 9X XXX XXX';
    }
    
    if (tipoEntrega === 'delivery') {
      if (!formData.departamento) {
        newErrors.departamento = 'Selecciona un departamento';
      }
      
      if (formData.departamento === 'Maldonado' && !formData.zona) {
        newErrors.zona = 'Selecciona una zona';
      }
      
      // Bloquear si está fuera de zona
      if (formData.zona === 'Otro') {
        newErrors.zona = 'Tu ubicación está fuera de nuestras zonas. Consulta por WhatsApp.';
      }
      
      if (!formData.direccion.trim()) {
        newErrors.direccion = 'La dirección es requerida';
      }
    }
    
    // Validar alias de transferencia si el método es transferencia
    if (metodoPago === 'transferencia' && !formData.aliasTransferencia.trim()) {
      newErrors.aliasTransferencia = 'El alias de tu cuenta es requerido para confirmar la transferencia';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validarCupon = async () => {
    if (!codigoCupon.trim()) return;
    
    setValidandoCupon(true);
    setCuponError('');
    
    try {
      const { data: coupon, error } = await couponsDB.getByCode(codigoCupon.toUpperCase());
      
      if (error || !coupon) {
        setCuponError('Cupón inválido');
        return;
      }
      
      // Verificar fecha de expiración
      if (coupon.valido_hasta && new Date(coupon.valido_hasta) < new Date()) {
        setCuponError('Cupón expirado');
        return;
      }
      
      // Verificar límite de usos global
      if (coupon.max_usos !== null && coupon.usos_actuales >= coupon.max_usos) {
        setCuponError('Este cupón ya alcanzó su límite de usos');
        return;
      }
      
      // Verificar si el usuario ya usó este cupón
      if (user?.id) {
        const { hasUsed } = await couponsDB.checkUserUsage(coupon.id, user.id);
        if (hasUsed) {
          setCuponError('Ya utilizaste este cupón anteriormente');
          return;
        }
      }
      
      // Verificar monto mínimo
      if (coupon.minimo && subtotal < coupon.minimo) {
        setCuponError(`Monto mínimo: $${coupon.minimo.toLocaleString()}`);
        return;
      }
      
      // Calcular descuento
      let descuento = 0;
      if (coupon.tipo === 'porcentaje') {
        descuento = Math.round(subtotal * coupon.valor / 100);
      } else {
        descuento = coupon.valor;
      }
        
      setCuponAplicado({ 
        id: coupon.id,
        code: codigoCupon.toUpperCase(), 
        discount: descuento,
        usos_actuales: coupon.usos_actuales || 0
      });
    } catch (err) {
      setCuponError('Error al validar cupón');
    } finally {
      setValidandoCupon(false);
    }
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
    setCodigoCupon('');
  };

  // Cálculos
  const subtotal = esCanjePuntos ? 0 : getSubtotal(); // Si es canje, subtotal es 0
  const descuentoCupon = cuponAplicado?.discount || 0;
  const envioGratis = cuponAplicado?.esEnvioGratis || false;
  const costoEnvioFinal = envioGratis ? 0 : costoEnvio;
  const totalSinEnvio = subtotal - descuentoCupon;
  
  // Recargo 10% para MercadoPago
  const recargoMP = metodoPago === 'mercadopago' ? Math.round((totalSinEnvio + costoEnvioFinal) * 0.10) : 0;
  
  const total = esCanjePuntos ? costoEnvioFinal : totalSinEnvio + costoEnvioFinal + recargoMP; // Solo costo envío si es canje
  const puntosAGanar = esCanjePuntos ? 0 : Math.floor(total - recargoMP); // No gana puntos del recargo ni en canjes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar autenticación antes de procesar
    if (!isAuthenticated || !user) {
      alert('Debes iniciar sesión para realizar un pedido');
      router.push('/login?redirect=/checkout');
      return;
    }
    
    // Verificar límite de pedidos pendientes para efectivo/transferencia
    if ((metodoPago === 'efectivo' || metodoPago === 'transferencia') && pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES) {
      alert(`Ya tienes ${pedidosPendientes} pedidos pendientes con pago en efectivo o transferencia.\n\nDebes esperar a que al menos uno sea entregado antes de hacer un nuevo pedido con este método de pago.\n\nPuedes usar MercadoPago para pagar ahora.`);
      return;
    }
    
    // Verificar puntos suficientes si es canje
    if (esCanjePuntos && puntosUsados > 0) {
      const puntosActuales = user.puntos || 0;
      if (puntosActuales < puntosUsados) {
        alert(`No tienes suficientes puntos. Tienes ${puntosActuales} y necesitas ${puntosUsados}.`);
        setSubmitting(false);
        return;
      }
    }
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // Verificar stock de productos (solo para productos con ID válido, no boxes personalizadas ni canjes)
      for (const item of items) {
        if (item.id && !item.id.startsWith('box-') && !item.id.startsWith('canje-') && !item.esCanjeoPuntos) {
          const { data: product } = await productsDB.getById(item.id);
          if (product && product.stock !== null && product.stock < item.cantidad) {
            alert(`Lo sentimos, no hay suficiente stock de "${item.nombre}". Stock disponible: ${product.stock}`);
            setSubmitting(false);
            return;
          }
        }
      }
      
      // Formatear teléfono para Uruguay
      let telefonoFormateado = formData.telefono.replace(/\s/g, '');
      if (telefonoFormateado.startsWith('0')) {
        telefonoFormateado = '+598' + telefonoFormateado.substring(1);
      } else if (!telefonoFormateado.startsWith('+598')) {
        telefonoFormateado = '+598' + telefonoFormateado;
      }
      
      // Crear pedido usando ordersAPI (maneja esquema correcto)
      const orderData = {
        subtotal: subtotal,
        shipping_cost: costoEnvioFinal,
        discount_coupon: descuentoCupon,
        discount_points: esCanjePuntos ? puntosUsados : 0,
        total: total,
        payment_method: metodoPago,
        // Si es MercadoPago, empezar como pendiente_pago hasta que se confirme el pago
        estado: metodoPago === 'mercadopago' ? 'pendiente_pago' : undefined,
        address: tipoEntrega === 'delivery' ? formData.direccion : 'Retiro en local',
        zone: formData.zona || 'Maldonado',
        department: formData.departamento || 'Maldonado',
        latitud: ubicacion?.lat || null,
        longitud: ubicacion?.lng || null,
        notes: esCanjePuntos ? `🎁 CANJE DE PUNTOS: ${canjeItem?.nombre}. ${formData.notas || ''}`.trim() : (formData.notas || null),
        points_earned: puntosAGanar, // Los puntos se suman cuando admin marca entregado
        points_used: esCanjePuntos ? puntosUsados : 0,
        delivery_type: tipoEntrega,
        customer_name: formData.nombre,
        customer_phone: telefonoFormateado,
        customer_email: formData.email,
        transfer_alias: metodoPago === 'transferencia' ? formData.aliasTransferencia : null,
        items: items.map(item => ({
          product_id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
          // Guardar cookies incluidas si es una box
          cookies_incluidas: item.cookiesIncluidas ? JSON.stringify(item.cookiesIncluidas) : null
        }))
      };
      
      const order = await ordersAPI.create(orderData) as any;
      
      if (!order?.id) {
        throw new Error('No se pudo crear el pedido');
      }
      
      // Registrar uso del cupón si se aplicó uno
      if (cuponAplicado?.id && user?.id) {
        // Registrar en coupon_uses para evitar uso repetido
        await couponsDB.registerUsage(
          cuponAplicado.id, 
          order.id, 
          user.id, 
          descuentoCupon
        ).catch(err => console.error('Error registrando uso de cupón:', err));
        
        // Incrementar contador global de usos
        await couponsDB.incrementUsage(cuponAplicado.id)
          .catch(err => console.error('Error incrementando usos:', err));
      }
      
      // Descontar puntos si es canje
      if (esCanjePuntos && puntosUsados > 0 && user?.id) {
        const nuevosPuntos = Math.max(0, (user.puntos || 0) - puntosUsados);
        await usersDB.updatePoints(user.id, nuevosPuntos)
          .catch(err => console.error('Error descontando puntos:', err));
        
        // Actualizar puntos en el store
        useAuthStore.getState().updatePuntos(nuevosPuntos);
      }
      
      // Guardar ID del pedido en sessionStorage para la página de confirmación
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lastOrderId', order.id);
      }
      
      console.log('Pedido creado exitosamente:', order.id);
      
      // **SI ES MERCADOPAGO, CREAR PREFERENCIA Y REDIRIGIR**
      if (metodoPago === 'mercadopago') {
        try {
          console.log('💳 Creando preferencia de pago en MP...');
          
          const preference = buildPreferenceFromOrder({
            id: order.id,
            items: orderData.items,
            subtotal: subtotal,
            envio: costoEnvioFinal,
            total: total,
            customer_name: formData.nombre,
            customer_email: formData.email,
            customer_phone: telefonoFormateado,
          });
          
          console.log('📦 Datos de preferencia:', {
            orderId: order.id,
            items: preference.items.length,
            total: total
          });
          
          const result = await createPaymentPreference(preference);
          
          console.log('✅ Preferencia creada, redirigiendo a MP...');
          
          // NO limpiar carrito todavía - se limpiará cuando el webhook confirme el pago
          // Redirigir a Mercado Pago
          window.location.href = result.init_point;
          return; // No ejecutar el redirect de abajo
        } catch (mpError: any) {
          console.error('❌ Error completo MP:', mpError);
          
          // Mostrar error más detallado
          const errorMsg = mpError?.message || 'Error desconocido';
          const errorDetails = mpError?.details || '';
          
          alert(
            `Error al procesar el pago con Mercado Pago.\n\n` +
            `Error: ${errorMsg}\n` +
            (errorDetails ? `Detalles: ${JSON.stringify(errorDetails)}\n\n` : '') +
            `Tu pedido #${order.id} fue creado correctamente.\n` +
            `Puedes pagar con otro método o contactarnos por WhatsApp.`
          );
          
          // Redirigir al pedido creado
          window.location.href = `/confirmacion?pedido=${order.id}`;
          return;
        }
      }
      
      // Limpiar carrito solo si NO es MercadoPago (otros métodos de pago)
      clearCart();
      
      // Redirigir a página de confirmación (para otros métodos de pago)
      window.location.href = `/confirmacion?pedido=${order.id}`;
      
    } catch (err: any) {
      console.error('Error creando pedido:', err);
      alert(err?.message || 'Error al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generar link de WhatsApp
  const generateWhatsAppLink = (order: any, form: FormData, cartItems: any[], totalAmount: number) => {
    const phone = '59897865053'; // Número del negocio
    const itemsList = cartItems.map(i => {
      let itemText = `• ${i.cantidad}x ${i.nombre}`;
      // Agregar detalle de cookies si es una box
      if (i.cookiesIncluidas && i.cookiesIncluidas.length > 0) {
        const cookiesList = i.cookiesIncluidas.map((c: any) => `  - ${c.cantidad}x ${c.nombre}`).join('%0A');
        itemText += `%0A${cookiesList}`;
      }
      return itemText;
    }).join('%0A');
    const msg = `🍪 *Nuevo Pedido MarLo Cookies*%0A%0A` +
      `📋 Pedido ${generateOrderCode(order?.id || '')}%0A%0A` +
      `👤 ${form.nombre}%0A📱 ${form.telefono}%0A%0A` +
      `*Productos:*%0A${itemsList}%0A%0A` +
      `💰 *Total: $${totalAmount.toLocaleString()}*%0A%0A` +
      `📍 ${tipoEntrega === 'delivery' ? form.direccion : 'Retiro en local'}`;
    return `https://wa.me/${phone}?text=${msg}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-brown-800 mb-8">Finalizar Pedido</h1>
        
        {/* Banner de canje de puntos */}
        {esCanjePuntos && canjeItem && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{canjeItem.imagen}</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">🎉 ¡Canje de Puntos!</h2>
                <p className="text-lg">{canjeItem.nombre}</p>
                <p className="text-purple-100 mt-2">
                  Estás canjeando <strong>{puntosUsados.toLocaleString()} puntos</strong>
                  {costoEnvioFinal > 0 && ` + $${costoEnvioFinal} de envío`}
                </p>
                <p className="text-sm text-purple-100 mt-1">
                  Tus puntos actuales: <strong>{user?.puntos?.toLocaleString() || 0}</strong>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Aviso de login si no está autenticado */}
        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔐</span>
              <div>
                <p className="font-medium text-amber-800">Necesitas iniciar sesión para comprar</p>
                <p className="text-sm text-amber-600">Así podrás ver tus pedidos y acumular puntos</p>
              </div>
            </div>
            <Link 
              href="/login?redirect=/checkout"
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="lg:col-span-2 space-y-6">
              {/* Datos de contacto */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-brown-800 mb-4">
                  Datos de Contacto
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Tu nombre"
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brown-700 mb-1">
                      Teléfono (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 ${
                        errors.telefono ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="09X XXX XXX"
                    />
                    {errors.telefono && (
                      <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      Recibirás confirmación por WhatsApp
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Tipo de entrega */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-brown-800 mb-4">
                  Tipo de Entrega
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setTipoEntrega('delivery')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tipoEntrega === 'delivery'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🚗</div>
                    <div className="font-semibold">Delivery</div>
                    <div className="text-sm text-gray-500">Te lo llevamos</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setTipoEntrega('retiro')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tipoEntrega === 'retiro'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏪</div>
                    <div className="font-semibold">Retiro en Local</div>
                    <div className="text-sm text-gray-500">Sin costo</div>
                  </button>
                </div>
                
                {tipoEntrega === 'delivery' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-brown-700 mb-1">
                          Departamento *
                        </label>
                        <select
                          name="departamento"
                          value={formData.departamento}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 ${
                            errors.departamento ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          {departamentos.map(dep => (
                            <option key={dep} value={dep}>{dep}</option>
                          ))}
                        </select>
                        {formData.departamento !== 'Maldonado' && (
                          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-amber-700 text-sm mb-2">
                              ⚠️ Delivery solo disponible en Maldonado.
                            </p>
                            <a
                              href={`https://wa.me/59897865053?text=${encodeURIComponent(
                                `¡Hola! 🍪\n\nQuiero consultar si hacen envío a ${formData.departamento}.\n\n¡Gracias!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              Consultar envío a {formData.departamento}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {formData.departamento === 'Maldonado' && (
                        <div>
                          <label className="block text-sm font-medium text-brown-700 mb-2">
                            Ubicación de Entrega *
                          </label>
                          <p className="text-sm text-gray-600 mb-2">
                            Marca tu ubicación en el mapa. La zona y el costo de envío se detectarán automáticamente.
                          </p>
                          <MapLocationPicker
                            onLocationChange={handleLocationChange}
                            initialLat={-34.9}
                            initialLng={-54.95}
                            className="rounded-lg overflow-hidden border border-gray-300"
                          />
                          {formData.zona && formData.zona !== 'Otro' && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                              <p className="text-sm text-green-700">
                                ✓ Zona detectada: <strong>{formData.zona}</strong> - Costo: ${costoEnvio}
                              </p>
                              <p className="text-xs text-gray-600">
                                📍 {formData.direccion}
                              </p>
                              {formData.mapsLink && (
                                <a
                                  href={formData.mapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                >
                                  <span className="material-icons text-sm">map</span>
                                  Ver ubicación en el mapa
                                </a>
                              )}
                            </div>
                          )}
                          {/* Mensaje cuando está fuera de zona - WhatsApp */}
                          {formData.zona === 'Otro' && ubicacion && (
                            <div className="mt-2 p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-3">
                              <div className="flex items-start gap-2">
                                <span className="text-amber-500 text-xl">⚠️</span>
                                <div>
                                  <p className="text-sm font-medium text-amber-800">
                                    Tu ubicación está fuera de nuestras zonas de delivery
                                  </p>
                                  <p className="text-xs text-amber-700 mt-1">
                                    📍 {formData.direccion}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">
                                ¡No te preocupes! Contáctanos por WhatsApp para consultar si podemos hacer envío a tu zona.
                              </p>
                              <a
                                href={`https://wa.me/59897865053?text=${encodeURIComponent(
                                  `¡Hola! 🍪\n\nQuiero consultar si hacen envío a mi zona:\n\n📍 ${formData.direccion}\n🗺️ Coordenadas: ${ubicacion.lat.toFixed(5)}, ${ubicacion.lng.toFixed(5)}\n\n¡Gracias!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                Consultar por WhatsApp
                              </a>
                              <p className="text-xs text-center text-gray-500">
                                Te responderemos a la brevedad 💬
                              </p>
                            </div>
                          )}
                          {errors.zona && (
                            <p className="text-red-500 text-sm mt-1">{errors.zona}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-brown-700 mb-1">
                        Dirección *
                      </label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 ${
                          errors.direccion ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Calle, número, apartamento..."
                      />
                      {errors.direccion && (
                        <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-brown-700 mb-1">
                        Referencias (opcional)
                      </label>
                      <input
                        type="text"
                        name="referencias"
                        value={formData.referencias}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        placeholder="Ej: Casa blanca, portón negro..."
                      />
                    </div>
                  </div>
                )}
                
                {tipoEntrega === 'retiro' && (
                  <div className="bg-cream-100 rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-brown-800 mb-2">📍 Dirección de retiro</h3>
                    <p className="text-brown-600">
                      MarLo Cookies<br />
                      Maldonado, Uruguay<br />
                      <span className="text-sm text-gray-500">Te enviaremos la ubicación exacta por WhatsApp</span>
                    </p>
                  </div>
                )}
              </div>
              
              {/* Método de pago */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-brown-800 mb-4">
                  Método de Pago
                </h2>
                
                {/* Aviso de límite de pedidos pendientes */}
                {pedidosPendientes > 0 && !esCanjePuntos && (
                  <div className={`mb-4 p-4 rounded-lg border ${
                    pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES ? '🚫' : '⚠️'}
                      </span>
                      <div>
                        <p className={`font-medium ${
                          pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          {pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES 
                            ? `Límite alcanzado: ${pedidosPendientes} pedidos pendientes`
                            : `Tienes ${pedidosPendientes} pedido${pedidosPendientes > 1 ? 's' : ''} pendiente${pedidosPendientes > 1 ? 's' : ''}`
                          }
                        </p>
                        <p className={`text-sm mt-1 ${
                          pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES 
                            ? 'No puedes hacer más pedidos con efectivo o transferencia hasta que uno sea entregado. Usa MercadoPago para pagar ahora.'
                            : `Puedes hacer ${LIMITE_PEDIDOS_PENDIENTES - pedidosPendientes} pedido${LIMITE_PEDIDOS_PENDIENTES - pedidosPendientes > 1 ? 's' : ''} más con efectivo o transferencia.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {esCanjePuntos ? (
                  <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🎁</span>
                      <div>
                        <div className="font-semibold text-purple-800">Pago con Puntos</div>
                        <div className="text-sm text-purple-600">Se descontarán {puntosUsados.toLocaleString()} puntos de tu cuenta</div>
                        {costoEnvioFinal > 0 && (
                          <div className="text-sm text-gray-600 mt-1">+ ${costoEnvioFinal} de envío (en efectivo)</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                <div className="space-y-3">
                  <label className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                    pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES 
                      ? 'cursor-not-allowed opacity-50 border-gray-200 bg-gray-50' 
                      : metodoPago === 'efectivo' 
                        ? 'cursor-pointer border-pink-500 bg-pink-50' 
                        : 'cursor-pointer border-gray-200 hover:border-pink-300'
                  }`}>
                    <input
                      type="radio"
                      name="metodoPago"
                      value="efectivo"
                      checked={metodoPago === 'efectivo'}
                      onChange={() => setMetodoPago('efectivo')}
                      disabled={pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">💵</span>
                    <div className="flex-1">
                      <div className="font-semibold">Efectivo</div>
                      <div className="text-sm text-gray-500">Pago contra entrega</div>
                    </div>
                    {pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES && (
                      <span className="text-xs text-red-500 font-medium">Bloqueado</span>
                    )}
                  </label>
                  
                  <label className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                    pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES 
                      ? 'cursor-not-allowed opacity-50 border-gray-200 bg-gray-50' 
                      : metodoPago === 'transferencia' 
                        ? 'cursor-pointer border-pink-500 bg-pink-50' 
                        : 'cursor-pointer border-gray-200 hover:border-pink-300'
                  }`}>
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transferencia"
                      checked={metodoPago === 'transferencia'}
                      onChange={() => setMetodoPago('transferencia')}
                      disabled={pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">🏦</span>
                    <div className="flex-1">
                      <div className="font-semibold">Transferencia Bancaria</div>
                      <div className="text-sm text-gray-500">Te enviaremos los datos por WhatsApp</div>
                    </div>
                    {pedidosPendientes >= LIMITE_PEDIDOS_PENDIENTES && (
                      <span className="text-xs text-red-500 font-medium">Bloqueado</span>
                    )}
                  </label>
                  
                  {/* Campo de alias para transferencia */}
                  {metodoPago === 'transferencia' && (
                    <div className="ml-4 mt-3 space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          <span className="flex items-center gap-2">
                            <span className="material-icons text-lg">account_balance</span>
                            Alias de tu cuenta de transferencia *
                          </span>
                        </label>
                        <input
                          type="text"
                          name="aliasTransferencia"
                          value={formData.aliasTransferencia}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${
                            errors.aliasTransferencia ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Ej: mi.alias.brou"
                        />
                        {errors.aliasTransferencia && (
                          <p className="text-red-500 text-sm mt-1">{errors.aliasTransferencia}</p>
                        )}
                        <p className="text-blue-600 text-xs mt-2">
                          💡 Ingresa el alias desde el que realizarás la transferencia para poder confirmar tu pago.
                        </p>
                      </div>
                      
                      {/* Mensaje de envío de comprobante */}
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="material-icons text-green-600 text-xl">info</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800 mb-1">
                              📸 Importante: Envía tu comprobante
                            </p>
                            <p className="text-sm text-green-700">
                              Después de realizar la transferencia, <strong>debes enviar el comprobante por WhatsApp</strong> para que confirmemos tu pedido.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    metodoPago === 'mercadopago' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                  }`}>
                    <input
                      type="radio"
                      name="metodoPago"
                      value="mercadopago"
                      checked={metodoPago === 'mercadopago'}
                      onChange={() => setMetodoPago('mercadopago')}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">💳</span>
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        MercadoPago
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">+10%</span>
                      </div>
                      <div className="text-sm text-gray-500">Tarjetas, QR, billetera virtual</div>
                    </div>
                  </label>
                </div>
                )}
              </div>
              
              {/* Notas adicionales */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-brown-800 mb-4">
                  Notas Adicionales (opcional)
                </h2>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                  placeholder="Instrucciones especiales, alergias, horario preferido de entrega..."
                />
              </div>
            </div>
            
            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-brown-800 mb-4">
                  Resumen del Pedido
                </h2>
                
                {/* Productos */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {items.map(item => {
                    // Verificar si es una URL válida o un emoji
                    const isValidImageUrl = item.imagen && (
                      item.imagen.startsWith('/') || 
                      item.imagen.startsWith('http://') || 
                      item.imagen.startsWith('https://')
                    );
                    
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-cream-100 flex items-center justify-center">
                          {isValidImageUrl ? (
                            <img
                              src={item.imagen}
                              alt={item.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">{item.imagen || '🍪'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-brown-800 text-sm truncate">{item.nombre}</p>
                          <p className="text-gray-500 text-xs">x{item.cantidad}</p>
                        </div>
                        <p className="font-semibold text-brown-800 text-sm">
                          ${(item.precio * item.cantidad).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{esCanjePuntos ? 'Canje de puntos' : `$${subtotal.toLocaleString()}`}</span>
                  </div>
                  
                  {esCanjePuntos && puntosUsados > 0 && (
                    <div className="flex justify-between text-purple-600 font-medium">
                      <span>Puntos usados</span>
                      <span>-{puntosUsados.toLocaleString()} pts</span>
                    </div>
                  )}
                  
                  {/* Cupón */}
                  {!esCanjePuntos && (
                  <div className="py-2">
                    {!cuponAplicado ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={codigoCupon}
                          onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                          placeholder="Código de cupón"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-300"
                        />
                        <button
                          type="button"
                          onClick={validarCupon}
                          disabled={validandoCupon || !codigoCupon.trim()}
                          className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {validandoCupon ? '...' : 'Aplicar'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="text-sm font-medium">{cuponAplicado.code}</span>
                        </div>
                        <button
                          type="button"
                          onClick={quitarCupon}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                    {cuponError && (
                      <p className="text-red-500 text-xs mt-1">{cuponError}</p>
                    )}
                  </div>
                  )}
                  
                  {descuentoCupon > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento cupón</span>
                      <span>-${descuentoCupon.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Envío {tipoEntrega === 'retiro' ? '(Retiro)' : formData.zona ? `(${formData.zona})` : '(Seleccionar zona)'}</span>
                    {tipoEntrega === 'retiro' ? (
                      <span className="text-green-600">Gratis</span>
                    ) : envioGratis ? (
                      <span className="text-green-600 font-medium">
                        <span className="line-through text-gray-400 mr-2">${costoEnvio.toLocaleString()}</span>
                        Gratis
                      </span>
                    ) : formData.zona ? (
                      <span>${costoEnvio.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </div>
                  
                  {/* Recargo MercadoPago */}
                  {recargoMP > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-sm">credit_card</span>
                        Recargo MercadoPago (10%)
                      </span>
                      <span>+${recargoMP.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold text-brown-800 pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                  
                  {puntosAGanar > 0 && (
                    <p className="text-sm text-green-600 text-center flex items-center justify-center gap-1">
                      <span className="material-icons text-sm">card_giftcard</span>
                      Ganarás {puntosAGanar} puntos al entregar
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Confirmar Pedido
                      <span>→</span>
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  Al confirmar aceptas nuestros{' '}
                  <Link href="/terminos" className="text-pink-500 hover:underline">
                    Términos y Condiciones
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
