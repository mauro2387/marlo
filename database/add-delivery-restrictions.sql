-- Agregar configuración de días sin delivery y leyenda personalizable
-- a la tabla site_settings

-- 1. Agregar columnas para días bloqueados, leyenda, hora límite y modo mantenimiento
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS blocked_delivery_days jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_notice jsonb DEFAULT '{"enabled": true, "message": "Los miércoles no hay delivery", "day_index": 3}'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_time_limit jsonb DEFAULT '{"enabled": true, "time": "21:00", "message": "Delivery disponible hasta las 21:00hs"}'::jsonb,
ADD COLUMN IF NOT EXISTS maintenance_mode jsonb DEFAULT '{"enabled": false, "message": "⚠️ Temporalmente no estamos tomando pedidos por la app debido al alto volumen de pedidos. Puedes visitarnos en el local para comprar directamente."}'::jsonb;

-- Comentarios para documentar
COMMENT ON COLUMN site_settings.blocked_delivery_days IS 'Array de días bloqueados para delivery. Formato: [{"day_index": 3, "day_name": "Miércoles", "blocked": true, "reason": "Descanso del equipo"}]';
COMMENT ON COLUMN site_settings.delivery_notice IS 'Leyenda personalizable sobre días sin delivery. Formato: {"enabled": true, "message": "Los miércoles no hay delivery", "day_index": 3}';
COMMENT ON COLUMN site_settings.delivery_time_limit IS 'Hora límite para delivery. Formato: {"enabled": true, "time": "21:00", "message": "Delivery disponible hasta las 21:00hs"}';
COMMENT ON COLUMN site_settings.maintenance_mode IS 'Modo mantenimiento para pausar pedidos online. Formato: {"enabled": false, "message": "Mensaje personalizado para mostrar a los clientes"}';

-- 2. Actualizar valores por defecto
UPDATE site_settings 
SET 
  blocked_delivery_days = '[
    {"day_index": 3, "day_name": "Miércoles", "blocked": true, "reason": "Descanso del equipo"}
  ]'::jsonb,
  delivery_notice = '{"enabled": true, "message": "Los miércoles no hay delivery", "day_index": 3}'::jsonb,
  delivery_time_limit = '{"enabled": true, "time": "21:00", "message": "Delivery disponible hasta las 21:00hs"}'::jsonb,
  maintenance_mode = '{"enabled": false, "message": "⚠️ Temporalmente no estamos tomando pedidos por la app debido al alto volumen de pedidos. Puedes visitarnos en el local para comprar directamente."}'::jsonb
WHERE id = 'main';

-- 3. Asegurar que el registro principal existe
INSERT INTO site_settings (id) 
VALUES ('main')
ON CONFLICT (id) DO NOTHING;
