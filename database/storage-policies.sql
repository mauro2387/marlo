-- Políticas de Storage para el bucket featured-images
-- Ejecutar en Supabase SQL Editor

-- 1. Política para permitir lectura pública
CREATE POLICY "Public read access for featured-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'featured-images');

-- 2. Política para permitir subida a usuarios autenticados (admins)
CREATE POLICY "Authenticated users can upload to featured-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'featured-images');

-- 3. Política para permitir actualización a usuarios autenticados
CREATE POLICY "Authenticated users can update featured-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'featured-images');

-- 4. Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Authenticated users can delete from featured-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'featured-images');

-- Verificar políticas creadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%featured%';
