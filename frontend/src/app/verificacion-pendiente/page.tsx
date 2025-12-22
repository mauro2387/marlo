'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase/client';

export default function VerificacionPendientePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'tu email';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resent, setResent] = useState(false);

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      setResent(true);
      setMessage('¡Email reenviado exitosamente! Revisa tu bandeja de entrada.');
    } catch (error: any) {
      setMessage(error.message || 'Error al reenviar el email. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gradient-to-br from-secondary-crema via-white to-secondary-rosa/20 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                  <span className="material-icons" style={{fontSize: '64px', color: 'white'}}>email</span>
                </div>
                <h1 className="text-3xl font-bold text-primary mb-4">
                  ¡Verifica tu Email!
                </h1>
                <p className="text-lg text-gray-600">
                  Te hemos enviado un email de confirmación a:
                </p>
                <p className="text-xl font-bold text-primary mt-2">
                  {email}
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h2 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="material-icons text-3xl">assignment</span>
                    Pasos a Seguir
                  </h2>
                  <ol className="space-y-3 text-blue-800">
                    <li className="flex items-start gap-3">
                      <span className="font-bold bg-blue-200 w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                      <span>Abre tu correo electrónico ({email})</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold bg-blue-200 w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                      <span>Busca el email de <strong>MarLo Cookies</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold bg-blue-200 w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                      <span>Haz click en el botón <strong>"Confirmar Email"</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold bg-blue-200 w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                      <span className="flex items-center gap-1">¡Listo! Podrás empezar a comprar <span className="material-icons text-base">cookie</span></span>
                    </li>
                  </ol>
                </div>

                {/* Tips */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <span className="material-icons text-3xl" style={{color: '#FBC02D'}}>lightbulb</span>
                    ¿No encuentras el email?
                  </h3>
                  <ul className="space-y-2 text-yellow-800 text-sm">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Revisa tu carpeta de <strong>Spam o Correo no deseado</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Verifica que escribiste correctamente tu email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Espera unos minutos, a veces puede tardar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Agrega <strong>noreply@marlocookies.uy</strong> a tus contactos</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className={`mb-6 p-4 rounded-lg ${resent ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {message}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleResendEmail}
                  disabled={loading || resent}
                  className="w-full px-6 py-4 bg-secondary-salmon text-white font-semibold rounded-xl hover:bg-secondary-salmon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Reenviando...
                    </>
                  ) : resent ? (
                    <>
                      <span className="material-icons">check_circle</span> Email Reenviado
                    </>
                  ) : (
                    <>
                      <span className="material-icons">mail_outline</span> Reenviar Email de Confirmación
                    </>
                  )}
                </button>

                <Link
                  href="/"
                  className="block text-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Volver al Inicio
                </Link>
              </div>

              {/* Help Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600 mb-3">
                  ¿Necesitas ayuda?
                </p>
                <div className="flex justify-center gap-6">
                  <Link 
                    href="/contacto"
                    className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    <span className="material-icons text-base">chat</span> Contactar Soporte
                  </Link>
                  <a 
                    href="https://wa.me/59897865053"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline font-medium flex items-center gap-1"
                  >
                    <span className="material-icons text-base">smartphone</span> WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="material-icons text-3xl" style={{color: '#455A64'}}>lock</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Seguridad</h3>
                  <p className="text-sm text-gray-600">
                    El link de verificación expira en 24 horas por seguridad. 
                    Nunca compartas este email con nadie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
