'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ordersDB, usersDB, loyaltyHistoryDB } from '@/lib/supabase-fetch';
import { supabase } from '@/lib/supabase/client';
import { generateOrderCode } from '@/utils/validators';
import LoadingSpinner from '@/components/LoadingSpinner';

interface OrderItem {
  id: string;
  name?: string;
  nombre?: string;
  cantidad?: number;
  quantity?: number;
  precio?: number;
  unit_price?: number;
  product_name?: string;
}

interface Order {
  id: string;
  user_id?: string;
  customer_name?: string;
  nombre_cliente?: string;
  customer_email?: string;
  email_cliente?: string;
  customer_phone?: string;
  telefono_cliente?: string;
  delivery_type?: string;
  tipo_entrega?: string;
  address?: string;
  direccion?: string;
  zone?: string;
  zona?: string;
  payment_method?: string;
  metodo_pago?: string;
  transferencia_confirmada?: boolean;
  subtotal: number;
  discount_coupon?: number;
  descuento_cupon?: number;
  discount_points?: number;
  descuento_puntos?: number;
  shipping_cost?: number;
  costo_envio?: number;
  total: number;
  estado: string;
  notes?: string | null;
  notas?: string | null;
  puntos_ganados?: number;
  created_at: string;
  order_items?: OrderItem[];
  users?: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    puntos?: number;
  };
}

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  preparando: { label: 'Preparando', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: 'restaurant' },
  listo: { label: 'Listo para Retirar', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: 'store' },
  en_camino: { label: 'En Camino', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: 'local_shipping' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-300', icon: 'check_circle' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300', icon: 'cancel' },
};

// Flujo de estados según tipo de entrega
const statusFlowDelivery = ['preparando', 'en_camino', 'entregado'];
const statusFlowRetiro = ['preparando', 'listo', 'entregado'];

// Intervalo de polling (10 segundos para mejor experiencia)
const POLLING_INTERVAL = 10000;

