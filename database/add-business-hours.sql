-- Migración: Agregar columna business_hours a site_settings
-- Permite configurar horarios del negocio desde el admin

-- Agregar columna para guardar horarios del negocio
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '[
  {"day": "Lunes", "hours": "15:00 - 22:00", "open": true, "dayIndex": 1},
  {"day": "Martes", "hours": "15:00 - 22:00", "open": true, "dayIndex": 2},
  {"day": "Miércoles", "hours": "15:00 - 22:00", "open": true, "dayIndex": 3},
  {"day": "Jueves", "hours": "15:00 - 22:00", "open": true, "dayIndex": 4},
  {"day": "Viernes", "hours": "15:00 - 22:00", "open": true, "dayIndex": 5},
  {"day": "Sábado", "hours": "15:00 - 22:00", "open": true, "dayIndex": 6},
  {"day": "Domingo", "hours": "15:00 - 22:00", "open": true, "dayIndex": 0}
]'::jsonb;

-- Actualizar el registro existente con valores por defecto (nuevo formato con 7 días)
UPDATE site_settings 
SET business_hours = '[
  {"day": "Lunes", "hours": "15:00 - 22:00", "open": true, "dayIndex": 1},
  {"day": "Martes", "hours": "15:00 - 22:00", "open": true, "dayIndex": 2},
  {"day": "Miércoles", "hours": "15:00 - 22:00", "open": true, "dayIndex": 3},
  {"day": "Jueves", "hours": "15:00 - 22:00", "open": true, "dayIndex": 4},
  {"day": "Viernes", "hours": "15:00 - 22:00", "open": true, "dayIndex": 5},
  {"day": "Sábado", "hours": "15:00 - 22:00", "open": true, "dayIndex": 6},
  {"day": "Domingo", "hours": "15:00 - 22:00", "open": true, "dayIndex": 0}
]'::jsonb
WHERE id = 'main' AND (
  business_hours IS NULL OR 
  jsonb_array_length(business_hours) < 7
);

-- Comentario explicativo
COMMENT ON COLUMN site_settings.business_hours IS 'Horarios de atención del negocio. Formato: [{"day": "Día", "hours": "HH:MM - HH:MM", "open": boolean, "dayIndex": 0-6}]. dayIndex: 0=Domingo, 1=Lunes... Para horarios especiales (feriados), usar dayIndex: -1';
