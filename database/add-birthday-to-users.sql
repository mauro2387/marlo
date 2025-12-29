-- ========================================
-- AGREGAR CAMPO CUMPLEAÑOS A LA TABLA USERS
-- ========================================
-- Este script agrega el campo fecha_cumpleanos a public.users
-- y crea un trigger para mantenerlo sincronizado con auth.users

-- 1. Agregar columna fecha_cumpleanos a public.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'fecha_cumpleanos'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN fecha_cumpleanos DATE;
        
        RAISE NOTICE 'Columna fecha_cumpleanos agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna fecha_cumpleanos ya existe';
    END IF;
END $$;

-- 2. Migrar fechas existentes desde auth.users metadata a public.users
-- (Solo afecta usuarios que ya tienen fecha en metadata pero no en users)
UPDATE public.users u
SET fecha_cumpleanos = TO_DATE(au.raw_user_meta_data->>'fecha_cumpleanos', 'YYYY-MM-DD')
FROM auth.users au
WHERE u.id = au.id
AND au.raw_user_meta_data->>'fecha_cumpleanos' IS NOT NULL
AND u.fecha_cumpleanos IS NULL;

-- 3. Función para sincronizar cumpleaños automáticamente
CREATE OR REPLACE FUNCTION public.sync_birthday_to_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando se crea o actualiza un usuario en auth.users
    -- Copiar fecha de cumpleaños a public.users
    IF NEW.raw_user_meta_data->>'fecha_cumpleanos' IS NOT NULL THEN
        UPDATE public.users 
        SET fecha_cumpleanos = TO_DATE(NEW.raw_user_meta_data->>'fecha_cumpleanos', 'YYYY-MM-DD')
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear trigger en auth.users para auto-sync
DROP TRIGGER IF EXISTS trigger_sync_birthday ON auth.users;
CREATE TRIGGER trigger_sync_birthday
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_birthday_to_users();

-- 5. Comentarios descriptivos
COMMENT ON COLUMN public.users.fecha_cumpleanos IS 'Fecha de cumpleaños del usuario - sincronizada automáticamente desde auth.users.raw_user_meta_data';
COMMENT ON FUNCTION public.sync_birthday_to_users() IS 'Mantiene sincronizado el campo fecha_cumpleanos entre auth.users y public.users';

-- 6. Verificar resultado
DO $$
DECLARE
    total_users INTEGER;
    users_with_birthday INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM public.users;
    SELECT COUNT(*) INTO users_with_birthday FROM public.users WHERE fecha_cumpleanos IS NOT NULL;
    
    RAISE NOTICE '✅ Total de usuarios: %', total_users;
    RAISE NOTICE '🎂 Usuarios con cumpleaños: %', users_with_birthday;
END $$;
