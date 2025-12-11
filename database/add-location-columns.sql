-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Agregar columnas de ubicación (lat/lng) a tabla orders
-- =====================================================

-- Agregar columnas para coordenadas GPS
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8);

-- Comentarios
COMMENT ON COLUMN orders.latitud IS 'Latitud de la ubicación de entrega';
COMMENT ON COLUMN orders.longitud IS 'Longitud de la ubicación de entrega';

-- Mensaje de confirmación
SELECT 'Columnas de ubicación agregadas correctamente a tabla orders' AS status;
