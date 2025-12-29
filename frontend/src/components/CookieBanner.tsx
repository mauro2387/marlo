'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya aceptó las cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Mostrar el banner después de un pequeño delay para mejor UX
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
    // Aquí podrías desactivar cookies de terceros si es necesario
    // Por ejemplo, no cargar el Pixel de Meta
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
      <div className="bg-white border-t-4 border-primary shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Icono */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                <span className="material-icons text-white" style={{ fontSize: '32px' }}>cookie</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🍪 Usamos Cookies
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Usamos cookies propias y de terceros (como Meta) para mejorar tu experiencia, analizar el uso del sitio 
                y mostrarte publicidad personalizada. Al continuar navegando, aceptas nuestra{' '}
                <Link href="/terminos" className="text-primary hover:underline font-semibold">
                  Política de Cookies
                </Link>
                {' '}y{' '}
                <Link href="/terminos" className="text-primary hover:underline font-semibold">
                  Términos y Condiciones
                </Link>
                .
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Puedes gestionar tus preferencias desde{' '}
                <a 
                  href="http://www.aboutads.info/choices" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  aquí
                </a>
                {' '}o en la configuración de Facebook/Instagram.
              </p>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={rejectCookies}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                Solo Necesarias
              </button>
              <button
                onClick={acceptCookies}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 text-white font-semibold rounded-lg transition-opacity shadow-lg text-sm whitespace-nowrap"
              >
                Aceptar Todas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
