-- ============================================================================
-- FASE 1: MULTI-LOCATION STEALTH MIGRATION
-- ============================================================================
-- Esta migración NO activa nada. Solo crea la infraestructura.
-- El "botón rojo" es site_settings.multi_location_enabled (default FALSE).
-- Mientras esté en FALSE, la app funciona exactamente igual que antes.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. TABLA LOCATIONS (sucursales)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,                 -- 'maldonado', 'montevideo'
  nombre text NOT NULL,                      -- 'Maldonado', 'Montevideo'
  direccion text,
  telefono text,
  latitud numeric,
  longitud numeric,
  business_hours jsonb DEFAULT '[]'::jsonb,
  maintenance_mode jsonb DEFAULT '{"enabled": false, "message": ""}'::jsonb,
  delivery_notice jsonb DEFAULT '{"enabled": false, "message": ""}'::jsonb,
  blocked_delivery_days jsonb DEFAULT '[]'::jsonb,
  pedidosya_url text,
  activo boolean DEFAULT true,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT locations_pkey PRIMARY KEY (id)
);

-- Seed: Maldonado (local actual) y Montevideo (preparado, inactivo)
INSERT INTO public.locations (slug, nombre, direccion, activo, orden, business_hours)
VALUES 
  ('maldonado', 'Maldonado', 'Av. Juan Gorlero, Punta del Este', true, 1,
    '[{"day": "Viernes - Domingo", "open": true, "hours": "15:00 - 20:00"}, {"day": "Lunes - Jueves", "open": false, "hours": "Cerrado"}]'::jsonb),
  ('montevideo', 'Montevideo', '', false, 2,
    '[{"day": "Viernes - Domingo", "open": true, "hours": "15:00 - 20:00"}, {"day": "Lunes - Jueves", "open": false, "hours": "Cerrado"}]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. TABLA PRODUCT_STOCK (stock por local, paralela al stock global)
-- ----------------------------------------------------------------------------
-- No reemplaza products.stock (queda como fallback/global).
-- Cuando multi_location_enabled = true, el stock se lee de acá.
CREATE TABLE IF NOT EXISTS public.product_stock (
  product_id uuid NOT NULL,
  location_id uuid NOT NULL,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_stock_pkey PRIMARY KEY (product_id, location_id),
  CONSTRAINT product_stock_product_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT product_stock_location_fk FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_stock_location ON public.product_stock(location_id);

-- Pre-cargar el stock actual de todos los productos a Maldonado
INSERT INTO public.product_stock (product_id, location_id, stock)
SELECT p.id, l.id, COALESCE(p.stock, 0)
FROM public.products p
CROSS JOIN public.locations l
WHERE l.slug = 'maldonado'
ON CONFLICT (product_id, location_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. AGREGAR location_id A TABLAS EXISTENTES (nullable, no rompe nada)
-- ----------------------------------------------------------------------------

-- Orders: qué local procesa el pedido
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);
CREATE INDEX IF NOT EXISTS idx_orders_location ON public.orders(location_id);

-- Delivery zones: cada local tiene sus zonas
ALTER TABLE public.delivery_zones_geo 
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_geo_location ON public.delivery_zones_geo(location_id);

ALTER TABLE public.delivery_zones 
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);

-- Migrar datos existentes a Maldonado
UPDATE public.orders o
SET location_id = (SELECT id FROM public.locations WHERE slug = 'maldonado')
WHERE o.location_id IS NULL;

UPDATE public.delivery_zones_geo
SET location_id = (SELECT id FROM public.locations WHERE slug = 'maldonado')
WHERE location_id IS NULL;

UPDATE public.delivery_zones
SET location_id = (SELECT id FROM public.locations WHERE slug = 'maldonado')
WHERE location_id IS NULL;

-- ----------------------------------------------------------------------------
-- 4. USERS: ROLES GRANULARES PARA ADMINS
-- ----------------------------------------------------------------------------
-- Mantiene 'rol' tal cual (compatibilidad). Agrega admin_location_id e is_superadmin.
-- Cuando multi_location_enabled = false → solo mira users.rol (como hoy)
-- Cuando multi_location_enabled = true → mira is_superadmin + admin_location_id

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS admin_location_id uuid REFERENCES public.locations(id),
  ADD COLUMN IF NOT EXISTS is_superadmin boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_admin_location ON public.users(admin_location_id) WHERE admin_location_id IS NOT NULL;

-- Los admins actuales → superadmin (para que no pierdan acceso al activar el flag)
UPDATE public.users 
SET is_superadmin = true 
WHERE rol = 'admin';

-- ----------------------------------------------------------------------------
-- 5. EL "BOTÓN ROJO": flag maestro en site_settings
-- ----------------------------------------------------------------------------
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS multi_location_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_location_id uuid REFERENCES public.locations(id);

-- Default location = Maldonado
UPDATE public.site_settings
SET default_location_id = (SELECT id FROM public.locations WHERE slug = 'maldonado')
WHERE default_location_id IS NULL AND id = 'main';

-- ----------------------------------------------------------------------------
-- 6. ÍNDICES DE PERFORMANCE (independientes del multi-local, mejoran la app ya)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_estado ON public.orders(estado);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_activo ON public.products(activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_products_categoria ON public.products(categoria);
CREATE INDEX IF NOT EXISTS idx_loyalty_history_user_id ON public.loyalty_history(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_history_expires_at ON public.loyalty_history(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupon_uses_user_id ON public.coupon_uses(user_id);
CREATE INDEX IF NOT EXISTS idx_users_rol ON public.users(rol);

-- ----------------------------------------------------------------------------
-- 7. RLS PARA NUEVAS TABLAS
-- ----------------------------------------------------------------------------
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

-- Locations: lectura pública, escritura solo admin
DROP POLICY IF EXISTS "locations_read_public" ON public.locations;
CREATE POLICY "locations_read_public" ON public.locations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "locations_write_admin" ON public.locations;
CREATE POLICY "locations_write_admin" ON public.locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.rol = 'admin' OR u.is_superadmin = true))
  );

-- Product stock: lectura pública, escritura solo admin
DROP POLICY IF EXISTS "product_stock_read_public" ON public.product_stock;
CREATE POLICY "product_stock_read_public" ON public.product_stock
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "product_stock_write_admin" ON public.product_stock;
CREATE POLICY "product_stock_write_admin" ON public.product_stock
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.rol = 'admin' OR u.is_superadmin = true))
  );

