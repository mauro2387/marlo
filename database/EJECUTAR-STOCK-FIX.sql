-- EJECUTA ESTO EN SUPABASE SQL EDITOR PARA ARREGLAR EL STOCK

-- Permitir a usuarios autenticados actualizar productos (para el stock)
CREATE POLICY "Allow authenticated users to update products"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
