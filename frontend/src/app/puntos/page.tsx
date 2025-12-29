'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { loyaltyService } from '@/services/supabase-api';
import { useUIStore } from '@/store/uiStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase/client';
import { couponsDB } from '@/lib/supabase-fetch';
import ScrollAnimation from '@/components/ScrollAnimation';

interface HistorialItem {
  id: string;
  created_at: string;
  concepto: string;
  puntos: number;
  tipo: 'ganado' | 'canjeado';
}

interface Recompensa {
  id: string;
  nombre: string;
  descripcion: string;
  puntos_requeridos: number;
  icono: string;
  imagen_url: string | null;
  categoria: string;
  tipo_recompensa?: string; // 'producto' | 'cupon_descuento' | 'cupon_envio' | 'box_personalizable'
  valor_descuento?: number | null;
  cantidad_cookies?: number | null;
  es_destacado: boolean;
  activo: boolean;
  stock: number;
}

interface Cookie {
  id: string;
  nombre: string;
  imagen: string | null;
  precio: number;
  stock: number;
}

// Recompensas por defecto si no hay en la base de datos
const recompensasDefault: Omit<Recompensa, 'id'>[] = [
  { 
    nombre: '1 Café + 1 Cookie Gratis', 
    puntos_requeridos: 2000, 
    descripcion: 'Disfruta de un café caliente acompañado de tu cookie favorita',
    icono: 'coffee',
    imagen_url: null,
    categoria: 'producto',
    es_destacado: false,
    activo: true,
    stock: -1,
  },
  { 
    nombre: 'Box 4 Unidades Gratis', 
    puntos_requeridos: 5000, 
    descripcion: 'Un box de 4 cookies a tu elección completamente gratis',
    icono: 'inventory_2',
    imagen_url: null,
    categoria: 'producto',
    es_destacado: false,
    activo: true,
    stock: -1,
  },
  { 
    nombre: 'Box 6 Unidades Gratis', 
    puntos_requeridos: 10000, 
    descripcion: 'Box de 6 cookies premium totalmente gratis',
    icono: 'card_giftcard',
    imagen_url: null,
    categoria: 'producto',
    es_destacado: false,
    activo: true,
    stock: -1,
  },
];

