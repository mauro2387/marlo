'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { productsDB } from '@/lib/supabase-fetch';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScrollAnimation from '@/components/ScrollAnimation';

interface Box {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad_cookies: number;
  ahorro: number;
  es_premium: boolean;
  orden: number;
}

interface Cookie {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  stock: number;
}

export default function BoxesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Parámetros de canje
  const esCanje = searchParams.get('canje') === 'true';
  const cantidadCanje = parseInt(searchParams.get('cantidad') || '0');
  const puntosCanje = parseInt(searchParams.get('puntos') || '0');
  const rewardId = searchParams.get('rewardId') || '';
  const nombreRecompensa = decodeURIComponent(searchParams.get('nombre') || 'Box Gratis');
  
  const sizeParam = searchParams.get('size');
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState<number | null>(null);
  const [cookiesSeleccionadas, setCookiesSeleccionadas] = useState<{[key: string]: number}>({});

  // Obtener items del carrito para calcular stock disponible
  const cartItems = useCartStore((state) => state.items);
  const getTotalQuantityForProduct = useCartStore((state) => state.getTotalQuantityForProduct);

  // Calcular stock disponible de una cookie (stock total - en carrito - seleccionadas en esta box)
  const getAvailableStock = (cookieId: string): number => {
    const cookie = cookies.find(c => c.id === cookieId);
    if (!cookie) return 0;
    
    const inCart = getTotalQuantityForProduct(cookieId);
    const inCurrentBox = cookiesSeleccionadas[cookieId] || 0;
    
    return Math.max(0, cookie.stock - inCart - inCurrentBox);
  };

  // Verificar si se puede agregar una cookie más
  const canAddCookie = (cookieId: string): boolean => {
    return getAvailableStock(cookieId) > 0;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (boxes.length > 0 && tamanoSeleccionado === null) {
      // Si es canje, fijar el tamaño según la recompensa
      if (esCanje && cantidadCanje > 0) {
        setTamanoSeleccionado(cantidadCanje);
        return;
      }
      
      if (sizeParam) {
        const boxWithSize = boxes.find(b => b.cantidad_cookies === parseInt(sizeParam));
        if (boxWithSize) {
          setTamanoSeleccionado(boxWithSize.cantidad_cookies);
          return;
        }
      }
      setTamanoSeleccionado(boxes[0].cantidad_cookies);
    }
  }, [boxes, sizeParam, tamanoSeleccionado, esCanje, cantidadCanje]);

  const fetchData = async () => {
    try {
      // Forzar refresh para tener stock actualizado
      const { data: allProducts, error } = await productsDB.getAll(true);
      if (error) throw error;
      
      const boxProducts = (allProducts || [])
        .filter((p: any) => p.categoria === 'boxes')
        .map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          cantidad_cookies: p.cantidad_cookies || parseInt(p.nombre.match(/\d+/)?.[0] || '6'),
          ahorro: p.ahorro || 0,
          es_premium: p.es_limitado || false,
          orden: p.orden || 999,
        }))
        // Ordenar por cantidad de cookies: la más chica primero, la más grande de última
        .sort((a: Box, b: Box) => a.cantidad_cookies - b.cantidad_cookies);
      
      const cookieProducts = (allProducts || [])
        .filter((p: any) => p.categoria === 'cookies' && p.activo)
        .map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.es_limitado ? 'especial' : 'clasica',
          imagen: p.imagen || '',
          stock: p.stock || 0
        }));
      
      setBoxes(boxProducts);
      setCookies(cookieProducts);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const { addNotification, openCart } = useUIStore();

  const boxActual = boxes.find(box => box.cantidad_cookies === tamanoSeleccionado);
  const totalSeleccionadas = Object.values(cookiesSeleccionadas).reduce((sum, cant) => sum + cant, 0);
  // En modo canje, usar cantidadCanje; si no, usar tamanoSeleccionado
  const cantidadObjetivo = esCanje ? cantidadCanje : (tamanoSeleccionado || 0);
  const restantes = cantidadObjetivo - totalSeleccionadas;

  const agregarCookie = (id: string) => {
    if (totalSeleccionadas >= cantidadObjetivo) {
      return; // Box completo
    }
    
    // Validar stock disponible
    if (!canAddCookie(id)) {
      const cookie = cookies.find(c => c.id === id);
      addNotification({
        type: 'error',
        message: `No hay más stock de ${cookie?.nombre || 'esta cookie'}`,
        duration: 3000,
      });
      return;
    }
    
    setCookiesSeleccionadas(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const quitarCookie = (id: string) => {
    setCookiesSeleccionadas(prev => {
      const nuevaCantidad = (prev[id] || 0) - 1;
      if (nuevaCantidad <= 0) {
        const { [id]: _, ...resto } = prev;
        return resto;
      }
      return { ...prev, [id]: nuevaCantidad };
    });
  };

  const cambiarTamano = (cantidad: number) => {
    setTamanoSeleccionado(cantidad);
    setCookiesSeleccionadas({});
  };

  const agregarBoxAlCarrito = () => {
    if (restantes > 0) {
      addNotification({
        type: 'warning',
        message: `Faltan ${restantes} cookies para completar tu box`,
        duration: 3000,
      });
      return;
    }

    // Crear lista de cookies incluidas para guardar en el carrito
    const cookiesIncluidas = Object.entries(cookiesSeleccionadas)
      .map(([id, cantidad]) => {
        const cookie = cookies.find(c => c.id === id);
        return {
          id,
          nombre: cookie?.nombre || '',
          cantidad
        };
      });

    const descripcionCookies = cookiesIncluidas
      .map(c => `${c.cantidad}x ${c.nombre}`)
      .join(', ');

    // Si es canje de puntos, manejar diferente
    if (esCanje) {
      // Limpiar carrito y agregar el box gratis
      clearCart();
      
      addItem({
        id: `reward-box-${rewardId}-${Date.now()}`,
        nombre: `🎁 ${nombreRecompensa}`,
        precio: 0, // GRATIS
        imagen: '',
        categoria: 'recompensa',
        cookiesIncluidas,
        esCanjeoPuntos: true,
        puntosRequeridos: puntosCanje,
        rewardId: rewardId,
      });

      addNotification({
        type: 'success',
        message: '¡Box gratis agregado! Completa tu pedido.',
        duration: 3000,
      });

      // Redirigir al checkout con método puntos
      router.push('/checkout?metodo=puntos');
      return;
    }

    // Flujo normal (no es canje)
    addItem({
      id: `box-custom-${Date.now()}`,
      nombre: `Box ${tamanoSeleccionado} Cookies`,
      precio: boxActual!.precio,
      imagen: '',
      categoria: 'boxes',
      cookiesIncluidas,
    });

    addNotification({
      type: 'success',
      message: 'Box agregado al carrito',
      duration: 2000,
    });

    openCart();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-[120px] min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
      </>
    );
  }

  if (boxes.length === 0) {
    return (
      <>
        <Navbar />
        <main className="pt-[120px] min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <span className="material-icons text-gray-300" style={{fontSize: '80px'}}>inventory_2</span>
            <h2 className="text-2xl font-bold text-gray-700 mt-4">No hay box disponibles</h2>
            <p className="text-gray-500 mt-2">Pronto agregaremos nuevos box</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-24 sm:pt-28 lg:pt-[120px] min-h-screen bg-gray-50">
        {/* Banner de Canje */}
        {esCanje && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🎁</span>
                <div className="text-center">
                  <h2 className="text-lg font-bold">Canje de Puntos: {nombreRecompensa}</h2>
                  <p className="text-sm text-purple-100">
                    Elige {cantidadCanje} cookies para tu box gratis • Se usarán {puntosCanje.toLocaleString()} puntos
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Hero compacto */}
        <section className="bg-gradient-to-br from-secondary-crema via-white to-secondary-rosa/20 py-6 sm:py-8 lg:py-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation animation="fade-up">
            <div className="max-w-3xl mx-auto text-center">
              <span className="material-icons text-primary mb-1 sm:mb-2 text-4xl sm:text-5xl lg:text-[56px]">inventory_2</span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary mb-1 sm:mb-2">
                Arma tu Box Personalizado
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Elige el tamaño y selecciona tus sabores favoritos
              </p>
            </div>
            </ScrollAnimation>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Paso 1: Tamaño */}
          {!esCanje && (
          <ScrollAnimation animation="fade-up" delay={100}>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-primary mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs sm:text-sm">1</span>
              Elige el tamaño
            </h2>
            <div className={`grid gap-2 sm:gap-4 ${
              boxes.length <= 3 ? 'grid-cols-3 sm:grid-cols-3 max-w-2xl' : 'grid-cols-2 sm:grid-cols-4'
            }`}>
              {boxes.map(box => (
                <button
                  key={box.id}
                  onClick={() => cambiarTamano(box.cantidad_cookies)}
                  className={`relative p-2 sm:p-4 rounded-lg sm:rounded-xl text-center transition-all border-2 ${
                    tamanoSeleccionado === box.cantidad_cookies
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-primary/50'
                  }`}
                >
                  {box.es_premium && (
                    <span className="absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 bg-yellow-500 text-white text-[8px] sm:text-xs font-bold rounded-full">
                      PREMIUM
                    </span>
                  )}
                  <span className="material-icons text-primary mb-0.5 sm:mb-1 text-xl sm:text-3xl lg:text-[32px]">inventory_2</span>
                  <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-primary">{box.cantidad_cookies} Cookies</h3>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-secondary-salmon">${box.precio.toLocaleString('es-UY')}</p>
                  {box.ahorro > 0 && (
                    <span className="text-[8px] sm:text-xs text-green-600 font-semibold">Ahorrás {box.ahorro}%</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          </ScrollAnimation>
          )}

          {/* Layout principal: Cookies + Checkout lateral */}
          <ScrollAnimation animation="fade-in" delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Paso 2: Selección de cookies - Grid de 3 columnas en móvil */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-primary mb-3 sm:mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs sm:text-sm">{esCanje ? '1' : '2'}</span>
                  Selecciona tus {esCanje ? cantidadCanje : ''} cookies {esCanje ? 'gratis' : ''}
                </span>
                <span className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold ${
                  restantes === 0 ? 'bg-green-100 text-green-700' : 'bg-secondary-crema text-primary'
                }`}>
                  {restantes === 0 ? (
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-sm sm:text-base">check_circle</span>
                      <span className="hidden sm:inline">Completo</span>
                      <span className="sm:hidden">✓</span>
                    </span>
                  ) : (
                    `${restantes} restantes`
                  )}
                </span>
              </h2>

              {/* Grid de 3 columnas en móvil */}
              <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                {cookies.map(cookie => {
                  const availableStock = getAvailableStock(cookie.id);
                  const noStock = availableStock <= 0 && !cookiesSeleccionadas[cookie.id];
                  const canAdd = canAddCookie(cookie.id);
                  
                  return (
                  <div key={cookie.id} className={`bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${noStock ? 'opacity-60' : ''}`}>
                    {/* Imagen */}
                    <div className="aspect-[4/5] bg-gradient-to-br from-secondary-crema to-secondary-rosa/20 flex items-center justify-center overflow-hidden relative">
                      {cookie.imagen && (cookie.imagen.startsWith('http') || cookie.imagen.startsWith('/')) ? (
                        <img src={cookie.imagen} alt={cookie.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-icons text-primary text-4xl sm:text-5xl">cookie</span>
                      )}
                      {/* Badge de cantidad seleccionada */}
                      {cookiesSeleccionadas[cookie.id] > 0 && (
                        <div className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {cookiesSeleccionadas[cookie.id]}
                        </div>
                      )}
                      {/* Badge de sin stock */}
                      {noStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-red-500 text-white text-[8px] sm:text-xs font-bold px-2 py-1 rounded">AGOTADO</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="p-2 sm:p-3 flex flex-col flex-1">
                      <h3 className="font-bold text-primary text-xs sm:text-sm line-clamp-2 leading-tight mb-1 flex-grow">{cookie.nombre}</h3>
                      {/* Stock disponible */}
                      {cookie.stock > 0 && cookie.stock <= 10 && !noStock && (
                        <span className="text-[8px] sm:text-[10px] text-orange-600 mb-1">Quedan {availableStock + (cookiesSeleccionadas[cookie.id] || 0)}</span>
                      )}
                      
                      {/* Botones */}
                      <div className="flex items-center justify-between gap-1 mt-auto">
                        {cookiesSeleccionadas[cookie.id] > 0 && (
                          <button
                            onClick={() => quitarCookie(cookie.id)}
                            className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors flex-shrink-0"
                          >
                            <span className="material-icons text-base text-gray-600">remove</span>
                          </button>
                        )}
                        <button
                          onClick={() => agregarCookie(cookie.id)}
                          disabled={restantes === 0 || !canAdd}
                          className={`w-7 h-7 rounded flex items-center justify-center transition-colors flex-shrink-0 ml-auto ${
                            restantes === 0 || !canAdd
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-primary hover:bg-primary-dark text-white'
                          }`}
                        >
                          <span className="material-icons text-base">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Checkout lateral - 1 columna (sticky en desktop, fijo abajo en móvil) */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              {/* En móvil: barra fija abajo */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 z-40 lg:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {esCanje ? (
                        <span className="text-lg font-bold text-green-600">GRATIS</span>
                      ) : (
                        <span className="text-lg font-bold text-primary">${boxActual?.precio.toLocaleString('es-UY')}</span>
                      )}
                      <span className="text-xs text-gray-500">{totalSeleccionadas}/{esCanje ? cantidadCanje : tamanoSeleccionado}</span>
                    </div>
                    {restantes > 0 && (
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full transition-all ${esCanje ? 'bg-purple-600' : 'bg-primary'}`}
                          style={{width: `${(totalSeleccionadas / (esCanje ? cantidadCanje : tamanoSeleccionado || 1)) * 100}%`}}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    disabled={restantes !== 0}
                    onClick={agregarBoxAlCarrito}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
                      restantes === 0
                        ? esCanje 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                          : 'bg-primary hover:bg-primary-dark text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {restantes === 0 ? (
                      esCanje ? (
                        <>
                          <span className="material-icons text-lg">redeem</span>
                          Canjear
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-lg">add_shopping_cart</span>
                          Agregar
                        </>
                      )
                    ) : (
                      `Faltan ${restantes}`
                    )}
                  </button>
                </div>
              </div>
              
              {/* En desktop: sidebar sticky */}
              <div className="hidden lg:block sticky top-28">
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                  <h3 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="material-icons text-lg sm:text-xl">shopping_cart</span>
                    Tu Box
                  </h3>

                  {totalSeleccionadas === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-gray-400">
                      <span className="material-icons mb-2 text-4xl sm:text-5xl">inventory_2</span>
                      <p className="text-xs sm:text-sm">Selecciona cookies para tu box</p>
                    </div>
                  ) : (
                    <>
                      {/* Lista de cookies seleccionadas */}
                      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 max-h-48 sm:max-h-64 overflow-y-auto">
                        {Object.entries(cookiesSeleccionadas).map(([id, cantidad]) => {
                          const cookie = cookies.find(c => c.id === id);
                          return (
                            <div key={id} className="flex items-center justify-between py-1.5 sm:py-2 border-b border-gray-100">
                              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <span className="material-icons text-primary text-sm sm:text-lg">cookie</span>
                                <span className="text-xs sm:text-sm text-gray-700 truncate">{cookie?.nombre}</span>
                              </div>
                              <span className="font-bold text-primary text-xs sm:text-base flex-shrink-0">×{cantidad}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-3 sm:mb-4">
                        <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
                          <span>{totalSeleccionadas} de {tamanoSeleccionado}</span>
                          <span>{Math.round((totalSeleccionadas / (tamanoSeleccionado || 1)) * 100)}%</span>
                        </div>
                        <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${restantes === 0 ? 'bg-green-500' : 'bg-primary'}`}
                            style={{width: `${(totalSeleccionadas / (tamanoSeleccionado || 1)) * 100}%`}}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Resumen de precio */}
                  <div className="border-t pt-3 sm:pt-4 mb-3 sm:mb-4">
                    {esCanje ? (
                      <>
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                          <span className="text-gray-600 text-xs sm:text-sm">Box {cantidadCanje} cookies</span>
                          <span className="font-bold text-base sm:text-lg text-green-600">GRATIS</span>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-purple-600">Puntos a usar</span>
                          <span className="font-semibold text-purple-600">-{puntosCanje.toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                          <span className="text-gray-600 text-xs sm:text-sm">Box {tamanoSeleccionado} cookies</span>
                          <span className="font-bold text-base sm:text-lg text-primary">${boxActual?.precio.toLocaleString('es-UY')}</span>
                        </div>
                        {boxActual?.ahorro && boxActual.ahorro > 0 && (
                          <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-green-600">Ahorro</span>
                            <span className="font-semibold text-green-600">{boxActual.ahorro}%</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Botón agregar */}
                  <button
                    disabled={restantes !== 0}
                    onClick={agregarBoxAlCarrito}
                    className={`w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg transition-all flex items-center justify-center gap-2 ${
                      restantes === 0
                        ? esCanje 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {restantes === 0 ? (
                      esCanje ? (
                        <>
                          <span className="material-icons">redeem</span>
                          Canjear Box Gratis
                        </>
                      ) : (
                        <>
                          <span className="material-icons">add_shopping_cart</span>
                          Agregar al Carrito
                        </>
                      )
                    ) : (
                      `Faltan ${restantes} cookies`
                    )}
                  </button>
                </div>

                {/* Info adicional */}
                <div className="mt-3 sm:mt-4 bg-secondary-crema/50 rounded-xl p-3 sm:p-4">
                  <h4 className="font-bold text-primary mb-1.5 sm:mb-2 text-xs sm:text-sm flex items-center gap-1">
                    <span className="material-icons text-sm sm:text-base">info</span>
                    ¿Por qué un Box?
                  </h4>
                  <ul className="text-[10px] sm:text-xs text-gray-600 space-y-0.5 sm:space-y-1">
                    <li className="flex items-center gap-1">
                      <span className="material-icons text-green-500 text-xs sm:text-sm">check</span>
                      Ahorrás hasta 12% vs compra individual
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="material-icons text-green-500 text-xs sm:text-sm">check</span>
                      Presentación ideal para regalo
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="material-icons text-green-500 text-xs sm:text-sm">check</span>
                      100% personalizable
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          </ScrollAnimation>
          
          {/* Espaciado extra en móvil para la barra fija */}
          <div className="h-20 lg:hidden"></div>
        </div>
      </main>

      <Footer />
    </>
  );
}
