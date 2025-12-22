'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PopupModal from '@/components/PopupModal';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { productsAPI } from '@/lib/api-optimized';
import { siteSettingsDB } from '@/lib/supabase-fetch';
import { MetaPixelEvents } from '@/components/MetaPixel';
import ImageGallery from '@/components/ImageGallery';

// Tipos
interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string | null;
  imagenes?: string[] | null;
  stock: number;
  es_limitado: boolean;
  cantidad_cookies?: number;
}

interface LimitedBannerSettings {
  limited_banner_title: string;
  limited_banner_subtitle: string;
  limited_banner_gradient: string;
  limited_banner_active: boolean;
  limited_banner_products: string[];
  limited_banner_show_images: boolean;
}

// Categorías disponibles
const CATEGORIAS = [
  { id: 'todas', nombre: 'Todas', icon: 'cookie' },
  { id: 'cookies', nombre: 'Cookies', icon: 'cookie' },
  { id: 'boxes', nombre: 'Box', icon: 'inventory_2' },
  { id: 'bebidas', nombre: 'Bebidas', icon: 'local_cafe' },
  { id: 'otros', nombre: 'Otros', icon: 'redeem' },
];

// Función para asignar emoji según producto
function getEmojiForProduct(nombre: string, categoria: string): string {
  const n = nombre.toLowerCase();
  
  // Bebidas
  if (categoria === 'bebidas') {
    if (n.includes('coca')) return '🥤';
    if (n.includes('fanta')) return '🍊';
    if (n.includes('sprite')) return '🍋';
    if (n.includes('agua')) return '💧';
    if (n.includes('jugo')) return '🧃';
    return '🥤';
  }
  
  // Box
  if (categoria === 'boxes') return '📦';
  
  // Otros
  if (categoria === 'otros') {
    if (n.includes('alfajor')) return '🍫';
    if (n.includes('chocotorta')) return '🎂';
    if (n.includes('roll')) return '🥖';
    return '🎁';
  }
  
  // Cookies
  if (n.includes('choco')) return '🍫';
  if (n.includes('oreo')) return '⚫';
  if (n.includes('red velvet')) return '❤️';
  if (n.includes('pistacho')) return '🥜';
  if (n.includes('lemon') || n.includes('limón')) return '🍋';
  if (n.includes('bon o bon') || n.includes('mantecol')) return '🥜';
  if (n.includes('halloween')) return '🎃';
  if (n.includes('navid')) return '🎄';
  
  return '🍪';
}

function ProductosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [ordenar, setOrdenar] = useState('destacados');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerSettings, setBannerSettings] = useState<LimitedBannerSettings>({
    limited_banner_title: 'Ediciones Limitadas',
    limited_banner_subtitle: 'Sabores exclusivos por tiempo limitado. ¡No te las pierdas!',
    limited_banner_gradient: 'from-purple-600 via-pink-600 to-purple-600',
    limited_banner_active: true,
    limited_banner_products: [],
    limited_banner_show_images: true
  });
  const [bannerProducts, setBannerProducts] = useState<Producto[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { addNotification, openCart } = useUIStore();

  // Cargar productos y configuración al montar
  useEffect(() => {
    cargarProductos();
    cargarBannerSettings();
  }, []);

  // Abrir modal si hay un ID en la URL
  useEffect(() => {
    const productId = searchParams.get('id');
    if (productId && productos.length > 0) {
      const producto = productos.find(p => p.id === productId);
      if (producto) {
        setProductoSeleccionado(producto);
        // Track Meta Pixel ViewContent event
        MetaPixelEvents.viewContent(producto.id, producto.nombre, producto.precio);
        // Limpiar el parámetro de la URL sin recargar
        router.replace('/productos', { scroll: false });
      }
    }
  }, [searchParams, productos, router]);

  // Actualizar productos del banner cuando cambian productos o settings
  useEffect(() => {
    if (productos.length > 0) {
      if (bannerSettings.limited_banner_products.length > 0) {
        // Usar productos seleccionados manualmente
        const selectedProducts = productos.filter(p => 
          bannerSettings.limited_banner_products.includes(p.id)
        );
        setBannerProducts(selectedProducts);
      } else {
        // Fallback: mostrar productos con es_limitado = true
        const limitedProducts = productos.filter(p => p.es_limitado);
        setBannerProducts(limitedProducts);
      }
    }
  }, [productos, bannerSettings.limited_banner_products]);

  async function cargarBannerSettings() {
    try {
      const { data } = await siteSettingsDB.get();
      if (data) {
        setBannerSettings({
          limited_banner_title: data.limited_banner_title || 'Ediciones Limitadas',
          limited_banner_subtitle: data.limited_banner_subtitle || 'Sabores exclusivos por tiempo limitado. ¡No te las pierdas!',
          limited_banner_gradient: data.limited_banner_gradient || 'from-purple-600 via-pink-600 to-purple-600',
          limited_banner_active: data.limited_banner_active ?? true,
          limited_banner_products: data.limited_banner_products || [],
          limited_banner_show_images: data.limited_banner_show_images ?? true
        });
      }
    } catch (err) {
      console.error('Error cargando configuración de banner:', err);
    }
  }

  async function cargarProductos() {
    try {
      // Forzar refresh para tener stock actualizado
      const data = await productsAPI.getAll(true);
      
      // Mapear a formato interno con emojis
      const productosMapeados: Producto[] = data.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precio: p.precio,
        categoria: p.categoria,
        imagen: p.imagen || getEmojiForProduct(p.nombre, p.categoria),
        imagenes: p.imagenes || null, // ← AGREGAR ESTO
        stock: p.stock || 0,
        es_limitado: p.es_limitado || false,
      }));
      
      setProductos(productosMapeados);
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      addNotification({
        type: 'error',
        message: 'Error al cargar productos',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }

  // Filtrar productos (en "todas" excluir box)
  const productosFiltrados = categoriaActiva === 'todas'
    ? productos.filter(p => p.categoria !== 'boxes')
    : productos.filter(p => p.categoria === categoriaActiva);

  // Ordenar productos
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    // Primero ordenar por categoría: cookies antes que bebidas
    const categoriaOrden: {[key: string]: number} = {
      'cookies': 1,
      'boxes': 2,
      'bebidas': 3,
      'otros': 4
    };
    
    const ordenA = categoriaOrden[a.categoria] || 999;
    const ordenB = categoriaOrden[b.categoria] || 999;
    
    if (ordenA !== ordenB) {
      return ordenA - ordenB;
    }
    
    // Luego aplicar el orden seleccionado por el usuario
    switch (ordenar) {
      case 'precio-asc':
        return a.precio - b.precio;
      case 'precio-desc':
        return b.precio - a.precio;
      case 'nombre':
        return a.nombre.localeCompare(b.nombre);
      default:
        return 0;
    }
  });

  // Agregar al carrito
  function agregarAlCarrito(producto: Producto) {
    const result = addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen || undefined,
      categoria: producto.categoria,
      stock: producto.stock,
    });
    
    if (result.success) {
      // Track Meta Pixel AddToCart event
      MetaPixelEvents.addToCart(producto.id, producto.nombre, producto.precio, 1);
      
      addNotification({
        type: 'success',
        message: `${producto.nombre} agregado al carrito`,
        duration: 2000,
      });
    } else {
      addNotification({
        type: 'error',
        message: result.message || 'No hay suficiente stock disponible',
        duration: 3000,
      });
    }
  }

  return (
    <>
      <Navbar />

      <main className="pt-24 sm:pt-28 lg:pt-[120px] min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-gradient-to-br from-secondary-crema to-white py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-2 sm:mb-4">
                Nuestros Productos
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                Cookies artesanales, box personalizados, bebidas y más.
              </p>
            </div>
          </div>
        </section>

        {/* Banner de ediciones limitadas */}
        {bannerSettings.limited_banner_active && bannerProducts.length > 0 && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className={`bg-gradient-to-r ${bannerSettings.limited_banner_gradient} rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 lg:p-8 text-white`}>
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <span className="material-icons text-3xl sm:text-4xl lg:text-5xl animate-pulse">star</span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">{bannerSettings.limited_banner_title}</h2>
              </div>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                {bannerSettings.limited_banner_subtitle}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {bannerProducts.map(p => (
                    <Link 
                      key={p.id}
                      href={`/productos#${p.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setProductoSeleccionado(p);
                        MetaPixelEvents.viewContent(p.id, p.nombre, p.precio);
                      }}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 hover:bg-white/30 transition-colors cursor-pointer"
                    >
                      {bannerSettings.limited_banner_show_images && (
                        p.imagen?.startsWith('http') || p.imagen?.startsWith('/') ? (
                          <img 
                            src={p.imagen} 
                            alt={p.nombre} 
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span>🍪</span>'; }}
                          />
                        ) : (
                          <span className="text-xl">{p.imagen || '🍪'}</span>
                        )
                      )}
                      {p.nombre}
                    </Link>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-32 sm:pb-16">
          {/* Filtros móviles - Arriba en horizontal */}
          <div className="lg:hidden mb-4">
            <div className="flex gap-2 mb-3">
              {/* Botón Filtrar */}
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  mobileFiltersOpen ? 'bg-primary text-white' : 'bg-white text-gray-700 shadow-md'
                }`}
              >
                <span className="material-icons text-lg">tune</span>
                Filtrar
                <span className="material-icons text-lg">{mobileFiltersOpen ? 'expand_less' : 'expand_more'}</span>
              </button>
              
              {/* Select Ordenar */}
              <select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-white text-gray-700 border-0 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              >
                <option value="destacados">Ordenar: Destacados</option>
                <option value="precio-asc">Precio: Menor a Mayor</option>
                <option value="precio-desc">Precio: Mayor a Menor</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
            </div>
            
            {/* Categorías expandibles */}
            {mobileFiltersOpen && (
              <div className="bg-white rounded-xl shadow-md p-4 animate-fade-in">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Categorías</h4>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategoriaActiva(cat.id);
                        setMobileFiltersOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                        categoriaActiva === cat.id
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="material-icons text-lg">{cat.icon}</span>
                      <span className="font-medium">{cat.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Sidebar de filtros - Solo Desktop */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:sticky lg:top-32">
                <h3 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4">Filtrar por</h3>
                
                {/* Categorías */}
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Categorías</h4>
                  <div className="flex flex-col space-y-2">
                    {CATEGORIAS.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoriaActiva(cat.id)}
                        className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg transition-all text-sm sm:text-base w-full ${
                          categoriaActiva === cat.id
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="material-icons text-lg sm:text-xl">{cat.icon}</span>
                        <span className="font-medium">{cat.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ordenar */}
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Ordenar por</h4>
                  <select
                    value={ordenar}
                    onChange={(e) => setOrdenar(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
                  >
                    <option value="destacados">Destacados</option>
                    <option value="precio-asc">Precio: Menor a Mayor</option>
                    <option value="precio-desc">Precio: Mayor a Menor</option>
                    <option value="nombre">Nombre A-Z</option>
                  </select>
                </div>

                {/* Info adicional */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-base text-green-600">card_giftcard</span>
                      <span>Gana puntos con cada compra</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Grid de productos */}
            <div className="lg:col-span-3">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">
                  {CATEGORIAS.find(c => c.id === categoriaActiva)?.nombre}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  <span className="font-semibold text-primary">{productosOrdenados.length}</span> productos encontrados
                </p>
              </div>

              {loading ? (
                // Loading skeleton
                <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-2 sm:p-5 space-y-1 sm:space-y-3">
                        <div className="h-4 sm:h-6 bg-gray-200 rounded"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 hidden sm:block"></div>
                        <div className="h-6 sm:h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : productosOrdenados.length > 0 ? (
                // Grid de productos - 3 columnas en móvil
                <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                  {productosOrdenados.map(producto => {
                    const sinStock = producto.stock <= 0;
                    const stockBajo = producto.stock > 0 && producto.stock <= 5;
                    
                    return (
                    <div key={producto.id} className={`bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group flex flex-col ${sinStock ? 'opacity-70' : ''}`}>
                      {/* Badges */}
                      <div className="relative">
                        {producto.es_limitado && (
                          <div className="absolute top-1 right-1 sm:top-3 sm:right-3 z-10">
                            <div className="px-1 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[8px] sm:text-xs font-bold rounded-full shadow-lg flex items-center gap-0.5">
                              <span className="material-icons text-[8px] sm:text-xs">star</span>
                              <span className="hidden sm:inline">LIMITADO</span>
                            </div>
                            <div className="mt-0.5 sm:mt-1 text-center">
                              <span className="text-[6px] sm:text-[10px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-medium">
                                Solo 15 días
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Imagen - más grande */}
                        <div 
                          className="aspect-[4/5] bg-gradient-to-br from-secondary-crema to-secondary-rosa/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden relative"
                          onClick={() => {
                            if (producto.categoria === 'boxes') {
                              const size = producto.cantidad_cookies || producto.nombre.match(/\d+/)?.[0] || '6';
                              window.location.href = `/boxes?size=${size}`;
                            } else {
                              setProductoSeleccionado(producto);
                              // Track Meta Pixel ViewContent event
                              MetaPixelEvents.viewContent(producto.id, producto.nombre, producto.precio);
                            }
                          }}
                        >
                          {producto.imagen?.startsWith('http') || producto.imagen?.startsWith('/') ? (
                            <img 
                              src={producto.imagen} 
                              alt={producto.nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '🍪';
                              }}
                            />
                          ) : (
                            <span className="text-4xl sm:text-7xl">{producto.imagen || '🍪'}</span>
                          )}
                          
                          {/* Badge de AGOTADO */}
                          {sinStock && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="bg-red-500 text-white text-[8px] sm:text-xs font-bold px-2 py-1 rounded">AGOTADO</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info del producto - Compacta en móvil */}
                      <div className="p-2 sm:p-4 lg:p-5 flex flex-col flex-1">
                        <h3 
                          className="font-bold text-xs sm:text-base lg:text-lg text-primary mb-1 sm:mb-2 group-hover:text-secondary-salmon transition-colors cursor-pointer line-clamp-2 leading-tight"
                          onClick={() => {
                            setProductoSeleccionado(producto);
                            MetaPixelEvents.viewContent(producto.id, producto.nombre, producto.precio);
                          }}
                        >
                          {producto.nombre}
                        </h3>
                        
                        <p className="text-[8px] sm:text-xs lg:text-sm text-gray-600 mb-1 sm:mb-4 line-clamp-2 hidden sm:block">
                          {producto.descripcion}
                        </p>
                        
                        {/* Stock bajo warning */}
                        {stockBajo && (
                          <span className="text-[8px] sm:text-xs text-orange-600 mb-1 flex items-center gap-0.5">
                            <span className="material-icons text-[10px] sm:text-xs">local_fire_department</span>
                            ¡Solo quedan {producto.stock}!
                          </span>
                        )}

                        <div className="flex items-end justify-between gap-1 mt-auto">
                          <span className="text-sm sm:text-xl lg:text-2xl font-bold text-primary">
                            ${producto.precio.toLocaleString('es-CL')}
                          </span>

                          {producto.categoria === 'boxes' ? (
                            <Link
                              href={`/boxes?size=${producto.cantidad_cookies || producto.nombre.match(/\d+/)?.[0] || '6'}`}
                              className="w-7 h-7 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded sm:rounded-lg text-center flex items-center justify-center flex-shrink-0"
                            >
                              <span className="material-icons text-base sm:hidden">build</span>
                              <span className="hidden sm:inline">Armar Box</span>
                            </Link>
                          ) : sinStock ? (
                            <button 
                              disabled
                              className="w-7 h-7 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-gray-300 text-gray-500 font-medium rounded sm:rounded-lg flex items-center justify-center flex-shrink-0 cursor-not-allowed"
                            >
                              <span className="material-icons text-base">block</span>
                              <span className="hidden sm:inline ml-1">Agotado</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => agregarAlCarrito(producto)}
                              className="w-7 h-7 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded sm:rounded-lg flex items-center justify-center flex-shrink-0"
                            >
                              <span className="material-icons text-base sm:text-base">add</span>
                              <span className="hidden sm:inline ml-1">Agregar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                // Estado vacío
                <div className="text-center py-12 sm:py-16">
                  <span className="material-icons mb-3 sm:mb-4 block text-6xl sm:text-7xl lg:text-[80px] text-gray-300">
                    sentiment_dissatisfied
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-1 sm:mb-2">No hay productos</h3>
                  <p className="text-gray-500 text-sm sm:text-base">Prueba con otra categoría</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-10 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-4">
              ¿No sabes qué elegir?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Arma tu propio box personalizado con tus sabores favoritos.
            </p>
            <Link 
              href="/boxes" 
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-primary font-bold text-base sm:text-lg rounded-xl hover:bg-secondary-crema transition-colors shadow-xl"
            >
              <span className="material-icons">inventory_2</span>
              Armar Mi Box
            </Link>
          </div>
        </section>

        {/* Carrito fijo móvil */}
        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 z-40 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">${getSubtotal().toLocaleString('es-UY')}</span>
                  <span className="text-xs text-gray-500 bg-primary/10 px-2 py-0.5 rounded-full">
                    {getTotalItems()} items
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">
                  {items.slice(0, 2).map(i => i.nombre).join(', ')}{items.length > 2 ? '...' : ''}
                </p>
              </div>
              <button
                onClick={openCart}
                className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white shadow-lg"
              >
                <span className="material-icons text-lg">shopping_cart</span>
                Ver Carrito
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Modal de detalle */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setProductoSeleccionado(null)}
          />
          <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProductoSeleccionado(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col sm:grid sm:grid-cols-2">
              {/* Imagen / Galería */}
              <div className="relative bg-gradient-to-br from-secondary-crema to-secondary-rosa/20 aspect-square overflow-hidden">
                {productoSeleccionado.es_limitado && (
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
                    <div className="px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                      <span className="material-icons text-xs sm:text-base">star</span>
                      <span className="hidden sm:inline">EDICIÓN LIMITADA</span>
                      <span className="sm:hidden">LIMITADO</span>
                    </div>
                    <div className="mt-1 sm:mt-2">
                      <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <span className="material-icons text-[10px] sm:text-xs">schedule</span>
                        Disponible solo 15 días
                      </span>
                    </div>
                  </div>
                )}
                {/* Usar galería si hay múltiples imágenes */}
                {(() => {
                  // Normalizar imagenes (puede venir como array, string JSON, o null)
                  let imgs = productoSeleccionado.imagenes;
                  if (typeof imgs === 'string') {
                    try { imgs = JSON.parse(imgs); } catch { imgs = []; }
                  }
                  if (!Array.isArray(imgs)) imgs = [];
                  
                  // Si no hay imagenes pero hay imagen, usar esa
                  if (imgs.length === 0 && productoSeleccionado.imagen && 
                      (productoSeleccionado.imagen.startsWith('http') || productoSeleccionado.imagen.startsWith('/'))) {
                    imgs = [productoSeleccionado.imagen];
                  }
                  
                  if (imgs.length > 0) {
                    return (
                      <ImageGallery
                        images={imgs}
                        productName={productoSeleccionado.nombre}
                        className="w-full h-full"
                      />
                    );
                  } else if (productoSeleccionado.imagen?.startsWith('http') || productoSeleccionado.imagen?.startsWith('/')) {
                    return (
                      <img 
                        src={productoSeleccionado.imagen} 
                        alt={productoSeleccionado.nombre}
                        className="w-full h-full object-cover"
                      />
                    );
                  } else {
                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl sm:text-9xl">{productoSeleccionado.imagen || '🍪'}</span>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Detalles */}
              <div className="p-4 sm:p-6 lg:p-8">
                <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold rounded-full mb-2 sm:mb-3">
                  {productoSeleccionado.categoria}
                </span>
                
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-2 sm:mb-4">
                  {productoSeleccionado.nombre}
                </h2>
                
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  {productoSeleccionado.descripcion}
                </p>

                {/* Link para compartir */}
                <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                  <span className="material-icons text-gray-400 text-sm">link</span>
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/productos?id=${productoSeleccionado.id}`}
                    className="flex-1 bg-transparent text-xs text-gray-500 truncate outline-none"
                  />
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/productos?id=${productoSeleccionado.id}`;
                      navigator.clipboard.writeText(url);
                      addNotification({
                        type: 'success',
                        message: '¡Link copiado!',
                        duration: 2000,
                      });
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title="Copiar link"
                  >
                    <span className="material-icons text-sm text-gray-600">content_copy</span>
                  </button>
                </div>

                {/* Características - Solo para cookies y boxes */}
                {(productoSeleccionado.categoria === 'cookies' || productoSeleccionado.categoria === 'boxes') && (
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">Ingredientes premium</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">Elaboración artesanal</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">Sin conservantes</span>
                    </div>
                  </div>
                )}

                {/* Stock */}
                {productoSeleccionado.stock <= 10 && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-orange-800 font-semibold flex items-center gap-1.5 sm:gap-2">
                      <span className="material-icons text-sm sm:text-base">local_fire_department</span>
                      ¡Solo quedan {productoSeleccionado.stock} unidades!
                    </p>
                  </div>
                )}

                {/* Precio y acción */}
                <div className="border-t pt-4 sm:pt-6">
                  <div className="flex items-baseline gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                      ${productoSeleccionado.precio.toLocaleString('es-CL')}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                      <span className="material-icons text-xs sm:text-sm">payments</span>
                      +{productoSeleccionado.precio} pts
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      const result = addItem({
                        id: productoSeleccionado.id,
                        nombre: productoSeleccionado.nombre,
                        precio: productoSeleccionado.precio,
                        imagen: productoSeleccionado.imagen || undefined,
                        categoria: productoSeleccionado.categoria,
                        stock: productoSeleccionado.stock,
                      });
                      
                      if (result.success) {
                        addNotification({
                          type: 'success',
                          message: `${productoSeleccionado.nombre} agregado al carrito`,
                          duration: 2000,
                        });
                        setProductoSeleccionado(null);
                        openCart();
                      } else {
                        addNotification({
                          type: 'error',
                          message: result.message || 'No hay suficiente stock disponible',
                          duration: 3000,
                        });
                      }
                    }}
                    disabled={productoSeleccionado.stock <= 0}
                    className={`w-full text-sm sm:text-base lg:text-lg py-3 sm:py-4 flex items-center justify-center gap-2 rounded-xl font-bold transition-all ${
                      productoSeleccionado.stock <= 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'btn-primary'
                    }`}
                  >
                    <span className="material-icons">shopping_cart</span>
                    {productoSeleccionado.stock <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                  </button>
                  
                  <p className="text-xs text-center text-gray-500 mt-3">
                    {/* Texto de envío gratis eliminado */}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Popup Modal */}
      <PopupModal pagina="productos" />
    </>
  );
}

// Wrapper con Suspense para useSearchParams
export default function ProductosPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <ProductosPage />
    </Suspense>
  );
}
