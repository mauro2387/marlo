-- Tabla de Pop-ups promocionales
-- Ejecutar en Supabase SQL Editor

-- Crear tabla popups
CREATE TABLE IF NOT EXISTS public.popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  contenido TEXT,
  imagen_url TEXT,
  boton_texto TEXT DEFAULT 'Ver más',
  boton_link TEXT,
  template TEXT DEFAULT 'promo' CHECK (template IN ('promo', 'newsletter', 'descuento', 'info', 'custom')),
  mostrar_en TEXT DEFAULT 'todas' CHECK (mostrar_en IN ('todas', 'home', 'productos', 'checkout')),
  frecuencia TEXT DEFAULT 'sesion' CHECK (frecuencia IN ('siempre', 'sesion', 'una_vez', 'diario')),
  activo BOOLEAN DEFAULT true,
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_popups_activo ON public.popups(activo);
CREATE INDEX IF NOT EXISTS idx_popups_mostrar_en ON public.popups(mostrar_en);

-- RLS
ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

-- Políticas: todos pueden leer popups activos
DROP POLICY IF EXISTS "Anyone can read active popups" ON public.popups;
CREATE POLICY "Anyone can read active popups" ON public.popups
  FOR SELECT USING (true);

-- Admins pueden hacer todo
DROP POLICY IF EXISTS "Authenticated users can manage popups" ON public.popups;
CREATE POLICY "Authenticated users can manage popups" ON public.popups
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insertar popup de ejemplo
INSERT INTO public.popups (titulo, contenido, template, mostrar_en, frecuencia, activo)
VALUES (
  '🍪 ¡Bienvenido a MarLo Cookies!',
  'Disfruta de las mejores cookies artesanales. ¡Envío gratis en pedidos sobre $2000!',
  'promo',
  'home',
  'sesion',
  false
) ON CONFLICT DO NOTHING;

-- Comentarios
COMMENT ON TABLE public.popups IS 'Pop-ups promocionales para mostrar en el sitio';
COMMENT ON COLUMN public.popups.template IS 'Plantilla visual: promo, newsletter, descuento, info, custom';
COMMENT ON COLUMN public.popups.frecuencia IS 'Con qué frecuencia mostrar: siempre, sesion, una_vez, diario';
COMMENT ON COLUMN public.popups.mostrar_en IS 'En qué páginas mostrar: todas, home, productos, checkout';
