-- ========================================
-- RESTRICCIONES DE PRODUCTOS
-- ========================================
-- Agregar opciones para productos solo retiro local y excluir de box

-- 1. Agregar campo solo_retiro_local
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'solo_retiro_local'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN solo_retiro_local BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.products.solo_retiro_local IS 'Si es true, el producto solo se puede retirar en el local físico, no se permite envío';
        
        RAISE NOTICE '✅ Columna solo_retiro_local agregada';
    ELSE
        RAISE NOTICE 'ℹ️ La columna solo_retiro_local ya existe';
    END IF;
END $$;

-- 2. Agregar campo no_disponible_box
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'no_disponible_box'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN no_disponible_box BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.products.no_disponible_box IS 'Si es true, el producto NO aparece en el selector de box personalizado';
        
        RAISE NOTICE '✅ Columna no_disponible_box agregada';
    ELSE
        RAISE NOTICE 'ℹ️ La columna no_disponible_box ya existe';
    END IF;
END $$;

-- 3. Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_products_solo_retiro ON public.products(solo_retiro_local) 
WHERE solo_retiro_local = true;

CREATE INDEX IF NOT EXISTS idx_products_box_disponible ON public.products(no_disponible_box) 
WHERE no_disponible_box = false;

-- 4. Verificar resultado
DO $$
DECLARE
    total_productos INTEGER;
    solo_retiro INTEGER;
    no_box INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_productos FROM public.products;
    SELECT COUNT(*) INTO solo_retiro FROM public.products WHERE solo_retiro_local = true;
    SELECT COUNT(*) INTO no_box FROM public.products WHERE no_disponible_box = true;
    
    RAISE NOTICE '📦 Total de productos: %', total_productos;
    RAISE NOTICE '🏪 Solo retiro local: %', solo_retiro;
    RAISE NOTICE '📦 No disponibles para box: %', no_box;
END $$;
