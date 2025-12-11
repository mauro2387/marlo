-- Configuración del banner de Ediciones Limitadas
-- Ejecutar en Supabase SQL Editor

-- Agregar campos a site_settings para el banner de ediciones limitadas
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS limited_banner_title TEXT DEFAULT 'Ediciones Limitadas',
ADD COLUMN IF NOT EXISTS limited_banner_subtitle TEXT DEFAULT 'Sabores exclusivos por tiempo limitado. ¡No te las pierdas!',
ADD COLUMN IF NOT EXISTS limited_banner_gradient TEXT DEFAULT 'from-purple-600 via-pink-600 to-purple-600',
ADD COLUMN IF NOT EXISTS limited_banner_active BOOLEAN DEFAULT true;

-- Si no existe site_settings, crear la tabla
CREATE TABLE IF NOT EXISTS site_settings (
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

-- Insertar configuración por defecto si no existe
INSERT INTO site_settings (id) 
VALUES ('main') 
ON CONFLICT (id) DO NOTHING;

-- RLS para site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer la configuración
DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
CREATE POLICY "Anyone can read site settings" ON site_settings
  FOR SELECT USING (true);

-- Solo admins pueden actualizar
DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
CREATE POLICY "Admins can update site settings" ON site_settings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
