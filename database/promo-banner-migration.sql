-- =========================================
-- CONFIGURACIÓN DE BANNERS PROMOCIONALES
-- MarLo Cookies - Uruguay/Maldonado
-- =========================================
-- Ejecutar en el SQL Editor de Supabase Dashboard

-- 1. Crear tabla para múltiples banners promocionales
CREATE TABLE IF NOT EXISTS public.promo_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  texto TEXT NOT NULL,
  link TEXT DEFAULT NULL,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insertar banners de ejemplo
INSERT INTO public.promo_banners (texto, link, activo, orden) VALUES
  ('🍪 ¡ENVÍO GRATIS en pedidos +$2000!', '/productos', true, 1),
  ('⭐ ¡Gana 1 punto por cada $1 de compra!', '/puntos', true, 2),
  ('🎁 ¡Nuevos Boxes disponibles!', '/boxes', true, 3);

-- 3. Habilitar RLS
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
-- Lectura pública (para mostrar banners)
CREATE POLICY "Public read access for promo banners"
ON public.promo_banners FOR SELECT
USING (true);

-- Solo usuarios autenticados pueden modificar
CREATE POLICY "Authenticated users can insert promo banners"
ON public.promo_banners FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update promo banners"
ON public.promo_banners FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete promo banners"
ON public.promo_banners FOR DELETE
USING (auth.role() = 'authenticated');

-- =========================================
-- NOTAS:
-- - Los banners rotan automáticamente cada 10 segundos
-- - Solo se muestran los banners con activo = true
-- - El orden determina la secuencia de rotación
-- =========================================
