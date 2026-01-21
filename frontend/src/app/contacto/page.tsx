'use client';

import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import { contactService } from '@/services/supabase-api';
import { wholesaleDB } from '@/lib/supabase-fetch';
import { useAuthStore } from '@/store/authStore';
import { notificationService } from '@/lib/notifications';
import { MetaPixelEvents } from '@/components/MetaPixel';
import { SPANISH_SPEAKING_COUNTRIES, validatePhone, formatPhoneNumber } from '@/lib/countries';

export default function ContactoPage() {
  const [activeTab, setActiveTab] = useState<'contacto' | 'mayorista'>('contacto');
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    country: 'UY',
    asunto: 'consulta',
    mensaje: '',
  });

  const [wholesaleData, setWholesaleData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    country: 'UY',
    empresa: '',
    tipo_negocio: '',
    cantidad_estimada: '',
    productos_interes: '',
    mensaje: '',
  });

  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Guardar en base de datos
      await contactService.sendMessage(formData);
      
      // Enviar email de notificación al negocio
      await notificationService.notifyContact({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        asunto: formData.asunto,
        mensaje: formData.mensaje,
      });
      
      // Track Meta Pixel Lead event
      MetaPixelEvents.lead('contact');
      
      setEnviado(true);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        country: 'UY',
        asunto: 'consulta',
        mensaje: '',
      });
      setTimeout(() => setEnviado(false), 5000);
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      setError('Error al enviar el mensaje. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleWholesaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Guardar en base de datos
      await wholesaleDB.create({
        ...wholesaleData,
        user_id: user?.id || undefined
      });
      
      // Enviar email de notificación al negocio
      await notificationService.notifyContact({
        nombre: wholesaleData.nombre,
        email: wholesaleData.email,
        telefono: wholesaleData.telefono,
        asunto: `Solicitud Mayorista - ${wholesaleData.tipo_negocio}`,
        mensaje: `Empresa: ${wholesaleData.empresa || 'No especificada'}\nTipo: ${wholesaleData.tipo_negocio}\nCantidad estimada: ${wholesaleData.cantidad_estimada || 'No especificada'}\nProductos de interés: ${wholesaleData.productos_interes || 'No especificados'}\n\nMensaje: ${wholesaleData.mensaje || 'Sin mensaje adicional'}`,
      });
      
      // Track Meta Pixel Lead event
      MetaPixelEvents.lead('wholesale');
      
      setEnviado(true);
      setWholesaleData({
        nombre: '',
        email: '',
        telefono: '',
        country: 'UY',
        empresa: '',
        tipo_negocio: '',
        cantidad_estimada: '',
        productos_interes: '',
        mensaje: '',
      });
      setTimeout(() => setEnviado(false), 5000);
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      setError('Error al enviar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWholesaleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWholesaleData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gradient-to-br from-secondary-crema via-white to-secondary-rosa/10">
        <section className="py-12">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <span className="material-icons text-primary mb-4" style={{fontSize: '64px'}}>mail</span>
                <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
                  Contáctanos
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  ¿Tenés alguna pregunta? Estamos acá para ayudarte.
                </p>
                
                {/* Tabs */}
                <div className="inline-flex bg-white rounded-xl shadow-md p-1.5 gap-1">
                  <button
                  onClick={() => { setActiveTab('contacto'); setEnviado(false); setError(''); }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'contacto' 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="material-icons text-xl">chat</span>
                  Contacto General
                </button>
                <button
                  onClick={() => { setActiveTab('mayorista'); setEnviado(false); setError(''); }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'mayorista' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="material-icons text-xl">storefront</span>
                  Pedidos por Mayor
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 pb-16">
          {/* Grid principal - Formulario a la izquierda, Info compacta a la derecha */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Formulario - Ocupa 2 columnas */}
            <div className="lg:col-span-2">
                {activeTab === 'contacto' ? (
                  /* FORMULARIO CONTACTO GENERAL */
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                    <span className="material-icons">edit</span>
                    Envianos un Mensaje
                  </h2>
                  
                  {enviado && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                      <span className="material-icons text-green-600">check_circle</span>
                      <div>
                        <span className="font-semibold text-green-700">¡Mensaje enviado con éxito!</span>
                        <p className="text-sm text-green-600">Te responderemos dentro de las próximas 24 horas.</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                      <span className="material-icons text-red-600">error</span>
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          placeholder="Juan Pérez"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                        />
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                        />
                      </div>
                    </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                        País
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                      >
                        {SPANISH_SPEAKING_COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name} ({country.dialCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono (WhatsApp)
                      </label>
                      <div className="flex gap-2">
                        <div className="w-24 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center font-semibold text-sm">
                          {SPANISH_SPEAKING_COUNTRIES.find(c => c.code === formData.country)?.dialCode}
                        </div>
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          placeholder="XXX XXX XXX"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="asunto" className="block text-sm font-semibold text-gray-700 mb-2">
                        Asunto *
                      </label>
                      <select
                        id="asunto"
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                      >
                        <option value="consulta">Consulta General</option>
                        <option value="pedido">Consulta sobre Pedido</option>
                        <option value="producto">Información de Producto</option>
                        <option value="evento">Pedido para Evento</option>
                        <option value="reclamo">Reclamo o Sugerencia</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Contanos en qué podemos ayudarte..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-colors resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <span className="material-icons">send</span>
                        Enviar Mensaje
                      </>
                    )}
                  </button>
                </form>
              </div>
              ) : (
                /* FORMULARIO PEDIDOS POR MAYOR */
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-white text-2xl">storefront</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Pedidos por Mayor</h2>
                      <p className="text-sm text-gray-500">Para cafeterías, restaurantes, hoteles y eventos</p>
                    </div>
                  </div>
                  
                  {enviado && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                      <span className="material-icons text-green-600">check_circle</span>
                      <div>
                        <span className="font-semibold text-green-700">¡Solicitud enviada con éxito!</span>
                        <p className="text-sm text-green-600">Nos pondremos en contacto contigo pronto.</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                      <span className="material-icons text-red-600">error</span>
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Beneficios */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-amber-800 mb-2">✨ Beneficios para mayoristas:</h3>
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-amber-700">
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-amber-500 text-sm">check_circle</span>
                        Precios especiales
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-amber-500 text-sm">check_circle</span>
                        Entrega programada
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-amber-500 text-sm">check_circle</span>
                        Facturación mensual
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-amber-500 text-sm">check_circle</span>
                        Atención personalizada
                      </li>
                    </ul>
                  </div>

                  <form onSubmit={handleWholesaleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={wholesaleData.nombre}
                          onChange={handleWholesaleChange}
                          required
                          placeholder="Tu nombre"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Empresa / Negocio
                        </label>
                        <input
                          type="text"
                          name="empresa"
                          value={wholesaleData.empresa}
                          onChange={handleWholesaleChange}
                          placeholder="Nombre de tu negocio"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={wholesaleData.email}
                          onChange={handleWholesaleChange}
                          required
                          placeholder="tu@email.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          País *
                        </label>
                        <select
                          name="country"
                          value={wholesaleData.country}
                          onChange={handleWholesaleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                        >
                          {SPANISH_SPEAKING_COUNTRIES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.name} ({country.dialCode})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono (WhatsApp) *
                      </label>
                      <div className="flex gap-2">
                        <div className="w-24 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center font-semibold text-sm">
                          {SPANISH_SPEAKING_COUNTRIES.find(c => c.code === wholesaleData.country)?.dialCode}
                        </div>
                        <input
                          type="tel"
                          name="telefono"
                          value={wholesaleData.telefono}
                          onChange={handleWholesaleChange}
                          required
                          placeholder="XXX XXX XXX"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipo de Negocio *
                        </label>
                        <select
                          name="tipo_negocio"
                          value={wholesaleData.tipo_negocio}
                          onChange={handleWholesaleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                        >
                          <option value="">-- Seleccionar --</option>
                          <option value="cafeteria">Cafetería / Coffee Shop</option>
                          <option value="restaurante">Restaurante</option>
                          <option value="hotel">Hotel / Hostel</option>
                          <option value="tienda">Tienda / Almacén</option>
                          <option value="eventos">Empresa de Eventos</option>
                          <option value="catering">Catering</option>
                          <option value="oficina">Oficina / Coworking</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cantidad Estimada (mensual)
                        </label>
                        <select
                          name="cantidad_estimada"
                          value={wholesaleData.cantidad_estimada}
                          onChange={handleWholesaleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                        >
                          <option value="">-- Seleccionar --</option>
                          <option value="50-100">50 - 100 unidades</option>
                          <option value="100-200">100 - 200 unidades</option>
                          <option value="200-500">200 - 500 unidades</option>
                          <option value="500+">Más de 500 unidades</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ¿Qué productos te interesan?
                      </label>
                      <input
                        type="text"
                        name="productos_interes"
                        value={wholesaleData.productos_interes}
                        onChange={handleWholesaleChange}
                        placeholder="Ej: Cookies clásicas, Boxes para eventos, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mensaje adicional
                      </label>
                      <textarea
                        name="mensaje"
                        value={wholesaleData.mensaje}
                        onChange={handleWholesaleChange}
                        rows={4}
                        placeholder="Contanos más sobre tu negocio, frecuencia de pedidos, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors resize-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-lg font-semibold text-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <span className="material-icons">send</span>
                          Enviar Solicitud
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar de información - 1 columna */}
            <div className="space-y-4">
              {/* Contacto directo */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-icons">contact_phone</span>
                  Contacto Directo
                </h3>
                
                <div className="space-y-3">
                  <a 
                    href="https://wa.me/59897865053" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-white">chat</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">WhatsApp</p>
                      <p className="text-sm text-green-600">(+598) 97 865 053</p>
                    </div>
                  </a>

                  <a 
                    href="tel:+59897865053"
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-white">phone</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Teléfono</p>
                      <p className="text-sm text-blue-600">(+598) 97 865 053</p>
                    </div>
                  </a>

                  <a 
                    href="mailto:marlocookies2@gmail.com"
                    className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-white">email</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Email</p>
                      <p className="text-sm text-pink-600">marlocookies2@gmail.com</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Trabaja con Nosotros - DESTACADO */}
              <Link 
                href="/trabaja-con-nosotros"
                className="block bg-gradient-to-r from-primary to-primary-dark rounded-2xl shadow-lg p-5 text-white hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <span className="material-icons text-2xl">work</span>
                  </div>
                  <div>
                    <h3 className="font-bold">¿Querés trabajar con nosotros?</h3>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      Unite al equipo
                      <span className="material-icons text-base">arrow_forward</span>
                    </p>
                  </div>
                </div>
              </Link>

              {/* Ubicación y Horarios en una sola card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                    <span className="material-icons">location_on</span>
                    Ubicación
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Av. Juan Gorlero, Punta del Este
                  </p>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=MarLo+Cookies+Punta+del+Este"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary font-semibold hover:underline text-sm mt-1"
                  >
                    <span className="material-icons text-base">directions</span>
                    Cómo llegar
                  </a>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                    <span className="material-icons">schedule</span>
                    Horarios
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lun - Vie</span>
                      <span className="font-semibold text-gray-800">9:00 - 19:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sábado</span>
                      <span className="font-semibold text-gray-800">10:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Domingo</span>
                      <span className="font-semibold text-gray-500">Cerrado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="material-icons">share</span>
                  Redes Sociales
                </h3>
                <div className="flex gap-3">
                  <a 
                    href="https://www.instagram.com/marlo_cookies" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <span className="material-icons text-white">photo_camera</span>
                  </a>
                  <a 
                    href="https://www.facebook.com/MarLoCookiesUY" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <span className="material-icons text-white">thumb_up</span>
                  </a>
                  <a 
                    href="https://wa.me/59897865053" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <span className="material-icons text-white">chat</span>
                  </a>
                </div>
              </div>

              {/* Zonas de Delivery */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="material-icons">local_shipping</span>
                  Zonas de Delivery
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Punta del Este', 'La Barra', 'Manantiales', 'San Carlos', 'Maldonado'].map((zona) => (
                    <span key={zona} className="px-3 py-1 bg-secondary-crema text-primary rounded-full text-xs font-medium">
                      {zona}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}


