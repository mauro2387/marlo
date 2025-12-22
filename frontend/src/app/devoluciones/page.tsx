import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DevolucionesPage() {
  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gradient-to-b from-secondary-crema to-white">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4">
                Políticas
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Política de Devoluciones
              </h1>
              <p className="text-lg text-white/90">
                Tu satisfacción es nuestra prioridad. Conoce nuestras políticas para 
                garantizar tu mejor experiencia.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              
              {/* Importante */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-amber-600">info</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-800 mb-2">Importante</h3>
                    <p className="text-amber-700">
                      Por tratarse de productos alimenticios artesanales y perecederos, 
                      no aceptamos devoluciones una vez que el pedido ha sido entregado, 
                      salvo en casos excepcionales que se detallan a continuación.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección 1 */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="material-icons text-green-600">verified</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">Garantía de Calidad</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Nos comprometemos a entregar productos de la más alta calidad. Cada cookie 
                  es preparada artesanalmente con ingredientes premium el mismo día o el día 
                  anterior a la entrega para garantizar frescura.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-green-500 text-sm mt-1">check_circle</span>
                    <span className="text-gray-600">Ingredientes 100% naturales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-green-500 text-sm mt-1">check_circle</span>
                    <span className="text-gray-600">Preparación artesanal diaria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-green-500 text-sm mt-1">check_circle</span>
                    <span className="text-gray-600">Empaque cuidado para preservar la calidad</span>
                  </li>
                </ul>
              </div>

              {/* Sección 2 */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="material-icons text-blue-600">published_with_changes</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">Casos en los que Aceptamos Reclamos</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Evaluaremos tu caso y ofreceremos una solución en las siguientes situaciones:
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="material-icons text-red-500">broken_image</span>
                      Producto dañado en la entrega
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Si tu pedido llega visiblemente dañado (cookies rotas, empaque abierto, etc.), 
                      contáctanos dentro de las primeras 2 horas de recibido con fotos del producto.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="material-icons text-orange-500">swap_horiz</span>
                      Pedido incorrecto
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Si recibiste productos diferentes a los que ordenaste, nos hacemos cargo 
                      de enviarte el pedido correcto sin costo adicional.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="material-icons text-yellow-500">remove_shopping_cart</span>
                      Productos faltantes
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Si en tu pedido falta algún producto, contáctanos inmediatamente y 
                      coordinaremos el envío de lo faltante.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección 3 */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="material-icons text-purple-600">schedule</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">Cómo Realizar un Reclamo</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Contáctanos rápidamente</h4>
                      <p className="text-gray-600 text-sm">
                        Tienes hasta 2 horas después de recibir tu pedido para reportar cualquier problema.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Envía evidencia</h4>
                      <p className="text-gray-600 text-sm">
                        Adjunta fotos claras del producto y/o del empaque mostrando el problema.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Recibe tu solución</h4>
                      <p className="text-gray-600 text-sm">
                        Evaluaremos tu caso y te ofreceremos una solución: reemplazo del producto, 
                        reenvío, o crédito en puntos para tu próxima compra.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 4 */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="material-icons text-red-600">cancel</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">Cancelación de Pedidos</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Puedes cancelar tu pedido bajo las siguientes condiciones:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <span className="material-icons text-green-600">check</span>
                      Cancelación Permitida
                    </h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Pedido en estado "Preparando"</li>
                      <li>• Pedido aún no ha sido pagado</li>
                      <li>• Antes de que salga a entrega</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <span className="material-icons text-red-600">close</span>
                      No se Puede Cancelar
                    </h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• Pedido en camino</li>
                      <li>• Pedido listo para retiro</li>
                      <li>• Pedido ya entregado</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sección 5 */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="material-icons text-primary">account_balance_wallet</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">Reembolsos</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  En caso de que corresponda un reembolso, este se procesará de la siguiente manera:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="material-icons text-primary mt-0.5">credit_card</span>
                    <div>
                      <strong className="text-gray-800">Pago con MercadoPago:</strong>
                      <p className="text-gray-600 text-sm">Se realizará el reembolso a través de la misma plataforma en un plazo de 5-10 días hábiles.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-icons text-primary mt-0.5">account_balance</span>
                    <div>
                      <strong className="text-gray-800">Pago por Transferencia:</strong>
                      <p className="text-gray-600 text-sm">Se realizará una transferencia a la cuenta desde la que se realizó el pago original.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-icons text-primary mt-0.5">payments</span>
                    <div>
                      <strong className="text-gray-800">Pago en Efectivo:</strong>
                      <p className="text-gray-600 text-sm">Si el pedido fue cancelado antes de la entrega, no se cobra. Si ya se pagó, se coordina devolución.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 md:p-8 text-white text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  ¿Tienes algún problema con tu pedido?
                </h3>
                <p className="text-white/80 mb-6">
                  Contáctanos inmediatamente y te ayudaremos a resolverlo.
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
                    Formulario de Contacto
                  </Link>
                </div>
              </div>

              {/* Links relacionados */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link 
                  href="/faq" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-primary hover:bg-primary/5 transition-colors border border-gray-200"
                >
                  <span className="material-icons text-sm">help</span>
                  Preguntas Frecuentes
                </Link>
                <Link 
                  href="/terminos" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-primary hover:bg-primary/5 transition-colors border border-gray-200"
                >
                  <span className="material-icons text-sm">gavel</span>
                  Términos y Condiciones
                </Link>
                <Link 
                  href="/privacidad" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-primary hover:bg-primary/5 transition-colors border border-gray-200"
                >
                  <span className="material-icons text-sm">privacy_tip</span>
                  Política de Privacidad
                </Link>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
