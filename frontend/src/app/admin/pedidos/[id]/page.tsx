'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersDB } from '@/lib/supabase-fetch';
import { generateOrderCode } from '@/utils/validators';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OrderItem {
  id: string;
  product_id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

interface Order {
  id: string;
  user_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  subtotal: number;
  envio: number;
  descuento: number;
  total: number;
  metodo_pago: string;
  direccion: string;
  comuna: string;
  region: string;
  notas: string;
  estado: string;
  puntos_ganados: number;
  puntos_usados: number;
  tipo_entrega?: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  users?: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    puntos: number;
  };
}

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  preparando: { label: 'Preparando', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '👨‍🍳' },
  listo: { label: 'Listo para Retirar', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: '🏪' },
  en_camino: { label: 'En Camino', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🚗' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-300', icon: '🎉' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300', icon: '❌' },
};

// Flujos según tipo de entrega
const statusFlowDelivery = ['preparando', 'en_camino', 'entregado'];
const statusFlowRetiro = ['preparando', 'listo', 'entregado'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await ordersDB.getById(orderId);
      if (error) throw error;
      setOrder(data as unknown as Order);
    } catch (err) {
      console.error('Error cargando pedido:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const { error } = await ordersDB.updateStatus(order.id, newStatus);
      if (error) throw error;
      setOrder({ ...order, estado: newStatus });
    } catch (err) {
      console.error('Error actualizando estado:', err);
      alert('Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const confirmPayment = async () => {
    if (!order) return;
    if (!confirm('¿Confirmar que el pago fue recibido? El pedido pasará a "Preparando".')) {
      return;
    }
    
    setUpdating(true);
    try {
      const { error } = await ordersDB.confirmPayment(order.id);
      if (error) throw error;
      setOrder({ ...order, estado: 'preparando' });
      alert('✅ Pago confirmado. El pedido está ahora en "Preparando".');
    } catch (err) {
      console.error('Error confirmando pago:', err);
      alert('Error al confirmar el pago');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const esRetiro = order?.tipo_entrega === 'retiro' || order?.direccion === 'Retiro en local';
    const flow = esRetiro ? statusFlowRetiro : statusFlowDelivery;
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= flow.length - 1) return null;
    return flow[currentIndex + 1];
  };
  
  // Determinar el flujo correcto según tipo de entrega
  const getStatusFlow = () => {
    const esRetiro = order?.tipo_entrega === 'retiro' || order?.direccion === 'Retiro en local';
    return esRetiro ? statusFlowRetiro : statusFlowDelivery;
  };

  const sendWhatsApp = () => {
    if (!order) return;
    
    // Priorizar customer_phone del pedido, luego el telefono del usuario
    let phone = (order.customer_phone || order.users?.telefono || '').replace(/\D/g, '');
    
    if (!phone) {
      alert('Este pedido no tiene número de teléfono registrado');
      return;
    }
    
    // Si no empieza con 598 (Uruguay), agregarlo
    if (!phone.startsWith('598')) {
      phone = '598' + phone;
    }
    
    const itemsList = order.order_items
      .map(item => `• ${item.cantidad}x ${item.nombre}`)
      .join('%0A');
    
    const statusInfo = statusLabels[order.estado] || { label: order.estado, icon: '📋' };
    const customerName = order.users 
      ? `${order.users.nombre} ${order.users.apellido}`
      : 'Cliente';
    
    const message = `🍪 *MarLo Cookies*%0A%0A` +
      `Hola ${customerName}!%0A%0A` +
      `Tu pedido *${generateOrderCode(order.id)}* está ${statusInfo.icon} *${statusInfo.label}*%0A%0A` +
      `*Productos:*%0A${itemsList}%0A%0A` +
      `💰 *Total: $${order.total.toLocaleString()}*%0A%0A` +
      `¡Gracias por elegirnos! 🍪`;
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Pedido no encontrado</h2>
        <Link href="/admin/pedidos" className="text-pink-500 hover:underline">
          ← Volver a pedidos
        </Link>
      </div>
    );
  }

  const customerName = order.users 
    ? `${order.users.nombre} ${order.users.apellido}`
    : 'Cliente';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pedidos"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Volver
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brown-800">
              Pedido {generateOrderCode(order.id)}
            </h1>
            <p className="text-gray-500 text-sm">
              {new Date(order.created_at).toLocaleString('es-UY', {
                dateStyle: 'full',
                timeStyle: 'short'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
            statusLabels[order.estado]?.color || 'bg-gray-100'
          }`}>
            {statusLabels[order.estado]?.icon} {statusLabels[order.estado]?.label || order.estado}
          </span>
        </div>
      </div>

      {/* Progress */}
      {order.estado !== 'cancelado' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Progreso del pedido</h3>
          <div className="flex items-center justify-between">
            {getStatusFlow().map((status, index) => {
              const statusFlow = getStatusFlow();
              const currentIndex = statusFlow.indexOf(order.estado);
              const isCompleted = index <= currentIndex;
              const isCurrent = status === order.estado;
              
              return (
                <div key={status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isCompleted 
                        ? isCurrent 
                          ? 'bg-pink-500 text-white ring-4 ring-pink-200' 
                          : 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {statusLabels[status]?.icon || '•'}
                    </div>
                    <span className={`text-xs mt-2 ${isCurrent ? 'font-semibold text-pink-600' : 'text-gray-500'}`}>
                      {statusLabels[status]?.label}
                    </span>
                  </div>
                  {index < statusFlow.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalles principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-700 mb-4">🛒 Productos</h3>
            <div className="space-y-3">
              {order.order_items?.map((item: any) => {
                // Parsear cookies incluidas si es una box
                let cookiesIncluidas = null;
                try {
                  if (item.cookies_incluidas) {
                    cookiesIncluidas = typeof item.cookies_incluidas === 'string' 
                      ? JSON.parse(item.cookies_incluidas) 
                      : item.cookies_incluidas;
                  }
                } catch (e) {}
                
                return (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cream-100 rounded-lg flex items-center justify-center text-xl">
                          {item.nombre?.includes('Box') ? '📦' : '🍪'}
                        </div>
                        <div>
                          <p className="font-medium">{item.nombre}</p>
                          <p className="text-sm text-gray-500">x{item.cantidad} @ ${item.precio.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="font-semibold">${item.subtotal.toLocaleString()}</p>
                    </div>
                    {/* Mostrar cookies incluidas en la box */}
                    {cookiesIncluidas && cookiesIncluidas.length > 0 && (
                      <div className="mt-2 ml-13 pl-3 border-l-2 border-primary/30">
                        <p className="text-xs text-gray-500 mb-1">Cookies incluidas:</p>
                        <div className="flex flex-wrap gap-1">
                          {cookiesIncluidas.map((c: any, i: number) => (
                            <span key={i} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              {c.cantidad}x {c.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.subtotal.toLocaleString()}</span>
              </div>
              {order.descuento > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento</span>
                  <span>-${order.descuento.toLocaleString()}</span>
                </div>
              )}
              {order.puntos_usados > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Puntos usados ({order.puntos_usados})</span>
                  <span>Aplicado</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Envío ({order.comuna || 'Retiro'})</span>
                <span>{order.envio === 0 ? 'Gratis' : `$${order.envio.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-brown-800 pt-2 border-t">
                <span>Total</span>
                <span>${order.total.toLocaleString()}</span>
              </div>
              {order.puntos_ganados > 0 && (
                <p className="text-sm text-green-600 text-right">
                  +{order.puntos_ganados} puntos ganados
                </p>
              )}
            </div>
          </div>

          {/* Notas */}
          {order.notas && (
            <div className="bg-yellow-50 rounded-xl shadow-md p-6 border border-yellow-200">
              <h3 className="font-semibold text-gray-700 mb-2">📝 Notas del cliente</h3>
              <p className="text-gray-700">{order.notas}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cliente */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-700 mb-4">👤 Cliente</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-brown-800">{customerName}</p>
                <p className="text-gray-500 text-sm">{order.customer_email || order.users?.email || 'Sin email'}</p>
              </div>
              {(order.customer_phone || order.users?.telefono) && (
                <a 
                  href={`tel:${order.customer_phone || order.users?.telefono}`}
                  className="flex items-center gap-2 text-green-600 hover:underline"
                >
                  📱 {order.customer_phone || order.users?.telefono}
                </a>
              )}
              {order.users?.puntos !== undefined && (
                <p className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full inline-block">
                  ⭐ {order.users.puntos} puntos
                </p>
              )}
            </div>
          </div>

          {/* Entrega */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-700 mb-4">📍 Entrega</h3>
            {(() => {
              const esRetiro = order.tipo_entrega === 'retiro' || order.direccion === 'Retiro en local';
              return (
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${esRetiro ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <p className={`font-semibold text-sm ${esRetiro ? 'text-purple-800' : 'text-blue-800'}`}>
                      {esRetiro ? '🏪 RETIRO EN LOCAL' : '🚗 DELIVERY'}
                    </p>
                  </div>
                  {esRetiro ? (
                    <div className="text-gray-600">
                      <p className="font-medium">El cliente retira en:</p>
                      <p className="text-sm">Av. Juan Gorlero casi 25, Punta del Este</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700">{order.direccion}</p>
                      {order.comuna && <p className="text-gray-500 text-sm">Zona: {order.comuna}</p>}
                      {order.region && <p className="text-gray-500 text-sm">Departamento: {order.region}</p>}
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Pago */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-700 mb-4">💳 Método de Pago</h3>
            <p className="text-lg font-medium">
              {order.metodo_pago === 'efectivo' && '💵 Efectivo'}
              {order.metodo_pago === 'transferencia' && '🏦 Transferencia'}
              {order.metodo_pago === 'mercadopago' && '💳 MercadoPago'}
            </p>
            {/* Mostrar alias de transferencia si existe */}
            {order.metodo_pago === 'transferencia' && (order as any).transfer_alias && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Alias de transferencia:</p>
                <p className="font-semibold text-blue-800">{(order as any).transfer_alias}</p>
              </div>
            )}
            
            {/* Botón confirmar pago MercadoPago */}
            {order.metodo_pago === 'mercadopago' && order.estado === 'pendiente_pago' && (
              <div className="mt-4">
                <button
                  onClick={confirmPayment}
                  disabled={updating}
                  className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="material-icons text-sm">check_circle</span>
                  {updating ? 'Confirmando...' : 'Confirmar Pago Recibido'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Usa este botón si verificaste el pago en MercadoPago
                </p>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
            <h3 className="font-semibold text-gray-700 mb-4">⚡ Acciones</h3>
            
            {order.estado !== 'cancelado' && order.estado !== 'entregado' && getNextStatus(order.estado) && (
              <button
                onClick={() => updateStatus(getNextStatus(order.estado)!)}
                disabled={updating}
                className="w-full py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
              >
                {updating ? 'Actualizando...' : `→ Marcar como ${statusLabels[getNextStatus(order.estado)!]?.label}`}
              </button>
            )}

            <button
              onClick={sendWhatsApp}
              className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
            >
              💬 Enviar WhatsApp
            </button>

            {order.estado !== 'cancelado' && order.estado !== 'entregado' && (
              <button
                onClick={() => updateStatus('cancelado')}
                disabled={updating}
                className="w-full py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50"
              >
                Cancelar Pedido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
