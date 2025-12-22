'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';
import { ordersDB, authDB } from '@/lib/supabase-fetch';
import { generateOrderCode } from '@/utils/validators';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OrderItem {
  id: string;
  name?: string;
  nombre?: string;
  quantity?: number;
  cantidad?: number;
  unit_price?: number;
  precio?: number;
  subtotal?: number;
}

interface Order {
  id: string;
  created_at: string;
  estado: string;
  total: number;
  subtotal: number;
  envio: number;
  descuento: number;
  direccion: string;
  comuna: string;
  region: string;
  metodo_pago: string;
  notas: string;
  puntos_ganados: number;
  puntos_usados: number;
  tipo_entrega?: string;
  delivery_type?: string;
  order_items: OrderItem[];
}

const estadoConfig: {[key: string]: {label: string, color: string, icon: string}} = {
  'pendiente_pago': { label: 'Pendiente de Pago', color: 'bg-orange-100 text-orange-700', icon: 'payment' },
  'preparando': { label: 'Preparando', color: 'bg-blue-100 text-blue-700', icon: 'restaurant' },
  'listo': { label: 'Listo para Retirar', color: 'bg-purple-100 text-purple-700', icon: 'store' },
  'en_camino': { label: 'En Camino', color: 'bg-yellow-100 text-yellow-700', icon: 'local_shipping' },
  'entregado': { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: 'check_circle' },
  'cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: 'cancel' },
};

// Intervalo de polling para actualización en tiempo real (10 segundos)
const POLLING_INTERVAL = 10000;

