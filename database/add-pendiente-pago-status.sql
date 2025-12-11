-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Agregar estado 'pendiente_pago' al enum order_status
-- =====================================================

-- Agregar el nuevo valor al enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pendiente_pago';

-- Mensaje de confirmación
SELECT 'Estado pendiente_pago agregado correctamente al enum order_status' AS status;
