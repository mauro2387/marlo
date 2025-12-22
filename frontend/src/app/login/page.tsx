'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { authDB } from '@/lib/supabase-fetch';
import LoadingSpinner from '@/components/LoadingSpinner';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const { login, clearAuth, isAuthenticated, user } = useAuthStore();
  const { addNotification } = useUIStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/productos';

  // Lista de emails de admin
  const adminEmails = ['admin@marlocookies.com', 'antorivero.work@gmail.com', 'maurohernandez5678@gmail.com'];
  
  const checkIsAdmin = (email?: string, rol?: string) => {
    return rol === 'admin' || adminEmails.includes(email || '');
  };

  // Si ya está autenticado correctamente, redirigir
  useEffect(() => {
    // Solo ejecutar una vez cuando está autenticado y no está cargando
    if (isAuthenticated && user && !loading) {
      console.log('✅ Ya autenticado:', user.email, 'rol:', user.rol);
      const isAdmin = checkIsAdmin(user.email, user.rol);
      
      if (redirectTo === '/admin') {
        if (isAdmin) {
          console.log('🔄 Redirigiendo admin a /admin');
          router.replace('/admin');
        } else {
          console.log('❌ No es admin, mostrando error');
          setError('No tienes permisos de administrador');
          setShowHelp(true);
        }
      } else {
        console.log('🔄 Redirigiendo a:', redirectTo);
        router.replace(redirectTo);
      }
    }
  }, [isAuthenticated, user]);

  // Función para limpiar todo el estado guardado
  const handleClearStorage = async () => {
    try {
      // Limpiar Zustand persist
      clearAuth();
      
      // Limpiar localStorage
      localStorage.removeItem('marlocookies-auth');
      localStorage.removeItem('marlocookies-cart');
      
      // Cerrar sesión (limpia el token de Supabase)
      await authDB.logout();
      
      addNotification({
        type: 'success',
        message: 'Datos limpiados. Intenta iniciar sesión de nuevo.',
        duration: 3000,
      });
      
      // Recargar la página
      window.location.reload();
    } catch (err) {
      console.error('Error limpiando storage:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('🔐 Iniciando login con:', email);
    
    try {
      // Limpiar cualquier estado de auth anterior
      clearAuth();
      
      // Hacer login con fetch directo (rápido)
      console.log('📡 Llamando authDB.login...');
      const { data, error: loginError } = await authDB.login(email, password);
      
      if (loginError || !data) {
        console.error('❌ Error en login:', loginError);
        setError(loginError?.message || 'Error al iniciar sesión');
        setShowHelp(true);
        return;
      }
      
      console.log('✅ Login exitoso:', data.user?.email);
      
      const userData = data.userData;
      if (userData) {
        // Guardar en el store de Zustand
        login(
          {
            id: userData.id,
            nombre: userData.nombre,
            apellido: userData.apellido || '',
            email: userData.email,
            puntos: userData.puntos || 0,
            rol: userData.rol || 'cliente',
            avatar: userData.avatar,
            telefono: userData.telefono,
            direccion: userData.direccion,
            zona: userData.zona,
            departamento: userData.departamento,
          },
          data.session?.access_token || ''
        );
        
        addNotification({
          type: 'success',
          message: `¡Bienvenido de vuelta, ${userData.nombre}!`,
          duration: 3000,
        });
        
        // Determinar redirección usando la función checkIsAdmin
        const isAdmin = checkIsAdmin(userData.email, userData.rol);
        const finalRedirect = redirectTo === '/admin' && isAdmin ? '/admin' : (redirectTo !== '/admin' ? redirectTo : '/productos');
        
        console.log('✅ Redirigiendo a:', finalRedirect, '(isAdmin:', isAdmin, ')');
        router.replace(finalRedirect);
      } else {
        console.error('❌ No se encontró userData');
        setError('Error al obtener datos del usuario');
        setShowHelp(true);
      }
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err?.message || 'Error al iniciar sesión');
      setShowHelp(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
          <span className="material-icons" style={{fontSize: '48px', color: 'white'}}>cookie</span>
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">Bienvenido de Vuelta</h1>
        <p className="text-gray-600">Ingresa a tu cuenta para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensaje de error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recordar}
              onChange={(e) => setRecordar(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
            />
            <span className="text-sm text-gray-600">Recordarme</span>
          </label>
          <Link href="/recuperar" className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      {/* Botón de ayuda si hay problemas */}
      {showHelp && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">¿Tienes problemas para iniciar sesión?</p>
          <button
            onClick={handleClearStorage}
            className="text-sm text-yellow-700 underline hover:text-yellow-900"
          >
            Limpiar datos guardados e intentar de nuevo
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-center text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link href="/registro" className="text-primary hover:text-primary-dark font-semibold transition-colors">
            Regístrate gratis
          </Link>
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">Inicia sesión para acceder a todas las funciones</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gradient-to-br from-secondary-crema via-white to-secondary-rosa/20 flex items-center py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-md mx-auto">
            <Suspense fallback={
              <div className="bg-white rounded-2xl shadow-2xl p-8 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            }>
              <LoginForm />
            </Suspense>

            <div className="mt-6 text-center">
              <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
