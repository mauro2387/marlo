-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Crear bucket de Storage para imágenes
-- =====================================================

-- 1. Crear bucket 'images' si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- 2. Eliminar políticas existentes si las hay (para evitar conflictos)
DROP POLICY IF EXISTS "Imágenes públicas" ON storage.objects;
DROP POLICY IF EXISTS "Subida autenticada" ON storage.objects;
DROP POLICY IF EXISTS "Subida anónima" ON storage.objects;
DROP POLICY IF EXISTS "Actualización de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Eliminación de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- 3. Política para permitir lectura pública
CREATE POLICY "Imágenes públicas" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- 4. Política para permitir subida (cualquier usuario)
CREATE POLICY "Subida de imágenes" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'images');

-- 5. Política para permitir actualización
CREATE POLICY "Actualización de imágenes" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'images');

-- 6. Política para permitir eliminación
CREATE POLICY "Eliminación de imágenes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'images');

-- 7. Verificar bucket creado
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'images';
