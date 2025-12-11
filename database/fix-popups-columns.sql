-- Agregar columnas faltantes a la tabla popups
-- Ejecutar en Supabase SQL Editor

-- Columnas adicionales para el formulario del admin
ALTER TABLE public.popups 
ADD COLUMN IF NOT EXISTS nombre TEXT,
ADD COLUMN IF NOT EXISTS subtitulo TEXT,
ADD COLUMN IF NOT EXISTS color_fondo TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS color_titulo TEXT DEFAULT '#4A3728',
ADD COLUMN IF NOT EXISTS color_texto TEXT DEFAULT '#666666',
ADD COLUMN IF NOT EXISTS color_boton TEXT DEFAULT '#4A3728',
ADD COLUMN IF NOT EXISTS color_boton_texto TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS gradiente TEXT,
ADD COLUMN IF NOT EXISTS boton_secundario_texto TEXT,
ADD COLUMN IF NOT EXISTS boton_secundario_link TEXT,
ADD COLUMN IF NOT EXISTS mostrar_input_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delay_segundos INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS plantilla TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS mostrar_en TEXT DEFAULT 'todas';

-- Renombrar 'template' a 'plantilla' si existe (para consistencia)
-- Si ya tienes datos, esto puede fallar, entonces lo hacemos con UPDATE
UPDATE public.popups SET plantilla = template WHERE plantilla IS NULL AND template IS NOT NULL;

-- Asegurar que mostrar_en tenga un valor por defecto en registros existentes
UPDATE public.popups SET mostrar_en = 'todas' WHERE mostrar_en IS NULL;

-- Verificar la estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'popups' 
ORDER BY ordinal_position;

-- =====================================================
-- AGREGAR COLUMNAS PARA BANNER DE EDICIONES LIMITADAS
-- =====================================================

-- Columnas para selector de productos y opción de imágenes
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS limited_banner_products TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS limited_banner_show_images BOOLEAN DEFAULT true;

-- Verificar la estructura de site_settings
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
ORDER BY ordinal_position;

-- =====================================================
-- AGREGAR user_id A NEWSLETTER_SUBSCRIBERS
-- =====================================================

-- Columna para enlazar suscriptor con usuario registrado
ALTER TABLE public.newsletter_subscribers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Índice para búsqueda rápida por user_id
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON newsletter_subscribers(user_id);

-- =====================================================
-- TABLA PARA PEDIDOS POR MAYOR (WHOLESALE)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wholesale_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  empresa TEXT,
  tipo_negocio TEXT, -- cafeteria, restaurante, hotel, tienda, eventos, otro
  cantidad_estimada TEXT, -- rango de cantidades mensuales
  productos_interes TEXT, -- qué productos les interesan
  mensaje TEXT,
  estado TEXT DEFAULT 'pendiente', -- pendiente, contactado, en_negociacion, aprobado, rechazado
  notas_admin TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para wholesale_requests
ALTER TABLE public.wholesale_requests ENABLE ROW LEVEL SECURITY;

-- Los admins pueden ver todo
DROP POLICY IF EXISTS "Admins can manage wholesale requests" ON public.wholesale_requests;
CREATE POLICY "Admins can manage wholesale requests"
ON public.wholesale_requests FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.rol = 'admin'
  )
);

-- Los usuarios pueden crear solicitudes
DROP POLICY IF EXISTS "Users can create wholesale requests" ON public.wholesale_requests;
CREATE POLICY "Users can create wholesale requests"
ON public.wholesale_requests FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Los usuarios pueden ver sus propias solicitudes
DROP POLICY IF EXISTS "Users can view own wholesale requests" ON public.wholesale_requests;
CREATE POLICY "Users can view own wholesale requests"
ON public.wholesale_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- AGREGAR cookies_incluidas A ORDER_ITEMS (para boxes)
-- =====================================================

-- Columna para guardar las cookies que van dentro de una box
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS cookies_incluidas JSONB;

-- =====================================================
-- AGREGAR transfer_alias A ORDERS (para confirmar transferencias)
-- =====================================================

-- Columna para guardar el alias de transferencia del cliente
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS transfer_alias TEXT;

-- =====================================================
-- FIX: POLITICAS RLS PARA ORDER_ITEMS
-- =====================================================

-- Eliminar políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Users can insert items in their orders" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

-- Política más permisiva para INSERT: cualquier usuario autenticado puede insertar
-- siempre que la orden exista y le pertenezca
CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_id
      AND orders.user_id = auth.uid()
    )
  );

-- También asegurar que admins puedan insertar
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
  );

-- Verificar que RLS esté habilitado
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
