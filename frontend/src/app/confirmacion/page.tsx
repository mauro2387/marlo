'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ordersDB } from '@/lib/supabase-fetch';
import { generateOrderCode } from '@/utils/validators';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MetaPixelEvents } from '@/components/MetaPixel';

interface OrderData {
  id: string;
  created_at: string;
  estado: string;
  total: number;
  subtotal: number;
  envio: number;
  descuento: number;
  direccion: string;
  comuna: string;
  metodo_pago: string;
  puntos_ganados: number;
  order_items: Array<{
    name?: string;
    nombre?: string;
    quantity?: number;
    cantidad?: number;
    unit_price?: number;
    precio?: number;
    subtotal?: number;
  }>;
}

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('pedido');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [finalOrderId, setFinalOrderId] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  useEffect(() => {
    // Mostrar debug log del pedido
    if (typeof window !== 'undefined') {
      const log = sessionStorage.getItem('orderDebugLog');
      if (log) {
        try {
          const parsed = JSON.parse(log);
          setDebugLog(parsed);
          console.log('📋 Debug del pedido:', parsed);
        } catch (e) {}
        sessionStorage.removeItem('orderDebugLog');
      }
    }
    
    // Determinar el ID del pedido (URL param o sessionStorage)
    let orderIdToLoad = orderId;
    
    if (!orderIdToLoad && typeof window !== 'undefined') {
      orderIdToLoad = sessionStorage.getItem('lastOrderId');
      if (orderIdToLoad) {
        console.log('📦 Recuperando pedido de sessionStorage:', orderIdToLoad);
        // Limpiar después de usar
        sessionStorage.removeItem('lastOrderId');
      }
    }
    
    setFinalOrderId(orderIdToLoad);

    // Intentar lanzar confetti al cargar (si la librería está disponible)
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F25252', '#FF8F6B', '#8B4513', '#FFD700']
      });
      
      // Segundo confetti después de 500ms
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.7 },
          colors: ['#F25252', '#FF8F6B', '#8B4513', '#FFD700']
        });
      }, 500);
    }).catch(() => {
      console.log('Confetti not available');
    });

    // Cargar datos del pedido
    if (orderIdToLoad) {
      loadOrder(orderIdToLoad);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const loadOrder = async (id: string) => {
    try {
      console.log('🔍 Cargando pedido:', id);
      const { data, error } = await ordersDB.getById(id);
      if (data && !error) {
        console.log('✅ Pedido cargado:', data);
        setOrder(data);
        
        // Track Meta Pixel Purchase event
        const contentIds = data.order_items?.map(() => Math.random().toString()) || [];
        MetaPixelEvents.purchase(
          data.id,
          data.total,
          data.order_items?.length || 0,
          contentIds
        );
      } else {
        console.error('❌ Error cargando pedido:', error);
      }
    } catch (err) {
      console.error('Error cargando pedido:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    const idToCopy = order?.id || finalOrderId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy.slice(-8).toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWhatsAppLink = () => {
    if (!order) return '#';
    const phone = '59897865053'; // Número del negocio
    const items = order.order_items?.map(i => `• ${i.quantity || i.cantidad}x ${i.name || i.nombre}`).join('%0A') || '';
    const msg = `*Confirmación Pedido MarLo*%0A%0A` +
      `Pedido ${generateOrderCode(order.id)}%0A%0A` +
      `*Productos:*%0A${items}%0A%0A` +
      `*Total: $${order.total.toLocaleString()}*%0A%0A` +
      `${order.direccion}%0A%0A` +
      `Pago: ${order.metodo_pago}`;
    return `https://wa.me/${phone}?text=${msg}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="pt-[120px] min-h-screen bg-gradient-to-br from-green-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Animación de éxito */}
            <div className="text-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                <span className="material-icons text-white" style={{ fontSize: '64px' }}>check_circle</span>
              </div>
              <h1 className="text-4xl font-bold text-green-600 mb-3">¡Pedido Confirmado!</h1>
              <p className="text-gray-600 text-lg">
                Gracias por tu compra. Tu pedido está siendo procesado.
              </p>
            </div>

            {order ? (
              <>
                {/* Número de pedido */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Número de pedido</p>
                      <p className="text-3xl font-bold text-primary">{generateOrderCode(order.id)}</p>
                    </div>
                    <button
                      onClick={copyOrderId}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copiar número"
                    >
                      <span className="material-icons">{copied ? 'check' : 'content_copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Estado del pedido */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-icons text-primary">timeline</span>
                    Estado del Pedido
                  </h2>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mb-2">
                        <span className="material-icons">receipt</span>
                      </div>
                      <span className="text-xs text-gray-600">Recibido</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 mx-2">
                      <div className="h-full bg-gray-200 w-0"></div>
                    </div>
                    <div className="flex flex-col items-center opacity-50">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                        <span className="material-icons">restaurant</span>
                      </div>
                      <span className="text-xs text-gray-600">Preparando</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                    <div className="flex flex-col items-center opacity-50">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                        <span className="material-icons">local_shipping</span>
                      </div>
                      <span className="text-xs text-gray-600">En camino</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                    <div className="flex flex-col items-center opacity-50">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                        <span className="material-icons">celebration</span>
                      </div>
                      <span className="text-xs text-gray-600">Entregado</span>
                    </div>
                  </div>
                </div>

                {/* Resumen */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-icons text-primary">receipt_long</span>
                    Resumen del Pedido
                  </h2>
                  
                  <div className="space-y-3 mb-4">
                    {order.order_items?.map((item, idx) => {
                      const qty = item.quantity || item.cantidad || 1;
                      const name = item.name || item.nombre || 'Producto';
                      const sub = item.subtotal || ((item.unit_price || item.precio || 0) * qty);
                      return (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-700">{qty}x {name}</span>
                          <span className="font-medium">${sub.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Envío</span>
                      <span>{order.envio === 0 ? 'Gratis' : `$${order.envio}`}</span>
                    </div>
                    {order.descuento > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento</span>
                        <span>-${order.descuento}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">${order.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {order.puntos_ganados > 0 && (
                    <div className="mt-4 bg-green-50 rounded-lg p-3 text-center">
                      <span className="text-green-600 font-medium">
                        🎁 ¡Ganarás {order.puntos_ganados} puntos con esta compra!
                      </span>
                    </div>
                  )}
                </div>

                {/* Información de entrega */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-icons text-primary">local_shipping</span>
                    Información de Entrega
                  </h2>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700">{order.direccion}</p>
                    {order.comuna && <p className="text-gray-500 text-sm mt-1">{order.comuna}</p>}
                  </div>

                  <div className="mt-4 text-sm">
                    <div>
                      <p className="text-gray-500">Método de pago</p>
                      <p className="font-medium capitalize">{order.metodo_pago}</p>
                      {/* Mostrar alias de transferencia si existe */}
                      {order.metodo_pago === 'transferencia' && (order as any).transfer_alias && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-600">Tu alias de transferencia:</p>
                          <p className="font-semibold text-blue-800">{(order as any).transfer_alias}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mensaje importante */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="material-icons text-amber-600">info</span>
                    <div>
                      <h3 className="font-bold text-amber-800 mb-1">¿Qué sigue ahora?</h3>
                      <ul className="text-amber-700 text-sm space-y-1">
                        <li>• Te contactaremos por WhatsApp para confirmar tu pedido</li>
                        <li>• Recibirás actualizaciones del estado de tu pedido</li>
                        {order.metodo_pago === 'transferencia' && (
                          <li>• Te enviaremos los datos bancarios para realizar la transferencia</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
                  >
                    <span className="material-icons">chat</span>
                    Contactar por WhatsApp
                  </a>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/pedidos"
                      className="bg-white border-2 border-primary text-primary py-3 px-6 rounded-xl font-semibold text-center hover:bg-primary hover:text-white transition-colors"
                    >
                      Ver Mis Pedidos
                    </Link>
                    <Link
                      href="/productos"
                      className="bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors"
                    >
                      Seguir Comprando
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              /* Sin pedido específico */
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-green-600" style={{ fontSize: '40px' }}>check</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Gracias por tu pedido!</h2>
                <p className="text-gray-600 mb-6">
                  Tu pedido ha sido recibido. Te contactaremos pronto por WhatsApp.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/pedidos"
                    className="block w-full btn-primary py-3"
                  >
                    Ver Mis Pedidos
                  </Link>
                  <Link
                    href="/"
                    className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Volver al Inicio
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  );
}
