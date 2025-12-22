'use client';

import { useState, useRef, useEffect } from 'react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export default function ImageGallery({ images, productName, className = '' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar imágenes válidas
  const validImages = images.filter(img => 
    img && (img.startsWith('http') || img.startsWith('/'))
  );

  // Si no hay imágenes válidas, mostrar emoji
  if (validImages.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-secondary-crema to-secondary-rosa/20 flex items-center justify-center ${className}`}>
        <span className="text-6xl">🍪</span>
      </div>
    );
  }

  // Si solo hay una imagen, mostrar sin controles
  if (validImages.length === 1) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={validImages[0]}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Swipe handlers para móvil
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe izquierda -> siguiente
      goToNext();
    } else if (distance < -minSwipeDistance) {
      // Swipe derecha -> anterior
      goToPrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden group ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Imagen actual */}
      <div 
        className="flex transition-transform duration-300 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {validImages.map((img, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            <img
              src={img}
              alt={`${productName} - Imagen ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Botones de navegación - Solo en PC (hidden en móvil) */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center z-10"
        aria-label="Imagen anterior"
      >
        <span className="material-icons text-gray-800">chevron_left</span>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center z-10"
        aria-label="Siguiente imagen"
      >
        <span className="material-icons text-gray-800">chevron_right</span>
      </button>

      {/* Indicadores de puntos */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {validImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white w-4' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>

      {/* Contador de imágenes */}
      <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
        {currentIndex + 1} / {validImages.length}
      </div>
    </div>
  );
}