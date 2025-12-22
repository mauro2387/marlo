-- =====================================================
-- AGREGAR SOPORTE PARA MÚLTIPLES IMÁGENES EN PRODUCTOS
-- Fecha: 2025-12-19
-- =====================================================
-- 
-- Esta migración agrega una columna para almacenar múltiples
-- imágenes por producto, manteniendo compatibilidad con el
-- campo imagen existente.
-- 
-- EJECUTAR EN: Supabase SQL Editor
-- =====================================================

-- Paso 1: Agregar columna para múltiples imágenes (array de URLs)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS imagenes TEXT[] DEFAULT '{}';

-- Paso 2: Migrar imagen actual a la nueva columna (si existe)
UPDATE public.products 
SET imagenes = ARRAY[imagen]
WHERE imagen IS NOT NULL 
  AND imagen != '' 
  AND imagen != '🍪'
  AND (imagen LIKE 'http%' OR imagen LIKE '/%')
  AND (imagenes IS NULL OR array_length(imagenes, 1) IS NULL);

-- Paso 3: Verificar la migración
SELECT 
  id, 
  nombre, 
  imagen,
  imagenes,
  array_length(imagenes, 1) as num_imagenes
FROM public.products
LIMIT 10;

-- =====================================================
-- RESULTADO ESPERADO:
-- Cada producto tendrá:
-- - imagen: campo original (string) - mantiene compatibilidad
-- - imagenes: array de URLs - para galería múltiple
-- 
-- La imagen principal será imagenes[0] o imagen como fallback
-- =====================================================
