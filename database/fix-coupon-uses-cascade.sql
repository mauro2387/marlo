-- Fix: Permitir borrar orders eliminando automáticamente los coupon_uses relacionados
-- Problema: No se pueden borrar pedidos porque coupon_uses tiene una FK sin CASCADE

-- 1. Eliminar la constraint actual de order_id en coupon_uses
ALTER TABLE public.coupon_uses
DROP CONSTRAINT IF EXISTS coupon_uses_order_id_fkey;

-- 2. Agregar la constraint con ON DELETE CASCADE
ALTER TABLE public.coupon_uses
ADD CONSTRAINT coupon_uses_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE CASCADE;

-- Verificar que se aplicó correctamente
SELECT 
  conname AS constraint_name,
  confdeltype AS delete_action,
  CASE confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
  END AS delete_action_text
FROM pg_constraint
WHERE conname = 'coupon_uses_order_id_fkey'
  AND conrelid = 'public.coupon_uses'::regclass;
