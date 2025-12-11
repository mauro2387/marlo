-- MarLo Cookies - Seed Data (Datos iniciales)
-- Ejecutar después de schema.sql

-- ===============================
-- 1. USUARIO ADMINISTRADOR
-- ===============================

-- Contraseña: Admin123! (debe ser hasheada en la aplicación)
INSERT INTO users (id, nombre, apellido, email, telefono, contrasena, puntos_totales, activo)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Admin',
    'Sistema',
    'admin@marlocookies.com',
    '+54 9 XXX XXX-XXXX',
    '$2b$10$example_hashed_password', -- Reemplazar con hash real
    0,
    TRUE
);

-- Asignar rol de Admin
INSERT INTO user_roles (user_id, role_id)
VALUES ('00000000-0000-0000-0000-000000000001', 1);

-- ===============================
-- 2. PRODUCTOS FIJOS
-- ===============================

-- COOKIES CLÁSICAS ($199)
INSERT INTO products (nombre, descripcion, categoria, precio, es_fijo, es_limitado, stock, visible, orden) VALUES
('Cookie Clásica', 'Nuestra receta tradicional con chips de chocolate belga', 'Cookies', 199.00, TRUE, FALSE, 1000, TRUE, 1),
('Cookie Chocochip', 'Clásica cookie con doble porción de chips de chocolate', 'Cookies', 199.00, TRUE, FALSE, 1000, TRUE, 2),
('Cookie Red Velvet', 'Suave textura aterciopelada con toques de cacao y chips blancos', 'Cookies', 199.00, TRUE, FALSE, 1000, TRUE, 3),
('Cookie Oreo', 'Cookie de chocolate con trozos de oreo y relleno cremoso', 'Cookies', 199.00, TRUE, FALSE, 1000, TRUE, 4),
('Cookie Mantecol', 'Cookie con dulce de leche y trozos de mantecol', 'Cookies', 199.00, TRUE, FALSE, 1000, TRUE, 5),
('Cookie Bon o Bon', 'Cookie con trozos de Bon o Bon y dulce de leche', 'Cookies', 199.00, TRUE, FALSE, 1000, TRUE, 6),
('Cookie Chocotorta', 'Sabor a chocotorta con chocolinas y dulce de leche', 'Cookies', 199.00, TRUE, FALSE, 1000, TRUE, 7),
('Cookie Lemon Pie', 'Cookie de limón con merengue italiano quemado', 'Cookies', 199.00, TRUE, FALSE, 1000, TRUE, 8);

-- COOKIE ESPECIAL
INSERT INTO products (nombre, descripcion, categoria, precio, es_fijo, es_limitado, stock, visible, destacado, orden) VALUES
('Cookie Pistacho', 'Cookie premium con pistachos importados y chocolate blanco', 'Cookie especial', 219.00, TRUE, FALSE, 500, TRUE, TRUE, 1);

-- BOXES
INSERT INTO products (nombre, descripcion, categoria, precio, es_fijo, es_limitado, stock, visible, orden) VALUES
('Box x4', 'Caja con 4 cookies a elección del cliente', 'Boxes', 720.00, TRUE, FALSE, 500, TRUE, 1),
('Box x6', 'Caja con 6 cookies a elección del cliente', 'Boxes', 1080.00, TRUE, FALSE, 500, TRUE, 2),
('Box x12', 'Caja con 12 cookies a elección del cliente - Ideal para compartir', 'Boxes', 2150.00, TRUE, FALSE, 300, TRUE, 3);

-- ROLLS
INSERT INTO products (nombre, descripcion, categoria, precio, es_fijo, es_limitado, stock, visible, orden) VALUES
('Roll Clásico', 'Roll de canela con glaseado de queso crema', 'Rolls', 220.00, TRUE, FALSE, 200, TRUE, 1);

-- POSTRES
INSERT INTO products (nombre, descripcion, categoria, precio, es_fijo, es_limitado, stock, visible, orden) VALUES
('Chocotorta 300g', 'Clásica chocotorta casera en pote de 300g', 'Postres', 330.00, TRUE, FALSE, 100, TRUE, 1);