export default function AdminPedidosPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState(statusFilter);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());

  // Inicializar AudioContext para generar sonidos
  useEffect(() => {
    // NO intentar cargar mp3, usar solo AudioContext
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log('AudioContext no disponible');
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Función para reproducir sonido de notificación (beep con AudioContext)
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || !audioUnlocked) return;
    
    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      
      // Asegurarse de que el contexto esté activo
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      // Crear un beep de notificación más elaborado (dos tonos)
      const playTone = (freq: number, start: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + start);
        gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
        
        oscillator.start(ctx.currentTime + start);
        oscillator.stop(ctx.currentTime + start + duration);
      };
      
      // Secuencia de beeps: dos tonos ascendentes
      playTone(600, 0, 0.15);
      playTone(800, 0.15, 0.15);
      playTone(1000, 0.3, 0.2);
      
    } catch (e) {
      console.log('Error reproduciendo sonido:', e);
    }
  }, [soundEnabled, audioUnlocked]);

  // Desbloquear audio con primer clic
  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return;
    
    try {
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          setAudioUnlocked(true);
          console.log('🔊 Audio desbloqueado');
          
          // Reproducir beep de confirmación
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.frequency.value = 440;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.1);
        });
      } else if (ctx) {
        setAudioUnlocked(true);
        console.log('🔊 Audio ya estaba desbloqueado');
      }
    } catch (e) {
      console.log('No se pudo desbloquear audio:', e);
    }
  }, [audioUnlocked]);

  // Suscripción en tiempo real a Supabase
  useEffect(() => {
    console.log('Configurando realtime para orders...');
    
    const channel = supabase
      .channel('admin-orders-live')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('Evento realtime recibido:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            console.log('NUEVO PEDIDO DETECTADO:', payload.new);
            playNotificationSound();
            setNewOrdersCount(prev => prev + 1);
            
            // Recargar todos los pedidos para obtener datos completos con joins
            await fetchOrdersSilent();
            
            // Mostrar notificación del navegador
            if ('Notification' in window && Notification.permission === 'granted') {
              const newOrder = payload.new as any;
              new Notification('Nuevo Pedido MarLo Cookies', {
                body: `Pedido ${generateOrderCode(newOrder.id || '')} - $${newOrder.total?.toLocaleString() || '?'}`,
                icon: '/IMG/logo.png',
                tag: 'new-order'
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            console.log('Pedido actualizado:', payload.new);
            const updatedOrder = payload.new as Order;
            setOrders(prev => 
              prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o)
                .filter(o => filter === 'all' || o.estado === filter)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Estado conexión realtime:', status);
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    // Solicitar permiso para notificaciones del navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log('Desconectando canal realtime');
      supabase.removeChannel(channel);
    };
  }, [filter, playNotificationSound]);  

  // Polling como respaldo del realtime
  useEffect(() => {
    fetchOrders();
    
    // Polling cada 10 segundos como respaldo
    const interval = setInterval(() => {
      fetchOrdersSilent();
    }, POLLING_INTERVAL);
    
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Fetch silencioso para polling
  const fetchOrdersSilent = async () => {
    try {
      const { data, error } = await ordersDB.getAll();
      if (error) throw error;
      
      let filtered = data || [];
      if (filter !== 'all') {
        filtered = filtered.filter((o: any) => o.estado === filter);
      }
      
      // Detectar nuevos pedidos comparando IDs
      const currentIds = new Set(filtered.map((o: any) => o.id));
      const previousIds = previousOrderIdsRef.current;
      
      let newCount = 0;
      currentIds.forEach(id => {
        if (!previousIds.has(id)) {
          newCount++;
        }
      });
      
      if (newCount > 0 && previousIds.size > 0) {
        // Solo notificar si no es la primera carga
        setNewOrdersCount(prev => prev + newCount);
        playNotificationSound();
      }
      
      previousOrderIdsRef.current = currentIds;
      setOrders(filtered);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error en polling:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setNewOrdersCount(0);
    try {
      const { data, error } = await ordersDB.getAll();
      if (error) throw error;
      
      let filtered = data || [];
      if (filter !== 'all') {
        filtered = filtered.filter((o: any) => o.estado === filter);
      }
      
      // Guardar IDs actuales para comparar en polling
      previousOrderIdsRef.current = new Set(filtered.map((o: any) => o.id));
      
      setOrders(filtered);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando pedidos:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    // Verificar si es pago por transferencia y no está confirmada
    const order = orders.find(o => o.id === orderId);
    const paymentMethod = order?.metodo_pago || order?.payment_method;
    
    if (paymentMethod === 'transferencia' && !order?.transferencia_confirmada && newStatus === 'entregado') {
      alert('No se puede marcar como entregado sin confirmar la transferencia primero.');
      return;
    }
    
    setUpdating(orderId);
    try {
      console.log('Actualizando pedido', orderId, 'a estado:', newStatus);
      const { data, error } = await ordersDB.updateStatus(orderId, newStatus);
      
      if (error) {
        console.error('Error actualizando estado:', error);
        alert(`Error al actualizar el estado: ${error.message || 'Error desconocido'}`);
        return;
      }
      
      // Si se marca como ENTREGADO, los puntos se suman automáticamente
      // mediante el trigger 'update_loyalty_points_on_delivery' en la base de datos
      // NO sumar puntos manualmente aquí para evitar duplicación
      if (newStatus === 'entregado' && order?.user_id) {
        console.log(`Pedido ${orderId} marcado como entregado. Los puntos se suman automáticamente por trigger.`);
      }
      
      console.log('Estado actualizado correctamente');
      
      // Actualizar estado local
      setOrders(prevOrders => {
        const updated = prevOrders.map(o => 
          o.id === orderId ? { ...o, estado: newStatus } : o
        );
        
        if (filter !== 'all') {
          return updated.filter(o => o.estado === filter);
        }
        return updated;
      });
    } catch (err: any) {
      console.error('Error actualizando estado:', err);
      alert(`Error al actualizar: ${err?.message || 'Error de conexión'}`);
    } finally {
      setUpdating(null);
    }
  };

  // Obtener siguiente estado según tipo de entrega
  const getNextStatus = (order: Order) => {
    const deliveryType = order.tipo_entrega || order.delivery_type || 'delivery';
    const currentStatus = order.estado;
    const paymentMethod = order.metodo_pago || order.payment_method;
    
    const isRetiro = deliveryType === 'retiro';
    const flow = isRetiro ? statusFlowRetiro : statusFlowDelivery;
    const currentIndex = flow.indexOf(currentStatus);
    
    if (currentIndex === -1 || currentIndex >= flow.length - 1) return null;
    
    const nextStatus = flow[currentIndex + 1];
    
    // Si es transferencia y no está confirmada, no permitir avanzar a entregado
    if (paymentMethod === 'transferencia' && !order.transferencia_confirmada && nextStatus === 'entregado') {
      return null;
    }
    
    return nextStatus;
  };
  
  // Verificar si es estado final
  const isFinalStatus = (status: string) => {
    return ['entregado', 'cancelado'].includes(status);
  };

  // Confirmar transferencia recibida
  const confirmTransfer = async (orderId: string) => {
    setUpdating(orderId);
    try {
      const { error } = await ordersDB.confirmTransfer(orderId);
      
      if (error) throw error;
      
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, transferencia_confirmada: true } : o
      ));
    } catch (err: any) {
      console.error('Error confirmando transferencia:', err);
      alert('Error al confirmar la transferencia');
    } finally {
      setUpdating(null);
    }
  };

  // Confirmar pago recibido (para MercadoPago)
  const confirmPayment = async (orderId: string) => {
    if (!confirm('¿Confirmar que el pago fue recibido? El pedido pasará a "Preparando".')) {
      return;
    }
    
    setUpdating(orderId);
    try {
      const { error } = await ordersDB.confirmPayment(orderId);
      
      if (error) throw error;
      
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, estado: 'preparando' } : o
      ));
      
      // Mostrar mensaje de éxito
      alert('✅ Pago confirmado. El pedido está ahora en "Preparando".');
    } catch (err: any) {
      console.error('Error confirmando pago:', err);
      alert('Error al confirmar el pago');
    } finally {
      setUpdating(null);
    }
  };

  // Test de sonido
  const testSound = () => {
    unlockAudio();
    setTimeout(() => {
      playNotificationSound();
    }, 100);
  };

  return (
    <div className="space-y-6" onClick={unlockAudio}>
      {/* Header con notificación de nuevos pedidos */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brown-800 flex items-center gap-2">
            <span className="material-icons">inventory_2</span>
            Gestión de Pedidos
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">
              Última actualización: {lastUpdate.toLocaleTimeString('es-UY')} 
            </p>
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              realtimeConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
              {realtimeConnected ? 'Tiempo Real Activo' : 'Conectando...'}
            </span>
            {!audioUnlocked && (
              <span className="text-xs text-orange-600 flex items-center gap-1">
                <span className="material-icons text-sm">touch_app</span>
                Haz clic para activar sonido
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {newOrdersCount > 0 && (
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold animate-pulse flex items-center gap-2"
            >
              <span className="material-icons">notifications_active</span>
              {newOrdersCount} nuevo{newOrdersCount > 1 ? 's' : ''}! - Ver
            </button>
          )}
          <button
            onClick={testSound}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
              soundEnabled && audioUnlocked
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : soundEnabled
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title={soundEnabled ? (audioUnlocked ? 'Probar sonido' : 'Clic para activar') : 'Sonido desactivado'}
          >
            <span className="material-icons">{soundEnabled ? 'volume_up' : 'volume_off'}</span>
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            title={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
          >
            <span className="material-icons">{soundEnabled ? 'notifications' : 'notifications_off'}</span>
          </button>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <span className="material-icons">refresh</span>
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-brown-800 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('preparando')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filter === 'preparando' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            }`}
          >
            <span className="material-icons text-lg">restaurant</span> Preparando
          </button>
          <button
            onClick={() => setFilter('listo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filter === 'listo' ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
            }`}
          >
            <span className="material-icons text-lg">store</span> Listo (Retiro)
          </button>
          <button
            onClick={() => setFilter('en_camino')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filter === 'en_camino' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            <span className="material-icons text-lg">local_shipping</span> En Camino
          </button>
          <button
            onClick={() => setFilter('entregado')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filter === 'entregado' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            <span className="material-icons text-lg">check_circle</span> Entregados
          </button>
          <button
            onClick={() => setFilter('cancelado')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filter === 'cancelado' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            <span className="material-icons text-lg">cancel</span> Cancelados
          </button>
        </div>
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <span className="material-icons text-gray-300 mb-4" style={{fontSize: '80px'}}>inbox</span>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay pedidos</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Aún no se han recibido pedidos'
              : `No hay pedidos con estado "${statusLabels[filter]?.label || filter}"`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const customerName = order.users 
              ? `${order.users.nombre} ${order.users.apellido}`
              : order.nombre_cliente || order.customer_name || 'Cliente';
            const customerEmail = order.users?.email || order.email_cliente || order.customer_email || '';
            const customerPhone = order.users?.telefono || order.telefono_cliente || order.customer_phone || '';
            const deliveryType = order.tipo_entrega || order.delivery_type || 'delivery';
            const address = order.direccion || order.address || '';
            const zone = order.zona || order.zone || '';
            const paymentMethod = order.metodo_pago || order.payment_method || 'efectivo';
            const discountCoupon = order.descuento_cupon || order.discount_coupon || 0;
            const discountPoints = order.descuento_puntos || order.discount_points || 0;
            const shippingCost = order.costo_envio || order.shipping_cost || 0;
            const notes = order.notas || order.notes;
            
            return (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-cream-50 border-b flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Pedido</span>
                    <h3 className="font-mono font-bold text-brown-800">{generateOrderCode(order.id)}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    statusLabels[order.estado]?.color || 'bg-gray-100'
                  }`}>
                    {statusLabels[order.estado]?.label || order.estado}
                  </span>
                  {/* Alerta de transferencia pendiente */}
                  {paymentMethod === 'transferencia' && !order.transferencia_confirmada && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1 animate-pulse">
                      <span className="material-icons text-sm">warning</span>
                      Transferencia pendiente
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isFinalStatus(order.estado) && (
                    <>
                      {getNextStatus(order) ? (
                        <button
                          onClick={() => updateStatus(order.id, getNextStatus(order)!)}
                          disabled={updating === order.id}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                        >
                          {updating === order.id ? '...' : `Avanzar a ${statusLabels[getNextStatus(order)!]?.label}`}
                        </button>
                      ) : paymentMethod === 'transferencia' && !order.transferencia_confirmada ? (
                        <span className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm flex items-center gap-1">
                          <span className="material-icons text-sm">lock</span>
                          Confirma la transferencia primero
                        </span>
                      ) : null}
                      <button
                        onClick={() => updateStatus(order.id, 'cancelado')}
                        disabled={updating === order.id}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Productos - PRIMERO y MÁS VISIBLE */}
                <div className="md:col-span-2 lg:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <span className="material-icons text-base">cookie</span> Productos
                  </h4>
                  <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                    {order.order_items && order.order_items.length > 0 ? (
                      <ul className="space-y-2">
                        {order.order_items.map((item: any, idx: number) => {
                          const itemName = item.name || item.nombre || item.product_name || 'Producto';
                          const itemQty = item.quantity || item.cantidad || 1;
                          const itemPrice = item.unit_price || item.precio || 0;
                          
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
                            <li key={idx}>
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-brown-800">
                                  {itemQty}x {itemName}
                                </span>
                                <span className="text-gray-600">
                                  ${(itemPrice * itemQty).toLocaleString()}
                                </span>
                              </div>
                              {/* Mostrar cookies incluidas */}
                              {cookiesIncluidas && cookiesIncluidas.length > 0 && (
                                <div className="mt-1 ml-4 flex flex-wrap gap-1">
                                  {cookiesIncluidas.map((c: any, i: number) => (
                                    <span key={i} className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                                      {c.cantidad}x {c.nombre}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Sin detalles de productos</p>
                    )}
                  </div>
                </div>

                {/* Cliente */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <span className="material-icons text-base">person</span> Cliente
                  </h4>
                  <p className="font-medium">{customerName}</p>
                  <p className="text-sm text-gray-600">{customerEmail}</p>
                  {customerPhone && (
                    <a 
                      href={`https://wa.me/598${customerPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline flex items-center gap-1"
                    >
                      <span className="material-icons text-sm">phone_iphone</span> {customerPhone}
                    </a>
                  )}
                </div>

                {/* Entrega - con mejor visualización */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <span className="material-icons text-base">inventory_2</span> Entrega
                  </h4>
                  <div className={`p-3 rounded-lg ${deliveryType === 'retiro' ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <p className="font-semibold mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${
                        deliveryType === 'retiro' 
                          ? 'bg-purple-200 text-purple-800' 
                          : 'bg-blue-200 text-blue-800'
                      }`}>
                        <span className="material-icons text-sm">{deliveryType === 'retiro' ? 'store' : 'local_shipping'}</span>
                        {deliveryType === 'retiro' ? 'RETIRO EN LOCAL' : 'DELIVERY'}
                      </span>
                    </p>
                    {deliveryType === 'retiro' ? (
                      <p className="text-sm text-purple-700 mt-2">
                        <span className="font-medium">El cliente retira en el local</span>
                      </p>
                    ) : (
                      <>
                        <p className="text-sm mt-2">{address}</p>
                        {zone && <p className="text-sm text-gray-500">Zona: {zone}</p>}
                        
                        {/* Link de Google Maps para el repartidor */}
                        {address && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Maldonado, Uruguay')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span className="material-icons text-sm">navigation</span>
                            Abrir en Google Maps
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Pago */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <span className="material-icons text-base">payments</span> Pago
                  </h4>
                  <p className="text-sm mb-2">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-xs flex items-center gap-1 w-fit">
                      {paymentMethod === 'efectivo' && <><span className="material-icons text-green-600 text-sm">attach_money</span> Efectivo</>}
                      {paymentMethod === 'transferencia' && <><span className="material-icons text-blue-600 text-sm">account_balance</span> Transferencia</>}
                      {paymentMethod === 'mercadopago' && <><span className="material-icons text-sky-600 text-sm">credit_card</span> MercadoPago</>}
                    </span>
                  </p>
                  
                  {/* Botón de confirmar transferencia */}
                  {paymentMethod === 'transferencia' && (
                    <div className="mb-3">
                      {/* Mostrar alias de transferencia si existe */}
                      {(order as any).transfer_alias && (
                        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-600">Alias del cliente:</p>
                          <p className="font-bold text-blue-800 text-sm">{(order as any).transfer_alias}</p>
                        </div>
                      )}
                      {order.transferencia_confirmada ? (
                        <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-lg">
                          <span className="material-icons text-sm">verified</span>
                          Transferencia Confirmada
                        </span>
                      ) : (
                        <button
                          onClick={() => confirmTransfer(order.id)}
                          disabled={updating === order.id}
                          className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <span className="material-icons text-sm">pending</span>
                          {updating === order.id ? 'Confirmando...' : 'Confirmar Transferencia'}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Botón de confirmar pago MercadoPago */}
                  {paymentMethod === 'mercadopago' && order.estado === 'pendiente_pago' && (
                    <div className="mb-3">
                      <button
                        onClick={() => confirmPayment(order.id)}
                        disabled={updating === order.id}
                        className="flex items-center gap-1 text-xs bg-orange-100 text-orange-800 hover:bg-orange-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 w-full justify-center"
                      >
                        <span className="material-icons text-sm">check_circle</span>
                        {updating === order.id ? 'Confirmando...' : 'Confirmar Pago Recibido'}
                      </button>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Confirma manualmente si verificaste el pago en MP
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal:</span>
                      <span>${order.subtotal.toLocaleString()}</span>
                    </div>
                    {discountCoupon > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Cupón:</span>
                        <span>-${discountCoupon.toLocaleString()}</span>
                      </div>
                    )}
                    {discountPoints > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Puntos:</span>
                        <span>-${discountPoints.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Envío:</span>
                      <span>{shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>Total:</span>
                      <span className="text-pink-600">${order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {notes && (
                <div className="p-4 bg-yellow-50 border-t flex items-center gap-2">
                  <span className="material-icons text-yellow-600">notes</span>
                  <p className="text-sm">
                    <span className="font-medium">Notas:</span> {notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="material-icons text-base">schedule</span>
                  {new Date(order.created_at).toLocaleString('es-UY', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="text-pink-500 hover:underline flex items-center gap-1"
                >
                  Ver detalle completo <span className="material-icons text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