-- ----------------------------------------------------------------------------
-- 8. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Función: obtener ubicación por slug (útil en queries)
CREATE OR REPLACE FUNCTION public.get_location_by_slug(location_slug text)
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT id FROM public.locations WHERE slug = location_slug LIMIT 1;
$$;

-- Función: check si multi-location está activo
CREATE OR REPLACE FUNCTION public.is_multi_location_enabled()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE((SELECT multi_location_enabled FROM public.site_settings WHERE id = 'main'), false);
$$;

-- ----------------------------------------------------------------------------
-- COMENTARIOS DE DOCUMENTACIÓN
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.locations IS 'Sucursales/locales. Habilitado por site_settings.multi_location_enabled';
COMMENT ON TABLE public.product_stock IS 'Stock por sucursal. Activo cuando multi_location_enabled=true';
COMMENT ON COLUMN public.orders.location_id IS 'Sucursal que procesa el pedido (NULL = legacy / pre-multi-location)';
COMMENT ON COLUMN public.users.is_superadmin IS 'Acceso a todos los locales. Anula admin_location_id';
COMMENT ON COLUMN public.users.admin_location_id IS 'Si rol=admin y is_superadmin=false, solo gestiona este local';
COMMENT ON COLUMN public.site_settings.multi_location_enabled IS 'EL BOTÓN ROJO: activa todo el sistema multi-sucursal';

COMMIT;

-- ============================================================================
-- VERIFICACIÓN POST-MIGRACIÓN (ejecutar después)
-- ============================================================================
-- SELECT * FROM public.locations;
-- SELECT COUNT(*) FROM public.product_stock;
-- SELECT multi_location_enabled FROM public.site_settings WHERE id = 'main';
-- SELECT id, email, rol, is_superadmin, admin_location_id FROM public.users WHERE rol = 'admin';
