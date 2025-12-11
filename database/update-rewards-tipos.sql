-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Actualizar tabla rewards con nuevos campos para tipos de recompensas
-- =====================================================

-- 1. Agregar columnas nuevas a rewards
ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS tipo_recompensa VARCHAR(50) DEFAULT 'producto';

ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS valor_descuento INTEGER DEFAULT NULL;

ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS cantidad_cookies INTEGER DEFAULT NULL;

-- 2. Agregar 'puntos' al enum payment_method (si existe el tipo)
DO $$ 
BEGIN
    ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'puntos';
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN 
        -- El tipo no existe, crear o ignorar
        RAISE NOTICE 'Tipo payment_method no existe, saltando...';
END $$;

-- 3. Actualizar tabla coupons para agregar campo 'codigo' si usa 'code'
-- Verificar si existe columna 'code' y no 'codigo'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'code') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'codigo') THEN
        ALTER TABLE coupons RENAME COLUMN code TO codigo;
    END IF;
END $$;

-- 4. Comentarios para documentación
COMMENT ON COLUMN rewards.tipo_recompensa IS 'Tipo de recompensa: producto, cupon_descuento, cupon_envio, box_personalizable';
COMMENT ON COLUMN rewards.valor_descuento IS 'Para cupones: porcentaje de descuento (1-100)';
COMMENT ON COLUMN rewards.cantidad_cookies IS 'Para boxes personalizables: cantidad de cookies a elegir';

-- 5. Verificar cambios
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'rewards' 
ORDER BY ordinal_position;
