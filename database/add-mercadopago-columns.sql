-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Agregar columnas para Mercado Pago en tabla orders
-- =====================================================

-- Agregar columnas para tracking de pagos de Mercado Pago
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS mp_payment_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS mp_payment_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS mp_preference_id VARCHAR(100);

-- Crear índice para búsquedas rápidas por payment_id
CREATE INDEX IF NOT EXISTS idx_orders_mp_payment_id ON orders(mp_payment_id);

-- Comentarios
COMMENT ON COLUMN orders.mp_payment_id IS 'ID del pago en Mercado Pago';
COMMENT ON COLUMN orders.mp_payment_status IS 'Estado del pago en MP: approved, pending, rejected, etc.';
COMMENT ON COLUMN orders.mp_preference_id IS 'ID de la preferencia de pago creada en MP';

-- Mensaje de confirmación
SELECT 'Columnas de Mercado Pago agregadas correctamente a tabla orders' AS status;
