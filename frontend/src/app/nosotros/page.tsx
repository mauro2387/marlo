'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function NosotrosPage() {
  return (
    <>
      <Navbar />

      <main className="pt-[120px]">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-primary to-primary-dark text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-9xl"><span className="material-icons" style={{fontSize: '144px'}}>cookie</span></div>
            <div className="absolute bottom-10 right-10 text-9xl"><span className="material-icons" style={{fontSize: '144px'}}>cookie</span></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl"><span className="material-icons" style={{fontSize: '144px'}}>cookie</span></div>
          </div>
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <ScrollAnimation animation="fade-up">
                <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                  ¿Quiénes somos?
                </h1>
                <p className="text-xl text-white/90">
                  Hecho con cariño. Compartido con vos. 🍪✨
                </p>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* Quiénes Somos */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
                <ScrollAnimation animation="slide-right">
                  <div className="aspect-square max-w-[280px] md:max-w-none mx-auto bg-gradient-to-br from-secondary-crema to-secondary-rosa/30 rounded-2xl flex items-center justify-center">
                    <span className="material-icons text-[96px] md:text-[144px]" style={{color: '#8B4513'}}>cookie</span>
                  </div>
                </ScrollAnimation>
                <ScrollAnimation animation="slide-left" delay={100}>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">
                      Nuestra Esencia
                    </h2>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4">
                    En MarLo Cookies creemos que las cosas más simples pueden convertirse en momentos inolvidables. 
                    Por eso elaboramos cookies y otras delicias caseras con dedicación artesanal, ingredientes de 
                    calidad y el toque familiar que nos caracteriza.
                  </p>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4">
                    Nacimos con la idea de llevar un poco de felicidad a cada bocado. Cada receta está pensada 
                    para que disfrutes una experiencia única: sabores intensos, texturas perfectas y ese "algo 
                    especial" que solo se consigue cuando se cocina con pasión.
                  </p>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Nuestro público es joven, curioso y amante de lo rico. Personas que valoran lo auténtico, 
                    lo hecho a mano y que buscan darse un gusto sin vueltas.
                  </p>
                  </div>
                </ScrollAnimation>
              </div>
              
            </div>
          </div>
        </section>

        {/* Historia */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-secondary-crema to-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              
              <ScrollAnimation animation="fade-up">
                <div className="text-center mb-10 md:mb-12">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
                    Historia
                  </h2>
                </div>
              </ScrollAnimation>
              
              
              <ScrollAnimation animation="fade-in" delay={100}>
              <div className="space-y-6 text-gray-600 text-base md:text-lg leading-relaxed">
                <p>
                  MarLo Cookies nació de un momento simple, de esos que parecen chicos pero terminan cambiándolo todo. 
                  Empezó en nuestra cocina, entre charlas, risas y el aroma de cookies recién hechas que llenaba la casa. 
                  Lo que al principio era un pasatiempo para compartir en familia se convirtió, sin darnos cuenta, en una 
                  pasión que quería crecer.
                </p>
                
                <p>
                  Cada vez que alguien probaba nuestras cookies, pasaba lo mismo: sonrisas, ganas de "otra más" y ese 
                  comentario que se repetía una y otra vez: "tienen ese gusto a hecho en casa que no se consigue en ningún lado". 
                  Y ahí entendimos algo: lo que hacíamos tenía algo especial.
                </p>
                
                <p>
                  Decidimos entonces transformar esa mezcla de tradición familiar, creatividad y amor por lo rico en un 
                  proyecto real. Así nació MarLo Cookies: un emprendimiento joven, artesanal y con la misión de llevar 
                  sabor y cariño en cada bocado.
                </p>
                
                <p>
                  Hoy seguimos trabajando como el primer día: amasando a mano, probando nuevas recetas, cuidando cada 
                  detalle y manteniendo ese espíritu familiar que nos hizo empezar. Porque para nosotros, una cookie no 
                  es solo una cookie —es una experiencia, un recuerdo, un mimo que se comparte.
                </p>
                
                <p className="font-semibold text-primary">
                  MarLo Cookies es eso: nuestra historia transformada en sabor.<br />
                  Y ahora, también es parte de la tuya.
                </p>
              </div>
              </ScrollAnimation>
              
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            
            <ScrollAnimation animation="fade-up">
              <div className="text-center mb-10 md:mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
                  Nuestros Valores
                </h2>
              </div>
            </ScrollAnimation>
            

            <ScrollAnimation animation="scale-up" delay={100}>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
                
                <div className="card p-6 md:p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary-salmon/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <span className="material-icons text-[36px] md:text-[48px]" style={{color: '#D2691E'}}>auto_awesome</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">Calidad</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Ingredientes de primera. Sin atajos. Todo hecho con dedicación artesanal.
                </p>
              </div>
              

              
              <div className="card p-6 md:p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary-salmon/20 rounded-full flex items-center justify-center text-3xl md:text-4xl mx-auto mb-4 md:mb-6">
                  ❤️
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">Pasión</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Cada cookie está hecha con amor. Horneamos con el corazón.
                </p>
              </div>
              

              
              <div className="card p-6 md:p-8 text-center sm:col-span-2 md:col-span-1 sm:max-w-sm sm:mx-auto md:max-w-none">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary-salmon/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <span className="material-icons text-[36px] md:text-[48px]" style={{color: '#D2691E'}}>handshake</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">Comunidad</h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Valoramos a cada cliente. Construimos relaciones basadas en confianza.
                  </p>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>        {/* Misión y Visión */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-secondary-crema to-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {/* Misión */}
                <ScrollAnimation animation="slide-right">
                  <div className="card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-primary text-2xl">gps_fixed</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-primary">Misión</h3>
                  </div>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Trabajamos para crear momentos dulces e inolvidables a través de productos artesanales, frescos y 
                    llenos de sabor. Ofrecemos cookies y delicias hechas con dedicación familiar, ingredientes de calidad 
                    y un toque creativo que conecte con un público joven que busca autenticidad y experiencias genuinas. 
                    Queremos que cada bocado transmita cariño, alegría y el placer de algo verdaderamente hecho a mano.
                  </p>
                  </div>
                </ScrollAnimation>

                {/* Visión */}
                <ScrollAnimation animation="slide-left" delay={100}>
                  <div className="card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-secondary-salmon/20 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-secondary-salmon text-2xl">visibility</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-primary">Visión</h3>
                  </div>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Soñamos con convertir a MarLo Cookies en una marca referente de repostería artesanal, reconocida por 
                    su calidad, su energía joven y su espíritu familiar. Buscamos crecer sin perder nuestra esencia: crear 
                    productos que generen comunidad, momentos compartidos y un vínculo real con quienes nos eligen. Nuestra 
                    visión es expandirnos manteniendo siempre lo más importante: el sabor casero que nos distingue y la pasión 
                    por lo que hacemos.
                  </p>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <ScrollAnimation animation="scale-up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">100%</div>
                <p className="text-white/80 text-sm md:text-base">Artesanal</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">500+</div>
                <p className="text-white/80 text-sm md:text-base">Clientes Felices</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">25+</div>
                <p className="text-white/80 text-sm md:text-base">Recetas Únicas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">10K+</div>
                <p className="text-white/80 text-sm md:text-base">Cookies Horneadas</p>
              </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <ScrollAnimation animation="fade-up">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 md:mb-6">
                ¿Listo para Probar la Diferencia?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
                Únete a nuestra comunidad de amantes de las cookies y descubre 
                por qué somos las favoritas.
              </p>
              <Link href="/productos" className="btn-primary text-base md:text-lg px-8 md:px-10 py-3 md:py-4">
                Ver Nuestros Productos
              </Link>
            </ScrollAnimation>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

