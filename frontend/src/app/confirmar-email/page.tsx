'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase/client';

export default function ConfirmarEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const confirmEmail = async () => {
      try {
        // Capturar token_hash de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const tokenHash = urlParams.get('token_hash');
        const type = urlParams.get('type');
        
        console.log('🔍 Token hash:', tokenHash);
        console.log('🔍 Type:', type);

        if (tokenHash && type === 'signup') {
          console.log('✅ Verificando OTP manualmente...');
          
          // Verificar el token manualmente
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'signup'
          });
          
          console.log('📊 Resultado verifyOtp:', data);
          console.log('❌ Error verifyOtp:', error);

          if (error) {
            console.error('❌ Error verificando:', error);
            setStatus('error');
            setMessage(error.message || 'Error al verificar el email');
            return;
          }

          if (data?.session) {
            console.log('✅ Email confirmado exitosamente!');
            setStatus('success');
            setMessage('¡Email verificado exitosamente!');
            
            timeoutId = setTimeout(() => {
              router.push('/login?verified=true');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('No se pudo verificar el email');
          }
        } else {
          console.log('❌ No hay token_hash o type en la URL');
          setStatus('error');
          setMessage('Link de verificación inválido');
        }
      } catch (err) {
        console.error('❌ Error:', err);
        setStatus('error');
        setMessage('Error al procesar la confirmación');
      }
    };

    confirmEmail();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router]);

  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gradient-to-br from-secondary-crema via-white to-secondary-rosa/20 flex items-center py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {/* Loading State */}
              {status === 'loading' && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                  <h1 className="text-2xl font-bold text-primary mb-4">
                    Verificando tu email...
                  </h1>
                  <p className="text-gray-600">
                    Por favor espera mientras confirmamos tu cuenta
                  </p>
                </div>
              )}

              {/* Success State */}
              {status === 'success' && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <span className="material-icons" style={{fontSize: '64px', color: '#2E7D32'}}>check_circle</span>
                  </div>
                  <h1 className="text-2xl font-bold text-green-600 mb-4">
                    ¡Email Verificado!
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {message}
                  </p>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Serás redirigido automáticamente en unos segundos...
                    </p>
                    <Link 
                      href="/productos"
                      className="btn-primary inline-block"
                    >
                      Ir a Productos
                    </Link>
                  </div>
                </div>
              )}

              {/* Error State */}
              {status === 'error' && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-icons" style={{fontSize: '64px', color: '#C62828'}}>cancel</span>
                  </div>
                  <h1 className="text-2xl font-bold text-red-600 mb-4">
                    Error de Verificación
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {message}
                  </p>
                  <div className="space-y-3">
                    <Link 
                      href="/registro"
                      className="btn-primary inline-block w-full"
                    >
                      Volver a Registrarse
                    </Link>
                    <Link 
                      href="/"
                      className="block text-gray-600 hover:text-primary transition-colors"
                    >
                      Ir al Inicio
                    </Link>
                  </div>
                </div>
              )}

              {/* Expired State */}
              {status === 'expired' && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-icons" style={{fontSize: '64px', color: '#F57C00'}}>schedule</span>
                  </div>
                  <h1 className="text-2xl font-bold text-yellow-600 mb-4">
                    Link Expirado
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Este link de verificación ha expirado. Por favor, solicita uno nuevo.
                  </p>
                  <div className="space-y-3">
                    <Link 
                      href="/reenviar-confirmacion"
                      className="btn-primary inline-block w-full"
                    >
                      Reenviar Email de Confirmación
                    </Link>
                    <Link 
                      href="/login"
                      className="block text-gray-600 hover:text-primary transition-colors"
                    >
                      Iniciar Sesión
                    </Link>
                  </div>
                </div>
              )}

              {/* Help Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500 mb-3">
                  ¿Tienes problemas con la verificación?
                </p>
                <div className="flex justify-center gap-4">
                  <Link 
                    href="/contacto"
                    className="text-sm text-primary hover:underline"
                  >
                    Contactar Soporte
                  </Link>
                  <Link 
                    href="/ayuda"
                    className="text-sm text-primary hover:underline"
                  >
                    Centro de Ayuda
                  </Link>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="material-icons text-3xl" style={{color: '#FBC02D'}}>lightbulb</span>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Consejo</h3>
                  <p className="text-sm text-blue-700">
                    Si no encuentras el email de confirmación, revisa tu carpeta de spam o correo no deseado.
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
