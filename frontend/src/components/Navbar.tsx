'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { promoBannersDB } from '@/lib/supabase-fetch';

interface PromoBanner {
  id: string;
  texto: string;
  link: string | null;
  activo: boolean;
  orden: number;
}

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, toggleCart } = useUIStore();

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    setMounted(true);
    
    // Cargar banners promocionales
    const loadBanners = async () => {
      try {
        const { data } = await promoBannersDB.getActive();
        if (data && data.length > 0) {
          setBanners(data);
        }
      } catch (err) {
        console.error('Error cargando banners:', err);
      }
    };
    
    loadBanners();
  }, []);

  // Rotación automática de banners cada 10 segundos
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        setIsAnimating(false);
      }, 300);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  const totalItems = mounted ? getTotalItems() : 0;
  const currentBanner = banners[currentBannerIndex];
  const hasBanners = banners.length > 0;

  // Solo mostrar admin si el rol es 'admin' en la base de datos
  const isAdmin = Boolean(
    mounted && 
    isAuthenticated && 
    user && 
    user.rol === 'admin'
  );

  // Renderizar el contenido del banner promocional actual
  const renderPromoBanner = () => {
    if (!hasBanners || !currentBanner) return null;
    
    const content = (
      <div className={`h-10 flex items-center justify-center text-white font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 px-4 ${
        isAnimating ? 'opacity-0 transform -translate-y-2' : 'opacity-100 transform translate-y-0'
      }`}>
        <span className="truncate max-w-[85%] sm:max-w-none">{currentBanner.texto}</span>
        {currentBanner.link && <span className="ml-1 sm:ml-2 flex-shrink-0">→</span>}
        {banners.length > 1 && (
          <div className="absolute right-2 sm:right-4 flex gap-1">
            {banners.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                  idx === currentBannerIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );

    if (currentBanner.link) {
      const isExternal = currentBanner.link.startsWith('http');
      if (isExternal) {
        return (
          <a 
            href={currentBanner.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity relative"
          >
            {content}
          </a>
        );
      } else {
        return (
          <Link href={currentBanner.link} className="block hover:opacity-90 transition-opacity relative">
            {content}
          </Link>
        );
      }
    }

    return <div className="relative">{content}</div>;
  };

  return (
    <>
      {/* Banner Promocional con rotación */}
      {hasBanners && (
        <div className="fixed top-0 w-full z-50" style={{backgroundColor: '#F25252'}}>
          {renderPromoBanner()}
        </div>
      )}

      <nav className={`fixed ${hasBanners ? 'top-10' : 'top-0'} w-full bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-gray-100`}>
        <div className="container mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center gap-2 h-16 sm:h-18 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0" onClick={closeMobileMenu}>
              <div className="relative w-36 h-14 sm:w-48 sm:h-16 lg:w-64 lg:h-20">
                <Image
                  src="/IMG/logo.png"
                  alt="MarLo Cookies"
                  fill
                  sizes="(max-width: 640px) 144px, (max-width: 1024px) 192px, 256px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 flex-1">
              <Link href="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Inicio
              </Link>
              <Link href="/productos" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Productos
              </Link>
              <Link href="/boxes" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Box
              </Link>
              <Link href="/nosotros" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Nosotros
              </Link>
              <Link href="/contacto" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Contacto
              </Link>
              <Link href="/puntos" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Puntos
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl text-gray-700 translate-y-0.5 sm:translate-y-1">shopping_bag</span>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-secondary-salmon text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Menu / Auth */}
              {isAuthenticated && user ? (
                <div className="hidden md:flex items-center gap-3">
                  {/* Admin Link */}
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="px-3 py-2 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium transition-colors flex items-center gap-1"
                      title="Panel de Administración"
                    >
                      <span className="material-icons" style={{fontSize: '18px'}}>admin_panel_settings</span>
                      Admin
                    </Link>
                  )}
                  <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary-salmon rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.nombre[0]}{user.apellido?.[0] || ''}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">{user.nombre}</p>
                      <p className="text-xs text-secondary-salmon flex items-center gap-1">
                        <span className="material-icons" style={{fontSize: '14px'}}>stars</span>
                        {user.puntos} pts
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                    title="Cerrar Sesión"
                  >
                    <span className="material-icons" style={{fontSize: '18px'}}>logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="hidden md:block px-5 py-2.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                    Ingresar
                  </Link>
                  <Link href="/registro" className="btn-primary text-xs sm:text-sm px-3 py-2 sm:px-6 sm:py-3">
                    <span className="hidden sm:inline">Crear Cuenta</span>
                    <span className="sm:hidden">Registro</span>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/" 
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  Inicio
                </Link>
                <Link 
                  href="/productos" 
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  Productos
                </Link>
                <Link 
                  href="/boxes" 
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  Box
                </Link>
                <Link 
                  href="/nosotros" 
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  Nosotros
                </Link>
                <Link 
                  href="/contacto" 
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={closeMobileMenu}
                >
                  Contacto
                </Link>

                {isAuthenticated && user ? (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    {/* Admin Link Mobile */}
                    {isAdmin && (
                      <Link 
                        href="/admin" 
                        className="px-4 py-3 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium transition-colors flex items-center gap-2"
                        onClick={closeMobileMenu}
                      >
                        <span className="material-icons text-xl">admin_panel_settings</span>
                        Panel Admin
                      </Link>
                    )}
                    <Link 
                      href="/perfil" 
                      className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                      onClick={closeMobileMenu}
                    >
                      <span className="material-icons text-xl">person</span>
                      Mi Perfil
                    </Link>
                    <Link 
                      href="/pedidos" 
                      className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                      onClick={closeMobileMenu}
                    >
                      <span className="material-icons text-xl">inventory_2</span>
                      Mis Pedidos
                    </Link>
                    <Link 
                      href="/puntos" 
                      className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                      onClick={closeMobileMenu}
                    >
                      <span className="material-icons text-xl">stars</span>
                      Mis Puntos ({user.puntos})
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <span className="material-icons text-xl">logout</span>
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link 
                      href="/login" 
                      className="px-4 py-3 text-primary hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Ingresar
                    </Link>
                    <Link 
                      href="/registro" 
                      className="btn-primary text-center"
                      onClick={closeMobileMenu}
                    >
                      Crear Cuenta
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
