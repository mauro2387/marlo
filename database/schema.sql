-- MarLo Cookies - Database Schema
-- PostgreSQL 14+

-- ===============================
-- 1. EXTENSIONS
-- ===============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================
-- 2. ENUMS
-- ===============================

CREATE TYPE order_status AS ENUM (
    'Pendiente',
    'En producción',
    'Listo para retirar',
    'Entregado',
    'Cancelado'
);

CREATE TYPE payment_method AS ENUM (
    'Efectivo',
    'Transferencia',
    'Mercado Pago',
    'Tarjeta débito',
    'Tarjeta crédito'
);

CREATE TYPE delivery_method AS ENUM (
    'Retiro en local',
    'Envío a domicilio'
);

CREATE TYPE product_category AS ENUM (
    'Cookies',
    'Cookie especial',
    'Boxes',
    'Rolls',
    'Toppings',
    'Postres',
    'Alfajores',
    'Bebidas'
);

CREATE TYPE loyalty_type AS ENUM (
    'suma',
    'canje',
    'ajuste'
);

-- ===============================
-- 3. ROLES
-- ===============================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    permisos JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles predefinidos
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('Admin', 'Acceso total al sistema', '{"all": true}'),
('Producción', 'Gestión de pedidos y producción', '{"orders": ["read", "update"], "products": ["read"]}'),
('Caja', 'Gestión de pagos y cierres', '{"orders": ["read", "update"], "finance": ["read", "write"], "cash_register": ["read", "write"]}'),
('Marketing', 'Gestión de campañas y clientes', '{"customers": ["read", "write"], "campaigns": ["read", "write"], "promotions": ["read", "write"]}'),
('Soporte', 'Atención al cliente y reclamos', '{"customers": ["read"], "orders": ["read"], "support": ["read", "write"]}'),
('Cliente', 'Usuario final del e-commerce', '{"orders": ["create", "read_own"], "profile": ["read", "write"]}');

-- ===============================
-- 4. USERS
-- ===============================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE,
    puntos_totales INTEGER DEFAULT 0 CHECK (puntos_totales >= 0),
    direccion TEXT,
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(10),
    notas_internas TEXT,
    blacklist BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telefono ON users(telefono);
CREATE INDEX idx_users_nombre_apellido ON users(nombre, apellido);
CREATE INDEX idx_users_puntos ON users(puntos_totales);

-- ===============================
-- 5. USER_ROLES
-- ===============================

CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    asignado_por UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- ===============================
-- 6. PRODUCTS
-- ===============================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria product_category NOT NULL,
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    imagen_url VARCHAR(500),
    es_fijo BOOLEAN DEFAULT TRUE,
    es_limitado BOOLEAN DEFAULT FALSE,
    fecha_inicio DATE,
    fecha_fin DATE,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    stock_minimo INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 0,
    ingredientes TEXT[],
    alergenos TEXT[],
    calorias INTEGER,
    peso_gramos INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_categoria ON products(categoria);
CREATE INDEX idx_products_visible ON products(visible);
CREATE INDEX idx_products_limitado ON products(es_limitado, fecha_inicio, fecha_fin);

-- ===============================
-- 7. ORDERS
-- ===============================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_pedido SERIAL UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    descuento DECIMAL(10, 2) DEFAULT 0 CHECK (descuento >= 0),
    envio DECIMAL(10, 2) DEFAULT 0 CHECK (envio >= 0),
    metodo_pago payment_method NOT NULL,
    metodo_entrega delivery_method NOT NULL,
    estado order_status DEFAULT 'Pendiente',
    direccion_entrega TEXT,
    ciudad_entrega VARCHAR(100),
    codigo_postal_entrega VARCHAR(10),
    telefono_contacto VARCHAR(20),
    notas TEXT,
    cupon_codigo VARCHAR(50),
    puntos_usados INTEGER DEFAULT 0,
    puntos_ganados INTEGER DEFAULT 0,
    confirmado_whatsapp BOOLEAN DEFAULT FALSE,
    fecha_confirmacion TIMESTAMP,
    fecha_produccion TIMESTAMP,
    fecha_listo TIMESTAMP,
    fecha_entregado TIMESTAMP,
    fecha_cancelado TIMESTAMP,
    razon_cancelacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_estado ON orders(estado);