export default function PuntosPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updatePuntos } = useAuthStore();
  const { addNotification } = useUIStore();
  const { addItem, clearCart } = useCartStore();
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [loading, setLoading] = useState(true);
  const [canjeando, setCanjeando] = useState(false);
  const [recompensaSeleccionada, setRecompensaSeleccionada] = useState<Recompensa | null>(null);
  
  // Para box personalizable
  const [showBoxModal, setShowBoxModal] = useState(false);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [selectedCookies, setSelectedCookies] = useState<{id: string; nombre: string; cantidad: number}[]>([]);
  const [loadingCookies, setLoadingCookies] = useState(false);
  
  // Para cupones generados
  const [cuponGenerado, setCuponGenerado] = useState<{codigo: string; tipo: string; valor?: number} | null>(null);
  
  const puntosActuales = user?.puntos || 0;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/puntos');
      return;
    }
    cargarDatos();
  }, [isAuthenticated, router]);

  async function cargarDatos() {
    try {
      setLoading(true);
      
      // Cargar historial
      const historialData = await loyaltyService.getHistory();
      setHistorial(historialData || []);
      
      // Cargar recompensas desde Supabase
      const { data: rewardsData, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('activo', true)
        .order('puntos_requeridos', { ascending: true });
      
      if (error) {
        console.log('Usando recompensas por defecto:', error.message);
        setRecompensas(recompensasDefault.map((r, i) => ({ ...r, id: String(i + 1) })));
      } else if (rewardsData && rewardsData.length > 0) {
        setRecompensas(rewardsData);
      } else {
        setRecompensas(recompensasDefault.map((r, i) => ({ ...r, id: String(i + 1) })));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setRecompensas(recompensasDefault.map((r, i) => ({ ...r, id: String(i + 1) })));
    } finally {
      setLoading(false);
    }
  }

  const totalGanados = historial
    .filter(h => h.tipo === 'ganado')
    .reduce((sum, h) => sum + h.puntos, 0);
  
  const totalCanjeados = historial
    .filter(h => h.tipo === 'canjeado')
    .reduce((sum, h) => sum + h.puntos, 0);

  const handleCanjear = async () => {
    if (!recompensaSeleccionada || canjeando) return;
    
    if (puntosActuales < recompensaSeleccionada.puntos_requeridos) {
      addNotification({
        type: 'error',
        message: 'No tienes suficientes puntos',
        duration: 3000,
      });
      return;
    }

    const tipoRecompensa = recompensaSeleccionada.tipo_recompensa || 'producto';

    // Según el tipo de recompensa, manejar diferente
    switch (tipoRecompensa) {
      case 'cupon_descuento':
        await handleCanjearCupon();
        break;
      case 'box_personalizable':
        await handleAbrirSelectorBox();
        break;
      case 'producto':
      default:
        await handleCanjearProducto();
        break;
    }
  };

  // Generar cupón de descuento
  const handleCanjearCupon = async () => {
    if (!recompensaSeleccionada || !user) return;
    
    setCanjeando(true);
    try {
      // Generar código único
      const codigo = `PUNTOS-DESC-${Date.now().toString(36).toUpperCase()}`;
      
      // Porcentaje de descuento configurado
      const valorCupon = recompensaSeleccionada.valor_descuento || 10;
      
      // Fecha de vencimiento: 30 días desde hoy
      const fecha30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      // Primero ver qué columnas tiene la tabla coupons
      const { data: sampleData } = await supabase.from('coupons').select('*').limit(1);
      const columnas = sampleData?.[0] ? Object.keys(sampleData[0]) : [];
      console.log('Columnas de coupons:', columnas);
      
      // Determinar el nombre de la columna de código
      let codeColumn = 'code';
      if (columnas.includes('codigo')) codeColumn = 'codigo';
      else if (columnas.includes('code')) codeColumn = 'code';
      else if (columnas.includes('coupon_code')) codeColumn = 'coupon_code';
      
      // Crear objeto dinámico según estructura
      const cuponData: any = {
        [codeColumn]: codigo,
        tipo: 'porcentaje',
        valor: valorCupon,
        activo: true,
      };
      
      // Agregar campos opcionales si existen
      if (columnas.includes('minimo') || columnas.length === 0) cuponData.minimo = 0;
      if (columnas.includes('valido_hasta') || columnas.length === 0) cuponData.valido_hasta = fecha30Dias;
      if (columnas.includes('max_usos') || columnas.length === 0) cuponData.max_usos = 1;
      if (columnas.includes('usos_actuales') || columnas.length === 0) cuponData.usos_actuales = 0;
      
      console.log('Insertando cupón:', cuponData);
      
      // Crear cupón usando supabase directo
      const { data: cuponCreado, error: cuponError } = await supabase
        .from('coupons')
        .insert(cuponData)
        .select()
        .single();

      if (cuponError) {
        console.error('Error creando cupón:', cuponError);
        // Si falla, intentar sin campos opcionales
        const cuponMinimo: any = { [codeColumn]: codigo, tipo: 'porcentaje', valor: valorCupon, activo: true };
        const { error: error2 } = await supabase.from('coupons').insert(cuponMinimo);
        if (error2) {
          console.error('Error segundo intento:', error2);
          throw new Error(`Error al crear el cupón: ${error2.message}`);
        }
      }

      console.log('Cupón creado exitosamente:', cuponCreado);

      // Descontar puntos
      const nuevosPuntos = puntosActuales - recompensaSeleccionada.puntos_requeridos;
      const supabaseAny = supabase as any;
      await supabaseAny
        .from('users')
        .update({ puntos: nuevosPuntos })
        .eq('id', user.id);
      
      updatePuntos(nuevosPuntos);

      // Registrar el canje
      await supabaseAny
        .from('reward_redemptions')
        .insert({
          user_id: user.id,
          reward_id: recompensaSeleccionada.id,
          puntos_usados: recompensaSeleccionada.puntos_requeridos,
          estado: 'entregado',
          codigo_cupon: codigo,
        });

      // Mostrar cupón generado
      setCuponGenerado({
        codigo,
        tipo: `${valorCupon}% de Descuento`,
        valor: valorCupon,
      });

      addNotification({
        type: 'success',
        message: '¡Cupón generado exitosamente!',
        duration: 5000,
      });

      setRecompensaSeleccionada(null);
      cargarDatos(); // Recargar historial
      
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.message || 'Error al generar el cupón',
        duration: 3000,
      });
    } finally {
      setCanjeando(false);
    }
  };

  // Abrir selector de cookies para box personalizable
  const handleAbrirSelectorBox = async () => {
    if (!recompensaSeleccionada) return;
    
    // Redirigir a la página de boxes con parámetros de canje
    const cantidadCookies = recompensaSeleccionada.cantidad_cookies || 6;
    const puntosRequeridos = recompensaSeleccionada.puntos_requeridos;
    const rewardId = recompensaSeleccionada.id;
    const nombreRecompensa = encodeURIComponent(recompensaSeleccionada.nombre);
    
    router.push(`/boxes?canje=true&cantidad=${cantidadCookies}&puntos=${puntosRequeridos}&rewardId=${rewardId}&nombre=${nombreRecompensa}`);
  };

  // Confirmar box personalizable
  const handleConfirmarBox = async () => {
    if (!recompensaSeleccionada || !user) return;
    
    const cantidadRequerida = recompensaSeleccionada.cantidad_cookies || 4;
    const cantidadSeleccionada = selectedCookies.reduce((sum, c) => sum + c.cantidad, 0);
    
    if (cantidadSeleccionada !== cantidadRequerida) {
      addNotification({
        type: 'error',
        message: `Debes seleccionar exactamente ${cantidadRequerida} cookies`,
        duration: 3000,
      });
      return;
    }

    setCanjeando(true);
    try {
      // Limpiar carrito y agregar el box con las cookies seleccionadas
      clearCart();
      
      addItem({
        id: `reward-box-${recompensaSeleccionada.id}-${Date.now()}`,
        nombre: `🎁 ${recompensaSeleccionada.nombre}`,
        precio: 0,
        imagen: recompensaSeleccionada.imagen_url || undefined,
        categoria: 'recompensa',
        esCanjeoPuntos: true,
        puntosRequeridos: recompensaSeleccionada.puntos_requeridos,
        rewardId: recompensaSeleccionada.id,
        cookiesIncluidas: selectedCookies,
      });

      setShowBoxModal(false);
      setRecompensaSeleccionada(null);
      
      addNotification({
        type: 'success',
        message: 'Box personalizado agregado. Completa tu pedido.',
        duration: 3000,
      });
      
      router.push('/checkout?metodo=puntos');
      
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.message || 'Error al procesar el box',
        duration: 3000,
      });
    } finally {
      setCanjeando(false);
    }
  };

  // Agregar/quitar cookie del box
  const toggleCookie = (cookie: Cookie, delta: number) => {
    const cantidadMaxima = recompensaSeleccionada?.cantidad_cookies || 4;
    const cantidadActual = selectedCookies.reduce((sum, c) => sum + c.cantidad, 0);
    
    setSelectedCookies(prev => {
      const existing = prev.find(c => c.id === cookie.id);
      
      if (delta > 0) {
        if (cantidadActual >= cantidadMaxima) return prev;
        if (existing) {
          return prev.map(c => c.id === cookie.id ? { ...c, cantidad: c.cantidad + 1 } : c);
        }
        return [...prev, { id: cookie.id, nombre: cookie.nombre, cantidad: 1 }];
      } else {
        if (!existing || existing.cantidad <= 0) return prev;
        if (existing.cantidad === 1) {
          return prev.filter(c => c.id !== cookie.id);
        }
        return prev.map(c => c.id === cookie.id ? { ...c, cantidad: c.cantidad - 1 } : c);
      }
    });
  };

  // Canjear producto normal (va al checkout)
  const handleCanjearProducto = async () => {
    if (!recompensaSeleccionada) return;

    try {
      setCanjeando(true);
      
      clearCart();
      
      addItem({
        id: `reward-${recompensaSeleccionada.id}-${Date.now()}`,
        nombre: `🎁 ${recompensaSeleccionada.nombre}`,
        precio: 0,
        imagen: recompensaSeleccionada.imagen_url || undefined,
        categoria: 'recompensa',
        esCanjeoPuntos: true,
        puntosRequeridos: recompensaSeleccionada.puntos_requeridos,
        rewardId: recompensaSeleccionada.id,
      });
      
      addNotification({
        type: 'success',
        message: 'Recompensa agregada. Completa tu pedido en el checkout.',
        duration: 3000,
      });
      
      setRecompensaSeleccionada(null);
      router.push('/checkout?metodo=puntos');
      
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.message || 'Error al procesar la recompensa',
        duration: 3000,
      });
    } finally {
      setCanjeando(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 sm:pt-28 lg:pt-[120px] min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-24 sm:pt-28 lg:pt-[120px] min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation animation="fade-up">
              <h1 className="text-4xl font-bold text-primary mb-8">Mi Programa de Puntos</h1>
            </ScrollAnimation>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <ScrollAnimation animation="slide-right">
                  <div className="card p-6 sticky top-24">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {user?.nombre?.[0]}{user?.apellido?.[0]}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-primary">{user?.nombre} {user?.apellido}</h3>
                    <p className="text-sm text-gray-500">Cliente MarLo</p>
                  </div>

                  <nav className="space-y-2">
                    <Link 
                      href="/perfil" 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors"
                    >
                      <span className="material-icons text-xl">person</span>
                      <span>Mi Perfil</span>
                    </Link>
                    <Link 
                      href="/pedidos" 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors"
                    >
                      <span className="material-icons text-xl">inventory_2</span>
                      <span>Mis Pedidos</span>
                    </Link>
                    <Link 
                      href="/puntos" 
                      className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg font-medium"
                    >
                      <span className="material-icons text-xl">stars</span>
                      <span>Mis Puntos</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg font-medium text-red-600 transition-colors"
                    >
                      <span className="material-icons text-xl">logout</span>
                      <span>Cerrar Sesión</span>
                    </button>
                  </nav>
                  </div>
                </ScrollAnimation>
              </aside>

              {/* Contenido Principal */}
              <div className="lg:col-span-3 space-y-8">
                <ScrollAnimation animation="fade-in">
                  {/* Tarjeta de Puntos Principal */}
                  <div className="card overflow-hidden">
                  <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-white/80 text-sm mb-1">Puntos Disponibles</p>
                        <p className="text-5xl font-bold">{puntosActuales.toLocaleString('es-UY')}</p>
                      </div>
                      <div className="text-7xl">
                        <span className="material-icons" style={{fontSize: '80px'}}>stars</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-white/80 text-sm mb-1">Total Ganados</p>
                        <p className="text-2xl font-bold">+{totalGanados.toLocaleString('es-UY')}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-white/80 text-sm mb-1">Total Canjeados</p>
                        <p className="text-2xl font-bold">-{totalCanjeados.toLocaleString('es-UY')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div className="flex items-center gap-3">
                      <span className="material-icons text-3xl text-yellow-600">lightbulb</span>
                      <div>
                        <p className="font-bold text-primary">
                          {puntosActuales >= 2000 
                            ? '¡Ya puedes canjear recompensas!' 
                            : `¡Estás a ${(2000 - puntosActuales).toLocaleString('es-UY')} puntos de canjear!`}
                        </p>
                        <p className="text-sm text-gray-600">
                          Cada $1 que gastas = 1 punto. Sigue acumulando para desbloquear más recompensas
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border-t border-blue-100">
                    <div className="flex items-start gap-2">
                      <span className="material-icons text-blue-600 text-lg">schedule</span>
                      <div className="text-sm">
                        <p className="text-blue-800 font-medium">⏰ Tus puntos vencen en 6 meses</p>
                        <p className="text-blue-600 mt-1">Los puntos se vencen 6 meses después de haberlos ganado. ¡No olvides canjearlos a tiempo!</p>
                      </div>
                    </div>
                  </div>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation animation="scale-up" delay={100}>
                  {/* Cómo Funciona */}
                  <div className="card p-8">
                  <h2 className="text-2xl font-bold text-primary mb-6">¿Cómo Funciona?</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-secondary-salmon/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        <span className="material-icons text-3xl text-secondary-salmon">shopping_bag</span>
                      </div>
                      <h3 className="font-bold text-primary mb-2">Compra</h3>
                      <p className="text-gray-600 text-sm">
                        Por cada <strong className="text-primary">$1 que gastas = 1 punto</strong> automáticamente
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-secondary-salmon/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        <span className="material-icons text-3xl text-secondary-salmon">account_balance_wallet</span>
                      </div>
                      <h3 className="font-bold text-primary mb-2">Acumula</h3>
                      <p className="text-gray-600 text-sm">
                        Tus puntos vencen a los <strong className="text-primary">6 meses</strong> de ser ganados
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-secondary-salmon/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        <span className="material-icons text-3xl text-secondary-salmon">card_giftcard</span>
                      </div>
                      <h3 className="font-bold text-primary mb-2">Canjea</h3>
                      <p className="text-gray-600 text-sm">
                        Usa tus puntos para obtener productos y descuentos gratis
                      </p>
                    </div>
                  </div>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={200}>
                  {/* Recompensas Disponibles */}
                  <div className="card p-8">
                  <h2 className="text-2xl font-bold text-primary mb-6">Recompensas Disponibles</h2>
                  {recompensas.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="material-icons text-gray-300" style={{fontSize: '60px'}}>card_giftcard</span>
                      <p className="text-gray-500 mt-4">No hay recompensas disponibles en este momento</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {recompensas.map(recompensa => {
                        const puedesCanjear = puntosActuales >= recompensa.puntos_requeridos && (recompensa.stock === -1 || recompensa.stock > 0);
                        const sinStock = recompensa.stock === 0;
                        return (
                          <div 
                            key={recompensa.id}
                            className={`border-2 rounded-xl p-6 transition-all relative ${
                              recompensa.es_destacado 
                                ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50' 
                                : sinStock
                                  ? 'border-gray-200 opacity-50'
                                  : puedesCanjear 
                                    ? 'border-primary hover:shadow-xl cursor-pointer' 
                                    : 'border-gray-200 opacity-60'
                            }`}
                            onClick={() => puedesCanjear && !sinStock && setRecompensaSeleccionada(recompensa)}
                          >
                            {recompensa.es_destacado && (
                              <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse flex items-center gap-1">
                                <span className="material-icons" style={{fontSize: '14px'}}>star</span>
                                DESTACADO
                              </div>
                            )}
                            {sinStock && (
                              <div className="absolute -top-3 -right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                AGOTADO
                              </div>
                            )}
                            <div className="flex items-start justify-between mb-4">
                              <div className="text-5xl">
                                <span className="material-icons" style={{fontSize: '60px', color: '#8B4513'}}>{recompensa.icono}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  {recompensa.puntos_requeridos.toLocaleString('es-UY')}
                                </p>
                                <p className="text-sm text-gray-500">puntos</p>
                              </div>
                            </div>
                            <h3 className="font-bold text-lg text-primary mb-2">
                              {recompensa.nombre}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                              {recompensa.descripcion}
                            </p>
                            {sinStock ? (
                              <div className="text-center">
                                <p className="text-sm text-red-500 font-medium">Sin stock disponible</p>
                              </div>
                            ) : puedesCanjear ? (
                              <button className="w-full py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors">
                                Canjear Ahora
                              </button>
                            ) : (
                              <div className="text-center">
                                <p className="text-sm text-gray-500">
                                  Te faltan {(recompensa.puntos_requeridos - puntosActuales).toLocaleString('es-UY')} puntos
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                  <div 
                                    className="bg-secondary-salmon rounded-full h-2 transition-all"
                                    style={{ width: `${Math.min((puntosActuales / recompensa.puntos_requeridos) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-in" delay={300}>
                  {/* Historial */}
                  <div className="card p-8">
                  <h2 className="text-2xl font-bold text-primary mb-6">Historial de Puntos</h2>
                  {historial.length > 0 ? (
                    <div className="space-y-3">
                      {historial.map(item => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                              item.tipo === 'ganado' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {item.tipo === 'ganado' ? '➕' : '➖'}
                            </div>
                            <div>
                              <p className="font-semibold text-primary">{item.concepto}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(item.created_at).toLocaleDateString('es-UY', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-bold ${
                              item.tipo === 'ganado' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.tipo === 'ganado' ? '+' : '-'}{item.puntos.toLocaleString('es-UY')}
                            </p>
                            <p className="text-sm text-gray-500">puntos</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <span className="material-icons mb-4 block" style={{fontSize: '80px', color: '#9CA3AF'}}>history</span>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">Sin historial aún</h3>
                      <p className="text-gray-500 mb-6">Haz tu primera compra para empezar a ganar puntos</p>
                      <Link href="/productos" className="btn-primary">
                        Ir a Comprar
                      </Link>
                    </div>
                  )}
                  </div>
                </ScrollAnimation>

                <ScrollAnimation animation="scale-up" delay={400}>
                  {/* CTA */}
                  <div className="card p-8 bg-gradient-to-br from-secondary-crema to-secondary-rosa/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-2">
                        ¡Sigue Ganando Puntos!
                      </h3>
                      <p className="text-gray-600">
                        Haz tu próxima compra y acumula más puntos para canjear recompensas increíbles
                      </p>
                    </div>
                    <Link 
                      href="/productos" 
                      className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg"
                    >
                      Ir a Comprar
                    </Link>
                  </div>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Confirmar Canje */}
        {recompensaSeleccionada && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setRecompensaSeleccionada(null)}
          >
            <div 
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-7xl mb-4">
                  <span className="material-icons" style={{fontSize: '80px', color: '#8B4513'}}>{recompensaSeleccionada.icono}</span>
                </div>
                <h2 className="text-3xl font-bold text-primary mb-2">
                  {recompensaSeleccionada.nombre}
                </h2>
                <p className="text-gray-600">
                  {recompensaSeleccionada.descripcion}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Puntos Requeridos:</span>
                  <span className="text-xl font-bold text-red-600">
                    -{recompensaSeleccionada.puntos_requeridos.toLocaleString('es-UY')}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Puntos Actuales:</span>
                  <span className="text-xl font-bold text-primary">
                    {puntosActuales.toLocaleString('es-UY')}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Puntos Restantes:</span>
                    <span className="text-xl font-bold text-green-600">
                      {(puntosActuales - recompensaSeleccionada.puntos_requeridos).toLocaleString('es-UY')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCanjear}
                  disabled={canjeando}
                  className="w-full btn-primary text-lg py-4 disabled:opacity-50"
                >
                  {canjeando ? 'Canjeando...' : 'Confirmar Canje'}
                </button>
                <button
                  onClick={() => setRecompensaSeleccionada(null)}
                  className="w-full px-6 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Box Personalizable */}
        {showBoxModal && recompensaSeleccionada && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-brown-800">
                    📦 Arma tu Box
                  </h2>
                  <p className="text-gray-600">
                    Elige {recompensaSeleccionada.cantidad_cookies || 4} cookies para tu box gratis
                  </p>
                </div>
                <button
                  onClick={() => setShowBoxModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              {/* Contador */}
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-800">Cookies seleccionadas:</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {selectedCookies.reduce((sum, c) => sum + c.cantidad, 0)} / {recompensaSeleccionada.cantidad_cookies || 4}
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-3 mt-2">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all"
                    style={{ 
                      width: `${(selectedCookies.reduce((sum, c) => sum + c.cantidad, 0) / (recompensaSeleccionada.cantidad_cookies || 4)) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Lista de cookies */}
              {loadingCookies ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : cookies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No hay cookies disponibles
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {cookies.map((cookie) => {
                    const selected = selectedCookies.find(c => c.id === cookie.id);
                    const cantidad = selected?.cantidad || 0;
                    
                    return (
                      <div 
                        key={cookie.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          cantidad > 0 ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="w-full h-24 rounded-lg overflow-hidden mb-3 bg-gray-100">
                          {cookie.imagen ? (
                            <img 
                              src={cookie.imagen} 
                              alt={cookie.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">🍪</div>
                          )}
                        </div>
                        <h4 className="font-medium text-brown-800 text-sm mb-2 truncate">{cookie.nombre}</h4>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleCookie(cookie, -1)}
                            disabled={cantidad === 0}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                          >
                            <span className="material-icons text-sm">remove</span>
                          </button>
                          <span className="w-8 text-center font-bold">{cantidad}</span>
                          <button
                            onClick={() => toggleCookie(cookie, 1)}
                            disabled={selectedCookies.reduce((sum, c) => sum + c.cantidad, 0) >= (recompensaSeleccionada.cantidad_cookies || 4)}
                            className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50 flex items-center justify-center"
                          >
                            <span className="material-icons text-sm">add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Resumen y botón */}
              {selectedCookies.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Tu selección:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCookies.map((c) => (
                      <span key={c.id} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {c.cantidad}x {c.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBoxModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarBox}
                  disabled={canjeando || selectedCookies.reduce((sum, c) => sum + c.cantidad, 0) !== (recompensaSeleccionada.cantidad_cookies || 4)}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  {canjeando ? 'Procesando...' : 'Confirmar Box'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cupón Generado */}
        {cuponGenerado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-brown-800 mb-2">
                ¡Cupón Generado!
              </h2>
              <p className="text-gray-600 mb-6">
                Tu cupón de <strong>{cuponGenerado.tipo}</strong> está listo para usar
              </p>
              
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Tu código de cupón:</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-2xl font-bold text-brown-800 tracking-wider">
                    {cuponGenerado.codigo}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cuponGenerado.codigo);
                      addNotification({
                        type: 'success',
                        message: '¡Código copiado!',
                        duration: 2000,
                      });
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="Copiar"
                  >
                    <span className="material-icons text-gray-600">content_copy</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
                <h4 className="font-medium text-blue-800 mb-2">📌 Cómo usar tu cupón:</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Agrega productos a tu carrito</li>
                  <li>En el checkout, ingresa el código</li>
                  <li>El descuento se aplicará automáticamente</li>
                </ol>
                <p className="text-xs text-blue-600 mt-3">
                  ⏰ Válido por 30 días • Un solo uso
                </p>
              </div>

              {/* Aviso de cupón solo online */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-bold text-orange-800 flex items-center justify-center gap-2">
                  <span className="material-icons text-base">store</span>
                  🌐 Este cupón es válido SOLO para compras online
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  No puede ser canjeado en el local físico
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setCuponGenerado(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <Link
                  href="/productos"
                  className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 flex items-center justify-center gap-2"
                >
                  Ir a Comprar
                  <span className="material-icons text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