-- ALFAJORES
INSERT INTO products (nombre, descripcion, categoria, precio, es_fijo, es_limitado, stock, visible, orden) VALUES
('Alfajor de Salchichón + Nutella', 'Alfajor de chocolate con dulce de leche y nutella', 'Alfajores', 89.00, TRUE, FALSE, 300, TRUE, 1);

-- BEBIDAS
INSERT INTO products (nombre, descripcion, categoria, precio, es_fijo, es_limitado, stock, visible, orden) VALUES
('Colet Chico', 'Jugo Colet 200ml', 'Bebidas', 55.00, TRUE, FALSE, 500, TRUE, 1),
('Colet Grande', 'Jugo Colet 1L', 'Bebidas', 130.00, TRUE, FALSE, 300, TRUE, 2),
('Ades Chico', 'Ades 200ml', 'Bebidas', 45.00, TRUE, FALSE, 500, TRUE, 3),
('Ades Grande', 'Ades 1L', 'Bebidas', 130.00, TRUE, FALSE, 300, TRUE, 4),
('Coca Cola 250ml', 'Coca Cola lata 250ml', 'Bebidas', 45.00, TRUE, FALSE, 500, TRUE, 5),
('Coca Cola 600ml', 'Coca Cola botella 600ml', 'Bebidas', 85.00, TRUE, FALSE, 400, TRUE, 6),
('Agua 600ml', 'Agua mineral 600ml', 'Bebidas', 75.00, TRUE, FALSE, 500, TRUE, 7),
('Agua 1L', 'Agua mineral 1L', 'Bebidas', 85.00, TRUE, FALSE, 400, TRUE, 8);

-- ===============================
-- 3. PRODUCTOS ROTATIVOS (EJEMPLO)
-- ===============================

-- Estos son ejemplos, deben gestionarse manualmente desde el CRM
INSERT INTO products (nombre, descripcion, categoria, precio, es_fijo, es_limitado, fecha_inicio, fecha_fin, stock, visible, destacado, orden) VALUES
('Cookie Dulce de Leche Tentación', 'Edición limitada - Cookie con dulce de leche repostero y chispas de chocolate', 'Cookies', 199.00, FALSE, TRUE, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 200, TRUE, TRUE, 100),
('Cookie S''mores', 'Edición limitada - Cookie con marshmallow, graham crackers y chocolate', 'Cookies', 199.00, FALSE, TRUE, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 200, TRUE, TRUE, 101);

-- ===============================
-- 4. CUPONES DE EJEMPLO
-- ===============================

