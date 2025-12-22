'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { bannersDB } from '@/lib/supabase-fetch';

interface PromoBanner {
  id: string;
  titulo?: string;
  subtitulo?: string;
  plantilla: 'descuento' | 'nuevo' | 'envio_gratis' | 'puntos' | 'temporada' | 'custom';
  imagen_url?: string;
  color_fondo: string;
  color_texto: string;
  color_boton?: string;
  boton_texto?: string;
  boton_link?: string;
  valor_descuento?: number;
  activo: boolean;
}

// Iconos por tipo de plantilla (usando Material Icons)
const plantillaIcons: Record<string, string> = {
  descuento: 'percent',
  nuevo: 'stars',
  envio_gratis: 'local_shipping',
  puntos: 'card_giftcard',
  temporada: 'favorite',
  custom: 'star',
};

// Fondos decorativos por plantilla
const plantillaPatterns: Record<string, string> = {
  descuento: 'bg-gradient-to-br from-red-500 via-pink-500 to-orange-400',
  nuevo: 'bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-400',
  envio_gratis: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-400',
  puntos: 'bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-400',
  temporada: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-400',
  custom: '',
};

export default function PromoBannerCarousel() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  const loadBanners = async () => {
    try {
      const { data, error } = await bannersDB.getActive();
      if (data && !error) {
        setBanners(data);
      }
    } catch (err) {
      console.error('Error loading banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="w-full aspect-square bg-gradient-to-r from-amber-100 to-pink-100 rounded-2xl animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null; // No mostrar nada si no hay banners
  }

  const currentBanner = banners[currentIndex];

  const renderBannerContent = (banner: PromoBanner) => {
    const isCustom = banner.plantilla === 'custom' && banner.imagen_url;
    
    if (isCustom) {
      // Banner con imagen personalizada - SIN overlay, imagen limpia
      const hasContent = banner.titulo || banner.subtitulo || (banner.boton_texto && banner.boton_link);
      
      return (
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden group bg-gray-100">
          {/* Imagen con next/image para mejor carga */}
          <img
            src={banner.imagen_url}
            alt={banner.titulo || 'Banner promocional'}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Solo mostrar contenido si hay texto */}
          {hasContent && (
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/70 to-transparent">
              {banner.titulo && (
                <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-lg">
                  {banner.titulo}
                </h3>
              )}
              {banner.subtitulo && (
                <p className="text-white/90 text-[10px] sm:text-xs drop-shadow">
                  {banner.subtitulo}
                </p>
              )}
              {banner.boton_texto && banner.boton_link && (
                <Link
                  href={banner.boton_link}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-900 rounded-full text-[10px] sm:text-xs font-semibold hover:bg-gray-100 transition-all w-fit shadow-lg"
                >
                  {banner.boton_texto}
                </Link>
              )}
            </div>
          )}
        </div>
      );
    }

    // Banner con plantilla predefinida
    const patternClass = plantillaPatterns[banner.plantilla] || plantillaPatterns.custom;
    const icon = plantillaIcons[banner.plantilla] || plantillaIcons.custom;

    return (
      <div 
        className={`relative w-full aspect-square rounded-2xl overflow-hidden ${patternClass}`}
        style={!patternClass ? { backgroundColor: banner.color_fondo } : {}}
      >
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white rounded-full opacity-50" />
        </div>
        
        {/* Cookies decorativas */}
        <div className="absolute right-4 bottom-4 text-5xl opacity-20 transform rotate-12">
          🍪
        </div>
        <div className="absolute left-4 top-4 text-3xl opacity-15 transform -rotate-12">
          🍪
        </div>
        
        {/* Contenido centrado verticalmente */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
          {/* Icono */}
          <div 
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3"
            style={{ color: banner.color_texto }}
          >
            {banner.plantilla === 'descuento' && banner.valor_descuento ? (
              <span className="text-xl font-black">{banner.valor_descuento}%</span>
            ) : (
              <span className="material-icons text-2xl">{icon}</span>
            )}
          </div>
          
          {/* Textos */}
          {banner.titulo && (
            <h3 
              className="text-lg font-bold drop-shadow-sm leading-tight"
              style={{ color: banner.color_texto }}
            >
              {banner.titulo}
            </h3>
          )}
          {banner.subtitulo && (
            <p 
              className="text-xs opacity-90 mt-1"
              style={{ color: banner.color_texto }}
            >
              {banner.subtitulo}
            </p>
          )}
          
          {/* Botón */}
          {banner.boton_texto && banner.boton_link && (
            <Link
              href={banner.boton_link}
              className="mt-3 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 shadow-lg"
              style={{
                backgroundColor: banner.color_boton || '#FFFFFF',
                color: banner.color_boton ? '#FFFFFF' : banner.color_fondo,
              }}
            >
              {banner.boton_texto}
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner actual */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full flex-shrink-0">
              {renderBannerContent(banner)}
            </div>
          ))}
        </div>
      </div>

      {/* Controles de navegación */}
      {banners.length > 1 && (
        <>
          {/* Botones prev/next */}
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all z-20"
            aria-label="Banner anterior"
          >
            <span className="material-icons text-lg">chevron_left</span>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all z-20"
            aria-label="Siguiente banner"
          >
            <span className="material-icons text-lg">chevron_right</span>
          </button>

          {/* Indicadores de puntos */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-white w-6 shadow-lg' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ir al banner ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
