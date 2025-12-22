'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: 'inventory_2' },
  { href: '/admin/productos', label: 'Productos', icon: 'cookie' },
  { href: '/admin/puntos', label: 'Puntos', icon: 'stars' },
  { href: '/admin/clientes', label: 'Clientes', icon: 'group' },
  { href: '/admin/cupones', label: 'Cupones', icon: 'confirmation_number' },
  { href: '/admin/zonas', label: 'Zonas Delivery', icon: 'local_shipping' },
  { href: '/admin/banners', label: 'Banners', icon: 'campaign' },
  { href: '/admin/destacados', label: 'Destacados', icon: 'auto_awesome' },
  { href: '/admin/postulaciones', label: 'Postulaciones', icon: 'work' },
  { href: '/admin/galeria', label: 'Galería', icon: 'photo_library' },
  { href: '/admin/popups', label: 'Pop-ups', icon: 'web_stories' },
  { href: '/admin/suscriptores', label: 'Suscriptores', icon: 'contacts' },
  { href: '/admin/mayoristas', label: 'Mayoristas', icon: 'storefront' },
  { href: '/admin/configuracion', label: 'Configuración', icon: 'settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  const checkIsAdmin = (u: typeof user) => {
    if (!u) return false;
    return u.rol === 'admin';
  };

  // Esperar a que el componente se monte
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar auth después de que se monte y el loading termine
  useEffect(() => {
    // No hacer nada hasta que esté montado
    if (!mounted) return;
    
    // Esperar a que termine de cargar
    if (isLoading) {
      console.log('🔄 Admin: Esperando que termine de cargar...');
      return;
    }
    
    const isAdmin = checkIsAdmin(user);
    console.log('🔐 Admin check:', { isAuthenticated, isLoading, userEmail: user?.email, userRol: user?.rol, isAdmin });
    
    if (!isAuthenticated || !user) {
      console.log('❌ No autenticado, redirigiendo a login...');
      router.replace('/login?redirect=/admin');
      return;
    }
    
    if (!isAdmin) {
      console.log('❌ No es admin, redirigiendo a inicio...');
      router.replace('/');
      return;
    }
    
    // Todo OK, terminar de verificar
    console.log('✅ Admin verificado correctamente');
    setIsChecking(false);
  }, [mounted, isLoading, isAuthenticated, user, router]);

  // Mostrar loading mientras se monta, carga o verifica
  if (!mounted || isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {!mounted ? 'Iniciando...' : isLoading ? 'Cargando sesión...' : 'Verificando permisos...'}
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = checkIsAdmin(user);
  
  // Si llegamos aquí sin ser admin, mostrar loading mientras redirige
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="material-icons text-pink-400 text-2xl">cookie</span>
            {sidebarOpen && <span className="font-bold text-lg text-white">MarLo Admin</span>}
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-pink-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="material-icons text-xl">{item.icon}</span>
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-gray-700 hover:bg-gray-800 transition-colors flex items-center justify-center text-gray-300 hover:text-white"
        >
          <span className="material-icons">{sidebarOpen ? 'chevron_left' : 'chevron_right'}</span>
        </button>

        {/* Volver al sitio */}
        <Link
          href="/"
          className="p-4 border-t border-gray-700 hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
        >
          <span className="material-icons">home</span>
          {sidebarOpen && <span>Volver al sitio</span>}
        </Link>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-brown-800">
              Panel de Administración
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.nombre?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
