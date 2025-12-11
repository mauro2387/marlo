-- =====================================================
-- MARLOCOOKIES - SQL MAESTRO PARA EJECUTAR EN SUPABASE
-- Ejecutar este archivo completo en SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABLA POPUPS (Pop-ups promocionales)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  contenido TEXT,
  imagen_url TEXT,
  plantilla TEXT DEFAULT 'default',
  template TEXT DEFAULT 'promo',
  color_fondo TEXT DEFAULT '#FFFFFF',
  color_titulo TEXT DEFAULT '#4A3728',
  color_texto TEXT DEFAULT '#666666',
  color_boton TEXT DEFAULT '#4A3728',
  color_boton_texto TEXT DEFAULT '#FFFFFF',
  gradiente TEXT,
  boton_texto TEXT DEFAULT 'Ver más',
  boton_link TEXT,
  boton_secundario_texto TEXT,
  boton_secundario_link TEXT,
  mostrar_input_email BOOLEAN DEFAULT false,
  mostrar_en TEXT DEFAULT 'todas',
  frecuencia TEXT DEFAULT 'sesion',
  delay_segundos INTEGER DEFAULT 3,
  activo BOOLEAN DEFAULT true,
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si la tabla ya existe, agregar columnas faltantes
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS subtitulo TEXT;
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS plantilla TEXT DEFAULT 'default';
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS color_fondo TEXT DEFAULT '#FFFFFF';
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS color_titulo TEXT DEFAULT '#4A3728';
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS color_texto TEXT DEFAULT '#666666';
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS color_boton TEXT DEFAULT '#4A3728';
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS color_boton_texto TEXT DEFAULT '#FFFFFF';
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS gradiente TEXT;
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS boton_secundario_texto TEXT;
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS boton_secundario_link TEXT;
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS mostrar_input_email BOOLEAN DEFAULT false;
ALTER TABLE public.popups ADD COLUMN IF NOT EXISTS delay_segundos INTEGER DEFAULT 3;

CREATE INDEX IF NOT EXISTS idx_popups_activo ON public.popups(activo);
CREATE INDEX IF NOT EXISTS idx_popups_mostrar_en ON public.popups(mostrar_en);

ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read popups" ON public.popups;
CREATE POLICY "Anyone can read popups" ON public.popups
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can manage popups" ON public.popups;
CREATE POLICY "Authenticated can manage popups" ON public.popups
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. TABLA SITE_SETTINGS (Configuración del sitio)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  promo_text TEXT,
  promo_link TEXT,
  promo_active BOOLEAN DEFAULT true,
  limited_banner_title TEXT DEFAULT 'Ediciones Limitadas',
  limited_banner_subtitle TEXT DEFAULT 'Sabores exclusivos por tiempo limitado. ¡No te las pierdas!',
  limited_banner_gradient TEXT DEFAULT 'from-purple-600 via-pink-600 to-purple-600',
  limited_banner_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO public.site_settings (id) 
VALUES ('main') 
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can update site settings" ON public.site_settings;
CREATE POLICY "Authenticated can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. POLÍTICAS LOYALTY_HISTORY (ya creadas, solo verificar)
-- =====================================================
-- Ya tienes estas políticas, esto es solo para verificar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'loyalty_history' 
    AND policyname LIKE '%insert%'
  ) THEN
    CREATE POLICY "Authenticated users can insert loyalty history"
      ON public.loyalty_history FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- =====================================================
-- 4. VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Tablas creadas:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('popups', 'site_settings', 'loyalty_history');

SELECT 'Políticas de popups:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'popups';
