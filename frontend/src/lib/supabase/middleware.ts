// Middleware de Supabase para manejar auth en Next.js
// OPTIMIZADO: Solo verifica auth en rutas protegidas
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/admin', '/perfil', '/pedidos', '/puntos'];

// Rutas públicas que nunca necesitan verificación
const PUBLIC_ROUTES = ['/', '/productos', '/boxes', '/login', '/registro', '/contacto', '/nosotros', '/privacidad', '/terminos', '/carrito', '/checkout', '/confirmar-email', '/verificacion-pendiente', '/recuperar', '/reset-password', '/reenviar-confirmacion', '/ayuda', '/trabaja-con-nosotros', '/confirmacion'];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Si es una ruta pública, no verificar auth (MUCHO más rápido)
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // También ignorar API routes y archivos estáticos
  if (isPublicRoute || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Solo crear cliente Supabase para rutas protegidas
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtectedRoute) {
    // Ruta no listada, dejar pasar sin verificar
    return NextResponse.next();
  }

  // Solo para rutas protegidas: verificar sesión
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // NO bloquear desde middleware - la validación se hace en el cliente
  // El middleware solo maneja cookies de Supabase pero el auth real está en localStorage
  // Las rutas protegidas validan auth en sus propios componentes
  
  // Intentar refrescar cookies de Supabase si existen
  try {
    await supabase.auth.getUser();
  } catch (e) {
    // Ignorar errores - auth se maneja en cliente
  }

  return response;
}
