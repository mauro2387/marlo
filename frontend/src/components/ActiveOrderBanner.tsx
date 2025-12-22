'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ordersDB, authDB } from '@/lib/supabase-fetch';
import { generateOrderCode } from '@/utils/validators';

interface OrderItem {
  name?: string;
  nombre?: string;
  quantity?: number;
  cantidad?: number;
}

interface ActiveOrder {
  id: string;
  estado: string;
  total: number;
  created_at: string;
  direccion: string;
  tipo_entrega?: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { 
  label: string; 
  sublabel: string;
  icon: string; 
  emoji: string;
  color: string; 
  bgColor: string;
  progress: number;
  animation?: string;
}> = {
  preparando: { 
    label: '¡Estamos preparando tu pedido!', 
    sublabel: 'Nuestro equipo está horneando tus cookies',
    icon: 'restaurant', 
    emoji: '👨‍🍳',
    color: 'text-purple-700', 
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    progress: 40,
    animation: 'animate-pulse'
  },
  listo: { 
    label: '¡Tu pedido está listo!', 
    sublabel: 'Puedes pasar a retirarlo al local',
    icon: 'store', 
    emoji: '🏪',
    color: 'text-indigo-700', 
    bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    progress: 80,
    animation: 'animate-pulse'
  },
  en_camino: { 
    label: '¡Tu pedido va en camino!', 
    sublabel: 'Llegará pronto a tu puerta',
    icon: 'local_shipping', 
    emoji: '🚗',
    color: 'text-orange-700', 
    bgColor: 'bg-gradient-to-r from-orange-500 to-yellow-500',
    progress: 75,
    animation: 'animate-bounce'
  },
  entregado: { 
    label: 'Pedido entregado', 
    sublabel: '¡Gracias por tu compra!',
    icon: 'check_circle', 
    emoji: '✅',
    color: 'text-green-700', 
    bgColor: 'bg-green-500',
    progress: 100 
  },
  cancelado: { 
    label: 'Pedido cancelado', 
    sublabel: '',
    icon: 'cancel', 
    emoji: '❌',
    color: 'text-red-700', 
    bgColor: 'bg-red-500',
    progress: 0 
  },
};

const stepsDelivery = [
  { id: 'confirmado', label: 'Confirmado', icon: '✓' },
  { id: 'preparando', label: 'Preparando', icon: '👨‍🍳' },
  { id: 'en_camino', label: 'En camino', icon: '🚗' },
  { id: 'entregado', label: 'Entregado', icon: '🍪' },
];

const stepsRetiro = [
  { id: 'confirmado', label: 'Confirmado', icon: '✓' },
  { id: 'preparando', label: 'Preparando', icon: '👨‍🍳' },
  { id: 'listo', label: 'Listo', icon: '🏪' },
  { id: 'entregado', label: 'Retirado', icon: '🍪' },
];

export default function ActiveOrderBanner() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (isAuthenticated) {
      checkActiveOrders();
      
      // Polling cada 10 segundos para actualizaciones en tiempo real
      const interval = setInterval(checkActiveOrders, 10000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setActiveOrders([]);
    }
  }, [isAuthenticated, mounted]);

  const checkActiveOrders = async () => {
    const userId = authDB.getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await ordersDB.getActiveOrders(userId);
      
      if (!error && data && data.length > 0) {
        setActiveOrders(data);
        // Si hay nuevos pedidos, quitar de dismissed
        const newIds = data.map((o: ActiveOrder) => o.id);
        setDismissed(prev => prev.filter(id => !newIds.includes(id)));
      } else {
        setActiveOrders([]);
      }
    } catch (err) {
      console.error('Error checking active orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const dismissOrder = (orderId: string) => {
    setDismissed(prev => [...prev, orderId]);
  };

  const visibleOrders = activeOrders.filter(o => !dismissed.includes(o.id));

  // No renderizar hasta que esté montado o mientras carga
  if (!mounted || loading || visibleOrders.length === 0) return null;

  const mainOrder = visibleOrders[0];
  const status = statusConfig[mainOrder.estado] || statusConfig.preparando;
  
  // Determinar si es retiro o delivery
  const esRetiro = mainOrder.tipo_entrega === 'retiro' || mainOrder.direccion === 'Retiro en local';
  const steps = esRetiro ? stepsRetiro : stepsDelivery;
  
  // Determinar paso actual
  const getCurrentStep = (estado: string) => {
    if (esRetiro) {
      switch(estado) {
        case 'preparando': return 1;
        case 'listo': return 2;
        case 'entregado': return 3;
        default: return 0;
      }
    } else {
      switch(estado) {
        case 'preparando': return 1;
        case 'en_camino': return 2;
        case 'entregado': return 3;
        default: return 0;
      }
    }
  };
  
  const currentStep = getCurrentStep(mainOrder.estado);

  // Calcular tiempo transcurrido
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${Math.floor(diffHours / 24)}d`;
  };

  return (
    <>
      {/* Banner flotante estilo McDonald's */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-0 md:bottom-6 md:left-auto md:right-6 md:w-[420px]">
        <div 
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${expanded ? 'scale-100' : 'scale-100'}`}
          style={{ boxShadow: '0 10px 50px rgba(0,0,0,0.2)' }}
        >
          {/* Barra de progreso animada */}
          <div className="h-1.5 bg-gray-100 overflow-hidden">
            <div 
              className={`h-full ${status.bgColor} transition-all duration-1000 ease-out relative`}
              style={{ width: `${status.progress}%` }}
            >
              {status.animation && (
                <div className="absolute inset-0 bg-white/30 animate-shimmer" />
              )}
            </div>
          </div>
          
          {/* Header con emoji y estado */}
          <div 
            className={`${status.bgColor} text-white p-4 cursor-pointer`}
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-4xl ${status.animation || ''}`}>
                  {status.emoji}
                </span>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{status.label}</h3>
                  <p className="text-white/80 text-sm">{status.sublabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm">{getTimeAgo(mainOrder.created_at)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); dismissOrder(mainOrder.id); }}
                  className="text-white/70 hover:text-white p-1"
                  aria-label="Cerrar"
                >
                  <span className="material-icons text-xl">close</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contenido expandible */}
          <div className={`transition-all duration-300 overflow-hidden ${expanded ? 'max-h-96' : 'max-h-0'}`}>
            <div className="p-4 bg-gray-50">
              {/* Timeline de pasos */}
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-lg
                          transition-all duration-300
                          ${isCompleted 
                            ? isCurrent 
                              ? `${status.bgColor} text-white ring-4 ring-opacity-30 shadow-lg` 
                              : 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-400'
                          }
                          ${isCurrent ? 'scale-110' : ''}
                        `}>
                          {isCompleted && !isCurrent ? '✓' : step.icon}
                        </div>
                        <span className={`text-xs mt-1 ${isCompleted ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-1 rounded ${idx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Productos del pedido */}
              {mainOrder.order_items && mainOrder.order_items.length > 0 && (
                <div className="bg-white rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-2">Tu pedido:</p>
                  <div className="flex flex-wrap gap-2">
                    {mainOrder.order_items.slice(0, 4).map((item, idx) => (
                      <span key={idx} className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {item.quantity || item.cantidad}x {item.name || item.nombre}
                      </span>
                    ))}
                    {mainOrder.order_items.length > 4 && (
                      <span className="text-sm text-gray-500">+{mainOrder.order_items.length - 4} más</span>
                    )}
                  </div>
                </div>
              )}

              {/* Info adicional */}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500">Pedido </span>
                  <span className="font-bold text-primary">{generateOrderCode(mainOrder.id)}</span>
                </div>
                <div className="font-bold text-lg text-primary">
                  ${mainOrder.total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="p-3 bg-white border-t flex gap-2">
            <Link
              href="/pedidos"
              className="flex-1 text-center py-2.5 px-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
            >
              Ver detalle
            </Link>
            <a
              href={`https://wa.me/59897865053?text=${encodeURIComponent(`Hola! Consulta sobre mi pedido ${generateOrderCode(mainOrder.id)}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors text-sm flex items-center gap-1"
            >
              <span className="material-icons text-lg">chat</span>
              Ayuda
            </a>
          </div>

          {/* Indicador de más pedidos */}
          {visibleOrders.length > 1 && (
            <div className="px-4 py-2 bg-gray-100 text-center">
              <Link href="/pedidos" className="text-xs text-gray-500 hover:text-primary">
                +{visibleOrders.length - 1} pedido(s) activo(s) más →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CSS para animación shimmer */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
}
