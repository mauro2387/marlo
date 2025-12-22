-- =====================================================
-- SOLUCIÓN URGENTE: Deshabilitar verificación de email
-- =====================================================

-- PASO 1: Ejecutar este SQL para confirmar TODOS los usuarios
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- PASO 2: Verificar cuántos se confirmaron
SELECT 
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmados,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as sin_confirmar
FROM auth.users;

-- =====================================================
-- PASO 3 (MANUAL): DESHABILITAR CONFIRMACIÓN EN SUPABASE
-- =====================================================
-- 
-- 1. Ve a: https://supabase.com/dashboard/project/_/auth/providers
-- 2. Haz clic en "Email" provider
-- 3. DESHABILITA "Confirm email"
-- 4. Click "Save"
--
-- Esto permite que los usuarios hagan login sin confirmar email
-- =====================================================
