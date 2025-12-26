'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribing) return;
    
    setSubscribing(true);
    setError('');
    
    try {
      // Usar nueva API que maneja suscripción + email
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al suscribirse');
      }
      
      setSubscribed(true);
      setEmail('');
    } catch (err: any) {
      setError('Error al suscribirse. Intenta de nuevo.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-primary text-white py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Newsletter Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 flex items-center gap-2">
                <span className="material-icons text-lg sm:text-xl">mail</span>
                ¡Suscribite a nuestro newsletter!
              </h3>
              <p className="text-white/80 text-xs sm:text-sm">
                Recibí ofertas exclusivas, nuevos sabores y promociones especiales.
              </p>
            </div>
            <div>
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-300 bg-green-500/20 rounded-lg p-2.5 sm:p-3">
                  <span className="material-icons text-lg sm:text-xl">check_circle</span>
                  <span className="font-medium text-sm sm:text-base">¡Gracias por suscribirte!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu email..."
                    required
                    className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    {subscribing ? (
                      <span className="animate-spin material-icons text-xs sm:text-sm">refresh</span>
                    ) : (
                      <span className="material-icons text-xs sm:text-sm">send</span>
                    )}
                    {subscribing ? 'Enviando...' : 'Suscribirse'}
                  </button>
                </form>
              )}
              {error && <p className="text-red-300 text-xs sm:text-sm mt-2">{error}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Marca */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h1 className="text-xl sm:text-2xl font-script mb-3 sm:mb-4">MarLo Cookies</h1>
            <p className="text-secondary-rosa/80 text-xs sm:text-sm mb-3 sm:mb-4">
              Las mejores cookies artesanales de Uruguay, hechas con amor y los mejores ingredientes.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61580225619685" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <span className="text-base sm:text-xl">📘</span>
              </a>
              <a
                href="https://www.instagram.com/marlo_cookies" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <span className="text-base sm:text-xl">📷</span>
              </a>
              <a 
                href="https://wa.me/59897865053" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <span className="text-base sm:text-xl">💬</span>
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h5 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Tienda</h5>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-secondary-rosa/80">
              <li>
                <Link href="/productos" className="hover:text-white transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/boxes" className="hover:text-white transition-colors">
                  Box
                </Link>
              </li>
              <li>
                <Link href="/puntos" className="hover:text-white transition-colors">
                  Puntos
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h5 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Ayuda</h5>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-secondary-rosa/80">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="hover:text-white transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-white transition-colors">
                  Términos
                </Link>
              </li>
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h5 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Mi Cuenta</h5>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-secondary-rosa/80">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Ingresar
                </Link>
              </li>
              <li>
                <Link href="/registro" className="hover:text-white transition-colors">
                  Crear Cuenta
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="hover:text-white transition-colors">
                  Mi Perfil
                </Link>
              </li>
              <li>
                <Link href="/pedidos" className="hover:text-white transition-colors">
                  Mis Pedidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="col-span-2 sm:col-span-1">
            <h5 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Contacto</h5>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-secondary-rosa/80">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>
                  Av. Juan Gorlero casi 25<br />
                  Punta del Este, Uruguay
                </span>
              </li>
              <li>
                <a href="tel:+59897865053" className="hover:text-white transition-colors flex items-center gap-2">
                  <span>📞</span>
                  <span>(+598) 97 865 053</span>
                </a>
              </li>
              <li>
                <a href="mailto:marlocookies2@gmail.com" className="hover:text-white transition-colors flex items-center gap-2">
                  <span>✉️</span>
                  <span className="truncate">marlocookies2@gmail.com</span>
                </a>
              </li>
              <li className="pt-2 flex flex-wrap gap-2">
                <Link href="/trabaja-con-nosotros" className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg font-semibold transition-colors text-[10px] sm:text-sm">
                  💼 Trabaja con nosotros
                </Link>
                <Link href="/contacto" className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors text-[10px] sm:text-sm">
                  Contáctanos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-secondary-rosa/80 text-[10px] sm:text-sm text-center sm:text-left">
              © 2025 MarLo Cookies - Todos los derechos reservados
            </p>
            <div className="flex gap-4 sm:gap-6 text-[10px] sm:text-sm text-secondary-rosa/80">
              <Link href="/terminos" className="hover:text-white transition-colors">
                Términos
              </Link>
              <Link href="/privacidad" className="hover:text-white transition-colors">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
