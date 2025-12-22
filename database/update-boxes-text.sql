-- Actualizar el título de "Boxes" a "Box" en featured_cards
UPDATE featured_cards
SET titulo = 'Box Personalizados'
WHERE titulo LIKE '%Boxes%' OR titulo LIKE '%boxes%';

-- Verificar el cambio
SELECT id, titulo, descripcion, activo 
FROM featured_cards 
WHERE titulo LIKE '%Box%';
