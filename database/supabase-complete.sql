-- MarLo Cookies - Schema y Seed Combinado
-- Uruguay - Maldonado Edition
-- 
-- INSTRUCCIONES:
-- 1. Ir a Supabase Dashboard > SQL Editor
-- 2. Copiar y pegar TODO este archivo
-- 3. Ejecutar (Run)

-- ===========================================
-- LIMPIAR TABLAS EXISTENTES
-- ===========================================
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS coupon_uses CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS delivery_zones CASCADE;
DROP TABLE IF EXISTS loyalty_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===========================================
-- TABLAS PRINCIPALES
-- ===========================================

-- Usuarios
CREATE TABLE users (
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
CREATE TABLE products (
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
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  department VARCHAR(100) DEFAULT 'Maldonado',
  zone VARCHAR(100),
  address TEXT NOT NULL,
  address_references TEXT,
  delivery_type VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
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
CREATE TABLE order_items (
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
CREATE TABLE loyalty_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  puntos INTEGER NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- TABLAS ADICIONALES
-- ===========================================

-- Cupones de Descuento
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  valor INTEGER NOT NULL,
  minimo INTEGER DEFAULT 0,
  max_usos INTEGER,
  usos_actuales INTEGER DEFAULT 0,
  valido_desde TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valido_hasta TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uso de Cupones
CREATE TABLE coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id),
  order_id UUID REFERENCES orders(id),
  user_id UUID REFERENCES users(id),
  discount_applied INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zonas de Delivery
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  cost INTEGER NOT NULL,
  estimated_time VARCHAR(50),
  available BOOLEAN DEFAULT true,
  order_priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Postulaciones de Trabajo
CREATE TABLE job_applications (
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
  estado VARCHAR(50) DEFAULT 'pendiente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mensajes de Contacto
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  asunto VARCHAR(255),
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suscriptores Newsletter
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notificaciones
CREATE TABLE notifications (
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

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_estado ON orders(estado);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_products_categoria ON products(categoria);
CREATE INDEX idx_products_activo ON products(activo);
CREATE INDEX idx_loyalty_history_user_id ON loyalty_history(user_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_job_applications_estado ON job_applications(estado);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ===========================================
-- FUNCIONES Y TRIGGERS
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Policies para loyalty_history
CREATE POLICY "Users can view own loyalty history" ON loyalty_history
  FOR SELECT USING (auth.uid() = user_id);

-- Policies para notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Productos públicos
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Cupones activos públicos
CREATE POLICY "Active coupons are viewable" ON coupons
  FOR SELECT USING (activo = true);

-- Zonas de delivery públicas
CREATE POLICY "Delivery zones are viewable" ON delivery_zones
  FOR SELECT USING (true);

-- Job applications - solo insertar
CREATE POLICY "Anyone can submit job applications" ON job_applications
  FOR INSERT WITH CHECK (true);

-- Contact messages - solo insertar
CREATE POLICY "Anyone can send contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Newsletter - insertar y actualizar
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Subscribers can update their preferences" ON newsletter_subscribers
  FOR UPDATE USING (true);

-- ===========================================
-- DATOS DE PRUEBA - PRODUCTOS
-- ===========================================

INSERT INTO products (nombre, descripcion, precio, categoria, stock, es_limitado, imagen) VALUES
-- Cookies Clásicas
('Chocolate Chip Classic', 'La clásica cookie con chips de chocolate belga. Crujiente por fuera, suave por dentro.', 120, 'cookies', 50, false, '/IMG/productos/chocolate-chip.jpg'),
('Double Chocolate', 'Para los amantes del chocolate. Masa de chocolate con chips blancos y negros.', 140, 'cookies', 45, false, '/IMG/productos/double-chocolate.jpg'),
('Red Velvet', 'Cookie de terciopelo rojo con chips de chocolate blanco y un toque de cacao.', 150, 'cookies', 40, false, '/IMG/productos/red-velvet.jpg'),
('Cookies & Cream', 'Galleta de vainilla con trozos de galleta Oreo. La favorita de los niños.', 130, 'cookies', 55, false, '/IMG/productos/cookies-cream.jpg'),
('Dulce de Leche', 'Cookie rellena con dulce de leche uruguayo. Un clásico irresistible.', 160, 'cookies', 35, false, '/IMG/productos/dulce-de-leche.jpg'),
('Alfajor Cookie', 'Inspirada en el alfajor. Dos cookies unidas con dulce de leche y bañadas en chocolate.', 180, 'cookies', 30, true, '/IMG/productos/alfajor-cookie.jpg'),

-- Cookies Premium
('Nutella Stuffed', 'Cookie rellena de Nutella. Explosión de sabor en cada mordida.', 170, 'cookies', 40, false, '/IMG/productos/nutella-stuffed.jpg'),
('Pistacho & Chocolate Blanco', 'Combinación gourmet de pistacho real y chocolate blanco premium.', 190, 'cookies', 25, true, '/IMG/productos/pistacho.jpg'),
('Salted Caramel', 'Caramelo salado artesanal con chips de chocolate y flor de sal.', 165, 'cookies', 35, false, '/IMG/productos/salted-caramel.jpg'),
('Peanut Butter', 'Cookie con mantequilla de maní natural y chips de chocolate.', 155, 'cookies', 40, false, '/IMG/productos/peanut-butter.jpg'),

-- Bebidas
('Café Americano', 'Café de especialidad, granos uruguayos tostados artesanalmente.', 90, 'bebidas', 100, false, '/IMG/productos/cafe-americano.jpg'),
('Latte', 'Espresso con leche vaporizada. Disponible con leche vegetal.', 110, 'bebidas', 100, false, '/IMG/productos/latte.jpg'),
('Chocolate Caliente', 'Chocolate belga derretido con leche. Perfecto para acompañar cookies.', 100, 'bebidas', 100, false, '/IMG/productos/chocolate-caliente.jpg'),
('Té Premium', 'Selección de tés importados. Earl Grey, English Breakfast, Verde.', 80, 'bebidas', 100, false, '/IMG/productos/te.jpg'),
('Milkshake de Cookies', 'Batido cremoso con trozos de cookie. Sabores: Chocolate, Dulce de Leche, Vainilla.', 180, 'bebidas', 50, false, '/IMG/productos/milkshake.jpg'),

-- Boxes
('Box de 6 Cookies', 'Selección de 6 cookies a tu elección. Perfecta para compartir.', 650, 'boxes', 30, false, '/IMG/productos/box-6.jpg'),
('Box de 12 Cookies', 'Caja premium con 12 cookies surtidas. Ideal para eventos.', 1200, 'boxes', 20, false, '/IMG/productos/box-12.jpg'),
('Box Familiar (24)', 'Mega box con 24 cookies. La mejor opción para familias y reuniones.', 2200, 'boxes', 15, false, '/IMG/productos/box-24.jpg'),
('Box Regalo Especial', 'Caja de regalo con 8 cookies premium, tarjeta personalizada y lazo.', 900, 'boxes', 25, false, '/IMG/productos/box-regalo.jpg'),

-- Otros
('Helado Artesanal', 'Helado de vainilla artesanal. Combina perfecto con cualquier cookie caliente.', 120, 'otros', 40, false, '/IMG/productos/helado.jpg'),
('Cookie Brownie', 'Mitad cookie, mitad brownie. Lo mejor de dos mundos.', 160, 'otros', 30, false, '/IMG/productos/brookie.jpg');

-- ===========================================
-- DATOS DE PRUEBA - ZONAS DE DELIVERY
-- ===========================================

INSERT INTO delivery_zones (name, cost, estimated_time, available, order_priority) VALUES
('Centro', 80, '30-45 min', true, 1),
('Punta del Este', 100, '45-60 min', true, 2),
('La Barra', 150, '60-90 min', true, 3),
('Manantiales', 180, '60-90 min', true, 4),
('José Ignacio', 250, '90-120 min', true, 5),
('San Carlos', 120, '45-60 min', true, 6),
('Piriápolis', 200, '60-90 min', true, 7),
('Pan de Azúcar', 180, '60-90 min', true, 8),
('Aiguá', 250, '90-120 min', false, 9);

-- ===========================================
-- DATOS DE PRUEBA - CUPONES
-- ===========================================

INSERT INTO coupons (code, tipo, valor, minimo, max_usos, valido_hasta, activo) VALUES
('BIENVENIDO', 'porcentaje', 15, 500, 100, NOW() + INTERVAL '3 months', true),
('VERANO2025', 'porcentaje', 10, 300, 200, '2025-03-31', true),
('PRIMERACOMPRA', 'fijo', 100, 400, NULL, NOW() + INTERVAL '1 year', true),
('ENVIOGRATIS', 'fijo', 150, 800, 50, NOW() + INTERVAL '1 month', true),
('AMIGOS20', 'porcentaje', 20, 1000, 30, NOW() + INTERVAL '2 months', true);

-- ===========================================
-- NOTA IMPORTANTE
-- ===========================================
-- El usuario admin debe crearse a través de Supabase Auth:
-- 1. Ir a Authentication > Users
-- 2. Crear usuario con email: admin@marlocookies.com
-- 3. Luego ejecutar:
-- UPDATE users SET rol = 'admin' WHERE email = 'admin@marlocookies.com';
