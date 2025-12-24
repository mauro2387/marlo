-- =====================================================
-- ZONAS DE DELIVERY CON POLÍGONOS VISUALES
-- Fecha: 2025-12-23
-- =====================================================
-- Esta migración crea la estructura para zonas de delivery
-- definidas visualmente como polígonos en el mapa
-- =====================================================

-- 1. Crear tabla de zonas de delivery con polígonos
CREATE TABLE IF NOT EXISTS public.delivery_zones_geo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Color hex para visualización
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tiempo_estimado VARCHAR(50) DEFAULT '30-60 min',
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0, -- Para prioridad de detección (menor = mayor prioridad)
  -- Almacenar polígono como JSON array de coordenadas [[lat, lng], [lat, lng], ...]
  poligono JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_delivery_zones_geo_activo ON public.delivery_zones_geo(activo);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_geo_orden ON public.delivery_zones_geo(orden);

-- 2. RLS
ALTER TABLE public.delivery_zones_geo ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para mostrar en checkout)
DROP POLICY IF EXISTS "Anyone can read active delivery zones" ON public.delivery_zones_geo;
CREATE POLICY "Anyone can read active delivery zones" ON public.delivery_zones_geo
  FOR SELECT USING (true);

-- Solo admins pueden modificar
DROP POLICY IF EXISTS "Admins can manage delivery zones" ON public.delivery_zones_geo;
CREATE POLICY "Admins can manage delivery zones" ON public.delivery_zones_geo
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
  );

-- 3. Función para verificar si un punto está dentro de un polígono (Ray Casting)
CREATE OR REPLACE FUNCTION point_in_polygon(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_polygon JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  n INTEGER;
  i INTEGER;
  j INTEGER;
  inside BOOLEAN := false;
  xi DOUBLE PRECISION;
  yi DOUBLE PRECISION;
  xj DOUBLE PRECISION;
  yj DOUBLE PRECISION;
  coord JSONB;
BEGIN
  n := jsonb_array_length(p_polygon);
  
  IF n < 3 THEN
    RETURN false;
  END IF;
  
  j := n - 1;
  
  FOR i IN 0..n-1 LOOP
    coord := p_polygon->i;
    xi := (coord->0)::DOUBLE PRECISION;
    yi := (coord->1)::DOUBLE PRECISION;
    
    coord := p_polygon->j;
    xj := (coord->0)::DOUBLE PRECISION;
    yj := (coord->1)::DOUBLE PRECISION;
    
    IF ((yi > p_lng) != (yj > p_lng)) AND 
       (p_lat < (xj - xi) * (p_lng - yi) / (yj - yi) + xi) THEN
      inside := NOT inside;
    END IF;
    
    j := i;
  END LOOP;
  
  RETURN inside;
END;
$$;

-- 4. Función para detectar zona de un punto
CREATE OR REPLACE FUNCTION detect_delivery_zone(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS TABLE (
  zona_id UUID,
  zona_nombre VARCHAR(100),
  zona_precio DECIMAL(10, 2),
  zona_tiempo VARCHAR(50),
  zona_color VARCHAR(7)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dz.id,
    dz.nombre,
    dz.precio,
    dz.tiempo_estimado,
    dz.color
  FROM public.delivery_zones_geo dz
  WHERE dz.activo = true
    AND point_in_polygon(p_lat, p_lng, dz.poligono)
  ORDER BY dz.orden ASC
  LIMIT 1;
END;
$$;

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_delivery_zones_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_delivery_zones_updated ON public.delivery_zones_geo;
CREATE TRIGGER trigger_delivery_zones_updated
  BEFORE UPDATE ON public.delivery_zones_geo
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_zones_timestamp();

-- 6. Insertar zonas de ejemplo para Maldonado
INSERT INTO public.delivery_zones_geo (nombre, color, precio, tiempo_estimado, orden, poligono) VALUES
-- Zona Centro/Maldonado (precio bajo)
('Centro Maldonado', '#22C55E', 50, '20-40 min', 1, '[
  [-34.92, -54.98],
  [-34.92, -54.93],
  [-34.88, -54.93],
  [-34.88, -54.98],
  [-34.92, -54.98]
]'::jsonb),

-- Punta del Este (precio medio)
('Punta del Este', '#3B82F6', 80, '30-50 min', 2, '[
  [-34.98, -54.97],
  [-34.98, -54.92],
  [-34.94, -54.92],
  [-34.94, -54.97],
  [-34.98, -54.97]
]'::jsonb),

-- La Barra / Manantiales (precio alto)
('La Barra - Manantiales', '#F59E0B', 120, '40-60 min', 3, '[
  [-34.89, -54.80],
  [-34.89, -54.70],
  [-34.84, -54.70],
  [-34.84, -54.80],
  [-34.89, -54.80]
]'::jsonb),

-- José Ignacio (precio premium)
('José Ignacio', '#EF4444', 180, '50-70 min', 4, '[
  [-34.86, -54.68],
  [-34.86, -54.58],
  [-34.80, -54.58],
  [-34.80, -54.68],
  [-34.86, -54.68]
]'::jsonb),

-- San Carlos (precio medio)
('San Carlos', '#8B5CF6', 70, '25-45 min', 5, '[
  [-34.83, -54.95],
  [-34.83, -54.88],
  [-34.77, -54.88],
  [-34.77, -54.95],
  [-34.83, -54.95]
]'::jsonb)

ON CONFLICT DO NOTHING;

-- 7. Comentarios
COMMENT ON TABLE public.delivery_zones_geo IS 'Zonas de delivery definidas como polígonos geográficos';
COMMENT ON COLUMN public.delivery_zones_geo.poligono IS 'Array JSON de coordenadas [[lat, lng], ...] formando el polígono';
COMMENT ON COLUMN public.delivery_zones_geo.orden IS 'Prioridad para detección (menor = mayor prioridad en caso de superposición)';
COMMENT ON FUNCTION point_in_polygon IS 'Verifica si un punto está dentro de un polígono usando Ray Casting';
COMMENT ON FUNCTION detect_delivery_zone IS 'Detecta la zona de delivery para unas coordenadas';

-- Verificación
SELECT 
  nombre, 
  color, 
  precio, 
  tiempo_estimado,
  jsonb_array_length(poligono) as puntos_poligono
FROM public.delivery_zones_geo 
ORDER BY orden;