CREATE INDEX idx_orders_fecha ON orders(created_at DESC);
CREATE INDEX idx_orders_numero ON orders(numero_pedido);

-- ===============================
-- 8. ORDER_ITEMS
-- ===============================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    nombre_producto VARCHAR(255) NOT NULL, -- Snapshot del nombre
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ===============================
-- 9. LOYALTY_HISTORY
-- ===============================

CREATE TABLE loyalty_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    tipo loyalty_type NOT NULL,
    puntos INTEGER NOT NULL,
    saldo_anterior INTEGER NOT NULL,
    saldo_nuevo INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loyalty_user ON loyalty_history(user_id, created_at DESC);
CREATE INDEX idx_loyalty_order ON loyalty_history(order_id);

-- ===============================
-- 10. COUPONS (Cupones)
-- ===============================

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    tipo CHAR(10) CHECK (tipo IN ('porcentaje', 'monto_fijo')),
    valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
    monto_minimo DECIMAL(10, 2) DEFAULT 0,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    usos_maximos INTEGER,
    usos_actuales INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_codigo ON coupons(codigo);
CREATE INDEX idx_coupons_activo ON coupons(activo, fecha_inicio, fecha_fin);

-- ===============================
-- 11. COUPON_USAGE
-- ===============================

CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    descuento_aplicado DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user ON coupon_usage(user_id);

-- ===============================
-- 12. CASH_REGISTER (Caja)
-- ===============================

