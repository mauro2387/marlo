'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Pedidos
  {
    category: 'Pedidos',
    question: '¿Cómo hago un pedido?',
    answer: 'Para hacer un pedido, simplemente navega a nuestra tienda, agrega los productos al carrito y sigue el proceso de checkout. Puedes pagar con efectivo, transferencia bancaria o MercadoPago.'
  },
  {
    category: 'Pedidos',
    question: '¿Cuánto tiempo tarda mi pedido?',
    answer: 'Los pedidos de delivery en Maldonado se entregan el mismo día o al día siguiente según la zona. Para retiro en local, te avisamos por WhatsApp cuando tu pedido esté listo (generalmente en 1-2 horas).'
  },
  {
    category: 'Pedidos',
    question: '¿Puedo modificar o cancelar mi pedido?',
    answer: 'Puedes modificar o cancelar tu pedido contactándonos por WhatsApp antes de que cambie a estado "preparando". Una vez en preparación, no es posible hacer cambios.'
  },
  {
    category: 'Pedidos',
    question: '¿Cómo sé el estado de mi pedido?',
    answer: 'Puedes ver el estado de tus pedidos en la sección "Mis Pedidos" de tu perfil. También te notificamos por WhatsApp cada vez que tu pedido cambia de estado.'
  },
  // Delivery
  {
    category: 'Delivery',
    question: '¿A qué zonas hacen delivery?',
    answer: 'Hacemos delivery a todas las zonas de Maldonado incluyendo: Centro, Punta del Este, La Barra, Manantiales, José Ignacio, San Carlos, Piriápolis y más. El costo varía según la zona.'
  },
  {
    category: 'Delivery',
    question: '¿Cuánto cuesta el delivery?',
    answer: 'El costo de delivery depende de la zona. Puedes ver el costo exacto al seleccionar tu zona durante el checkout. El retiro en local es siempre gratis.'
  },
  {
    category: 'Delivery',
    question: '¿Hacen envíos a otros departamentos?',
    answer: 'Actualmente solo hacemos delivery en el departamento de Maldonado. Para otros departamentos, contáctanos por WhatsApp para coordinar opciones de envío especiales.'
  },
  // Pagos
  {
    category: 'Pagos',
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos: Efectivo (al momento de la entrega), Transferencia bancaria (antes de la entrega) y MercadoPago (tarjetas de crédito/débito).'
  },
  {
    category: 'Pagos',
    question: '¿Cómo pago por transferencia?',
    answer: 'Al elegir transferencia, te mostraremos los datos bancarios. Debes incluir tu número de pedido en el concepto y enviarnos el comprobante por WhatsApp.'
  },
  // Cuenta
  {
    category: 'Cuenta',
    question: '¿Cómo creo una cuenta?',
    answer: 'Haz clic en "Registrarse" en el menú, completa tus datos y confirma tu email. ¡Listo! Ya puedes hacer pedidos y acumular puntos.'
  },
  {
    category: 'Cuenta',
    question: '¿Olvidé mi contraseña, qué hago?',
    answer: 'En la página de login, haz clic en "¿Olvidaste tu contraseña?" e ingresa tu email. Recibirás un link para crear una nueva contraseña.'
  },
  {
    category: 'Cuenta',
    question: 'No recibí el email de confirmación',
    answer: 'Revisa tu carpeta de spam o correo no deseado. Si no lo encuentras, puedes solicitar uno nuevo desde la página "Reenviar Confirmación".'
  },
  // Puntos
  {
    category: 'Puntos',
    question: '¿Cómo funciona el programa de puntos?',
    answer: 'Por cada $100 que gastas, ganas 10 puntos. Los puntos se pueden canjear por descuentos en futuras compras. ¡Mientras más compras, más beneficios!'
  },
  {
    category: 'Puntos',
    question: '¿Cuántos puntos necesito para obtener un descuento?',
    answer: 'Puedes canjear puntos desde 100 puntos = $50 de descuento. Los descuentos van aumentando: 200 puntos = $100, 500 puntos = $300, 1000 puntos = $700.'
  },
  {
    category: 'Puntos',
    question: '¿Los puntos tienen vencimiento?',
    answer: 'No, tus puntos no vencen mientras tu cuenta esté activa. ¡Acumúlalos sin preocupaciones!'
  },
  // Productos
  {
    category: 'Productos',
    question: '¿Las cookies tienen conservantes?',
    answer: 'No, nuestras cookies son 100% artesanales sin conservantes artificiales. Por eso recomendamos consumirlas dentro de los 5 días posteriores a la compra.'
  },
  {
    category: 'Productos',
    question: '¿Tienen opciones para personas con alergias?',
    answer: 'Algunas de nuestras cookies contienen frutos secos, lácteos y gluten. Consulta la descripción de cada producto para ver los alérgenos. Si tienes dudas, contáctanos.'
  },
  {
    category: 'Productos',
    question: '¿Puedo personalizar mi box de cookies?',
    answer: '¡Sí! Ofrecemos box personalizados donde puedes elegir los sabores que prefieras. Visita nuestra sección de Box para armar el tuyo.'
  },
];

const categories = ['Todos', 'Pedidos', 'Delivery', 'Pagos', 'Cuenta', 'Puntos', 'Productos'];

export default function AyudaPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'Todos' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gradient-to-br from-secondary-crema via-white to-secondary-rosa/20">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Centro de Ayuda
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              ¿Tienes preguntas? Aquí encontrarás respuestas a las consultas más frecuentes.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en las preguntas frecuentes..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <span className="material-icons text-6xl text-gray-300 mb-4">search_off</span>
                <p className="text-gray-500">No se encontraron resultados para tu búsqueda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                          {faq.category}
                        </span>
                        <span className="font-medium text-gray-800">{faq.question}</span>
                      </div>
                      <span className={`material-icons text-gray-400 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    {openFAQ === index && (
                      <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">
                ¿No encontraste lo que buscabas?
              </h2>
              <p className="text-white/80 mb-6">
                Nuestro equipo está listo para ayudarte. Contáctanos por cualquiera de estos medios.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://wa.me/59897865053"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors"
                >
                  <span className="text-xl">💬</span>
                  WhatsApp
                </a>
                <a
                  href="mailto:marlocookies2@gmail.com"
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
                >
                  <span className="text-xl">✉️</span>
                  Email
                </a>
                <Link
                  href="/contacto"
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
                >
                  <span className="text-xl">📝</span>
                  Formulario
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="max-w-3xl mx-auto mt-8">
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/puntos"
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <span className="text-4xl mb-3 block">🎁</span>
                <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                  Programa de Puntos
                </h3>
                <p className="text-sm text-gray-500 mt-1">Conoce cómo ganar y canjear</p>
              </Link>
              <Link
                href="/pedidos"
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <span className="text-4xl mb-3 block">📦</span>
                <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                  Mis Pedidos
                </h3>
                <p className="text-sm text-gray-500 mt-1">Revisa el estado de tus pedidos</p>
              </Link>
              <Link
                href="/perfil"
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <span className="text-4xl mb-3 block">👤</span>
                <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                  Mi Perfil
                </h3>
                <p className="text-sm text-gray-500 mt-1">Actualiza tus datos</p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
