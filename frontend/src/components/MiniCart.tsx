'use client';

import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MiniCart() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { isCartOpen, closeCart, addNotification } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();

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
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛒</span>
              <div>
                <h2 className="text-xl font-bold text-primary">Carrito</h2>
                <p className="text-sm text-gray-500">{items.length} productos</p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <span className="text-6xl mb-4">🛒</span>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Carrito vacío</h3>
                <p className="text-gray-500 mb-6">Agrega tus cookies favoritas</p>
                <Link
                  href="/productos"
                  onClick={closeCart}
                  className="btn-primary"
                >
                  Ver Productos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-secondary-crema to-secondary-rosa/20 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.imagen?.startsWith('http') || item.imagen?.startsWith('/') ? (
                        <img 
                          src={item.imagen} 
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">{item.categoria === 'boxes' ? '📦' : (item.imagen || '🍪')}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{item.nombre}</h3>
                      {/* Mostrar cookies incluidas en la box */}
                      {item.cookiesIncluidas && item.cookiesIncluidas.length > 0 ? (
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                          {item.cookiesIncluidas.map((cookie, idx) => (
                            <span key={idx} className="block">• {cookie.cantidad}x {cookie.nombre}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mb-2">{item.categoria}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">${(item.precio * item.cantidad).toLocaleString('es-CL')}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-gray-500 text-xs">Se calcula en checkout</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-bold text-lg">Subtotal</span>
                  <span className="font-bold text-lg text-primary">${subtotal.toLocaleString('es-CL')}</span>
                </div>
                <p className="text-xs text-gray-500">
                  + envío según zona
                </p>
                <p className="text-xs text-green-600">
                  💰 Ganarás puntos con esta compra
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/carrito"
                  onClick={closeCart}
                  className="block w-full px-6 py-3 bg-white text-primary font-semibold rounded-xl border-2 border-primary hover:bg-gray-50 transition-colors text-center"
                >
                  Ver Carrito
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full btn-primary text-center"
                >
                  Finalizar Compra
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
