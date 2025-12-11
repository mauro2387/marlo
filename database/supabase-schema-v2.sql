-- MarLo Cookies - Supabase Schema Actualizado
-- Uruguay - Maldonado Edition
-- 
-- IMPORTANTE: Ejecutar este script en el SQL Editor de Supabase
-- Si hay tablas existentes, hacer DROP primero o usar las migraciones

-- ===========================================
-- LIMPIAR TABLAS EXISTENTES (OPCIONAL - descomentar si necesario)
-- ===========================================
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS job_applications CASCADE;
-- DROP TABLE IF EXISTS coupon_uses CASCADE;
-- DROP TABLE IF EXISTS coupons CASCADE;
-- DROP TABLE IF EXISTS delivery_zones CASCADE;
-- DROP TABLE IF EXISTS loyalty_history CASCADE;
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ===========================================
-- TABLAS PRINCIPALES
-- ===========================================

-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  telefono VARCHAR(50),
  puntos INTEGER DEFAULT 0,
  avatar TEXT,
  direccion TEXT,
  zona VARCHAR(100),
  departamento VARCHAR(100) DEFAULT 'Maldonado',
  rol VARCHAR(50) DEFAULT 'cliente',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio INTEGER NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  imagen TEXT,
  stock INTEGER DEFAULT 100,
  es_limitado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  ingredientes TEXT[],
  alergenos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  department VARCHAR(100) DEFAULT 'Maldonado',
  zone VARCHAR(100),
  address TEXT NOT NULL,
  address_references TEXT,
  delivery_type VARCHAR(50) NOT NULL, -- 'delivery' | 'retiro'
  payment_method VARCHAR(50) NOT NULL, -- 'efectivo' | 'transferencia' | 'mercadopago'
  subtotal INTEGER NOT NULL,
  discount_coupon INTEGER DEFAULT 0,
  discount_points INTEGER DEFAULT 0,
  shipping_cost INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  points_used INTEGER DEFAULT 0,
  coupon_code VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'pendiente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items de Pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historial de Puntos
CREATE TABLE IF NOT EXISTS loyalty_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'ganado' | 'canjeado'
  puntos INTEGER NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- NUEVAS TABLAS
-- ===========================================

-- Cupones de Descuento
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'porcentaje' | 'fijo'
  valor INTEGER NOT NULL, -- Porcentaje (1-100) o monto fijo
  minimo INTEGER DEFAULT 0, -- Mínimo de compra para aplicar
  max_usos INTEGER, -- NULL = ilimitado
  usos_actuales INTEGER DEFAULT 0,
  valido_desde TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valido_hasta TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uso de Cupones (registro)
CREATE TABLE IF NOT EXISTS coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id),
  order_id UUID REFERENCES orders(id),
  user_id UUID REFERENCES users(id),
  discount_applied INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zonas de Delivery
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  cost INTEGER NOT NULL,
  estimated_time VARCHAR(50),
  available BOOLEAN DEFAULT true,
  order_priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Postulaciones de Trabajo
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  age INTEGER,
  experience TEXT,
  availability VARCHAR(100),
  motivation TEXT,
  cv_url TEXT,
  estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente' | 'revisado' | 'contactado' | 'descartado'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- ÍNDICES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_estado ON orders(estado);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria);
CREATE INDEX IF NOT EXISTS idx_products_activo ON products(activo);
CREATE INDEX IF NOT EXISTS idx_loyalty_history_user_id ON loyalty_history(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_job_applications_estado ON job_applications(estado);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ===========================================
-- FUNCIONES
-- ===========================================

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies para usuarios
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policies para pedidos
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Policies para order_items
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- Policies para loyalty_history
CREATE POLICY "Users can view own loyalty history" ON loyalty_history
  FOR SELECT USING (auth.uid() = user_id);

-- Policies para notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Productos y cupones son públicos (solo lectura)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active coupons are viewable" ON coupons
  FOR SELECT USING (activo = true);

ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Delivery zones are viewable" ON delivery_zones
  FOR SELECT USING (true);

-- Job applications - solo insertar
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit job applications" ON job_applications
  FOR INSERT WITH CHECK (true);
