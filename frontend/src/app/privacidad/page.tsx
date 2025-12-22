import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function PrivacidadPage() {
  return (
    <>
      <Navbar />

      <main className="pt-[120px] min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 lg:p-12">
              <div className="text-center mb-8">
                <span className="material-icons mb-4 block" style={{fontSize: '96px', color: '#455A64'}}>lock</span>
                <h1 className="text-4xl font-bold text-primary mb-4">
                  Política de Privacidad
                </h1>
                <p className="text-gray-600">
                  Última actualización: 25 de noviembre de 2025
                </p>
              </div>

              <div className="prose prose-lg max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">1. Introducción</h2>
                  <p className="text-gray-700 leading-relaxed">
                    En MarLo Cookies, nos tomamos muy en serio la privacidad de nuestros clientes. Esta política describe cómo recopilamos, 
                    utilizamos y protegemos su información personal de acuerdo con la Ley N° 18.331 de Protección de Datos Personales de Uruguay.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">2. Información que Recopilamos</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Recopilamos la siguiente información cuando usted utiliza nuestros servicios:
                  </p>
                  
                  <h3 className="text-xl font-semibold text-primary mb-3">Información Personal</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                    <li>Nombre y apellido</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Número de teléfono</li>
                    <li>Dirección de envío</li>
                    <li>Información de pago (procesada de forma segura)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-primary mb-3">Información de Uso</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Historial de pedidos</li>
                    <li>Preferencias de productos</li>
                    <li>Interacciones con nuestro sitio web</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">3. Cómo Utilizamos su Información</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Utilizamos su información personal para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Procesar y gestionar sus pedidos</li>
                    <li>Comunicarnos con usted sobre sus compras</li>
                    <li>Enviar actualizaciones sobre el estado de su pedido</li>
                    <li>Administrar su cuenta y programa de puntos</li>
                    <li>Enviar promociones y ofertas (solo si ha dado su consentimiento)</li>
                    <li>Mejorar nuestros productos y servicios</li>
                    <li>Cumplir con obligaciones legales</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">4. Compartir Información</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información únicamente con:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Proveedores de servicio:</strong> Empresas que nos ayudan a operar nuestro negocio (ej: servicios de pago, envío)</li>
                    <li><strong>Autoridades legales:</strong> Cuando sea requerido por ley o para proteger nuestros derechos</li>
                    <li><strong>Socios comerciales:</strong> Solo con su consentimiento explícito</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">5. Cookies y Tecnologías de Seguimiento</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Utilizamos cookies y tecnologías similares para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Mantener su sesión activa</li>
                    <li>Recordar sus preferencias</li>
                    <li>Analizar el uso del sitio web</li>
                    <li>Personalizar su experiencia</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">6. Seguridad de la Información</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su información personal contra 
                    acceso no autorizado, alteración o divulgación. Esto incluye:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                    <li>Encriptación SSL para transacciones</li>
                    <li>Almacenamiento seguro de datos</li>
                    <li>Acceso restringido a información personal</li>
                    <li>Revisiones periódicas de seguridad</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">7. Sus Derechos</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    De acuerdo con la legislación uruguaya, usted tiene derecho a:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Acceso:</strong> Solicitar una copia de su información personal</li>
                    <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                    <li><strong>Eliminación:</strong> Solicitar la eliminación de su información (sujeto a obligaciones legales)</li>
                    <li><strong>Oposición:</strong> Oponerse al procesamiento de su información para marketing</li>
                    <li><strong>Portabilidad:</strong> Recibir su información en formato estructurado</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Para ejercer estos derechos, contáctenos en marlocookies2@gmail.com
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">8. Retención de Datos</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, 
                    a menos que la ley requiera o permita un período de retención más largo. Los datos de transacciones se mantienen durante 
                    al menos 7 años según lo exigido por la legislación tributaria uruguaya.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">9. Marketing y Comunicaciones</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Si ha optado por recibir nuestras comunicaciones de marketing, puede darse de baja en cualquier momento:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                    <li>Haciendo clic en "Cancelar suscripción" en nuestros emails</li>
                    <li>Modificando sus preferencias en su cuenta</li>
                    <li>Contactándonos directamente</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">10. Menores de Edad</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información personal de 
                    menores. Si descubrimos que hemos recopilado información de un menor, la eliminaremos de inmediato.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">11. Enlaces a Terceros</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Nuestro sitio web puede contener enlaces a sitios de terceros. No somos responsables de las prácticas de privacidad 
                    de estos sitios. Le recomendamos leer las políticas de privacidad de cada sitio que visite.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">12. Cambios a esta Política</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios significativos 
                    publicando la nueva política en nuestro sitio web y actualizando la fecha de "última actualización". Su uso 
                    continuado del sitio después de dichos cambios constituye su aceptación de la nueva política.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4">13. Contacto</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Si tiene preguntas sobre esta política de privacidad o sobre cómo manejamos su información personal, contáctenos:
                  </p>
                  <div className="bg-secondary-crema/50 rounded-xl p-6">
                    <ul className="list-none space-y-3 text-gray-700">
                      <li className="flex items-center gap-3">
                        <span className="material-icons text-3xl" style={{color: '#8B4513'}}>email</span>
                        <div>
                          <p className="font-semibold">Email</p>
                          <p>marlocookies2@gmail.com</p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="material-icons text-3xl" style={{color: '#8B4513'}}>phone</span>
                        <div>
                          <p className="font-semibold">Teléfono</p>
                          <p>(+598) 97 865 053</p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="material-icons text-3xl" style={{color: '#8B4513'}}>location_on</span>
                        <div>
                          <p className="font-semibold">Dirección</p>
                          <p>Maldonado<br />Uruguay</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <span className="material-icons mb-3 block" style={{fontSize: '64px', color: '#2E7D32'}}>lock</span>
                  <p className="text-gray-700 font-semibold mb-2">
                    Tu privacidad es nuestra prioridad
                  </p>
                  <p className="text-sm text-gray-600">
                    Cumplimos con todas las normativas uruguayas de protección de datos
                  </p>
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
