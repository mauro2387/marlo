-- Migración: Agregar estado 'listo' y campo tipo_entrega
-- IMPORTANTE: Ejecutar cada bloque POR SEPARADO en Supabase SQL Editor

-- =====================================================
-- PASO 1: Ejecutar PRIMERO (solo esto)
-- =====================================================
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'listo' AFTER 'preparando';

-- =====================================================
-- PASO 2: Ejecutar DESPUÉS (en una nueva ejecución)
-- =====================================================
-- Agregar campo tipo_entrega si no existe
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tipo_entrega TEXT DEFAULT 'delivery';

-- Actualizar pedidos existentes basándose en la dirección
UPDATE orders 
SET tipo_entrega = 'retiro' 
WHERE direccion ILIKE '%retiro%' OR direccion ILIKE '%local%';

-- Agregar constraint para validar valores
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_tipo_entrega_check;
ALTER TABLE orders ADD CONSTRAINT orders_tipo_entrega_check 
  CHECK (tipo_entrega IN ('delivery', 'retiro'));

-- Comentarios
COMMENT ON TYPE order_status IS 'Estados: preparando, listo (retiro), en_camino (delivery), entregado, cancelado';
COMMENT ON COLUMN orders.tipo_entrega IS 'Tipo de entrega: delivery o retiro';

-- =====================================================
-- PASO 3: Verificar (opcional)
-- =====================================================
SELECT unnest(enum_range(NULL::order_status)) AS estados_disponibles;