export default function PedidosPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Order | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/pedidos');
      return;
    }
    cargarPedidos();
    
    // Polling para actualización en tiempo real
    const interval = setInterval(() => {
      cargarPedidosSilencioso();
    }, POLLING_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  async function cargarPedidos() {
    try {
      setLoading(true);
      const userId = authDB.getCurrentUserId();
      if (!userId) {
        console.log('❌ No hay userId, no se pueden cargar pedidos');
        setPedidos([]);
        return;
      }
      
      console.log('🔍 Cargando pedidos para usuario:', userId);
      
      // Obtener pedidos del usuario usando el método de ordersDB
      const { data, error } = await ordersDB.getUserOrders(userId);
      
      if (error) {
        console.error('Error cargando pedidos:', error);
        setPedidos([]);
        return;
      }
      
      console.log('✅ Pedidos cargados:', data?.length || 0);
      setPedidos(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }
  
  // Cargar pedidos silenciosamente (sin mostrar loading) para polling
  async function cargarPedidosSilencioso() {
    try {
      const userId = authDB.getCurrentUserId();
      if (!userId) return;
      
      const { data, error } = await ordersDB.getUserOrders(userId);
      
      if (!error && data) {
        // Siempre actualizar con los datos frescos del servidor
        setPedidos(prevPedidos => {
          const newDataStr = JSON.stringify(data.map((p: any) => ({ id: p.id, estado: p.estado })));
          const oldDataStr = JSON.stringify(prevPedidos.map(p => ({ id: p.id, estado: p.estado })));
          
          if (newDataStr !== oldDataStr) {
            console.log('🔄 Pedidos actualizados en tiempo real');
            setLastUpdate(new Date());
            return data;
          }
          return prevPedidos;
        });
      }
    } catch (error) {
      console.error('Error en polling:', error);
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      window.location.href = '/';
    }
  };

  const handleCancelarPedido = async (orderId: string) => {
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;
    
    try {
      await ordersDB.updateStatus(orderId, 'cancelado');
      cargarPedidos();
    } catch (error) {
      alert('No se puede cancelar el pedido');
    }
  };

  const handleContactarWhatsApp = (pedido: Order) => {
    const phone = '59897865053';
    const itemsList = pedido.order_items?.map(i => `• ${i.quantity || i.cantidad}x ${i.name || i.nombre}`).join('%0A') || '';
    const msg = `*Consulta Pedido MarLo*%0A%0A` +
      `Pedido ${generateOrderCode(pedido.id)}%0A` +
      `${user?.nombre} ${user?.apellido}%0A%0A` +
      `*Productos:*%0A${itemsList}%0A%0A` +
      `Total: $${pedido.total?.toLocaleString()}%0A` +
      `${pedido.direccion}`;
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const pedidosFiltrados = (() => {
    if (filtroEstado === 'todos') return pedidos;
    if (filtroEstado === 'activo') return pedidos.filter(p => ['preparando', 'en_camino'].includes(p.estado));
    if (filtroEstado === 'finalizado') return pedidos.filter(p => p.estado === 'entregado');
    return pedidos.filter(p => p.estado === filtroEstado);
  })();

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
      <main className="pt-24 sm:pt-28 lg:pt-[120px] min-h-screen bg-gray-50 overflow-x-hidden">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">Mis Pedidos</h1>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
                  Actualizado: {lastUpdate.toLocaleTimeString('es-UY')}
                </span>
                <button
                  onClick={cargarPedidos}
                  className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors"
                >
                  <span className="material-icons text-base sm:text-lg">refresh</span>
                  Actualizar
                </button>
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-4 lg:gap-8">
              {/* Sidebar */}
              <aside className="hidden lg:block lg:col-span-1">
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
                      className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg font-medium"
                    >
                      <span className="material-icons text-xl">inventory_2</span>
                      <span>Mis Pedidos</span>
                    </Link>
                    <Link 
                      href="/puntos" 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors"
                    >
                      <span className="material-icons text-xl">stars</span>
                      <span>Mis Puntos</span>
                      <span className="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">
                        {user?.puntos || 0}
                      </span>
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
              </aside>

              {/* Contenido Principal */}
              <div className="lg:col-span-3">
                {/* Filtros */}
                <div className="card p-3 sm:p-6 mb-6 sm:mb-8 ">
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    <button
                      onClick={() => setFiltroEstado('todos')}
                      className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                        filtroEstado === 'todos'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Todos ({pedidos.length})
                    </button>
                    <button
                      onClick={() => setFiltroEstado('preparando')}
                      className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                        filtroEstado === 'preparando'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      Preparando ({pedidos.filter(p => p.estado === 'preparando').length})
                    </button>
                    <button
                      onClick={() => setFiltroEstado('activo')}
                      className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                        filtroEstado === 'activo'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      En Camino ({pedidos.filter(p => p.estado === 'en_camino').length})
                    </button>
                    <button
                      onClick={() => setFiltroEstado('finalizado')}
                      className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                        filtroEstado === 'finalizado'
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Finalizados ({pedidos.filter(p => p.estado === 'entregado').length})
                    </button>
                  </div>
                </div>

                {/* Lista de Pedidos */}
                <div className="space-y-6">
                  {pedidosFiltrados.length > 0 ? (
                    pedidosFiltrados.map(pedido => {
                      const config = estadoConfig[pedido.estado] || estadoConfig['preparando'];
                      const tipoEntrega = pedido.tipo_entrega || pedido.delivery_type || 'delivery';
                      const esRetiro = tipoEntrega === 'retiro' || pedido.direccion === 'Retiro en local';
                      
                      return (
                        <div key={pedido.id} className="card p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-base sm:text-xl font-bold text-primary">
                                  Pedido {generateOrderCode(pedido.id)}
                                </h3>
                                {/* Badge tipo de entrega */}
                                <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full ${
                                  esRetiro 
                                    ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                                    : 'bg-blue-100 text-blue-700 border border-blue-300'
                                }`}>
                                  {esRetiro ? '🏪 Retiro' : '🚗 Delivery'}
                                </span>
                              </div>
                              <p className="text-gray-500 text-xs sm:text-sm">
                                {new Date(pedido.created_at).toLocaleDateString('es-UY', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <span className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm ${config.color}`}>
                              <span className="material-icons text-sm sm:text-lg">{config.icon}</span>
                              <span className="hidden sm:inline">{config.label}</span>
                            </span>
                          </div>

                          <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-3 sm:mb-4">
                            <div className="space-y-1.5 sm:space-y-2">
                              {pedido.order_items?.map((item, idx) => {
                                const qty = item.quantity || item.cantidad || 1;
                                const name = item.name || item.nombre || 'Producto';
                                const sub = item.subtotal || ((item.unit_price || item.precio || 0) * qty);
                                return (
                                  <div key={idx} className="flex justify-between text-gray-700 text-xs sm:text-base">
                                    <span className="truncate mr-2">{qty}x {name}</span>
                                    <span className="font-semibold flex-shrink-0">${sub?.toLocaleString('es-UY')}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Información de entrega */}
                          <div className={`rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 ${esRetiro ? 'bg-purple-50' : 'bg-gray-50'}`}>
                            {esRetiro ? (
                              <div className="flex items-center gap-2">
                                <span className="material-icons text-purple-600 text-base sm:text-xl">store</span>
                                <div>
                                  <p className="font-medium text-purple-800 text-xs sm:text-base">Retiro en Local</p>
                                  <p className="text-[10px] sm:text-sm text-purple-600">Av. Juan Gorlero casi 25, Punta del Este</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs sm:text-sm text-gray-600">
                                <span className="material-icons text-xs sm:text-sm align-middle mr-1">location_on</span>
                                <span className="break-words">{pedido.direccion}{pedido.comuna && `, ${pedido.comuna}`}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                            <div>
                              <p className="text-xl sm:text-2xl font-bold text-primary">
                                ${pedido.total?.toLocaleString('es-UY')}
                              </p>
                              {pedido.puntos_ganados > 0 && (
                                <p className="text-xs sm:text-sm text-green-600">
                                  +{pedido.puntos_ganados} puntos ganados
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {pedido.estado === 'preparando' && (
                                <button
                                  onClick={() => handleCancelarPedido(pedido.id)}
                                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors text-xs sm:text-sm"
                                >
                                  Cancelar
                                </button>
                              )}
                              <button
                                onClick={() => handleContactarWhatsApp(pedido)}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                              >
                                <span className="material-icons text-sm sm:text-lg">chat</span>
                                <span className="hidden sm:inline">WhatsApp</span>
                              </button>
                              <button
                                onClick={() => setPedidoSeleccionado(pedido)}
                                className="px-3 sm:px-6 py-1.5 sm:py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors text-xs sm:text-sm"
                              >
                                Ver Detalles
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="card p-16 text-center">
                      <span className="material-icons mb-6 block" style={{fontSize: '100px', color: '#8B4513'}}>inventory_2</span>
                      <h3 className="text-2xl font-bold text-gray-700 mb-2">
                        {filtroEstado === 'todos' ? 'Aún no tienes pedidos' : 'No hay pedidos con este estado'}
                      </h3>
                      <p className="text-gray-500 mb-8">
                        {filtroEstado === 'todos' 
                          ? '¡Haz tu primer pedido y empieza a acumular puntos!' 
                          : 'Prueba con otro filtro'}
                      </p>
                      <Link href="/productos" className="btn-primary">
                        Ir a Comprar
                      </Link>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="card p-8 mt-8 bg-gradient-to-br from-primary to-primary-dark text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">¿Quieres hacer un nuevo pedido?</h3>
                      <p className="text-white/90">
                        Aprovecha nuestras promociones y gana más puntos
                      </p>
                    </div>
                    <Link 
                      href="/productos" 
                      className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-secondary-crema transition-colors"
                    >
                      Ver Productos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Detalle Pedido */}
        {pedidoSeleccionado && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setPedidoSeleccionado(null)}
          >
            <div 
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-primary">
                  Detalle del Pedido
                </h2>
                <button
                  onClick={() => setPedidoSeleccionado(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Número de Pedido</p>
                      <p className="font-bold text-primary">#{pedidoSeleccionado.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Estado</p>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-semibold ${estadoConfig[pedidoSeleccionado.estado]?.color}`}>
                        <span className="material-icons text-lg">{estadoConfig[pedidoSeleccionado.estado]?.icon}</span>
                        <span>{estadoConfig[pedidoSeleccionado.estado]?.label}</span>
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Fecha</p>
                      <p className="font-semibold">{new Date(pedidoSeleccionado.created_at).toLocaleDateString('es-UY')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Método de Pago</p>
                      <p className="font-semibold capitalize">{pedidoSeleccionado.metodo_pago}</p>
                      {/* Mostrar alias de transferencia si existe */}
                      {pedidoSeleccionado.metodo_pago === 'transferencia' && (pedidoSeleccionado as any).transfer_alias && (
                        <p className="text-xs text-blue-600 mt-1">
                          Alias: <span className="font-semibold">{(pedidoSeleccionado as any).transfer_alias}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {pedidoSeleccionado.direccion && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                      <span className="material-icons">location_on</span>
                      Dirección de Entrega
                    </h4>
                    <p className="text-gray-700">{pedidoSeleccionado.direccion}</p>
                    {pedidoSeleccionado.comuna && <p className="text-gray-600">{pedidoSeleccionado.comuna}, {pedidoSeleccionado.region}</p>}
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-lg mb-4">Productos</h3>
                  <div className="space-y-3">
                    {pedidoSeleccionado.order_items?.map((item: any, idx) => {
                      const qty = item.quantity || item.cantidad || 1;
                      const name = item.name || item.nombre || 'Producto';
                      const price = item.unit_price || item.precio || 0;
                      const sub = item.subtotal || (price * qty);
                      
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
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{name}</p>
                              <p className="text-sm text-gray-500">Cantidad: {qty} × ${price}</p>
                              {/* Mostrar cookies incluidas en la box */}
                              {cookiesIncluidas && cookiesIncluidas.length > 0 && (
                                <div className="mt-2 pl-3 border-l-2 border-primary/30">
                                  <p className="text-xs text-gray-500 mb-1">Cookies incluidas:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {cookiesIncluidas.map((c: any, i: number) => (
                                      <span key={i} className="text-xs bg-secondary-crema px-2 py-0.5 rounded">
                                        {c.cantidad}x {c.nombre}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="font-bold text-primary">${sub?.toLocaleString('es-UY')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${pedidoSeleccionado.subtotal?.toLocaleString('es-UY')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>{pedidoSeleccionado.envio === 0 ? 'Gratis' : `$${pedidoSeleccionado.envio}`}</span>
                  </div>
                  {pedidoSeleccionado.descuento > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>-${pedidoSeleccionado.descuento?.toLocaleString('es-UY')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">${pedidoSeleccionado.total?.toLocaleString('es-UY')}</span>
                  </div>
                  {pedidoSeleccionado.puntos_ganados > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Puntos ganados</span>
                      <span>+{pedidoSeleccionado.puntos_ganados}</span>
                    </div>
                  )}
                </div>

                {pedidoSeleccionado.notas && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Notas:</strong> {pedidoSeleccionado.notas}
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => handleContactarWhatsApp(pedidoSeleccionado)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <span className="material-icons">chat</span>
                    Contactar por WhatsApp
                  </button>
                  <Link 
                    href="/productos"
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors text-center"
                  >
                    Repetir Pedido
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
