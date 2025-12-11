-- Script para arreglar RLS de productos y permitir actualización de stock
-- Ejecutar en Supabase SQL Editor

-- 1. Ver políticas actuales de products
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'products';

-- 2. Crear política para permitir UPDATE a usuarios autenticados
-- (Esto permite que cualquier usuario autenticado actualice productos - el stock)
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;

CREATE POLICY "Allow authenticated users to update products"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. También asegurarse de que se puede leer
DROP POLICY IF EXISTS "Allow public read access to products" ON products;

CREATE POLICY "Allow public read access to products"
ON products FOR SELECT
TO public
USING (true);

-- 4. Para anon también (usuarios no autenticados pueden ver productos)
DROP POLICY IF EXISTS "Allow anon read access to products" ON products;

CREATE POLICY "Allow anon read access to products"
ON products FOR SELECT
TO anon
USING (true);

-- 5. Verificar que RLS está habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 6. Verificar las políticas después de los cambios
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'products';

-- ===============================================
-- OPCIÓN ALTERNATIVA: Si quieres que SOLO admins
-- puedan modificar productos, usa esta política en su lugar:
-- ===============================================
-- DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
-- 
-- CREATE POLICY "Only admins can update products"
-- ON products FOR UPDATE
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM users u 
--     WHERE u.id = auth.uid() 
--     AND u.rol = 'admin'
--   )
-- )
-- WITH CHECK (
--   EXISTS (
--     SELECT 1 FROM users u 
--     WHERE u.id = auth.uid() 
--     AND u.rol = 'admin'
--   )
-- );