INSERT INTO coupons (codigo, descripcion, tipo, valor, monto_minimo, fecha_inicio, fecha_fin, usos_maximos, activo) VALUES
('BIENVENIDO10', 'Cupón de bienvenida - 10% de descuento', 'porcentaje', 10.00, 500.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 100, TRUE),
('PRIMERACOMPRA', 'Primera compra - $200 de descuento', 'monto_fijo', 200.00, 1000.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 50, TRUE),
('CUMPLE2000', 'Regalo de cumpleaños - $2000 de descuento', 'monto_fijo', 2000.00, 3000.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', 1000, TRUE);

-- ===============================
-- 5. CAJA DEL DÍA ACTUAL
-- ===============================

INSERT INTO cash_register (fecha, saldo_inicial, cerrado)
VALUES (CURRENT_DATE, 0.00, FALSE);

-- ===============================
-- 6. USUARIOS DE PRUEBA
-- ===============================

-- Cliente de ejemplo (Contraseña: Cliente123!)
INSERT INTO users (nombre, apellido, email, telefono, contrasena, fecha_nacimiento, puntos_totales, direccion, ciudad, codigo_postal)
VALUES 
('Juan', 'Pérez', 'juan.perez@example.com', '+54 9 11 1234-5678', '$2b$10$example_hashed_password', '1990-05-15', 1500, 'Calle Falsa 123', 'Buenos Aires', '1414'),
('María', 'González', 'maria.gonzalez@example.com', '+54 9 11 8765-4321', '$2b$10$example_hashed_password', '1988-08-20', 3200, 'Av. Siempreviva 742', 'Buenos Aires', '1425');

-- Asignar rol de Cliente
INSERT INTO user_roles (user_id, role_id)
SELECT id, 6 FROM users WHERE email IN ('juan.perez@example.com', 'maria.gonzalez@example.com');

-- ===============================
-- 7. STAFF DE EJEMPLO
-- ===============================

-- Usuario de Producción
INSERT INTO users (nombre, apellido, email, telefono, contrasena, puntos_totales)
VALUES ('Carlos', 'Producción', 'produccion@marlocookies.com', '+54 9 11 2222-2222', '$2b$10$example_hashed_password', 0);

INSERT INTO user_roles (user_id, role_id)
SELECT id, 2 FROM users WHERE email = 'produccion@marlocookies.com';

-- Usuario de Caja
INSERT INTO users (nombre, apellido, email, telefono, contrasena, puntos_totales)
VALUES ('Ana', 'Caja', 'caja@marlocookies.com', '+54 9 11 3333-3333', '$2b$10$example_hashed_password', 0);

INSERT INTO user_roles (user_id, role_id)
SELECT id, 3 FROM users WHERE email = 'caja@marlocookies.com';

-- Usuario de Marketing
INSERT INTO users (nombre, apellido, email, telefono, contrasena, puntos_totales)
VALUES ('Laura', 'Marketing', 'marketing@marlocookies.com', '+54 9 11 4444-4444', '$2b$10$example_hashed_password', 0);

INSERT INTO user_roles (user_id, role_id)
SELECT id, 4 FROM users WHERE email = 'marketing@marlocookies.com';

-- Usuario de Soporte
INSERT INTO users (nombre, apellido, email, telefono, contrasena, puntos_totales)
VALUES ('Pedro', 'Soporte', 'soporte@marlocookies.com', '+54 9 11 5555-5555', '$2b$10$example_hashed_password', 0);

INSERT INTO user_roles (user_id, role_id)
SELECT id, 5 FROM users WHERE email = 'soporte@marlocookies.com';

-- ===============================
-- 8. PEDIDOS DE EJEMPLO
-- ===============================

-- Pedido ejemplo 1 (Entregado)
DO $$
DECLARE
    v_user_id UUID;
    v_order_id UUID;
    v_product_id UUID;
BEGIN
    -- Obtener usuario
    SELECT id INTO v_user_id FROM users WHERE email = 'juan.perez@example.com';
    
    -- Crear pedido
    INSERT INTO orders (id, user_id, total, subtotal, metodo_pago, metodo_entrega, estado, telefono_contacto, confirmado_whatsapp, puntos_ganados)
    VALUES (uuid_generate_v4(), v_user_id, 720.00, 720.00, 'Mercado Pago', 'Retiro en local', 'Entregado', '+54 9 11 1234-5678', TRUE, 720)
    RETURNING id INTO v_order_id;
    
    -- Agregar items
    SELECT id INTO v_product_id FROM products WHERE nombre = 'Box x4' LIMIT 1;
    INSERT INTO order_items (order_id, product_id, nombre_producto, cantidad, precio_unitario, subtotal)
    VALUES (v_order_id, v_product_id, 'Box x4', 1, 720.00, 720.00);
    
    -- Registrar puntos
    INSERT INTO loyalty_history (user_id, order_id, tipo, puntos, saldo_anterior, saldo_nuevo, descripcion)
    VALUES (v_user_id, v_order_id, 'suma', 720, 780, 1500, 'Compra de Box x4');
END $$;

-- ===============================
-- 9. NOTIFICACIONES DE EJEMPLO
-- ===============================

INSERT INTO notifications (user_id, tipo, titulo, mensaje, enlace)
SELECT id, 'bienvenida', '¡Bienvenido a MarLo Cookies!', 'Gracias por registrarte. Disfruta de nuestras deliciosas cookies.', '/catalogo'
FROM users WHERE email IN ('juan.perez@example.com', 'maria.gonzalez@example.com');

-- ===============================
-- FIN DEL SEED
-- ===============================

-- Confirmar datos insertados
SELECT 'Seed completado exitosamente' AS status;
SELECT COUNT(*) AS total_productos FROM products;
SELECT COUNT(*) AS total_usuarios FROM users;
SELECT COUNT(*) AS total_roles FROM roles;
