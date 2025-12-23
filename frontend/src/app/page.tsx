'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ActiveOrderBanner from '@/components/ActiveOrderBanner';
import PopupModal from '@/components/PopupModal';
import PromoBannerCarousel from '@/components/PromoBannerCarousel';
import ScrollAnimation from '@/components/ScrollAnimation';
import { useEffect, useState } from 'react';
import { productsService } from '@/services/supabase-api';
import { floatingImagesDB, subscribersDB, featuredCardsDB } from '@/lib/supabase-fetch';
import { notificationService } from '@/lib/notifications';
import { isOpenNow, BUSINESS_HOURS } from '@/config/constants';
import type { Product } from '@/types';
import { MetaPixelEvents } from '@/components/MetaPixel';

type FeaturedProduct = {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  categoria: string;
};

type FeaturedCard = {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  icono: string;
  imagen_url: string | null;
  enlace: string;
  orden: number;
};

// Fallback por si no hay imágenes en la base de datos
const defaultCookieImages = ['/IMG/cc.png', '/IMG/2.png', '/IMG/3.png'];

// Helper para renderizar imagen o emoji con manejo de errores React-friendly
const ProductImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [hasError, setHasError] = useState(false);

  // Si es una URL (empieza con / o http) y no hay error, mostrar imagen
  if ((src.startsWith('/') || src.startsWith('http')) && !hasError) {
    return (
      <Image 
        src={src} 
        alt={alt} 
        fill
        className={`object-cover ${className || ''}`}
        onError={() => setHasError(true)}
      />
    );
  }
  
  // Si hay error o no es URL, mostrar emoji
  const emoji = (src.startsWith('/') || src.startsWith('http')) ? '🍪' : src;
  return <span className="text-3xl">{emoji}</span>;
};

