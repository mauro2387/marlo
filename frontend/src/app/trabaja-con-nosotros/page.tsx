'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { jobsService } from '@/services/supabase-api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SPANISH_SPEAKING_COUNTRIES, validatePhone, formatPhoneNumber } from '@/lib/countries';

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  country: string;
  edad: string;
  experiencia: string;
  disponibilidad: string;
  porque: string;
  cv_url: string;
}

const puestos = [
  {
    id: 'produccion',
    titulo: 'Ayudante de Producción',
    descripcion: 'Preparación de cookies, empaque y control de calidad.',
    requisitos: ['Mayor de 18 años', 'Disponibilidad horaria', 'Carnet de salud vigente'],
    icon: '🍪'
  },
  {
    id: 'delivery',
    titulo: 'Delivery',
    descripcion: 'Entrega de pedidos en Maldonado y alrededores.',
    requisitos: ['Licencia de conducir', 'Moto o vehículo propio', 'Conocimiento de la zona'],
    icon: '🚗'
  },
  {
    id: 'atencion',
    titulo: 'Atención al Cliente',
    descripcion: 'Gestión de pedidos, atención de consultas y redes sociales.',
    requisitos: ['Experiencia en atención al cliente', 'Buena comunicación', 'Manejo de redes sociales'],
    icon: '💬'
  }
];