CREATE TABLE cash_register (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha DATE NOT NULL UNIQUE,
    saldo_inicial DECIMAL(10, 2) DEFAULT 0,
    total_efectivo DECIMAL(10, 2) DEFAULT 0,
    total_transferencia DECIMAL(10, 2) DEFAULT 0,
    total_mercadopago DECIMAL(10, 2) DEFAULT 0,
    total_tarjeta_debito DECIMAL(10, 2) DEFAULT 0,
    total_tarjeta_credito DECIMAL(10, 2) DEFAULT 0,
    total_general DECIMAL(10, 2) DEFAULT 0,
    cantidad_pedidos INTEGER DEFAULT 0,
    gastos DECIMAL(10, 2) DEFAULT 0,
    notas TEXT,
    cerrado BOOLEAN DEFAULT FALSE,
    cerrado_por UUID REFERENCES users(id),
    fecha_cierre TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cash_register_fecha ON cash_register(fecha DESC);

-- ===============================
-- 13. EXPENSES (Gastos)
-- ===============================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha DATE NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    categoria VARCHAR(100),
    metodo_pago payment_method,
    registrado_por UUID REFERENCES users(id),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_fecha ON expenses(fecha DESC);

-- ===============================
-- 14. CONFIG
-- ===============================

CREATE TABLE config (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    descripcion TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuraciones por defecto
INSERT INTO config (clave, valor, descripcion) VALUES
('loyalty_rules', '{
    "puntos_por_peso": 1,
    "canjes": [
        {"puntos": 2000, "descripcion": "1 café + 1 cookie"},
        {"puntos": 5000, "descripcion": "1 box x4 gratis"},
        {"puntos": 10000, "descripcion": "1 box x6 gratis"}
    ]
}', 'Reglas del sistema de puntos'),

('delivery_costs', '{
    "zona_1": 100,
    "zona_2": 150,
    "zona_3": 200,
    "gratis_desde": 2000
}', 'Costos de envío por zona'),

('business_hours', '{
    "lunes": {"abierto": "10:00", "cerrado": "20:00"},
    "martes": {"abierto": "10:00", "cerrado": "20:00"},
    "miercoles": {"abierto": "10:00", "cerrado": "20:00"},
    "jueves": {"abierto": "10:00", "cerrado": "20:00"},
    "viernes": {"abierto": "10:00", "cerrado": "22:00"},
    "sabado": {"abierto": "11:00", "cerrado": "22:00"},
    "domingo": {"cerrado": true}
}', 'Horarios de atención'),

('payment_fees', '{
    "mercadopago": 5.0,
    "tarjeta_credito": 3.5
}', 'Recargos por método de pago (%)'),

('whatsapp', '{
    "phone_id": "",
    "api_key": "",
    "templates": {
        "order_confirmed": "order_confirmation",
        "order_ready": "order_ready",
        "thank_you": "thank_you_message",
        "abandoned_cart": "cart_reminder",
        "birthday": "birthday_coupon"
    }
}', 'Configuración de WhatsApp API'),

('instagram', '{
    "auto_reply_enabled": true,
    "keywords": {
        "menu": "Puedes ver nuestro menú completo en: https://marlocookies.com/menu",
        "horario": "Estamos abiertos de lunes a sábado. Ver horarios: https://marlocookies.com/contacto",
        "precio": "Consulta nuestros precios en: https://marlocookies.com",
        "envio": "Realizamos envíos a toda la ciudad. ¡Consultanos!"
    }
}', 'Configuración de Instagram'),

('site_info', '{
    "nombre": "MarLo Cookies",
    "email": "info@marlocookies.com",
    "telefono": "+54 9 XXX XXX-XXXX",
    "direccion": "Dirección del local",
    "ciudad": "Ciudad",
    "instagram": "@marlocookies",
    "facebook": "marlocookies"
}', 'Información del sitio');

-- ===============================
-- 15. NOTIFICATIONS
-- ===============================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    enlace VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, leida, created_at DESC);

-- ===============================
-- 16. AUDIT_LOG
-- ===============================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    tabla VARCHAR(100),
    registro_id VARCHAR(255),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_tabla ON audit_log(tabla, registro_id);

-- ===============================
-- 17. REFRESH_TOKENS
-- ===============================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ===============================
-- 18. TRIGGERS & FUNCTIONS
-- ===============================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_register_updated_at BEFORE UPDATE ON cash_register
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para cierre automático de caja
CREATE OR REPLACE FUNCTION auto_close_cash_register()
RETURNS TRIGGER AS $$
BEGIN
    -- Cerrar caja del día anterior si no está cerrada
    UPDATE cash_register
    SET cerrado = TRUE,
        fecha_cierre = CURRENT_TIMESTAMP
    WHERE fecha < CURRENT_DATE
    AND cerrado = FALSE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- 19. VIEWS (Vistas útiles)
-- ===============================

-- Vista de productos activos
CREATE VIEW productos_activos AS
SELECT * FROM products
WHERE visible = TRUE
AND (
    es_fijo = TRUE
    OR (es_limitado = TRUE AND stock > 0 AND fecha_inicio <= CURRENT_DATE AND fecha_fin >= CURRENT_DATE)
);

-- Vista de pedidos del día
CREATE VIEW pedidos_hoy AS
SELECT 
    o.id,
    o.numero_pedido,
    u.nombre || ' ' || u.apellido AS cliente,
    o.total,
    o.metodo_pago,
    o.estado,
    o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE DATE(o.created_at) = CURRENT_DATE
ORDER BY o.created_at DESC;

-- Vista de top productos
CREATE VIEW productos_mas_vendidos AS
SELECT 
    p.id,
    p.nombre,
    p.categoria,
    COUNT(oi.id) AS veces_pedido,
    SUM(oi.cantidad) AS cantidad_total,
    SUM(oi.subtotal) AS ingresos_total
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.estado = 'Entregado'
GROUP BY p.id, p.nombre, p.categoria
ORDER BY cantidad_total DESC;

-- ===============================
-- 20. COMENTARIOS Y METADATA
-- ===============================

COMMENT ON TABLE users IS 'Usuarios del sistema (clientes y staff)';
COMMENT ON TABLE products IS 'Catálogo de productos (fijos y rotativos)';
COMMENT ON TABLE orders IS 'Pedidos realizados';
COMMENT ON TABLE loyalty_history IS 'Historial de movimientos de puntos';
COMMENT ON TABLE cash_register IS 'Caja diaria con totales por método de pago';
COMMENT ON TABLE config IS 'Configuraciones del sistema';

-- ===============================
-- FIN DEL SCHEMA
-- ===============================
