-- =====================================================
-- FIX: Políticas DELETE faltantes + Configuración de Emails
-- Fecha: 2025-12-17
-- =====================================================

-- PROBLEMA 1: Las tablas no tienen políticas DELETE para admins
-- PROBLEMA 2: Emails de verificación no se envían (requiere configuración en Supabase)

-- =====================================================
-- PARTE 1: AGREGAR POLÍTICAS DELETE PARA ADMIN
-- =====================================================

-- Crear función helper para verificar si el usuario actual es admin
-- SECURITY DEFINER permite que la función acceda a public.users sin problemas de permisos
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND rol = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. NEWSLETTER_SUBSCRIBERS - Falta política DELETE
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Admins can delete subscribers"
ON public.newsletter_subscribers
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 2. PRODUCTS - Verificar/agregar política DELETE
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 3. COUPONS - Agregar política DELETE
DROP POLICY IF EXISTS "Admins can delete coupons" ON public.coupons;

CREATE POLICY "Admins can delete coupons"
ON public.coupons
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 4. DELIVERY_ZONES - Agregar política DELETE
DROP POLICY IF EXISTS "Admins can delete zones" ON public.delivery_zones;

CREATE POLICY "Admins can delete zones"
ON public.delivery_zones
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 5. JOB_APPLICATIONS - Agregar política DELETE
DROP POLICY IF EXISTS "Admins can delete applications" ON public.job_applications;

CREATE POLICY "Admins can delete applications"
ON public.job_applications
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 6. FEATURED_CARDS - Agregar política DELETE
DROP POLICY IF EXISTS "Admins can delete featured cards" ON public.featured_cards;

CREATE POLICY "Admins can delete featured cards"
ON public.featured_cards
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 7. PROMO_BANNERS - Agregar política DELETE
DROP POLICY IF EXISTS "Admins can delete banners" ON public.promo_banners;

CREATE POLICY "Admins can delete banners"
ON public.promo_banners
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 8. POPUPS - Agregar política DELETE
DROP POLICY IF EXISTS "Admins can delete popups" ON public.popups;

CREATE POLICY "Admins can delete popups"
ON public.popups
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 9. FLOATING_IMAGES - Ya tiene política pero verificamos
DROP POLICY IF EXISTS "Only admins can delete floating images" ON public.floating_images;

CREATE POLICY "Only admins can delete floating images"
ON public.floating_images
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 10. CONTACT_MESSAGES - Agregar política DELETE
DROP POLICY IF EXISTS "Admins can delete messages" ON public.contact_messages;

CREATE POLICY "Admins can delete messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 11. WHOLESALE_REQUESTS - Agregar política DELETE
DROP POLICY IF EXISTS "Admins can delete wholesale requests" ON public.wholesale_requests;

CREATE POLICY "Admins can delete wholesale requests"
ON public.wholesale_requests
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- 12. COUPON_USES - Agregar política DELETE
DROP POLICY IF EXISTS "Admins can delete coupon uses" ON public.coupon_uses;

CREATE POLICY "Admins can delete coupon uses"
ON public.coupon_uses
FOR DELETE
TO authenticated
USING (public.is_current_user_admin());

-- =====================================================
-- VERIFICACIÓN DE POLÍTICAS
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'DELETE'
ORDER BY tablename, policyname;

-- =====================================================
-- PARTE 2: CONFIGURACIÓN DE EMAILS (MANUAL)
-- =====================================================

-- Los emails de verificación NO se pueden configurar por SQL
-- Debes hacerlo MANUALMENTE en Supabase Dashboard:

-- 📧 PASOS PARA HABILITAR EMAILS:
-- 
-- 1. Ve a Supabase Dashboard → Authentication → Email Templates
-- 2. Configura los templates:
--    - Confirm signup
--    - Magic Link
--    - Change Email Address
--    - Reset Password
-- 
-- 3. Ve a Settings → Authentication
-- 4. Habilita "Enable email confirmations" (requiere confirmación de email)
-- 
-- 5. Configura un proveedor de email:
--    OPCIÓN A - SMTP (Resend, SendGrid, etc):
--    - Ve a Settings → Project Settings → SMTP Settings
--    - Agrega credenciales SMTP
--    
--    OPCIÓN B - Variables de entorno en Vercel:
--    - RESEND_API_KEY (recomendado - 100 emails/día gratis)
--    - Obtener en: https://resend.com
-- 
-- 6. Asegúrate de que la URL de confirmación sea correcta:
--    - Site URL: https://marlocookies-5lf83e6f7-pulsars-projects-1970fd6c.vercel.app
--    - Redirect URLs: Agregar tu dominio de producción
--
-- 7. Template recomendado para "Confirm signup":
-- 
--    Subject: Confirma tu cuenta en MarLo Cookies
--    
--    Body:
--    <h2>¡Bienvenido a MarLo Cookies! 🍪</h2>
--    <p>Gracias por registrarte. Haz clic en el botón para confirmar tu cuenta:</p>
--    <a href="{{ .ConfirmationURL }}" style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
--      Confirmar mi cuenta
--    </a>
--    <p>Si no te registraste, puedes ignorar este email.</p>
--    <p>Saludos,<br>El equipo de MarLo Cookies</p>

-- =====================================================
-- RESUMEN DE CAMBIOS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas DELETE agregadas para todas las tablas de admin';
  RAISE NOTICE '⚠️  IMPORTANTE: Debes configurar emails MANUALMENTE en Supabase Dashboard';
  RAISE NOTICE '📧 Sigue las instrucciones en el comentario PARTE 2 de este archivo';
  RAISE NOTICE '🔑 Recomendado: Usar Resend (https://resend.com) - 100 emails/día gratis';
END $$;
