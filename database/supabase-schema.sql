-- MarLo Cookies - Schema SQL para Supabase
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- ENABLE EXTENSIONS
-- =====================================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE order_status AS ENUM ('preparando', 'en_camino', 'entregado', 'cancelado');
CREATE TYPE payment_method AS ENUM ('efectivo', 'transferencia', 'mercadopago');
CREATE TYPE loyalty_type AS ENUM ('ganado', 'canjeado');

-- =====================================================
-- TABLES
-- =====================================================

-- Tabla: users (extendiendo auth.users de Supabase)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  puntos INTEGER DEFAULT 0,
  avatar TEXT,
  direccion TEXT,
  comuna TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  categoria TEXT NOT NULL,
  imagen TEXT,
  stock INTEGER DEFAULT 0,
  es_limitado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  ingredientes TEXT[],
  alergenos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subtotal DECIMAL(10, 2) NOT NULL,
  envio DECIMAL(10, 2) DEFAULT 0,
  descuento DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  estado order_status DEFAULT 'preparando',
  metodo_pago payment_method NOT NULL,
  direccion TEXT NOT NULL,
  comuna TEXT NOT NULL,
  region TEXT NOT NULL,
  notas TEXT,
  puntos_ganados INTEGER DEFAULT 0,
  puntos_usados INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: order_items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  nombre TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  cantidad INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: loyalty_history
CREATE TABLE public.loyalty_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tipo loyalty_type NOT NULL,
  puntos INTEGER NOT NULL,
  concepto TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: newsletter_subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  nombre TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: contact_messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  asunto TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_products_categoria ON public.products(categoria);
CREATE INDEX idx_products_activo ON public.products(activo);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_estado ON public.orders(estado);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_loyalty_history_user_id ON public.loyalty_history(user_id);
CREATE INDEX idx_loyalty_history_created_at ON public.loyalty_history(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear usuario automáticamente después del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nombre, apellido)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', 'Nuevo')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar puntos cuando el pedido se marca como entregado
CREATE OR REPLACE FUNCTION public.update_loyalty_points_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el estado cambió a 'entregado' y no es el estado anterior
  IF NEW.estado = 'entregado' AND OLD.estado != 'entregado' THEN
    -- Actualizar puntos del usuario
    UPDATE public.users
    SET puntos = puntos + NEW.puntos_ganados - NEW.puntos_usados
    WHERE id = NEW.user_id;

    -- Registrar puntos ganados en historial
    IF NEW.puntos_ganados > 0 THEN
      INSERT INTO public.loyalty_history (user_id, tipo, puntos, concepto, order_id)
      VALUES (NEW.user_id, 'ganado', NEW.puntos_ganados, 'Puntos por compra', NEW.id);
    END IF;

    -- Registrar puntos usados en historial
    IF NEW.puntos_usados > 0 THEN
      INSERT INTO public.loyalty_history (user_id, tipo, puntos, concepto, order_id)
      VALUES (NEW.user_id, 'canjeado', NEW.puntos_usados, 'Descuento en compra', NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar puntos automáticamente
CREATE TRIGGER on_order_delivered
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loyalty_points_on_delivery();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para products (lectura pública, escritura solo admin)
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (activo = TRUE);

-- Políticas para orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id AND estado = 'preparando');

-- Políticas para order_items
CREATE POLICY "Users can view items from their orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items in their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Políticas para loyalty_history
CREATE POLICY "Users can view their own loyalty history"
  ON public.loyalty_history FOR SELECT
  USING (auth.uid() = user_id);

-- Políticas para newsletter (solo INSERT público)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Políticas para contact_messages (solo INSERT público)
CREATE POLICY "Anyone can send contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para obtener productos por categoría
CREATE OR REPLACE FUNCTION get_products_by_category(category_name TEXT)
RETURNS SETOF public.products AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.products
  WHERE categoria = category_name AND activo = TRUE
  ORDER BY nombre;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para calcular total de pedidos de un usuario
CREATE OR REPLACE FUNCTION get_user_total_orders(user_uuid UUID)
RETURNS TABLE(
  total_pedidos BIGINT,
  total_gastado DECIMAL,
  puntos_acumulados INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_pedidos,
    COALESCE(SUM(total), 0)::DECIMAL as total_gastado,
    COALESCE(SUM(puntos_ganados), 0)::INTEGER as puntos_acumulados
  FROM public.orders
  WHERE user_id = user_uuid AND estado = 'entregado';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE public.users IS 'Usuarios del sistema, extiende auth.users de Supabase';
COMMENT ON TABLE public.products IS 'Catálogo de productos (cookies, boxes, bebidas, etc.)';
COMMENT ON TABLE public.orders IS 'Pedidos realizados por los usuarios';
COMMENT ON TABLE public.order_items IS 'Detalles de los items en cada pedido';
COMMENT ON TABLE public.loyalty_history IS 'Historial de transacciones de puntos de lealtad';
COMMENT ON TABLE public.newsletter_subscribers IS 'Suscriptores al newsletter';
COMMENT ON TABLE public.contact_messages IS 'Mensajes del formulario de contacto';

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant permissions para authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions para anon users (lectura limitada)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.products TO anon;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT INSERT ON public.contact_messages TO anon;
