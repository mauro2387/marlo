-- Migración: Agregar campo de confirmación de transferencia a orders
-- Ejecutar en Supabase SQL Editor

-- Agregar columna para confirmar que se recibió la transferencia
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transferencia_confirmada BOOLEAN DEFAULT false;

-- Comentario descriptivo
COMMENT ON COLUMN orders.transferencia_confirmada IS 'Indica si el admin confirmó la recepción de la transferencia bancaria';

-- Índice para filtrar por transferencias pendientes de confirmar
CREATE INDEX IF NOT EXISTS idx_orders_transfer_pending 
ON orders (metodo_pago, transferencia_confirmada) 
WHERE metodo_pago = 'transferencia' AND transferencia_confirmada = false;
