-- MarLo Cookies - Seed Data para Uruguay/Maldonado
-- Datos de prueba para desarrollo
--
-- IMPORTANTE: Ejecutar DESPUÉS de supabase-schema-v2.sql
-- O mejor aún, usar supabase-complete.sql que tiene todo junto

-- ===========================================
-- PRODUCTOS
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
-- ZONAS DE DELIVERY
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
-- CUPONES DE DESCUENTO
-- ===========================================

INSERT INTO coupons (code, tipo, valor, minimo, max_usos, valido_hasta, activo) VALUES
('BIENVENIDO', 'porcentaje', 15, 500, 100, NOW() + INTERVAL '3 months', true),
('VERANO2025', 'porcentaje', 10, 300, 200, '2025-03-31', true),
('PRIMERACOMPRA', 'fijo', 100, 400, NULL, NOW() + INTERVAL '1 year', true),
('ENVIOGRATIS', 'fijo', 150, 800, 50, NOW() + INTERVAL '1 month', true),
('AMIGOS20', 'porcentaje', 20, 1000, 30, NOW() + INTERVAL '2 months', true);

-- ===========================================
-- USUARIO ADMIN
-- ===========================================

-- Nota: El usuario admin debe crearse a través de Supabase Auth
-- Este es solo un placeholder para referencia
-- Email: admin@marlocookies.com
-- Crear desde el dashboard de Supabase y luego actualizar el rol aquí:
-- UPDATE users SET rol = 'admin' WHERE email = 'admin@marlocookies.com';
