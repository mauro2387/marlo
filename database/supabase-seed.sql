-- MarLo Cookies - Datos de Prueba (Seed)
-- Ejecutar DESPUÉS de supabase-schema.sql

-- =====================================================
-- PRODUCTOS
-- =====================================================

-- Cookies Clásicas ($199 c/u)
INSERT INTO public.products (nombre, descripcion, precio, categoria, stock, activo, ingredientes, alergenos) VALUES
('Cookie Chocolate', 'Deliciosa cookie con chips de chocolate de alta calidad. Crujiente por fuera, suave por dentro.', 199, 'cookies', 100, true, ARRAY['Harina de trigo', 'Chips de chocolate', 'Mantequilla', 'Azúcar', 'Huevos', 'Vainilla'], ARRAY['Gluten', 'Lácteos', 'Huevo']),
('Cookie Chocochip', 'La clásica cookie americana con abundantes chips de chocolate. Un favorito de todos.', 199, 'cookies', 100, true, ARRAY['Harina de trigo', 'Chocolate chips', 'Mantequilla', 'Azúcar morena', 'Huevos'], ARRAY['Gluten', 'Lácteos', 'Huevo']),
('Cookie Red Velvet', 'Suave cookie con el inconfundible sabor a red velvet y un toque de chocolate blanco.', 199, 'cookies', 80, true, ARRAY['Harina de trigo', 'Cacao', 'Chocolate blanco', 'Mantequilla', 'Colorante rojo'], ARRAY['Gluten', 'Lácteos', 'Huevo']),
('Cookie Oreo', 'Cookie rellena con crema estilo Oreo. Perfecta para los amantes de las galletas.', 199, 'cookies', 90, true, ARRAY['Harina de trigo', 'Galletas Oreo', 'Mantequilla', 'Azúcar', 'Crema'], ARRAY['Gluten', 'Lácteos', 'Huevo', 'Soja']),
('Cookie Mantecol', 'Sabor único argentino. Cookie con trozos de mantecol y dulce de leche.', 199, 'cookies', 75, true, ARRAY['Harina de trigo', 'Mantecol', 'Dulce de leche', 'Mantequilla', 'Maní'], ARRAY['Gluten', 'Lácteos', 'Maní']),
('Cookie Bon o Bon', 'Cookie con trozos de chocolate Bon o Bon y maní. Irresistible.', 199, 'cookies', 85, true, ARRAY['Harina de trigo', 'Bon o Bon', 'Chocolate', 'Maní', 'Mantequilla'], ARRAY['Gluten', 'Lácteos', 'Maní']),
('Cookie Chocotorta', 'El sabor de la chocotorta argentina en una cookie. Con dulce de leche y galletas chocolinas.', 199, 'cookies', 70, true, ARRAY['Harina de trigo', 'Galletas chocolinas', 'Dulce de leche', 'Queso crema'], ARRAY['Gluten', 'Lácteos']),
('Cookie Lemon Pie', 'Refrescante cookie con sabor a limón y merengue. Perfecta para el verano.', 199, 'cookies', 65, true, ARRAY['Harina de trigo', 'Limón', 'Merengue', 'Mantequilla', 'Ralladura de limón'], ARRAY['Gluten', 'Lácteos', 'Huevo']);

-- Cookie Especial
INSERT INTO public.products (nombre, descripcion, precio, categoria, stock, activo, ingredientes, alergenos) VALUES
('Cookie Pistacho', 'Cookie premium con pistachos importados y chocolate blanco. Sabor gourmet.', 219, 'cookies', 50, true, ARRAY['Harina de trigo', 'Pistachos', 'Chocolate blanco', 'Mantequilla', 'Azúcar'], ARRAY['Gluten', 'Lácteos', 'Frutos secos']);

-- Boxes
INSERT INTO public.products (nombre, descripcion, precio, categoria, stock, activo) VALUES
('Box x4', 'Caja con 4 cookies a elección. Perfecta para compartir o disfrutar solo.', 720, 'boxes', 50, true),
('Box x6', 'Caja con 6 cookies a elección. Ideal para regalar o disfrutar en familia.', 1080, 'boxes', 50, true),
('Box x12', 'Caja con 12 cookies a elección. Perfecta para fiestas o eventos especiales.', 2150, 'boxes', 30, true);

-- Otros productos
INSERT INTO public.products (nombre, descripcion, precio, categoria, stock, activo, ingredientes, alergenos) VALUES
('Roll Clásico', 'Rollo de masa de cookie con chips de chocolate. Para hornear en casa.', 220, 'otros', 40, true, ARRAY['Harina de trigo', 'Chips de chocolate', 'Mantequilla', 'Azúcar'], ARRAY['Gluten', 'Lácteos']),
('Chocotorta 300g', 'La clásica chocotorta argentina. 300 gramos de puro placer.', 330, 'otros', 25, true, ARRAY['Galletas chocolinas', 'Dulce de leche', 'Queso crema', 'Cacao'], ARRAY['Gluten', 'Lácteos']),
('Alfajor Salchichón + Nutella', 'Alfajor de salchichón de chocolate relleno con Nutella. Sabor explosivo.', 89, 'otros', 60, true, ARRAY['Chocolate', 'Nutella', 'Galletas', 'Mantequilla'], ARRAY['Gluten', 'Lácteos', 'Frutos secos']);

-- Bebidas
INSERT INTO public.products (nombre, descripcion, precio, categoria, stock, activo) VALUES
('Coca-Cola 350ml', 'Bebida refrescante Coca-Cola 350ml', 45, 'bebidas', 100, true),
('Sprite 350ml', 'Bebida refrescante Sprite 350ml', 45, 'bebidas', 100, true),
('Fanta 350ml', 'Bebida refrescante Fanta 350ml', 45, 'bebidas', 100, true),
('Agua Mineral 500ml', 'Agua mineral sin gas 500ml', 35, 'bebidas', 100, true),
('Jugo Natural Naranja', 'Jugo natural de naranja recién exprimido 300ml', 60, 'bebidas', 50, true);

-- Productos limitados (ejemplo)
INSERT INTO public.products (nombre, descripcion, precio, categoria, stock, es_limitado, activo, ingredientes, alergenos) VALUES
('Cookie Navideña', 'Cookie especial de temporada con especias navideñas y jengibre. Edición limitada.', 229, 'cookies', 30, true, true, ARRAY['Harina de trigo', 'Jengibre', 'Canela', 'Nuez moscada', 'Miel'], ARRAY['Gluten', 'Lácteos']),
('Cookie Halloween', 'Cookie temática de Halloween con chips de chocolate naranja. Disponible por tiempo limitado.', 229, 'cookies', 25, true, true, ARRAY['Harina de trigo', 'Chocolate naranja', 'Colorante negro', 'Mantequilla'], ARRAY['Gluten', 'Lácteos']);

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON COLUMN public.products.es_limitado IS 'Indica si el producto es de edición limitada y no vuelve al catálogo';
COMMENT ON COLUMN public.products.ingredientes IS 'Lista de ingredientes del producto';
COMMENT ON COLUMN public.products.alergenos IS 'Lista de alérgenos presentes en el producto';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Contar productos insertados
SELECT 
  categoria,
  COUNT(*) as cantidad,
  SUM(stock) as stock_total
FROM public.products
WHERE activo = true
GROUP BY categoria
ORDER BY categoria;

-- Ver productos limitados
SELECT nombre, precio, stock, es_limitado
FROM public.products
WHERE es_limitado = true;
