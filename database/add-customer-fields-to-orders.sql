-- ========================================
-- AGREGAR CAMPOS DE CLIENTE A ORDERS
-- ========================================
-- Agregar customer_name, customer_email, customer_phone a la tabla orders

-- 1. Agregar customer_name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'customer_name'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN customer_name VARCHAR(255);
        
        COMMENT ON COLUMN public.orders.customer_name IS 'Nombre completo del cliente ingresado en el checkout';
        
        RAISE NOTICE '✅ Columna customer_name agregada';
    ELSE
        RAISE NOTICE 'ℹ️ La columna customer_name ya existe';
    END IF;
END $$;

-- 2. Agregar customer_email
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN customer_email VARCHAR(255);
        
        COMMENT ON COLUMN public.orders.customer_email IS 'Email del cliente ingresado en el checkout';
        
        RAISE NOTICE '✅ Columna customer_email agregada';
    ELSE
        RAISE NOTICE 'ℹ️ La columna customer_email ya existe';
    END IF;
END $$;

-- 3. Agregar customer_phone
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'customer_phone'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN customer_phone VARCHAR(50);
        
        COMMENT ON COLUMN public.orders.customer_phone IS 'Teléfono del cliente ingresado en el checkout (con código de país +598)';
        
        RAISE NOTICE '✅ Columna customer_phone agregada';
    ELSE
        RAISE NOTICE 'ℹ️ La columna customer_phone ya existe';
    END IF;
END $$;

-- 4. Crear índice para búsquedas rápidas por teléfono
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone) 
WHERE customer_phone IS NOT NULL;

-- 5. Verificar resultado
DO $$
DECLARE
    total_orders INTEGER;
    with_phone INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_orders FROM public.orders;
    SELECT COUNT(*) INTO with_phone FROM public.orders WHERE customer_phone IS NOT NULL;
    
    RAISE NOTICE '📦 Total de pedidos: %', total_orders;
    RAISE NOTICE '📱 Pedidos con teléfono: %', with_phone;
    RAISE NOTICE '✅ Migración completada correctamente';
END $$;
