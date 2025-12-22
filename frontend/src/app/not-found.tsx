import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-crema via-white to-secondary-rosa/20 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-primary/10 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-icons animate-bounce" style={{fontSize: '128px', color: '#8B4513'}}>cookie</span>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-4xl font-bold text-primary mb-4">
          ¡Ups! Página no encontrada
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Parece que esta cookie se perdió en el horno. 
          No pudimos encontrar la página que buscas.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
          >
            <span className="material-icons">home</span> Volver al Inicio
          </Link>
          <Link 
            href="/productos" 
            className="px-8 py-4 bg-white text-primary font-semibold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-primary flex items-center justify-center gap-2"
          >
            <span className="material-icons">cookie</span> Ver Productos
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">O visita alguna de estas páginas:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/boxes" className="text-primary hover:underline font-medium">
              Box Personalizados
            </Link>
            <Link href="/puntos" className="text-primary hover:underline font-medium">
              Programa de Puntos
            </Link>
            <Link href="/nosotros" className="text-primary hover:underline font-medium">
              Nuestra Historia
            </Link>
            <Link href="/contacto" className="text-primary hover:underline font-medium">
              Contacto
            </Link>
          </div>
        </div>

        {/* Fun fact */}
        <div className="mt-8 p-4 bg-white rounded-xl shadow-md">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-primary">¿Sabías que...?</span> Mientras buscabas esta página, 
            horneamos aproximadamente 47 cookies deliciosas <span className="material-icons" style={{fontSize: '14px', verticalAlign: 'middle'}}>cookie</span>
          </p>
        </div>
      </div>
    </div>
  );
}