export default function Home() {
  const [currentCookie, setCurrentCookie] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [cookieImages, setCookieImages] = useState<string[]>(defaultCookieImages);
  const [loading, setLoading] = useState(true);
  
  // Featured Cards para la sección de productos destacados
  const [featuredCards, setFeaturedCards] = useState<FeaturedCard[]>([]);
  
  // Datos por defecto para las tarjetas
  const defaultFeaturedCards: FeaturedCard[] = [
    { id: '1', titulo: 'Cookies Clásicas', subtitulo: 'Desde $199', descripcion: 'Nuestras cookies tradicionales con chispas de chocolate', icono: 'cookie', imagen_url: null, enlace: '/productos', orden: 1 },
    { id: '2', titulo: 'Box Personalizados', subtitulo: 'Desde $540', descripcion: 'Arma tu box con tus sabores favoritos (4, 6 o 9 unidades)', icono: 'inventory_2', imagen_url: null, enlace: '/boxes', orden: 2 },
    { id: '3', titulo: 'Edición Limitada', subtitulo: 'Desde $219', descripcion: 'Sabores únicos disponibles por tiempo limitado', icono: 'star', imagen_url: null, enlace: '/productos', orden: 3 },
  ];
  
  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterLoading(true);
    setNewsletterError('');
    
    try {
      // Guardar en base de datos
      await subscribersDB.subscribe({
        email: newsletterEmail
      });
      
      // Enviar email de bienvenida
      await notificationService.notifyNewsletterSubscription({
        email: newsletterEmail,
      });
      
      // Track Meta Pixel Lead event
      MetaPixelEvents.lead('newsletter');
      
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 5000);
    } catch (err) {
      setNewsletterError('Error al suscribirse. Intenta de nuevo.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Cargar imágenes flotantes desde Supabase
  useEffect(() => {
    const loadFloatingImages = async () => {
      try {
        const { data } = await floatingImagesDB.getActive();
        if (data && data.length > 0) {
          setCookieImages(data.map((img: any) => img.imagen_url));
        }
      } catch (err) {
        console.log('Usando imágenes por defecto');
      }
    };
    loadFloatingImages();
  }, []);

  // Cargar tarjetas destacadas desde Supabase
  useEffect(() => {
    const loadFeaturedCards = async () => {
      try {
        const { data, error } = await featuredCardsDB.getActive();
        if (data && data.length > 0) {
          setFeaturedCards(data);
          console.log('🏠 Tarjetas destacadas cargadas:', data.length);
        } else {
          setFeaturedCards(defaultFeaturedCards);
        }
      } catch (err) {
        console.log('Usando tarjetas destacadas por defecto');
        setFeaturedCards(defaultFeaturedCards);
      }
    };
    loadFeaturedCards();
  }, []);

  // Cargar productos desde Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products: Product[] = await productsService.getAll({ enStock: true });
        
        // Eliminar duplicados por nombre + categoría
        const uniqueProducts = new Map<string, Product>();
        products.forEach((p: Product) => {
          const key = `${p.nombre.toLowerCase()}-${p.categoria}`;
          if (!uniqueProducts.has(key)) {
            uniqueProducts.set(key, p);
          }
        });
        
        const productsArray = Array.from(uniqueProducts.values());
        console.log(`🏠 Homepage: ${productsArray.length} productos únicos de ${products.length} totales`);
        
        // Helper para asignar emoji según el nombre del producto
        const getProductEmoji = (nombre: string): string => {
          const nombreLower = nombre.toLowerCase();
          if (nombreLower.includes('chocolate') || nombreLower.includes('choco')) return '🍫';
          if (nombreLower.includes('oreo')) return '⚫';
          if (nombreLower.includes('red velvet')) return '❤️';
          if (nombreLower.includes('pistacho')) return '🥜';
          if (nombreLower.includes('lemon') || nombreLower.includes('limón')) return '🍋';
          if (nombreLower.includes('bon o bon') || nombreLower.includes('mantecol')) return '🥜';
          if (nombreLower.includes('halloween')) return '🎃';
          if (nombreLower.includes('navid')) return '🎄';
          return '🍪';
        };
        
        // Tomar productos limitados primero, luego cookies regulares
        const limited = productsArray
          .filter((p: Product) => p.esLimitado && p.categoria === 'cookies')
          .slice(0, 4)
          .map((p: Product) => ({
            id: typeof p.id === 'string' ? parseInt(p.id) : p.id,
            nombre: p.nombre,
            precio: p.precio,
            imagen: p.imagen && p.imagen.trim() !== '' ? p.imagen : getProductEmoji(p.nombre),
            categoria: p.categoria,
          }));
        
        // Si no hay suficientes limitados, completar con cookies regulares
        const featured = limited.length >= 4 ? limited : [
          ...limited,
          ...productsArray
            .filter((p: Product) => !p.esLimitado && p.categoria === 'cookies')
            .slice(0, 4 - limited.length)
            .map((p: Product) => ({
              id: typeof p.id === 'string' ? parseInt(p.id) : p.id,
              nombre: p.nombre,
              precio: p.precio,
              imagen: p.imagen && p.imagen.trim() !== '' ? p.imagen : getProductEmoji(p.nombre),
              categoria: p.categoria,
            }))
        ];
        
        setFeaturedProducts(featured.slice(0, 4));
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback a productos por defecto si falla
        setFeaturedProducts([
          { id: 1, nombre: 'Chocolate Chips', precio: 199, imagen: '🍫', categoria: 'clasicas' },
          { id: 2, nombre: 'Red Velvet', precio: 199, imagen: '❤️', categoria: 'especiales' },
          { id: 3, nombre: 'Pistacho Premium', precio: 219, imagen: '🥜', categoria: 'especiales' },
          { id: 4, nombre: 'Oreo', precio: 199, imagen: '⚫', categoria: 'especiales' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Ancho fijo para las tarjetas
  const cardWidth = 'w-64';

  useEffect(() => {
    if (featuredProducts.length === 0) return;

    // Cambiar cookie cada 60 segundos (1 minuto) con fade más lento
    const cookieInterval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentCookie((prev) => (prev + 1) % cookieImages.length);
        setFadeIn(true);
      }, 500);
    }, 60000);

    // Cambiar producto cada 60 segundos (1 minuto) - sincronizado con las cookies
    const productInterval = setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % featuredProducts.length);
    }, 60000);

    return () => {
      clearInterval(cookieInterval);
      clearInterval(productInterval);
    };
  }, [featuredProducts.length]);

  return (
    <>
      <Navbar />
      <ActiveOrderBanner />

      <main className="pt-0">
        {/* Hero Section - Compacto y moderno */}
        <section className="relative min-h-[100svh] lg:min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-secondary-crema via-white to-secondary-rosa/20 pt-16 lg:pt-24">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 max-w-[40vw] max-h-[40vw] bg-secondary-salmon/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 max-w-[50vw] max-h-[50vw] bg-secondary-rosa/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10 flex-1 flex flex-col lg:items-center lg:justify-center">
            {/* MOBILE LAYOUT - Distribuido en toda la pantalla */}
            <div className="flex flex-col lg:hidden flex-1 justify-evenly py-4 pt-8">
              {/* Sección superior: Badge */}
              <div className="flex justify-center pt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-gray-700">Envíos a todo Maldonado</span>
                </div>
              </div>

              {/* Sección central: Título + Cookie + Descripción + Botones */}
              <div className="flex flex-col gap-4 px-2">
                {/* Title + Cookie Row */}
                <div className="flex items-center justify-between gap-3">
                  {/* Title Left */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-primary leading-tight">
                      Cookies que te
                      <span className="block font-script text-secondary-salmon text-2xl mt-1">Enamorarán</span>
                    </h1>
                  </div>
                  
                  {/* Cookie Right - más grande */}
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <div className={`relative w-full h-full animate-float transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                      <Image
                        key={`mobile-${currentCookie}`}
                        src={cookieImages[currentCookie]}
                        alt="Cookie MarLo"
                        fill
                        className="object-contain drop-shadow-lg"
                        priority
                      />
                    </div>
                    
                    {/* Mini floating images */}
                    {!loading && (
                      <>
                        {/* En móvil: usar imágenes flotantes PNG de la DB */}
                        <div className="md:hidden">
                          {cookieImages.length >= 2 && (
                            <>
                              <div 
                                className="absolute bottom-1 -left-3 w-12 h-12 z-10"
                                style={{ animation: 'floatGentle 2.5s ease-in-out infinite' }}
                              >
                                <Image
                                  src={cookieImages[0]}
                                  alt="Cookie flotante"
                                  fill
                                  className="object-contain drop-shadow-xl"
                                />
                              </div>
                              <div 
                                className="absolute -top-3 right-0 w-12 h-12 z-[-1]"
                                style={{ animation: 'floatGentle 2.5s ease-in-out infinite 1s' }}
                              >
                                <Image
                                  src={cookieImages[1]}
                                  alt="Cookie flotante"
                                  fill
                                  className="object-contain drop-shadow-xl"
                                />
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* En desktop: usar productos destacados con links */}
                        <div className="hidden md:block">
                          {featuredProducts.length > 0 && (
                            <>
                              <Link 
                                href={`/productos#producto-${featuredProducts[currentProduct].id}`}
                                className="absolute bottom-1 -left-3 w-9 h-9 bg-white rounded-lg shadow-md z-10 overflow-hidden hover:scale-105 transition-transform"
                                style={{ animation: 'floatGentle 2.5s ease-in-out infinite' }}
                              >
                                <div className="w-full h-full bg-secondary-crema flex items-center justify-center relative">
                                  <ProductImage src={featuredProducts[currentProduct].imagen} alt={featuredProducts[currentProduct].nombre} />
                                </div>
                              </Link>
                              <Link 
                                href={`/productos#producto-${featuredProducts[(currentProduct + 1) % featuredProducts.length].id}`}
                                className="absolute -top-3 right-0 w-9 h-9 bg-white rounded-lg shadow-md z-[-1] overflow-hidden hover:scale-105 transition-transform"
                                style={{ animation: 'floatGentle 2.5s ease-in-out infinite 1s' }}
                              >
                                <div className="w-full h-full bg-secondary-rosa/30 flex items-center justify-center relative">
                                  <ProductImage src={featuredProducts[(currentProduct + 1) % featuredProducts.length].imagen} alt={featuredProducts[(currentProduct + 1) % featuredProducts.length].nombre} />
                                </div>
                              </Link>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed text-center">
                  Cada cookie es una obra maestra artesanal. Ingredientes premium y recetas únicas.
                </p>

                {/* Buttons - Side by side */}
                <div className="flex gap-3">
                  <Link 
                    href="/productos" 
                    className="btn-primary text-sm px-4 py-3 shadow-md flex items-center justify-center gap-2 flex-1"
                  >
                    <span className="material-icons text-base">cookie</span>
                    Explorar
                  </Link>
                  <Link 
                    href="/boxes" 
                    className="px-4 py-3 bg-white text-primary font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm flex-1"
                  >
                    <span className="material-icons text-base">inventory_2</span>
                    Armar Box
                  </Link>
                </div>
              </div>

              {/* Mobile Products Section - 3 horizontales */}
              <div className="px-2">
                <h3 className="text-lg font-bold text-primary mb-3 text-center">Nuestros Productos Destacados</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {(featuredCards.length > 0 ? featuredCards : defaultFeaturedCards).slice(0, 3).map((card, index) => {
                    const gradients = [
                      'from-secondary-crema to-secondary-rosa/30',
                      'from-secondary-salmon/20 to-secondary-rosa/30',
                      'from-primary/10 to-secondary-crema'
                    ];
                    const iconColors = ['text-primary', 'text-secondary-salmon', 'text-yellow-500'];
                    
                    return (
                      <Link 
                        key={card.id}
                        href={card.enlace || '/productos'} 
                        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                      >
                        <div className={`aspect-[4/5] bg-gradient-to-br ${gradients[index % 3]} flex items-center justify-center overflow-hidden relative`}>
                          {card.imagen_url ? (
                            <Image 
                              src={card.imagen_url} 
                              alt={card.titulo}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className={`material-icons ${iconColors[index % 3]}`} style={{fontSize: '48px'}}>
                              {card.icono || 'cookie'}
                            </span>
                          )}
                        </div>
                        <div className="py-3 px-1 text-center">
                          <h4 className="text-base font-bold text-primary">{card.titulo.split(' ')[0]}</h4>
                          <p className="text-sm text-gray-500">{card.subtitulo}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Trust Indicators - al fondo */}
              <div>
                <div className="flex justify-center items-center gap-10 py-2.5 px-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-0.5">
                      <span className="material-icons text-yellow-500 text-sm">star</span>
                      <span className="font-bold text-xs text-gray-800">4.9</span>
                    </div>
                    <p className="text-[9px] text-gray-500">+500 reseñas</p>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-primary text-sm">local_shipping</span>
                    <p className="text-[9px] text-gray-600">Envío 24h</p>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="material-icons text-secondary-salmon text-sm">card_giftcard</span>
                    <p className="text-[9px] text-gray-600">Puntos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* DESKTOP LAYOUT */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content - Desktop */}
              <div className="space-y-8 text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-gray-700">Envíos a todo Maldonado</span>
                </div>

                <h1 className="text-5xl xl:text-7xl font-bold text-primary leading-tight">
                  Cookies que te
                  <span className="block font-script text-secondary-salmon">Enamorarán</span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  Cada cookie es una obra maestra artesanal. Ingredientes premium, 
                  recetas únicas y el amor por lo que hacemos en cada mordida.
                </p>

                <div className="flex gap-4">
                  <Link 
                    href="/productos" 
                    className="btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <span className="material-icons text-xl">cookie</span>
                    Explorar Cookies
                  </Link>
                  <Link 
                    href="/boxes" 
                    className="px-8 py-4 bg-white text-primary font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <span className="material-icons">inventory_2</span>
                    Armar mi Box
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                {/* Trust Indicators - Desktop */}
                <div className="flex gap-6 pt-8">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-2xl text-yellow-500">star</span>
                    <div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-sm">★</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">+500 clientes felices</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-2xl">card_giftcard</span>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Puntos de lealtad</p>
                      <p className="text-xs text-gray-500">Gana con cada compra</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Cookie Showcase Desktop */}
              <div className="relative">
                <div className="relative w-full h-[600px] flex items-center justify-center">
                  {loading ? (
                    <div className="text-center">
                      <span className="material-icons text-6xl text-primary animate-spin">refresh</span>
                      <p className="mt-4 text-gray-600">Cargando productos...</p>
                    </div>
                  ) : featuredProducts.length > 0 ? (
                    <>
                      {/* Tarjeta superior derecha */}
                      <Link 
                        href={`/productos#producto-${featuredProducts[currentProduct].id}`}
                        className="absolute top-24 right-1 bg-white p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all animate-float cursor-pointer group z-10 w-64"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm group-hover:text-primary transition-colors truncate">
                              {featuredProducts[currentProduct].nombre}
                            </p>
                            <p className="text-secondary-salmon font-semibold">
                              ${featuredProducts[currentProduct].precio}
                            </p>
                          </div>
                          <div className="w-16 h-16 flex-shrink-0 bg-secondary-crema rounded-xl flex items-center justify-center overflow-hidden relative group-hover:scale-110 transition-transform">
                            <ProductImage src={featuredProducts[currentProduct].imagen} alt={featuredProducts[currentProduct].nombre} />
                          </div>
                        </div>
                      </Link>

                      {/* Tarjeta inferior izquierda */}
                      <Link 
                        href={`/productos#producto-${featuredProducts[(currentProduct + 1) % featuredProducts.length].id}`}
                        className="absolute bottom-32 -left-10 bg-white p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer group z-30 w-64"
                        style={{animation: 'float 4s ease-in-out infinite'}}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-secondary-rosa/30 rounded-xl flex items-center justify-center overflow-hidden relative group-hover:scale-110 transition-transform">
                            <ProductImage src={featuredProducts[(currentProduct + 1) % featuredProducts.length].imagen} alt={featuredProducts[(currentProduct + 1) % featuredProducts.length].nombre} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm group-hover:text-primary transition-colors truncate">
                              {featuredProducts[(currentProduct + 1) % featuredProducts.length].nombre}
                            </p>
                            <p className="text-secondary-salmon font-semibold">
                              ${featuredProducts[(currentProduct + 1) % featuredProducts.length].precio}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </>
                  ) : null}
                  
                  {/* Main cookie image */}
                  <div className="relative w-96 h-96 flex items-center justify-center z-20">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-90"></div>
                    <div className="absolute bottom-4 w-full max-w-[400px] h-12 bg-black/30 rounded-full blur-3xl scale-x-125"></div>
                    <div className="absolute bottom-6 w-full max-w-[350px] h-8 bg-black/20 rounded-full blur-2xl scale-x-110"></div>
                    
                    <div className={`relative w-full h-full animate-float transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                      <Image
                        key={`desktop-${currentCookie}`}
                        src={cookieImages[currentCookie]}
                        alt="Cookie MarLo"
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section - Hidden on mobile, shown on larger screens */}
        <section className="hidden lg:block py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
                Nuestros Productos Destacados
              </h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
                Explora nuestra selección de cookies más populares, box personalizados y ediciones limitadas
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {(featuredCards.length > 0 ? featuredCards : defaultFeaturedCards).map((card, index) => {
              // Colores de gradiente según el índice
              const gradients = [
                'from-secondary-crema to-secondary-rosa/30',
                'from-secondary-salmon/20 to-secondary-rosa/30',
                'from-primary/10 to-secondary-crema'
              ];
              const iconColors = ['text-primary', 'text-secondary-salmon', 'text-yellow-500'];
              
              return (
                <ScrollAnimation 
                  key={card.id}
                  animation="fade-up"
                  delay={index * 100}
                >
                <Link 
                  key={card.id} 
                  href={card.enlace || '/productos'} 
                  className={`card group cursor-pointer ${index === 2 ? 'sm:col-span-2 md:col-span-1' : ''}`}
                >
                  <div className={`aspect-square bg-gradient-to-br ${gradients[index % 3]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden relative`}>
                    {card.imagen_url ? (
                      <Image 
                        src={card.imagen_url} 
                        alt={card.titulo}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className={`material-icons ${iconColors[index % 3]}`} style={{fontSize: '60px'}}>
                        {card.icono || 'cookie'}
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-6">
                    <h4 className="text-lg sm:text-xl font-bold text-primary mb-1 sm:mb-2">{card.titulo}</h4>
                    <p className="text-gray-600 mb-2 sm:mb-4 text-sm sm:text-base">{card.subtitulo}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      {card.descripcion}
                    </p>
                    <span className="text-secondary-salmon font-semibold hover:underline text-sm sm:text-base">
                      Ver más →
                    </span>
                  </div>
                </Link>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 sm:py-12 lg:py-16 bg-gradient-to-br from-secondary-crema to-white pb-16 sm:pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-8 max-w-5xl mx-auto">
            <ScrollAnimation animation="scale-up" delay={0}>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-secondary-salmon/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <span className="material-icons text-lg sm:text-3xl">star</span>
              </div>
              <h4 className="font-bold text-primary mb-1 sm:mb-2 text-[11px] sm:text-lg leading-tight">Programa de Puntos</h4>
              <p className="text-[9px] sm:text-sm text-gray-600 leading-tight">
                Gana puntos y canjéalos por productos gratis
              </p>
            </div>
            </ScrollAnimation>
            <ScrollAnimation animation="scale-up" delay={100}>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-secondary-salmon/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <span className="material-icons text-lg sm:text-3xl">local_shipping</span>
              </div>
              <h4 className="font-bold text-primary mb-1 sm:mb-2 text-[11px] sm:text-lg leading-tight">Retiro o Envío</h4>
              <p className="text-[9px] sm:text-sm text-gray-600 leading-tight">
                Retira en tienda o recibe en tu domicilio
              </p>
            </div>
            </ScrollAnimation>
            <ScrollAnimation animation="scale-up" delay={200}>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-secondary-salmon/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <span className="material-icons text-lg sm:text-3xl">message</span>
              </div>
              <h4 className="font-bold text-primary mb-1 sm:mb-2 text-[11px] sm:text-lg leading-tight">WhatsApp</h4>
              <p className="text-[9px] sm:text-sm text-gray-600 leading-tight">
                Seguimiento en tiempo real de tu pedido
              </p>
            </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-pink-50 pt-20 sm:pt-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="material-icons text-3xl sm:text-5xl text-yellow-500">star</span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-primary">
                Lo que dicen nuestros clientes
              </h2>
            </div>
            
            {/* Google Reviews Badge - Clickeable */}
            <div className="flex justify-center px-4">
              <a 
                href="https://www.google.com/search?kgmid=/g/11ybpp3pv9#lrd=0x9575110030adacd1:0x62e6dd03788fee45,1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block group w-full max-w-md"
              >
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  {/* Logo de Google */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
                    <svg className="w-7 h-7 sm:w-10 sm:h-10" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span className="text-lg sm:text-2xl font-semibold text-gray-700">Google Reviews</span>
                  </div>

                  {/* Estrellas y Rating */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex gap-0.5 sm:gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 sm:w-8 sm:h-8" fill="#FBBC04" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                  </div>

                  {/* Rating numérico */}
                  <div className="text-center mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-5xl font-bold text-gray-800">4.8</span>
                    <span className="text-gray-500 text-base sm:text-xl ml-1 sm:ml-2">/ 5.0</span>
                  </div>

                  {/* Cantidad de reseñas */}
                  <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                    Basado en <span className="font-semibold text-primary">19 reseñas</span> reales
                  </p>

                  {/* Botón CTA */}
                  <div className="flex items-center justify-center gap-2 text-blue-600 group-hover:text-blue-700 font-medium text-sm sm:text-base">
                    <span>Ver todas las reseñas</span>
                    <span className="material-icons text-base sm:text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </a>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 max-w-2xl mx-auto px-4">
              💬 ¡Dejanos tu reseña en Google y ayudá a otros a descubrir nuestras cookies!
            </p>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollAnimation animation="fade-up">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <span className="material-icons text-2xl sm:text-3xl lg:text-4xl">photo_camera</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary">
                Síguenos en Instagram
              </h2>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras creaciones, ofertas exclusivas y mucho más
            </p>
          </div>
          </ScrollAnimation>

          {/* Elfsight Instagram Feed Widget */}
          <div className="max-w-6xl mx-auto">
            <script src="https://elfsightcdn.com/platform.js" async></script>
            <div className="elfsight-app-82d30f88-cd52-4f48-aa46-8df8269da663" data-elfsight-app-lazy></div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 hidden sm:block">
          <div className="absolute top-10 left-10"><span className="material-icons" style={{fontSize: '100px'}}>cookie</span></div>
          <div className="absolute bottom-10 right-10"><span className="material-icons" style={{fontSize: '100px'}}>cookie</span></div>
          <div className="absolute top-1/2 left-1/3"><span className="material-icons" style={{fontSize: '60px'}}>mail</span></div>
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <ScrollAnimation animation="fade-in">
          <div className="max-w-3xl mx-auto text-center">
            <span className="material-icons mb-4 sm:mb-6 block text-5xl sm:text-6xl lg:text-7xl">mail_outline</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4">
              ¡Únete a Nuestra Newsletter!
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 px-2">
              Recibe ofertas exclusivas, nuevos sabores y descuentos especiales 
              directamente en tu email. ¡No te pierdas nada!
            </p>

            {newsletterSuccess ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 max-w-lg mx-auto">
                <span className="material-icons text-3xl sm:text-4xl text-green-300 mb-2 block">check_circle</span>
                <p className="text-lg sm:text-xl font-bold">¡Gracias por suscribirte!</p>
                <p className="text-white/80 text-sm sm:text-base">Te avisaremos de nuestras novedades</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto px-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-3 sm:px-6 sm:py-4 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-white/30 text-sm sm:text-base"
                  required
                  disabled={newsletterLoading}
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-primary font-bold rounded-xl hover:bg-secondary-crema transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 text-sm sm:text-base"
                >
                  {newsletterLoading ? 'Enviando...' : 'Suscribirme'}
                </button>
              </form>
            )}
            {newsletterError && (
              <p className="text-red-300 mt-3 sm:mt-4 text-sm sm:text-base">{newsletterError}</p>
            )}

            <p className="text-xs sm:text-sm text-white/70 mt-4 sm:mt-6 flex items-center justify-center gap-1.5 sm:gap-2">
              <span className="material-icons text-lg sm:text-xl">notifications_active</span>
              Entérate primero de nuevos sabores y ofertas exclusivas
            </p>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12 pt-6 sm:pt-12 border-t border-white/20">
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1">500+</p>
                <p className="text-white/80 text-[10px] sm:text-xs lg:text-sm">Suscriptores Felices</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1">2x</p>
                <p className="text-white/80 text-[10px] sm:text-xs lg:text-sm">Ofertas por Semana</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1">100%</p>
                <p className="text-white/80 text-[10px] sm:text-xs lg:text-sm">Sin Spam</p>
              </div>
            </div>
          </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Ubicación y Horarios */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-secondary-crema to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollAnimation animation="fade-up">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-2 sm:mb-4">
              Visítanos
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Retira tu pedido en nuestra tienda o simplemente pasa a conocernos
            </p>
          </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Mapa de Google Maps */}
            <ScrollAnimation animation="slide-right">
            <div className="card overflow-hidden">
              {/* Iframe de Google Maps - MarLo Cookies Punta del Este */}
              <div className="aspect-video relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6539.791041225218!2d-54.948110514610896!3d-34.95922725719071!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9575110030adacd1%3A0x62e6dd03788fee45!2sMarLo%20Cookies!5e0!3m2!1ses-419!2suy!4v1764206972224!5m2!1ses-419!2suy"
                  width="100%"
                  height="100%"
                  style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de MarLo Cookies"
                ></iframe>
              </div>
              
              <div className="p-2 sm:p-3 flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-primary text-xs sm:text-sm flex items-center gap-1 truncate">
                    <span className="material-icons text-sm sm:text-base">location_on</span>
                    <span className="truncate">Av. Juan Gorlero, Punta del Este</span>
                  </h4>
                </div>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=MarLo+Cookies+Punta+del+Este&travelmode=driving"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-primary text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  <span className="material-icons text-sm sm:text-base">directions</span>
                  Cómo llegar
                </a>
              </div>
              
              {/* Carrusel de Promociones */}
              <div className="p-3">
                <PromoBannerCarousel />
              </div>
            </div>

            {/* Horarios e Info */}
            </ScrollAnimation>
            <ScrollAnimation animation="slide-left">
            <div className="space-y-4 sm:space-y-6">
              {/* Horarios */}
              <div className="card p-5 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="material-icons text-xl sm:text-2xl">schedule</span>
                  Horario de Atención
                </h3>
                
                <div className="space-y-3 sm:space-y-4">
                  {BUSINESS_HOURS.map((schedule, index) => (
                    <div key={index} className={`flex justify-between items-center ${index < BUSINESS_HOURS.length - 1 ? 'pb-2 sm:pb-3 border-b border-gray-200' : ''}`}>
                      <span className="font-semibold text-gray-700 text-sm sm:text-base">{schedule.day}</span>
                      <span className={`font-bold text-sm sm:text-base ${schedule.open ? 'text-primary' : 'text-gray-500'}`}>
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>

                {(() => {
                  const status = isOpenNow();
                  return (
                    <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border ${
                      status.open 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className={`material-icons text-2xl sm:text-3xl ${
                          status.open ? 'text-green-500' : 'text-gray-400'
                        }`}>
                          {status.open ? 'check_circle' : 'schedule'}
                        </span>
                        <div>
                          <p className={`font-bold text-sm sm:text-base ${
                            status.open ? 'text-green-700' : 'text-gray-600'
                          }`}>
                            {status.open ? 'Abierto Ahora' : 'Cerrado'}
                          </p>
                          <p className={`text-xs sm:text-sm ${
                            status.open ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {status.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Contacto Directo */}
              <div className="card p-5 sm:p-6 lg:p-8 bg-gradient-to-br from-secondary-salmon/10 to-secondary-rosa/10">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-4 sm:mb-6">Contacto Directo</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <a 
                    href="tel:+59897865053"
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-white text-lg sm:text-xl">phone</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Teléfono</p>
                      <p className="font-bold text-primary group-hover:text-primary-dark text-sm sm:text-base">(+598) 97 865 053</p>
                    </div>
                  </a>

                  <a 
                    href="https://wa.me/59897865053"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-white text-lg sm:text-xl">chat</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">WhatsApp</p>
                      <p className="font-bold text-primary group-hover:text-green-600 text-sm sm:text-base">Chatear Ahora</p>
                    </div>
                  </a>

                  <a 
                    href="mailto:marlocookies2@gmail.com"
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-salmon rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-white text-lg sm:text-xl">email</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Email</p>
                      <p className="font-bold text-primary group-hover:text-secondary-salmon text-sm sm:text-base truncate">marlocookies2@gmail.com</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            </ScrollAnimation>
          </div>
          
          {/* CTA Rápido - Banner integrado */}
          <div className="max-w-6xl mx-auto mt-6 sm:mt-8">
            <div className="bg-gradient-to-r from-primary via-primary-dark to-primary rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white text-center relative overflow-hidden">
              {/* Decoración de fondo */}
              <div className="absolute inset-0 opacity-10 hidden sm:block">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/4 translate-y-1/4"></div>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
                  <span className="text-4xl sm:text-5xl">🍪</span>
                  <div>
                    <h4 className="text-lg sm:text-xl lg:text-2xl font-bold">¿Listo para ordenar?</h4>
                    <p className="text-white/80 text-xs sm:text-sm lg:text-base">
                      Compra online y recibe en tu casa o retira en tienda
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Link 
                    href="/productos"
                    className="px-5 py-2.5 sm:px-6 sm:py-3 lg:px-8 bg-white text-primary font-bold rounded-xl hover:bg-secondary-crema transition-colors shadow-lg text-sm sm:text-base text-center"
                  >
                    Ver Productos
                  </Link>
                  <a 
                    href="https://wa.me/59897865053"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <span className="material-icons">chat</span>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Info for Development */}
      {process.env.NODE_ENV === 'development' && (
        <section className="bg-gray-100 py-8">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-6 text-primary flex items-center justify-center gap-2">
              <span className="material-icons">build</span>
              Información de Desarrollo
            </h3>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-bold text-primary mb-2">Frontend</h4>
                <p className="text-sm text-gray-600">
                  <strong>URL:</strong> http://localhost:3005
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Framework:</strong> Next.js 14 (App Router)
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-bold text-primary mb-2">Backend API</h4>
                <p className="text-sm text-gray-600">
                  <strong>URL:</strong>{' '}
                  <a
                    href="http://localhost:3002/api/v1"
                    className="text-secondary-salmon hover:underline"
                    target="_blank"
                  >
                    http://localhost:3002/api/v1
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Docs:</strong>{' '}
                  <a
                    href="http://localhost:3002/api/docs"
                    className="text-secondary-salmon hover:underline"
                    target="_blank"
                  >
                    Swagger API Docs
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
      </main>
      
      {/* Pop-up Modal */}
      <PopupModal pagina="home" />
    </>
  );
}
