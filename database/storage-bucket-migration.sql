-- =========================================
-- CONFIGURACIÓN DE SUPABASE STORAGE PARA PRODUCTOS
-- =========================================
-- Ejecutar en el SQL Editor de Supabase Dashboard

-- 1. Crear el bucket para imágenes de productos (si no existe)
-- NOTA: Esto normalmente se hace desde el Dashboard de Supabase
-- Storage > Create new bucket > Name: product-images > Public: true

-- 2. Políticas RLS para el bucket de storage

-- Política de lectura pública (cualquiera puede ver las imágenes)
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Política para que usuarios autenticados puedan subir imágenes
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política para que usuarios autenticados puedan actualizar/reemplazar imágenes
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política para que usuarios autenticados puedan eliminar imágenes
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- =========================================
-- INSTRUCCIONES PARA CREAR EL BUCKET MANUALMENTE
-- =========================================
-- 
-- 1. Ve a https://app.supabase.com/project/[TU_PROYECTO]/storage/buckets
-- 2. Click en "New bucket"
-- 3. Configurar:
--    - Name: product-images
--    - Public bucket: ✅ Activado
--    - File size limit: 5242880 (5MB)
--    - Allowed MIME types: image/png,image/jpeg,image/jpg,image/webp,image/gif
-- 4. Click "Save"
-- 5. Luego ejecutar las políticas SQL de arriba
--
-- =========================================
