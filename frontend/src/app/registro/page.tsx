'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { authDB } from '@/lib/supabase-fetch';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SPANISH_SPEAKING_COUNTRIES, validatePhone, formatPhoneNumber } from '@/lib/countries';

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    country: 'UY',
    fecha_cumpleanos: '',
    password: '',
    confirmPassword: '',
    aceptaTerminos: false,
    aceptaMarketing: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!formData.aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    // Validar edad mínima (14 años) según políticas de Meta
    if (formData.fecha_cumpleanos) {
      const birthDate = new Date(formData.fecha_cumpleanos);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 14) {
        setError('Debes tener al menos 14 años para crear una cuenta');
        return;
      }
    }

    // Validar teléfono si se proporciona
    if (formData.telefono && !validatePhone(formData.telefono, formData.country)) {
      const country = SPANISH_SPEAKING_COUNTRIES.find(c => c.code === formData.country);
      setError(`Teléfono inválido para ${country?.name}. Ingresa ${country?.phoneLength} dígitos aproximadamente.`);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Formatear teléfono con código de país
      const telefonoFormateado = formData.telefono 
        ? formatPhoneNumber(formData.telefono, formData.country)
        : undefined;

      const { data, error: signupError } = await authDB.signup({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: telefonoFormateado,
        country: formData.country,
        fecha_cumpleanos: formData.fecha_cumpleanos || undefined,
      });

      if (signupError) {
        setError(signupError.message || 'Error al crear la cuenta');
        return;
      }

      if (data) {
        // Redirigir a página de verificación pendiente
        router.push(`/verificacion-pendiente?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError('Error al crear la cuenta. Por favor intenta nuevamente.');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al conectar con el servidor. Verifica tu conexión.';
      setError(errorMessage);
      console.error('Error en registro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gradient-to-br from-secondary-crema via-white to-secondary-rosa/20 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                  <span className="material-icons" style={{fontSize: '48px', color: 'white'}}>cookie</span>
                </div>
                <h1 className="text-3xl font-bold text-primary mb-2">Crea tu Cuenta</h1>
                <p className="text-gray-600">Únete a nuestra comunidad y disfruta de beneficios exclusivos</p>
              </div>

              {/* Beneficios */}
              <div className="grid md:grid-cols-3 gap-4 mb-8 p-4 bg-secondary-crema/30 rounded-xl">
                <div className="text-center">
                  <span className="material-icons text-3xl mb-2 block" style={{color: '#8B4513'}}>card_giftcard</span>
                  <p className="text-sm font-semibold text-primary">Programa de Puntos</p>
                </div>
                <div className="text-center">
                  <span className="material-icons text-3xl mb-2 block" style={{color: '#8B4513'}}>celebration</span>
                  <p className="text-sm font-semibold text-primary">Ofertas Exclusivas</p>
                </div>
                <div className="text-center">
                  <span className="material-icons text-3xl mb-2 block" style={{color: '#8B4513'}}>local_shipping</span>
                  <p className="text-sm font-semibold text-primary">Envío Prioritario</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mensaje de error */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Juan"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      required
                      placeholder="Pérez"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="09X XXX XXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Para notificaciones de pedidos por WhatsApp</p>
                </div>

                <div>
                  <label htmlFor="fecha_cumpleanos" className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha de Nacimiento * 🎂
                  </label>
                  <input
                    type="date"
                    id="fecha_cumpleanos"
                    name="fecha_cumpleanos"
                    value={formData.fecha_cumpleanos}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Debes tener al menos 14 años. ¡También recibirás una sorpresa en tu cumpleaños!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmar Contraseña *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="aceptaTerminos"
                      checked={formData.aceptaTerminos}
                      onChange={handleChange}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-600">
                      Acepto los{' '}
                      <Link href="/terminos" className="text-primary hover:underline font-semibold">
                        términos y condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link href="/privacidad" className="text-primary hover:underline font-semibold">
                        política de privacidad
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="aceptaMarketing"
                      checked={formData.aceptaMarketing}
                      onChange={handleChange}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-600">
                      Quiero recibir ofertas exclusivas, promociones y novedades por email
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Mi Cuenta'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <Link href="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                    Inicia sesión
                  </Link>
                </p>
              </div>
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
