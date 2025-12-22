-- FIX: Habilitar Row Level Security (RLS) en tablas públicas
-- Fecha: 2025-12-17
-- Crítico: Estos errores exponen datos sensibles sin protección

-- ============================================
-- 1. Habilitar RLS en newsletter_subscribers
-- ============================================
-- Esta tabla ya tiene políticas pero RLS no está habilitado
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Verificar políticas existentes
-- Ya tiene: "Admins can delete subscribers", "Admins can view all subscribers", 
--           "Admins full access", "Allow public subscribe"

-- ============================================
-- 2. Habilitar RLS en coupon_uses
-- ============================================
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

-- Crear políticas para coupon_uses
-- Solo admins pueden ver todos los usos de cupones
CREATE POLICY "Admins can view all coupon uses"
ON public.coupon_uses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      SELECT email FROM public.users WHERE rol = 'admin'
    )
  )
);

-- Los usuarios pueden ver sus propios usos de cupones
CREATE POLICY "Users can view their own coupon uses"
ON public.coupon_uses
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Solo admins pueden insertar usos de cupones (el sistema)
CREATE POLICY "Admins can insert coupon uses"
ON public.coupon_uses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      SELECT email FROM public.users WHERE rol = 'admin'
    )
  )
);

-- ============================================
-- Verificación
-- ============================================
-- Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('newsletter_subscribers', 'coupon_uses');

-- Verificar políticas activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('newsletter_subscribers', 'coupon_uses')
ORDER BY tablename, policyname;
