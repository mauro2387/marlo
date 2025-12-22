import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function TerminosPage() {
  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 lg:p-12">
              <div className="text-center mb-8">
                <span className="material-icons mb-4 block" style={{fontSize: '96px', color: '#8B4513'}}>description</span>
                <h1 className="text-4xl font-bold text-primary mb-4">
                  Términos y Condiciones
                </h1>
                <p className="text-gray-600">
                  Última actualización: 25 de noviembre de 2025
                </p>
              </div>

              <div className="prose prose-lg max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">1. Aceptación de Términos</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Al acceder y utilizar el sitio web de MarLo Cookies, usted acepta estar sujeto a estos términos y condiciones de uso. 
                    Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio web.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">2. Recopilación y Uso de Datos Personales</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Al registrarse, realizar un pedido o suscribirse a nuestro newsletter, usted acepta que recopilemos y procesemos los siguientes datos personales:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Datos de identificación:</strong> Nombre, apellido, email y número de teléfono</li>
                    <li><strong>Datos de entrega:</strong> Dirección completa para envíos</li>
                    <li><strong>Datos de compra:</strong> Historial de pedidos, preferencias de productos y puntos acumulados</li>
                    <li><strong>Datos de navegación:</strong> Cookies y datos de uso del sitio web</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    <strong>Finalidad del tratamiento:</strong> Utilizamos sus datos para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-2">
                    <li>Procesar y entregar sus pedidos</li>
                    <li>Gestionar su cuenta y programa de puntos</li>
                    <li>Enviar comunicaciones de marketing (si ha dado su consentimiento)</li>
                    <li>Mejorar nuestros productos y servicios</li>
                    <li>Cumplir con obligaciones legales</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    <strong>Base legal:</strong> El tratamiento de sus datos se basa en el consentimiento que usted otorga al aceptar estos términos, 
                    la ejecución del contrato de compraventa, y nuestro interés legítimo en mejorar nuestros servicios.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">3. Derechos del Usuario sobre sus Datos</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Conforme a la Ley N° 18.331 de Protección de Datos Personales de Uruguay, usted tiene derecho a:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Acceso:</strong> Solicitar información sobre los datos que tenemos sobre usted</li>
                    <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                    <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios</li>
                    <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos para fines de marketing</li>
                    <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado y de uso común</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Para ejercer estos derechos, puede contactarnos en marlocookies2@gmail.com o a través de nuestro formulario de contacto.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">4. Uso del Sitio Web</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Nuestro sitio web está destinado para uso personal y no comercial. Usted se compromete a:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Proporcionar información precisa y actualizada al crear una cuenta</li>
                    <li>Mantener la confidencialidad de su cuenta y contraseña</li>
                    <li>No utilizar el sitio para fines ilegales o no autorizados</li>
                    <li>No interferir con el funcionamiento del sitio web</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">5. Productos y Precios</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Todos los productos mostrados en nuestro sitio web están sujetos a disponibilidad. Los precios están expresados en pesos uruguayos (UYU) 
                    e incluyen IVA. Nos reservamos el derecho de modificar precios sin previo aviso, aunque los pedidos ya confirmados mantendrán el precio 
                    acordado al momento de la compra.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">6. Pedidos y Pagos</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Al realizar un pedido, usted acepta que:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>La confirmación del pedido será enviada por email y/o WhatsApp</li>
                    <li>El pago debe realizarse según el método seleccionado</li>
                    <li>Para pagos por transferencia, el pedido se procesará una vez confirmada la recepción</li>
                    <li>Los pedidos se procesan una vez confirmado el pago</li>
                    <li>Nos reservamos el derecho de rechazar pedidos en casos excepcionales</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">7. Envíos y Entregas</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Realizamos envíos a todo Maldonado y zonas aledañas. Los tiempos de entrega son estimados y pueden variar. 
                    El costo de envío depende de la zona de entrega. No nos hacemos responsables por retrasos causados por 
                    circunstancias fuera de nuestro control.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">8. Política de Devoluciones</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Dado que trabajamos con productos alimenticios artesanales, no aceptamos devoluciones excepto en casos de 
                    productos defectuosos o errores en el pedido. Si su pedido llega dañado o incorrecto, contáctenos dentro de 
                    las 24 horas posteriores a la recepción.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">9. Programa de Puntos</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Nuestro programa de fidelización funciona de la siguiente manera:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Ganas 1 punto por cada $1 gastado</li>
                    <li>Los puntos se acumulan automáticamente en tu cuenta</li>
                    <li>Los puntos no tienen fecha de vencimiento</li>
                    <li>Puedes canjear puntos por descuentos en futuras compras</li>
                    <li>Nos reservamos el derecho de modificar el programa con aviso previo</li>
                    <li>Los puntos no son transferibles ni canjeables por dinero</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">10. Comunicaciones de Marketing</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Al suscribirse a nuestro newsletter o aceptar recibir comunicaciones, usted acepta recibir:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Ofertas y promociones exclusivas</li>
                    <li>Información sobre nuevos productos</li>
                    <li>Novedades y eventos especiales</li>
                    <li>Actualizaciones sobre su cuenta y pedidos</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Puede darse de baja en cualquier momento haciendo clic en el enlace de cancelación de suscripción incluido en cada email, 
                    o contactándonos directamente.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">11. Seguridad de Datos</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, 
                    pérdida o destrucción. Utilizamos encriptación SSL para todas las transacciones y almacenamos sus datos en servidores seguros.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">12. Cookies</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Utilizamos cookies para mejorar su experiencia en nuestro sitio web, recordar sus preferencias y analizar el uso del sitio. 
                    Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">13. Propiedad Intelectual</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Todo el contenido de este sitio web, incluyendo textos, imágenes, logos y diseños, es propiedad de MarLo Cookies 
                    y está protegido por las leyes de propiedad intelectual. No se permite la reproducción sin autorización expresa.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">14. Limitación de Responsabilidad</h2>
                  <p className="text-gray-700 leading-relaxed">
                    MarLo Cookies no será responsable por daños indirectos, incidentales o consecuentes derivados del uso del sitio web 
                    o de la compra de productos. Nuestra responsabilidad está limitada al valor del producto adquirido.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">15. Modificaciones</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán 
                    en vigor inmediatamente después de su publicación en el sitio web. Es responsabilidad del usuario revisar periódicamente 
                    estos términos.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">16. Ley Aplicable</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Estos términos y condiciones se rigen por las leyes de la República Oriental del Uruguay, incluyendo la Ley N° 18.331 
                    de Protección de Datos Personales. Cualquier disputa será resuelta en los tribunales competentes de Maldonado, Uruguay.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">17. Contacto</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Para cualquier consulta sobre estos términos y condiciones o sobre el tratamiento de sus datos personales, puede contactarnos:
                  </p>
                  <ul className="list-none space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="material-icons text-base">email</span>
                      <span>Email: marlocookies2@gmail.com</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-icons text-base">phone</span>
                      <span>Teléfono: (+598) 97 865 053</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-icons text-base">location_on</span>
                      <span>Dirección: Maldonado, Uruguay</span>
                    </li>
                  </ul>
                </section>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="bg-secondary-crema/50 rounded-xl p-6 text-center">
                  <p className="text-gray-700 mb-4">
                    ¿Tienes alguna duda sobre nuestros términos?
                  </p>
                  <Link 
                    href="/contacto" 
                    className="btn-primary"
                  >
                    Contáctanos
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
