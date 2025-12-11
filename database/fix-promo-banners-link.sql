-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Migrar datos a columnas texto y link
-- =====================================================

-- Copiar valores de titulo/subtitulo a texto donde texto esté vacío
UPDATE promo_banners 
SET texto = COALESCE(titulo, subtitulo)
WHERE texto IS NULL OR texto = '';

-- Copiar valores de boton_link a link donde link esté vacío
UPDATE promo_banners 
SET link = boton_link 
WHERE (link IS NULL OR link = '') AND boton_link IS NOT NULL;

-- Insertar un banner de ejemplo si la tabla está vacía
INSERT INTO promo_banners (texto, link, activo, orden)
SELECT '🍪 ¡Bienvenido a MarLo Cookies! Envío gratis en compras +$5000', '/productos', true, 1
WHERE NOT EXISTS (SELECT 1 FROM promo_banners WHERE texto IS NOT NULL);

-- Verificar los banners actuales
SELECT id, texto, link, activo, orden FROM promo_banners ORDER BY orden;
