-- =====================================================
-- SCRIPT: Confirmar emails manualmente (Resend configurado)
-- =====================================================

-- PASO 1: Ver todos los usuarios sin confirmar
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Sin confirmar'
    ELSE '✅ Confirmado'
  END as status
FROM auth.users 
ORDER BY created_at DESC;

-- =====================================================
-- PASO 2: CONFIRMAR TODOS LOS USUARIOS SIN CONFIRMAR
-- =====================================================
-- Ejecuta esto para confirmar TODOS los usuarios pendientes:
-- NOTA: confirmed_at es una columna generada, se actualiza automáticamente

UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- =====================================================
-- PASO 3: Verificar que se confirmaron correctamente
-- =====================================================

SELECT 
  COUNT(*) as total_usuarios,
  COUNT(email_confirmed_at) as confirmados,
  COUNT(*) - COUNT(email_confirmed_at) as pendientes
FROM auth.users;

-- =====================================================
-- SOLUCIÓN PERMANENTE: Configurar SMTP
-- =====================================================

-- Este script es solo temporal. Para solucionar el problema permanentemente:
-- 
-- OPCIÓN 1 - DESHABILITAR confirmación de email (NO RECOMENDADO en producción):
-- 1. Ve a Supabase Dashboard → Authentication → Settings
-- 2. Busca "Enable email confirmations"
-- 3. Desactívalo temporalmente
--
-- OPCIÓN 2 - CONFIGURAR SMTP (RECOMENDADO):
-- 1. Crear cuenta en Resend: https://resend.com (100 emails/día gratis)
-- 2. Obtener API Key
-- 3. Supabase Dashboard → Settings → Authentication → SMTP Settings
-- 4. Configurar:
--    - Host: smtp.resend.com
--    - Port: 465
--    - Username: resend
--    - Password: [TU_API_KEY]
--    - Sender email: noreply@tudominio.com
--
-- IMPORTANTE: Si usas SMTP, también debes configurar los templates de email:
-- - Ve a Authentication → Email Templates
-- - Configura "Confirm signup" con el template de fix-admin-delete-and-emails.sql

-- =====================================================
-- AYUDA: Ver todos los usuarios sin confirmar
-- =====================================================

-- Ejecuta esto para ver qué usuarios necesitan confirmación:
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Sin confirmar'
    ELSE '✅ Confirmado'
  END as status
FROM auth.users 
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- CONFIRMAR TODOS LOS USUARIOS (USA CON PRECAUCIÓN)
-- =====================================================

-- Si quieres confirmar TODOS los usuarios de una vez (no recomendado en producción):
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW(),
--     confirmed_at = NOW()
-- WHERE email_confirmed_at IS NULL;
