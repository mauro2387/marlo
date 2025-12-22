-- =====================================================
-- PERMITIR ELIMINACIÓN DE PRODUCTOS CON PEDIDOS
-- Fecha: 2025-12-18
-- =====================================================
-- 
-- ADVERTENCIA: Esto permite borrar productos incluso si tienen
-- pedidos asociados. Los order_items mantendrán el nombre del 
-- producto pero el product_id será NULL.
-- 
-- EJECUTAR EN: Supabase SQL Editor
-- =====================================================

-- Paso 1: Eliminar el constraint actual
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Paso 2: Recrear el constraint con ON DELETE SET NULL
-- Esto hace que cuando se borre un producto, el product_id en order_items se ponga NULL
-- pero se mantiene el nombre, precio, y cantidad en el pedido (datos históricos)
ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE SET NULL;

-- Verificar que el constraint se creó correctamente
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'order_items' 
  AND kcu.column_name = 'product_id';

-- =====================================================
-- RESULTADO ESPERADO:
-- constraint_name: order_items_product_id_fkey
-- table_name: order_items
-- column_name: product_id
-- foreign_table_name: products
-- foreign_column_name: id
-- delete_rule: SET NULL  <-- Esto permite la eliminación
-- =====================================================
