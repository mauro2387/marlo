-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Agregar columna faltante a promo_banners
-- =====================================================

-- Agregar columna nombre_interno si no existe
ALTER TABLE promo_banners 
ADD COLUMN IF NOT EXISTS nombre_interno TEXT;

-- Actualizar registros existentes con un nombre por defecto
UPDATE promo_banners 
SET nombre_interno = COALESCE(titulo, 'Banner ' || id::text)
WHERE nombre_interno IS NULL;

-- Verificar
SELECT id, nombre_interno, titulo, activo FROM promo_banners;
