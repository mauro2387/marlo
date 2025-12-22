'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSent(true);
      setMessage({
        type: 'success',
        text: 'Te enviamos un email con instrucciones para restablecer tu contraseña.'
      });
    } catch (error: any) {
      console.error('Error al enviar email:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Ocurrió un error al enviar el email. Intenta nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-pink-50 to-orange-50 pt-[140px] pb-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-pink-500 rounded-full mb-6">
              <span className="material-icons text-white text-4xl">lock_reset</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-gray-600">
              No te preocupes, te ayudamos a recuperar el acceso a tu cuenta
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email de tu cuenta
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-gray-400">
                      email
                    </span>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Te enviaremos un link para restablecer tu contraseña
                  </p>
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
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-primary to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <span className="material-icons">send</span>
                      Enviar instrucciones
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <span className="material-icons text-green-600 text-3xl">mark_email_read</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  ¡Email enviado!
                </h2>
                <p className="text-gray-600 mb-6">
                  Revisa tu bandeja de entrada (y spam) para encontrar el link de recuperación.
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-2 text-amber-700 text-sm">
                    <span className="material-icons text-lg mt-0.5">info</span>
                    <div>
                      <p className="font-medium">El link expira en 1 hora</p>
                      <p>Si no lo ves, revisa tu carpeta de spam o correo no deseado.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                    setMessage(null);
                  }}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  ← Enviar a otro email
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">o</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3 text-center">
              <p className="text-gray-600">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
                  Iniciar sesión
                </Link>
              </p>
              <p className="text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link href="/registro" className="text-primary hover:text-primary-dark font-medium">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              ¿Necesitas ayuda?{' '}
              <a 
                href="https://wa.me/59897865053?text=Hola!%20Necesito%20ayuda%20para%20recuperar%20mi%20cuenta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Contáctanos por WhatsApp
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
