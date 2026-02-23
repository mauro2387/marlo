'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useEffect, useState } from 'react';
import { productsDB } from '@/lib/supabase-fetch';
import { MetaPixelEvents } from '@/components/MetaPixel';

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { addNotification } = useUIStore();
  const [unavailableProducts, setUnavailableProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const subtotal = getSubtotal();

  // Verificar disponibilidad de productos
  useEffect(() => {
    const checkAvailability = async () => {
      if (items.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = items.map(item => item.id);
      const { data: products } = await productsDB.getAll(false);
      
      const unavailable = new Set<string>();
      productIds.forEach(id => {
        // Ignorar boxes personalizadas (box-xxx), canjes de puntos (canje-xxx) y otros IDs especiales
        if (id.startsWith('box-') || id.startsWith('canje-') || id.startsWith('reward-')) {
          return; // No verificar disponibilidad de estos items
        }
        const product = products?.find(p => p.id === id);
        if (!product || !product.activo) {
          unavailable.add(id);
        }
      });

      setUnavailableProducts(unavailable);
      setLoading(false);
    };

    checkAvailability();
  }, [items]);

  const hasUnavailableProducts = unavailableProducts.size > 0;

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    const result = updateQuantity(id, newQuantity);
    if (!result.success && result.message) {
      addNotification({
        type: 'error',
        message: result.message,
        duration: 3000,
      });
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-primary mb-8">Mi Carrito</h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-16 text-center">
              <span className="material-icons mb-6 block" style={{fontSize: '100px', color: '#9CA3AF'}}>shopping_cart</span>
              <h2 className="text-3xl font-bold text-gray-700 mb-4">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-8">
                ¡Agrega algunas cookies deliciosas a tu carrito!
              </p>
              <Link href="/productos" className="btn-primary text-lg">
                Ver Productos
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {hasUnavailableProducts && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="material-icons text-red-500 text-2xl">error</span>
                      <div>
                        <h3 className="font-bold text-red-800 mb-1">Productos no disponibles</h3>
                        <p className="text-red-700 text-sm">
                          Algunos productos de tu carrito ya no están disponibles. 
                          Por favor elimínalos para continuar con tu compra.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {items.map(item => {
                  const isUnavailable = unavailableProducts.has(item.id);
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`bg-white rounded-xl shadow-md p-6 ${isUnavailable ? 'border-2 border-red-300 opacity-75' : ''}`}
                    >
                      {isUnavailable && (
                        <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg mb-4 text-sm font-semibold flex items-center gap-2">
                          <span className="material-icons text-base">block</span>
                          ❌ Producto ya no disponible - Elimínalo para continuar
                        </div>
                      )}
                      
                      <div className="flex gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-secondary-crema to-secondary-rosa/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.imagen?.startsWith('http') || item.imagen?.startsWith('/') ? (
                            <img 
                              src={item.imagen} 
                              alt={item.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-5xl">{item.categoria === 'boxes' ? '📦' : (item.imagen || '🍪')}</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-primary mb-1">{item.nombre}</h3>
                          {item.cookiesIncluidas && item.cookiesIncluidas.length > 0 && (
                            <div className="text-sm text-gray-500 mb-2 flex flex-wrap gap-1">
                              {item.cookiesIncluidas.map((cookie, idx) => (
                                <span key={idx} className="bg-secondary-crema px-2 py-0.5 rounded text-xs">
                                  {cookie.cantidad}x {cookie.nombre}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-2xl font-bold text-secondary-salmon mb-4">
                            ${item.precio.toLocaleString('es-CL')}
                          </p>
                          
                          <div className="flex items-center gap-4">
                            {!isUnavailable ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center font-bold transition-colors"
                                >
                                  −
                                </button>
                                <span className="w-12 text-center font-semibold">{item.cantidad}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center font-bold transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="text-red-600 font-semibold text-sm">No disponible</span>
                            )}
                            
                            <button
                              onClick={() => {
                                removeItem(item.id);
                                addNotification({
                                  type: 'success',
                                  message: `${item.nombre} eliminado del carrito`,
                                  duration: 2000,
                                });
                              }}
                              className="ml-auto text-red-500 hover:text-red-700 font-semibold transition-colors"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                          <p className="text-2xl font-bold text-primary">
                            ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Link 
                  href="/productos" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors"
                >
                  ← Seguir Comprando
                </Link>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-primary mb-6">Resumen del Pedido</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${subtotal.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-sm">
                      <span>Envío</span>
                      <span className="italic">Se calcula en checkout</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">Subtotal</span>
                        <span className="font-bold text-2xl text-primary">${subtotal.toLocaleString('es-CL')}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">+ envío según zona</p>
                    </div>
                  </div>

                  <Link 
                    href="/checkout" 
                    className={`btn-primary w-full text-center text-lg mb-4 block ${hasUnavailableProducts ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => {
                      if (!hasUnavailableProducts) {
                        // Track Meta Pixel InitiateCheckout event
                        MetaPixelEvents.initiateCheckout(
                          subtotal,
                          items.length,
                          items.map(item => item.id)
                        );
                      }
                    }}
                  >
                    {hasUnavailableProducts ? '⚠️ Elimina productos no disponibles' : 'Ir a Pagar'}
                  </Link>
                  
                  <p className="text-center text-sm text-gray-500 mb-4">
                    💡 ¿Tienes un cupón? Aplícalo en el checkout
                  </p>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-base">local_shipping</span>
                      <span>Envío a domicilio disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-base">store</span>
                      <span>Retiro en local gratis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-base">card_giftcard</span>
                      <span>Gana puntos con cada compra</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
