-- MarLo Cookies - Actualización de Productos
-- Ejecutar en Supabase SQL Editor
-- ⚠️ CUIDADO: Este script borra todos los productos existentes

-- ===============================
-- 1. BORRAR PRODUCTOS EXISTENTES
-- ===============================

-- Borrar usos de cupones
DELETE FROM coupon_uses;

-- Borrar items de órdenes que referencian productos
DELETE FROM order_items;

-- Borrar historial de lealtad relacionado
DELETE FROM loyalty_history;

-- Borrar órdenes
DELETE FROM orders;

-- Ahora sí borrar todos los productos
DELETE FROM products;

-- ===============================
-- 2. COOKIES ($199 cada una)
-- ===============================

INSERT INTO products (nombre, descripcion, categoria, precio, es_limitado, stock, activo) VALUES
('Clásica', 'Masa clásica de vainilla con morocadas de chocolate y sal marina.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Chocochips', 'Rellena de nutella, masa con chispas de chocolate y vainilla.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Red Velvet', 'Rellena de nuestra crema especial, masa con trozos de chocolate blanco.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Oreo', 'Masa repleta de Oreo, y chispas de chocolate.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Mantecol', 'Masa repleta de Mantecol, cubierta de ganache de chocolate.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Vuelta de cumpleaños', 'Masa de vainilla, chispas de colores y chocolate blanco. Rellena de Dulce de leche.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Bon o Bon', 'Masa de vainilla, canela y chispas de chocolate, rellena de un Bon o Bon en el centro.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Chocotorta', 'Masa repleta de Chocolinas y chispas de chocolate, rellena de nuestra crema especial de chocolinas.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Lemon Pie', 'Masa fina de limón, rellena de crema pastelera de limón.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Kit Kat', 'Masa de vainilla, repleta de trozos de Kit Kat y chispas de chocolate.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Carrot Cake', 'Masa de vainilla con zanahoria y nueces, rellena de nuestra crema especial. Decorada de chocolate blanco y canela.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Tiramisú', 'Masa de chocolate y café, con una cobertura de la clásica crema de tiramisú y cacao espolvoreado.', 'cookies', 199.00, FALSE, 1000, TRUE),
('Choconuetella', 'Masa de chocolate con trozos de chocolate y en su interior rellena de nutella y marshmallows.', 'cookies', 199.00, FALSE, 1000, TRUE);

-- ===============================
-- 3. BOXES
-- ===============================

INSERT INTO products (nombre, descripcion, categoria, precio, es_limitado, stock, activo) VALUES
('Box x4', 'Caja con 4 cookies a elección del cliente', 'boxes', 720.00, FALSE, 500, TRUE),
('Box x6', 'Caja con 6 cookies a elección del cliente', 'boxes', 1080.00, FALSE, 500, TRUE),
('Box x12', 'Caja con 12 cookies a elección del cliente - Ideal para compartir. Por más cantidad, o diferentes tamaños para eventos, pedir presupuesto.', 'boxes', 2150.00, FALSE, 300, TRUE);

-- ===============================
-- 4. ROLLS DE CANELA
-- ===============================

INSERT INTO products (nombre, descripcion, categoria, precio, es_limitado, stock, activo) VALUES
('Roll clásico', 'Roll clásico, con frosting de queso crema y canela. Toppings disponibles: Dulce de leche, nutella, oreo.', 'otros', 220.00, FALSE, 200, TRUE);

-- ===============================
-- 5. POSTRES
-- ===============================

INSERT INTO products (nombre, descripcion, categoria, precio, es_limitado, stock, activo) VALUES
('Chocotorta clásica', 'Postre Individual, 300 gramos.', 'otros', 330.00, FALSE, 100, TRUE);

-- ===============================
-- 6. ALFAJORES
-- ===============================

INSERT INTO products (nombre, descripcion, categoria, precio, es_limitado, stock, activo) VALUES
('Alfajor de masa de salchichón', 'Relleno de Dulce de leche y nutella.', 'otros', 89.00, FALSE, 300, TRUE);

-- ===============================
-- 7. BEBIDAS
-- ===============================

INSERT INTO products (nombre, descripcion, categoria, precio, es_limitado, stock, activo) VALUES
('Colet chico', 'Colet 200ml', 'bebidas', 65.00, FALSE, 500, TRUE),
('Colet grande', 'Colet 1L', 'bebidas', 130.00, FALSE, 300, TRUE),
('Ades chico', 'Ades 200ml', 'bebidas', 45.00, FALSE, 500, TRUE),
('Ades grande', 'Ades 1L', 'bebidas', 130.00, FALSE, 300, TRUE),
('Coca Cola 250ml', 'Coca Cola lata 250ml', 'bebidas', 45.00, FALSE, 500, TRUE),
('Coca Cola 500ml', 'Coca Cola botella 500ml', 'bebidas', 85.00, FALSE, 400, TRUE),
('Agua 500ml', 'Agua mineral 500ml', 'bebidas', 75.00, FALSE, 500, TRUE),
('Agua 1L', 'Agua mineral 1L', 'bebidas', 85.00, FALSE, 400, TRUE);

-- ===============================
-- VERIFICACIÓN
-- ===============================

SELECT 'Productos actualizados exitosamente' AS status;
SELECT categoria, COUNT(*) as cantidad FROM products GROUP BY categoria ORDER BY categoria;
SELECT nombre, precio, categoria FROM products ORDER BY categoria, nombre;
