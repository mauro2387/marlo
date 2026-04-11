-- Agregar soporte para mini cookies y boxes de minis

-- 1. Agregar columna es_mini a products (marca una cookie como "mini")
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS es_mini boolean DEFAULT false;

-- 2. Agregar columnas a boxes para soporte de minis
-- permite_minis: si esta box puede armarse con minis
-- precio_mini: precio de la box cuando se arma con minis
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS permite_minis boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS precio_mini numeric DEFAULT 0;

-- Comentarios
COMMENT ON COLUMN products.es_mini IS 'Si es true, esta cookie es una mini cookie';
COMMENT ON COLUMN products.permite_minis IS 'Si es true, esta box puede armarse con mini cookies';
COMMENT ON COLUMN products.precio_mini IS 'Precio de la box cuando se arma con mini cookies';
