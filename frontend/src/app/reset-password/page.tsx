'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión de recuperación válida
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Si no hay sesión, el usuario llegó aquí sin el link de recuperación
      if (!session) {
        setMessage({
          type: 'error',
          text: 'Link de recuperación inválido o expirado. Solicita uno nuevo.'
        });
      }
      setChecking(false);
    };

    checkSession();
  }, []);

  const validatePassword = () => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validatePassword();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setMessage({
        type: 'success',
        text: '¡Contraseña actualizada correctamente!'
      });

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Ocurrió un error al actualizar la contraseña.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-pink-50 to-orange-50 pt-[140px] pb-12 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 mt-4">Verificando...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-pink-50 to-orange-50 pt-[140px] pb-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-pink-500 rounded-full mb-6">
              <span className="material-icons text-white text-4xl">
                {success ? 'check' : 'key'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {success ? '¡Listo!' : 'Nueva contraseña'}
            </h1>
            <p className="text-gray-600">
              {success 
                ? 'Tu contraseña ha sido actualizada' 
                : 'Ingresa tu nueva contraseña'
              }
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-gray-400">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="material-icons">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-gray-400">
                      lock_outline
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {message && (
                  <div className={`p-4 rounded-xl ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-lg">
                        {message.type === 'success' ? 'check_circle' : 'error'}
                      </span>
                      {message.text}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full bg-gradient-to-r from-primary to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <span className="material-icons">save</span>
                      Guardar nueva contraseña
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <span className="material-icons text-green-600 text-3xl">check_circle</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  ¡Contraseña actualizada!
                </h2>
                <p className="text-gray-600 mb-6">
                  Ahora puedes iniciar sesión con tu nueva contraseña.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Redirigiendo al login...
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
                >
                  <span className="material-icons">login</span>
                  Ir a iniciar sesión
                </Link>
              </div>
            )}
          </div>

          {/* Links si el link expiró */}
          {message?.type === 'error' && !success && (
            <div className="mt-6 text-center">
              <Link
                href="/recuperar"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
              >
                <span className="material-icons">refresh</span>
                Solicitar nuevo link de recuperación
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