export default function TrabajaNosotrosPage() {
  const [selectedPuesto, setSelectedPuesto] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    country: 'UY',
    edad: '',
    experiencia: '',
    disponibilidad: '',
    porque: '',
    cv_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPuesto) {
      setError('Por favor selecciona un puesto');
      return;
    }
    
    if (!formData.nombre || !formData.email || !formData.telefono) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await jobsService.apply({
        position: selectedPuesto,
        name: formData.nombre,
        email: formData.email,
        phone: formData.telefono,
        age: formData.edad ? parseInt(formData.edad) : null,
        experience: formData.experiencia,
        availability: formData.disponibilidad,
        motivation: formData.porque,
        cv_url: formData.cv_url || null
      });
      
      setSubmitted(true);
    } catch (err) {
      console.error('Error enviando postulación:', err);
      setError('Error al enviar la postulación. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="pt-[120px] min-h-screen bg-cream-50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
              <span className="text-6xl block mb-4">🎉</span>
              <h1 className="text-2xl font-bold text-brown-800 mb-4">
                ¡Postulación Enviada!
              </h1>
              <p className="text-gray-600 mb-6">
                Gracias por tu interés en formar parte del equipo MarLo Cookies.
                Te contactaremos pronto si tu perfil coincide con lo que buscamos.
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600"
              >
                Volver al Inicio
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-[120px] min-h-screen bg-cream-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-pink-100 to-cream-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-6xl block mb-4">👩‍🍳</span>
              <h1 className="text-4xl font-bold text-brown-800 mb-4">
                Trabaja con Nosotros
              </h1>
              <p className="text-lg text-gray-600">
                ¿Te apasionan las cookies y querés ser parte de un equipo 
                increíble? ¡Te estamos buscando! 🍪
              </p>
            </div>
          </div>
        </section>

        {/* Puestos disponibles */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-brown-800 text-center mb-8">
              Puestos Disponibles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {puestos.map((puesto) => (
                <button
                  key={puesto.id}
                  onClick={() => setSelectedPuesto(puesto.id)}
                  className={`p-6 rounded-xl text-left transition-all ${
                    selectedPuesto === puesto.id
                      ? 'bg-pink-500 text-white shadow-lg scale-105'
                      : 'bg-white shadow-md hover:shadow-lg hover:scale-102'
                  }`}
                >
                  <span className="text-4xl block mb-3">{puesto.icon}</span>
                  <h3 className={`text-xl font-bold mb-2 ${
                    selectedPuesto === puesto.id ? 'text-white' : 'text-brown-800'
                  }`}>
                    {puesto.titulo}
                  </h3>
                  <p className={`text-sm mb-4 ${
                    selectedPuesto === puesto.id ? 'text-pink-100' : 'text-gray-600'
                  }`}>
                    {puesto.descripcion}
                  </p>
                  <ul className="space-y-1">
                    {puesto.requisitos.map((req, i) => (
                      <li key={i} className={`text-xs flex items-center gap-2 ${
                        selectedPuesto === puesto.id ? 'text-pink-100' : 'text-gray-500'
                      }`}>
                        <span>✓</span> {req}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Formulario */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-brown-800 text-center mb-2">
                Postúlate Ahora
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Completá el formulario y te contactaremos
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos personales */}
                <div className="bg-cream-50 rounded-xl p-6">
                  <h3 className="font-semibold text-brown-800 mb-4">📋 Datos Personales</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        placeholder="Tu nombre"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Edad
                      </label>
                      <input
                        type="number"
                        name="edad"
                        value={formData.edad}
                        onChange={handleInputChange}
                        min={16}
                        max={99}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        placeholder="Ej: 25"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        placeholder="tu@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono (WhatsApp) *
                      </label>
                      <div className="flex gap-2">
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                          className="w-16 px-1 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 text-center text-lg"
                          title={SPANISH_SPEAKING_COUNTRIES.find(c => c.code === formData.country)?.name}
                        >
                          {SPANISH_SPEAKING_COUNTRIES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag}
                            </option>
                          ))}
                        </select>
                        <div className="w-14 px-1 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-center font-medium text-xs">
                          {SPANISH_SPEAKING_COUNTRIES.find(c => c.code === formData.country)?.dialCode}
                        </div>
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          required
                          placeholder="XXX XXX XXX"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experiencia */}
                <div className="bg-cream-50 rounded-xl p-6">
                  <h3 className="font-semibold text-brown-800 mb-4">💼 Experiencia</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ¿Tenés experiencia relacionada?
                      </label>
                      <textarea
                        name="experiencia"
                        value={formData.experiencia}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        placeholder="Contanos sobre tu experiencia laboral previa..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Disponibilidad horaria
                      </label>
                      <select
                        name="disponibilidad"
                        value={formData.disponibilidad}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                      >
                        <option value="">Seleccionar</option>
                        <option value="full-time">Full time (8hs)</option>
                        <option value="part-time-manana">Part time (mañana)</option>
                        <option value="part-time-tarde">Part time (tarde)</option>
                        <option value="fines-semana">Fines de semana</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Motivación */}
                <div className="bg-cream-50 rounded-xl p-6">
                  <h3 className="font-semibold text-brown-800 mb-4">💭 Motivación</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ¿Por qué querés trabajar en MarLo Cookies?
                    </label>
                    <textarea
                      name="porque"
                      value={formData.porque}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                      placeholder="Contanos qué te motiva a postularte..."
                    />
                  </div>
                </div>

                {/* CV */}
                <div className="bg-cream-50 rounded-xl p-6">
                  <h3 className="font-semibold text-brown-800 mb-4">📄 Currículum (opcional)</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link a tu CV (Google Drive, Dropbox, etc.)
                    </label>
                    <input
                      type="url"
                      name="cv_url"
                      value={formData.cv_url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                      placeholder="https://drive.google.com/..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Podés subir tu CV a Google Drive o Dropbox y pegar el link aquí
                    </p>
                  </div>
                </div>

                {/* Puesto seleccionado */}
                {selectedPuesto && (
                  <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">
                      {puestos.find(p => p.id === selectedPuesto)?.icon}
                    </span>
                    <div>
                      <p className="text-sm text-pink-600">Postulándote para:</p>
                      <p className="font-semibold text-pink-800">
                        {puestos.find(p => p.id === selectedPuesto)?.titulo}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !selectedPuesto}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Postulación
                      <span>→</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Al enviar aceptás que tus datos sean utilizados para el proceso de selección.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="py-12 bg-brown-800 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">
              ¿Por qué trabajar con nosotros? 🍪
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <span className="text-4xl block mb-2">🎨</span>
                <h3 className="font-semibold mb-1">Creatividad</h3>
                <p className="text-sm text-brown-200">Ambiente creativo y dinámico</p>
              </div>
              <div className="text-center">
                <span className="text-4xl block mb-2">📈</span>
                <h3 className="font-semibold mb-1">Crecimiento</h3>
                <p className="text-sm text-brown-200">Oportunidades de desarrollo</p>
              </div>
              <div className="text-center">
                <span className="text-4xl block mb-2">🤝</span>
                <h3 className="font-semibold mb-1">Equipo</h3>
                <p className="text-sm text-brown-200">Compañeros increíbles</p>
              </div>
              <div className="text-center">
                <span className="text-4xl block mb-2">🍪</span>
                <h3 className="font-semibold mb-1">Cookies</h3>
                <p className="text-sm text-brown-200">¡Cookies gratis!</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
