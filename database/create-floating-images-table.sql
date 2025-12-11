-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Crear tabla para imágenes flotantes en móvil
-- =====================================================

-- Crear tabla floating_images (si no existe ya)
-- Nota: La tabla ya existe, este script solo agrega columnas faltantes si es necesario
DO $$ 
BEGIN
  -- Agregar columna nombre si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'floating_images' AND column_name = 'nombre') THEN
    ALTER TABLE floating_images ADD COLUMN nombre VARCHAR(100);
  END IF;
  
  -- Agregar columna updated_at si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'floating_images' AND column_name = 'updated_at') THEN
    ALTER TABLE floating_images ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Índice para orden
CREATE INDEX IF NOT EXISTS idx_floating_images_orden ON floating_images(orden);

-- Comentarios
COMMENT ON TABLE floating_images IS 'Imágenes flotantes PNG para mostrar en móvil';
COMMENT ON COLUMN floating_images.nombre IS 'Nombre descriptivo de la imagen';
COMMENT ON COLUMN floating_images.imagen_url IS 'URL de la imagen en Supabase Storage';
COMMENT ON COLUMN floating_images.orden IS 'Orden de aparición (menor = primero)';
COMMENT ON COLUMN floating_images.activo IS 'Si la imagen está activa o no';

-- RLS Policies
ALTER TABLE floating_images ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer imágenes activas
CREATE POLICY "Floating images are viewable by everyone"
  ON floating_images FOR SELECT
  USING (activo = true);

-- Política: Solo admins pueden insertar
CREATE POLICY "Only admins can insert floating images"
  ON floating_images FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Política: Solo admins pueden actualizar
CREATE POLICY "Only admins can update floating images"
  ON floating_images FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Política: Solo admins pueden eliminar
CREATE POLICY "Only admins can delete floating images"
  ON floating_images FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Mensaje de confirmación
SELECT 'Tabla floating_images creada correctamente' AS status;
