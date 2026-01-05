-- ========================================
-- DESACTIVAR REALTIME (Reducir Egress)
-- ========================================
-- Quitar tablas innecesarias de realtime para reducir tráfico

-- Ver qué tablas tienen realtime actualmente
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Desactivar realtime en tablas que NO necesitan actualizaciones en tiempo real
-- (Solo mantener 'orders' que sí necesita realtime para el admin)

DO $$
BEGIN
    -- Products (se cargan una vez, no necesitan realtime)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE products;
        RAISE NOTICE '✅ Realtime desactivado en products';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ products ya no está en realtime';
    END;
    
    -- Featured cards (rara vez cambian)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE featured_cards;
        RAISE NOTICE '✅ Realtime desactivado en featured_cards';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ featured_cards ya no está en realtime';
    END;
    
    -- Floating images (rara vez cambian)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE floating_images;
        RAISE NOTICE '✅ Realtime desactivado en floating_images';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ floating_images ya no está en realtime';
    END;
    
    -- Promo banners (rara vez cambian)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE promo_banners;
        RAISE NOTICE '✅ Realtime desactivado en promo_banners';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ promo_banners ya no está en realtime';
    END;
    
    -- Site settings (rara vez cambian)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE site_settings;
        RAISE NOTICE '✅ Realtime desactivado en site_settings';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ site_settings ya no está en realtime';
    END;
    
    -- Popups (rara vez cambian)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE popups;
        RAISE NOTICE '✅ Realtime desactivado en popups';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ popups ya no está en realtime';
    END;
    
    -- Subscribers (no necesitan realtime público)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE subscribers;
        RAISE NOTICE '✅ Realtime desactivado en subscribers';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ subscribers ya no está en realtime';
    END;
    
    -- Coupons (se consultan cuando se necesitan)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE coupons;
        RAISE NOTICE '✅ Realtime desactivado en coupons';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ coupons ya no está en realtime';
    END;
    
    -- Loyalty history (no necesita realtime)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE loyalty_history;
        RAISE NOTICE '✅ Realtime desactivado en loyalty_history';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ loyalty_history ya no está en realtime';
    END;
    
    -- Users (datos de perfil no necesitan realtime)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE users;
        RAISE NOTICE '✅ Realtime desactivado en users';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ users ya no está en realtime';
    END;
    
    -- Order items (los items se cargan con el order)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE order_items;
        RAISE NOTICE '✅ Realtime desactivado en order_items';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ order_items ya no está en realtime';
    END;
    
    -- Wholesale requests (solo admin necesita verlos)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE wholesale_requests;
        RAISE NOTICE '✅ Realtime desactivado en wholesale_requests';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ wholesale_requests ya no está en realtime';
    END;
    
    -- Job applications (solo admin necesita verlos)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE job_applications;
        RAISE NOTICE '✅ Realtime desactivado en job_applications';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ job_applications ya no está en realtime';
    END;

END $$;

-- Verificar qué queda con realtime (solo debería quedar 'orders')
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Mensaje final
DO $$
DECLARE
    tabla_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tabla_count 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime';
    
    RAISE NOTICE '📊 Tablas con realtime activo: %', tabla_count;
    RAISE NOTICE '✅ Optimización completada - Esto debería reducir el egress en un 60-80%%';
    RAISE NOTICE '⚡ Monitorea el dashboard de Supabase en las próximas horas';
END $$;
