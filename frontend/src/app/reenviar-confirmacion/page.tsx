'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ReenviarConfirmacionPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/confirmar-email?type=signup`,
        },
      });

      if (resendError) {
        setError(resendError.message || 'Error al reenviar el email');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gradient-to-br from-secondary-crema via-white to-secondary-rosa/20 flex items-center py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {success ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-icons" style={{fontSize: '48px', color: '#2E7D32'}}>mark_email_read</span>
                  </div>
                  <h1 className="text-2xl font-bold text-green-600 mb-4">
                    ¡Email Enviado!
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Hemos enviado un nuevo email de confirmación a <strong>{email}</strong>.
                    Por favor revisa tu bandeja de entrada y carpeta de spam.
                  </p>
                  <div className="space-y-3">
                    <Link 
                      href="/login"
                      className="btn-primary inline-block w-full text-center"
                    >
                      Ir a Iniciar Sesión
                    </Link>
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setEmail('');
                      }}
                      className="text-gray-600 hover:text-primary transition-colors text-sm"
                    >
                      Usar otro email
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                      <span className="material-icons" style={{fontSize: '48px', color: 'white'}}>email</span>
                    </div>
                    <h1 className="text-2xl font-bold text-primary mb-2">
                      Reenviar Confirmación
                    </h1>
                    <p className="text-gray-600">
                      Ingresa tu email para recibir un nuevo link de confirmación
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
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

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <span className="material-icons">send</span>
                          Reenviar Email
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-gray-600">
                      ¿Ya confirmaste tu email?{' '}
                      <Link href="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                        Iniciar Sesión
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>

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
