-- Migración: Agregar columnas de Google Reviews a site_settings
-- Permite mostrar rating y cantidad de reseñas editables desde el admin

-- Agregar columnas para Google Reviews
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1) DEFAULT 4.9,
ADD COLUMN IF NOT EXISTS google_reviews_count INTEGER DEFAULT 21,
ADD COLUMN IF NOT EXISTS google_reviews_url TEXT DEFAULT 'https://www.google.com/search?kgmid=/g/11ybpp3pv9#lrd=0x9575110030adacd1:0x62e6dd03788fee45,1';

-- Actualizar el registro existente con valores actuales de Google
UPDATE site_settings 
SET 
  google_rating = 4.9,
  google_reviews_count = 21,
  google_reviews_url = 'https://www.google.com/search?kgmid=/g/11ybpp3pv9#lrd=0x9575110030adacd1:0x62e6dd03788fee45,1'
WHERE id = 'main' AND google_rating IS NULL;

-- Comentarios explicativos
COMMENT ON COLUMN site_settings.google_rating IS 'Rating de Google Reviews (1.0 - 5.0). Actualizar manualmente cuando cambie.';
COMMENT ON COLUMN site_settings.google_reviews_count IS 'Cantidad de reseñas en Google. Actualizar manualmente cuando cambie.';
COMMENT ON COLUMN site_settings.google_reviews_url IS 'URL directa a las reseñas de Google Business';
