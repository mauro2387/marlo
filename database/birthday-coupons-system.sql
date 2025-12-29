-- Sistema de Cupones Automáticos de Cumpleaños
-- MarLo Cookies

-- 1. Agregar configuración de cumpleaños a site_settings
DO $$
BEGIN
    -- Verificar si la columna existe antes de agregarla
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' AND column_name = 'birthday_config'
    ) THEN
        ALTER TABLE site_settings 
        ADD COLUMN birthday_config JSONB DEFAULT '{
            "enabled": true,
            "send_email": true,
            "discount_type": "porcentaje",
            "discount_value": 15,
            "validity_days": 7,
            "email_subject": "🎂 ¡Feliz Cumpleaños! Aquí tienes tu regalo especial",
            "email_body": "¡Feliz cumpleaños! 🎉 Disfruta de un %VALUE%% de descuento en tu próxima compra. Usa el código: %CODE%"
        }'::jsonb;
    END IF;
END $$;

-- 2. Crear tabla para tracking de cupones de cumpleaños generados
CREATE TABLE IF NOT EXISTS birthday_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coupon_code TEXT NOT NULL,
    birthday_year INTEGER NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_email BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    UNIQUE(user_id, birthday_year)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_birthday_coupons_user ON birthday_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_birthday_coupons_year ON birthday_coupons(birthday_year);

-- 3. Función para generar cupones de cumpleaños automáticamente
CREATE OR REPLACE FUNCTION generate_birthday_coupons()
RETURNS TABLE(
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    coupon_code TEXT,
    discount_value INTEGER
) AS $$
DECLARE
    config JSONB;
    current_year INTEGER;
    user_record RECORD;
    new_code TEXT;
    expiry_date DATE;
BEGIN
    -- Obtener configuración
    SELECT birthday_config INTO config
    FROM site_settings
    LIMIT 1;

    -- Si no está habilitado, salir
    IF NOT (config->>'enabled')::boolean THEN
        RETURN;
    END IF;

    current_year := EXTRACT(YEAR FROM CURRENT_DATE);

    -- Buscar usuarios que cumplen años hoy y no tienen cupón este año
    FOR user_record IN
        SELECT 
            u.id,
            u.raw_user_meta_data->>'nombre' as nombre,
            u.raw_user_meta_data->>'apellido' as apellido,
            u.email,
            u.raw_user_meta_data->>'fecha_cumpleanos' as fecha_cumpleanos
        FROM auth.users u
        WHERE 
            u.raw_user_meta_data->>'fecha_cumpleanos' IS NOT NULL
            AND TO_CHAR(TO_DATE(u.raw_user_meta_data->>'fecha_cumpleanos', 'YYYY-MM-DD'), 'MM-DD') = TO_CHAR(CURRENT_DATE, 'MM-DD')
            AND NOT EXISTS (
                SELECT 1 FROM birthday_coupons bc
                WHERE bc.user_id = u.id AND bc.birthday_year = current_year
            )
    LOOP
        -- Generar código único
        new_code := 'CUMPLE' || current_year || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

        -- Calcular fecha de expiración
        expiry_date := CURRENT_DATE + INTERVAL '1 day' * (config->>'validity_days')::integer;

        -- Crear cupón en la tabla coupons
        INSERT INTO coupons (
            code,
            tipo,
            valor,
            minimo,
            max_usos,
            usos_actuales,
            valido_desde,
            valido_hasta,
            activo,
            descripcion,
            origen
        ) VALUES (
            new_code,
            (config->>'discount_type')::TEXT,
            (config->>'discount_value')::INTEGER,
            0,
            1,
            0,
            CURRENT_DATE,
            expiry_date,
            true,
            'Cupón de cumpleaños - Solo válido para compras online',
            'cumpleanos'
        );

        -- Registrar en birthday_coupons
        INSERT INTO birthday_coupons (
            user_id,
            coupon_code,
            birthday_year,
            sent_email
        ) VALUES (
            user_record.id,
            new_code,
            current_year,
            false
        );

        -- Retornar información para enviar email
        user_id := user_record.id;
        user_name := COALESCE(user_record.nombre || ' ' || user_record.apellido, 'Cliente');
        user_email := user_record.email;
        coupon_code := new_code;
        discount_value := (config->>'discount_value')::INTEGER;
        
        RETURN NEXT;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- 4. Agregar columna 'origen' a coupons si no existe (para identificar cupones de cumpleaños)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'origen'
    ) THEN
        ALTER TABLE coupons 
        ADD COLUMN origen TEXT DEFAULT 'manual';
        
        COMMENT ON COLUMN coupons.origen IS 'Origen del cupón: manual, cumpleanos, promocion, etc.';
    END IF;
END $$;

