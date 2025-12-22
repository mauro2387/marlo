'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: 'Pedidos y Entregas',
    icon: 'local_shipping',
    items: [
      {
        question: '¿Cuánto tiempo tarda mi pedido en llegar?',
        answer: 'Los pedidos se entregan generalmente dentro del mismo día o al día siguiente, dependiendo de la hora en que se realizó el pedido y la zona de entrega. Los pedidos realizados antes de las 16:00 hrs suelen entregarse el mismo día.'
      },
      {
        question: '¿A qué zonas hacen envíos?',
        answer: 'Actualmente realizamos envíos a Punta del Este, Maldonado, y zonas aledañas. El costo de envío varía según la zona. Puedes ver el costo exacto en el checkout.'
      },
      {
        question: '¿Puedo retirar mi pedido en el local?',
        answer: 'Sí, ofrecemos la opción de retiro en tienda sin costo adicional. Estamos ubicados en Av. Juan Gorlero casi 25, Punta del Este. Nuestro horario es de Miércoles a Lunes de 15:00 a 20:00 hrs.'
      },
      {
        question: '¿Cuál es el monto mínimo de pedido?',
        answer: 'No tenemos un monto mínimo de pedido, puedes ordenar la cantidad que desees.'
      },
      {
        question: '¿Puedo programar la entrega para otro día?',
        answer: 'Sí, al momento de hacer tu pedido puedes indicar en las notas del pedido si necesitas que llegue en un día específico y coordinaremos contigo por WhatsApp.'
      }
    ]
  },
  {
    title: 'Productos',
    icon: 'cookie',
    items: [
      {
        question: '¿Qué son las ediciones limitadas?',
        answer: 'Las ediciones limitadas son sabores especiales que están disponibles solo por 15 días. Son creaciones únicas que lanzamos regularmente para sorprenderte con nuevos sabores.'
      },
      {
        question: '¿Las cookies tienen conservantes?',
        answer: 'No, nuestras cookies son 100% artesanales, hechas con ingredientes naturales y sin conservantes artificiales. Por eso recomendamos consumirlas dentro de los 5 días para disfrutarlas en su punto óptimo.'
      },
      {
        question: '¿Tienen opciones para personas con alergias?',
        answer: 'Nuestras cookies contienen gluten, huevo y lácteos. Por el momento no ofrecemos opciones sin estos ingredientes, pero estamos trabajando en ampliar nuestra línea.'
      },
      {
        question: '¿Cómo debo conservar las cookies?',
        answer: 'Recomendamos guardarlas en un lugar fresco y seco, en un recipiente hermético. No es necesario refrigerarlas. Para mejor sabor, puedes calentarlas 10 segundos en el microondas antes de comer.'
      },
      {
        question: '¿Qué son los boxes y cómo funcionan?',
        answer: 'Los boxes son cajas que puedes armar con los sabores que prefieras. Tenemos boxes de 4, 6 y 9 unidades. Tú eliges qué sabores incluir en cada uno.'
      }
    ]
  },
  {
    title: 'Pagos',
    icon: 'payment',
    items: [
      {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos efectivo contra entrega, transferencia bancaria y MercadoPago (tarjetas de crédito y débito). El pago con MercadoPago tiene un recargo del 10%.'
      },
      {
        question: '¿Por qué MercadoPago tiene un recargo del 10%?',
        answer: 'MercadoPago cobra una comisión por cada transacción que debemos trasladar al precio final. Por eso ofrecemos otras opciones de pago sin recargo como efectivo y transferencia.'
      },
      {
        question: '¿Cuántos pedidos puedo tener pendientes con efectivo o transferencia?',
        answer: 'Puedes tener hasta 2 pedidos pendientes con pago en efectivo o transferencia. Si tienes 2 pedidos sin entregar, deberás esperar a que uno se complete o usar MercadoPago para nuevos pedidos.'
      },
      {
        question: '¿Cómo funciona el pago por transferencia?',
        answer: 'Al elegir transferencia, recibirás los datos bancarios para realizar el pago. Una vez confirmada la transferencia, procederemos a preparar tu pedido.'
      }
    ]
  },
  {
    title: 'Programa de Puntos',
    icon: 'stars',
    items: [
      {
        question: '¿Cómo funciona el programa de puntos?',
        answer: 'Por cada $1 que gastes, acumulas 1 punto. Estos puntos los puedes canjear por productos gratis y descuentos.'
      },
      {
        question: '¿Los puntos tienen vencimiento?',
        answer: 'No, tus puntos no vencen. Puedes acumularlos el tiempo que quieras hasta alcanzar la recompensa que desees.'
      },
      {
        question: '¿Qué premios puedo canjear con mis puntos?',
        answer: 'Tenemos varias opciones: 1 Café + 1 Cookie gratis (2,000 pts), Box de 4 unidades gratis (5,000 pts), Box de 6 unidades gratis (10,000 pts), y 15% de descuento (3,000 pts).'
      },
      {
        question: '¿Cómo canjeo mis puntos?',
        answer: 'Desde tu perfil, ve a la sección "Mis Puntos" y elige la recompensa que quieres canjear. Si es un box gratis, podrás elegir los sabores que prefieras.'
      }
    ]
  },
  {
    title: 'Cuenta y Perfil',
    icon: 'person',
    items: [
      {
        question: '¿Necesito una cuenta para comprar?',
        answer: 'Sí, para poder hacer seguimiento de tus pedidos, acumular puntos y tener un historial de compras, necesitas crear una cuenta. Es gratis y solo toma un minuto.'
      },
      {
        question: '¿Cómo recupero mi contraseña?',
        answer: 'En la página de login, haz clic en "¿Olvidaste tu contraseña?" e ingresa tu email. Recibirás un enlace para crear una nueva contraseña.'
      },
      {
        question: '¿Puedo modificar mis datos?',
        answer: 'Sí, desde tu perfil puedes actualizar tu nombre, dirección, teléfono y otros datos en cualquier momento.'
      }
    ]
  },
  {
    title: 'Devoluciones y Garantía',
    icon: 'replay',
    items: [
      {
        question: '¿Puedo cancelar mi pedido?',
        answer: 'Puedes cancelar tu pedido mientras esté en estado "Preparando". Una vez que el pedido está en camino o listo para entrega, no es posible cancelarlo.'
      },
      {
        question: '¿Qué pasa si mi pedido llega en mal estado?',
        answer: 'Tu satisfacción es nuestra prioridad. Si tu pedido llega dañado, contáctanos inmediatamente por WhatsApp con fotos del producto y te daremos una solución.'
      },
      {
        question: '¿Tienen política de devoluciones?',
        answer: 'Por tratarse de productos alimenticios, no aceptamos devoluciones una vez entregado el pedido, salvo casos de productos dañados o errores en el pedido.'
      }
    ]
  }
];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-start justify-between text-left hover:text-primary transition-colors"
      >
        <span className="font-medium text-gray-800 pr-4">{item.question}</span>
        <span className={`material-icons flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isOpen = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    return openItems[key] || false;
  };

  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gradient-to-b from-secondary-crema to-white">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4">
                Centro de Ayuda
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Preguntas Frecuentes
              </h1>
              <p className="text-lg text-white/90">
                Encuentra respuestas a las dudas más comunes sobre nuestros productos, 
                pedidos, envíos y mucho más.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {faqData.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-primary">{category.icon}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-primary">{category.title}</h2>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                    {category.items.map((item, itemIndex) => (
                      <FAQAccordion
                        key={itemIndex}
                        item={item}
                        isOpen={isOpen(categoryIndex, itemIndex)}
                        onToggle={() => toggleItem(categoryIndex, itemIndex)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="max-w-4xl mx-auto mt-12">
              <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 md:p-8 text-white text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  ¿No encontraste lo que buscabas?
                </h3>
                <p className="text-white/80 mb-6">
                  Estamos aquí para ayudarte. Contáctanos directamente.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="https://wa.me/59897865053"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-colors"
                  >
                    <span className="material-icons">chat</span>
                    WhatsApp
                  </a>
                  <Link
                    href="/contacto"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary hover:bg-secondary-crema rounded-xl font-semibold transition-colors"
                  >
                    <span className="material-icons">email</span>
                    Contacto
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
