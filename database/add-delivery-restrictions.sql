-- Agregar configuración de días sin delivery y leyenda personalizable
-- a la tabla site_settings

-- 1. Agregar columnas para días bloqueados y leyenda de delivery
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS blocked_delivery_days jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_notice jsonb DEFAULT '{"enabled": true, "message": "Los miércoles no hay delivery", "day_index": 3}'::jsonb;

-- Comentarios para documentar
COMMENT ON COLUMN site_settings.blocked_delivery_days IS 'Array de días bloqueados para delivery. Formato: [{"day_index": 3, "day_name": "Miércoles", "blocked": true, "reason": "Descanso del equipo"}]';
COMMENT ON COLUMN site_settings.delivery_notice IS 'Leyenda personalizable sobre días sin delivery. Formato: {"enabled": true, "message": "Los miércoles no hay delivery", "day_index": 3}';

-- 2. Actualizar valores por defecto
UPDATE site_settings 
SET 
  blocked_delivery_days = '[
    {"day_index": 3, "day_name": "Miércoles", "blocked": true, "reason": "Descanso del equipo"}
  ]'::jsonb,
  delivery_notice = '{"enabled": true, "message": "Los miércoles no hay delivery", "day_index": 3}'::jsonb
WHERE id = 'main';

-- 3. Asegurar que el registro principal existe
INSERT INTO site_settings (id) 
VALUES ('main')
ON CONFLICT (id) DO NOTHING;