-- 5. Agregar campo para indicar si el cupón es solo online
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'coupons' AND column_name = 'solo_online'
    ) THEN
        ALTER TABLE coupons 
        ADD COLUMN solo_online BOOLEAN DEFAULT true;
        
        COMMENT ON COLUMN coupons.solo_online IS 'Indica si el cupón es válido solo para compras online';
        
        -- Marcar todos los cupones existentes como solo online
        UPDATE coupons SET solo_online = true;
    END IF;
END $$;

-- 6. Políticas RLS para birthday_coupons
ALTER TABLE birthday_coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own birthday coupons" ON birthday_coupons;
CREATE POLICY "Users can view their own birthday coupons"
    ON birthday_coupons
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage birthday coupons" ON birthday_coupons;
CREATE POLICY "Admins can manage birthday coupons"
    ON birthday_coupons
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND rol = 'admin'
        )
    );

-- 7. Función helper para verificar si un usuario puede recibir cupón de cumpleaños
CREATE OR REPLACE FUNCTION can_generate_birthday_coupon(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_birthday TEXT;
    current_year INTEGER;
    already_generated BOOLEAN;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Obtener fecha de cumpleaños
    SELECT raw_user_meta_data->>'fecha_cumpleanos' INTO user_birthday
    FROM auth.users
    WHERE id = p_user_id;
    
    IF user_birthday IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar si ya se generó este año
    SELECT EXISTS (
        SELECT 1 FROM birthday_coupons
        WHERE user_id = p_user_id AND birthday_year = current_year
    ) INTO already_generated;
    
    IF already_generated THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar si es su cumpleaños (mes y día)
    RETURN TO_CHAR(TO_DATE(user_birthday, 'YYYY-MM-DD'), 'MM-DD') = TO_CHAR(CURRENT_DATE, 'MM-DD');
END;
$$ LANGUAGE plpgsql;

-- 8. Vista para ver cumpleaños próximos (para admin)
CREATE OR REPLACE VIEW upcoming_birthdays AS
SELECT 
    u.id as user_id,
    u.raw_user_meta_data->>'nombre' as nombre,
    u.raw_user_meta_data->>'apellido' as apellido,
    u.email,
    u.raw_user_meta_data->>'fecha_cumpleanos' as fecha_nacimiento,
    TO_CHAR(TO_DATE(u.raw_user_meta_data->>'fecha_cumpleanos', 'YYYY-MM-DD'), 'DD/MM') as cumpleanos,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, TO_DATE(u.raw_user_meta_data->>'fecha_cumpleanos', 'YYYY-MM-DD'))) as edad,
    CASE 
        WHEN TO_CHAR(TO_DATE(u.raw_user_meta_data->>'fecha_cumpleanos', 'YYYY-MM-DD'), 'MM-DD') = TO_CHAR(CURRENT_DATE, 'MM-DD') THEN 'Hoy'
        WHEN TO_CHAR(TO_DATE(u.raw_user_meta_data->>'fecha_cumpleanos', 'YYYY-MM-DD'), 'MM-DD') = TO_CHAR(CURRENT_DATE + INTERVAL '1 day', 'MM-DD') THEN 'Mañana'
        ELSE TO_CHAR(
            MAKE_DATE(
                EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
                EXTRACT(MONTH FROM TO_DATE(u.raw_user_meta_data->>'fecha_cumpleanos', 'YYYY-MM-DD'))::INTEGER,
                EXTRACT(DAY FROM TO_DATE(u.raw_user_meta_data->>'fecha_cumpleanos', 'YYYY-MM-DD'))::INTEGER
            ) - CURRENT_DATE,
            'FM999'
        ) || ' días'
    END as dias_para_cumple,
    EXISTS (
        SELECT 1 FROM birthday_coupons bc
        WHERE bc.user_id = u.id 
        AND bc.birthday_year = EXTRACT(YEAR FROM CURRENT_DATE)
    ) as cupon_generado
FROM auth.users u
WHERE u.raw_user_meta_data->>'fecha_cumpleanos' IS NOT NULL
ORDER BY 
    TO_CHAR(TO_DATE(u.raw_user_meta_data->>'fecha_cumpleanos', 'YYYY-MM-DD'), 'MM-DD');

-- Comentarios
COMMENT ON TABLE birthday_coupons IS 'Registro de cupones de cumpleaños generados automáticamente';
COMMENT ON FUNCTION generate_birthday_coupons() IS 'Genera cupones de cumpleaños para usuarios que cumplen años hoy';
COMMENT ON FUNCTION can_generate_birthday_coupon(UUID) IS 'Verifica si un usuario puede recibir cupón de cumpleaños';
COMMENT ON VIEW upcoming_birthdays IS 'Vista de cumpleaños próximos para dashboard de admin';
