-- =========================================
-- TABLA DE SUSCRIPTORES (Emails y Teléfonos)
-- MarLo Cookies - Uruguay/Maldonado
-- =========================================

-- 1. Crear tabla para recopilar emails y teléfonos
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  telefono TEXT,
  nombre TEXT,
  origen TEXT DEFAULT 'registro', -- 'registro', 'newsletter', 'checkout', 'popup'
  acepta_marketing BOOLEAN DEFAULT false,
  acepta_terminos BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(email)
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at DESC);

-- 3. Habilitar RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
-- Solo admins pueden ver todos los suscriptores
CREATE POLICY "Admins can read all subscribers"
ON public.subscribers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.rol = 'admin'
  )
);

-- Usuarios autenticados pueden insertar (para registro)
CREATE POLICY "Authenticated users can insert subscribers"
ON public.subscribers FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Solo admins pueden actualizar
CREATE POLICY "Admins can update subscribers"
ON public.subscribers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.rol = 'admin'
  )
);

-- Solo admins pueden eliminar
CREATE POLICY "Admins can delete subscribers"
ON public.subscribers FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.rol = 'admin'
  )
);

-- =========================================
-- TABLA DE POP-UPS PROMOCIONALES
-- =========================================

CREATE TABLE IF NOT EXISTS public.popups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT false,
  
  -- Diseño
  plantilla TEXT DEFAULT 'default', -- 'default', 'newsletter', 'discount', 'announcement'
  titulo TEXT,
  subtitulo TEXT,
  imagen_url TEXT,
  
  -- Colores
  color_fondo TEXT DEFAULT '#FFFFFF',
  color_titulo TEXT DEFAULT '#4A3728',
  color_texto TEXT DEFAULT '#666666',
  color_boton TEXT DEFAULT '#4A3728',
  color_boton_texto TEXT DEFAULT '#FFFFFF',
  gradiente TEXT, -- 'from-pink-500 to-purple-600' etc
  
  -- Botón principal
  boton_texto TEXT DEFAULT 'Aceptar',
  boton_link TEXT,
  
  -- Botón secundario
  boton_secundario_texto TEXT,
  boton_secundario_link TEXT,
  
  -- Configuración
  mostrar_input_email BOOLEAN DEFAULT false,
  mostrar_en TEXT DEFAULT 'home', -- 'home', 'productos', 'todas', 'checkout'
  frecuencia TEXT DEFAULT 'sesion', -- 'siempre', 'sesion', 'una_vez', 'cada_dia'
  delay_segundos INTEGER DEFAULT 3,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para popups
ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

-- Lectura pública para mostrar popups
CREATE POLICY "Public read access for active popups"
ON public.popups FOR SELECT
USING (true);

-- Solo admins pueden modificar
CREATE POLICY "Admins can insert popups"
ON public.popups FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.rol = 'admin'
  )
);

CREATE POLICY "Admins can update popups"
ON public.popups FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.rol = 'admin'
  )
);

CREATE POLICY "Admins can delete popups"
ON public.popups FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.rol = 'admin'
  )
);

-- Insertar plantillas de ejemplo
INSERT INTO public.popups (nombre, plantilla, titulo, subtitulo, boton_texto, activo, mostrar_input_email) VALUES
  ('Newsletter', 'newsletter', '¡Suscríbete!', 'Recibe ofertas exclusivas y novedades', 'Suscribirme', false, true),
  ('Descuento Bienvenida', 'discount', '¡10% de descuento!', 'En tu primera compra usando el código BIENVENIDO10', 'Ir a comprar', false, false),
  ('Anuncio', 'announcement', '¡Novedad!', 'Nuevos sabores de temporada disponibles', 'Ver productos', false, false),
  ('Oferta Flash', 'flash', '⚡ Oferta Relámpago', 'Solo por hoy: 2x1 en cookies clásicas', 'Aprovechar', false, false);

-- =========================================
-- AGREGAR CAMPO DE CONFIRMACIÓN DE TRANSFERENCIA A ORDERS
-- =========================================

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS transferencia_confirmada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS transferencia_confirmada_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS transferencia_confirmada_por UUID REFERENCES public.users(id);
