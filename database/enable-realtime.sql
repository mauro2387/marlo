-- Habilitar Realtime para la tabla orders
-- Ejecutar en Supabase SQL Editor (Database > SQL Editor)

-- Paso 1: Configurar replica identity
ALTER TABLE orders REPLICA IDENTITY FULL;

-- Paso 2: Agregar tabla a la publicación de realtime
-- (Supabase ya tiene la publicación creada, solo hay que agregar la tabla)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Verificar que se agregó correctamente
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
