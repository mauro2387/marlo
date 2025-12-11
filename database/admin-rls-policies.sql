-- =====================================================
-- POLÍTICAS RLS PARA ADMIN - MarLo Cookies
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Agregar columna 'rol' a users si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'rol'
  ) THEN
    ALTER TABLE public.users ADD COLUMN rol TEXT DEFAULT 'cliente';
  END IF;
END $$;

-- 2. Crear función helper para verificar si es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND rol IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear función helper para verificar si es admin por email
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email IN ('admin@marlocookies.com', 'antorivero.work@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS PARA PRODUCTS (ADMIN)
-- =====================================================

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can create products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Lectura pública de productos activos
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (activo = TRUE OR public.is_admin_by_email());

-- Admins pueden crear productos
CREATE POLICY "Admins can create products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin_by_email());

-- Admins pueden actualizar productos
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin_by_email());

-- Admins pueden eliminar productos
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin_by_email());

-- =====================================================
-- POLÍTICAS PARA ORDERS (ADMIN)
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own pending orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update any order" ON public.orders;

-- Usuarios pueden ver sus pedidos, admins pueden ver todos
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_by_email());

-- Usuarios autenticados pueden crear pedidos
CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Usuarios pueden actualizar sus pedidos pendientes, admins pueden actualizar todos
CREATE POLICY "Users can update their own pending orders"
  ON public.orders FOR UPDATE
  USING (
    (auth.uid() = user_id AND estado = 'preparando')
    OR public.is_admin_by_email()
  );

-- =====================================================
-- POLÍTICAS PARA ORDER_ITEMS (ADMIN)
-- =====================================================

DROP POLICY IF EXISTS "Users can view items from their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert items in their orders" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Usuarios ven items de sus pedidos, admins ven todos
CREATE POLICY "Users can view items from their orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin_by_email())
    )
  );

-- Usuarios pueden insertar items en sus pedidos
CREATE POLICY "Users can insert items in their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR auth.uid() IS NOT NULL)
    )
  );

-- =====================================================
-- POLÍTICAS PARA USERS (ADMIN)
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

-- Usuarios ven su perfil, admins ven todos
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR public.is_admin_by_email());

-- Usuarios actualizan su perfil, admins actualizan todos
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR public.is_admin_by_email());

-- =====================================================
-- POLÍTICAS PARA COUPONS
-- =====================================================

-- Crear tabla de cupones si no existe
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'porcentaje', -- 'porcentaje' o 'fijo'
  valor DECIMAL(10, 2) NOT NULL,
  minimo DECIMAL(10, 2) DEFAULT 0,
  max_usos INTEGER,
  usos_actuales INTEGER DEFAULT 0,
  valido_desde TIMESTAMPTZ DEFAULT NOW(),
  valido_hasta TIMESTAMPTZ,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

-- Lectura pública de cupones activos para validación
CREATE POLICY "Anyone can read active coupons"
  ON public.coupons FOR SELECT
  USING (activo = TRUE OR public.is_admin_by_email());

-- Admins pueden gestionar cupones
CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin_by_email());

-- =====================================================
-- POLÍTICAS PARA DELIVERY_ZONES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estimated_time TEXT DEFAULT '30-45 min',
  available BOOLEAN DEFAULT TRUE,
  order_priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read delivery zones" ON public.delivery_zones;
DROP POLICY IF EXISTS "Admins can manage delivery zones" ON public.delivery_zones;

-- Lectura pública de zonas disponibles
CREATE POLICY "Anyone can read delivery zones"
  ON public.delivery_zones FOR SELECT
  USING (TRUE);

-- Admins pueden gestionar zonas
CREATE POLICY "Admins can manage delivery zones"
  ON public.delivery_zones FOR ALL
  USING (public.is_admin_by_email());

-- =====================================================
-- POLÍTICAS PARA JOB_APPLICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  experience TEXT,
  availability TEXT,
  motivation TEXT,
  cv_url TEXT,
  estado TEXT DEFAULT 'pendiente',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit job application" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can manage job applications" ON public.job_applications;

-- Cualquiera puede postularse
CREATE POLICY "Anyone can submit job application"
  ON public.job_applications FOR INSERT
  WITH CHECK (TRUE);

-- Solo admins pueden ver y gestionar postulaciones
CREATE POLICY "Admins can manage job applications"
  ON public.job_applications FOR ALL
  USING (public.is_admin_by_email());

-- =====================================================
-- GRANTS ADICIONALES
-- =====================================================

GRANT SELECT ON public.coupons TO anon;
GRANT SELECT ON public.delivery_zones TO anon;
GRANT INSERT ON public.job_applications TO anon;
GRANT ALL ON public.coupons TO authenticated;
GRANT ALL ON public.delivery_zones TO authenticated;
GRANT ALL ON public.job_applications TO authenticated;

-- =====================================================
-- CONFIGURAR USUARIO ADMIN INICIAL
-- =====================================================

-- Actualizar usuarios existentes con emails de admin
UPDATE public.users 
SET rol = 'admin' 
WHERE email IN ('admin@marlocookies.com', 'antorivero.work@gmail.com');

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS de admin configuradas correctamente';
  RAISE NOTICE '📧 Admins configurados: admin@marlocookies.com, antorivero.work@gmail.com';
END $$;
