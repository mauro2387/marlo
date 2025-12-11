-- Migración: Crear tabla de banners promocionales
-- Ejecutar en Supabase SQL Editor

-- Eliminar tabla si existe (para recrear con estructura correcta)
DROP TABLE IF EXISTS promo_banners CASCADE;

-- Crear bucket de storage para banners (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "Banners images are public" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banners" ON storage.objects;

-- Política para que todos puedan ver las imágenes de banners
CREATE POLICY "Banners images are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

-- Política para que admins puedan subir imágenes
CREATE POLICY "Admins can upload banners" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.rol = 'admin'
    )
  );

-- Política para que admins puedan eliminar imágenes
CREATE POLICY "Admins can delete banners" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.rol = 'admin'
    )
  );

-- Tabla de banners promocionales
CREATE TABLE promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_interno VARCHAR(255) NOT NULL, -- Para identificar en el admin (ej: "Promo Navidad 2025")
  titulo VARCHAR(255),  -- Opcional, puede ser solo imagen
  subtitulo TEXT,
  plantilla VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'descuento', 'nuevo', 'envio_gratis', 'puntos', 'temporada', 'custom'
  imagen_url TEXT, -- Para plantilla 'custom'
  color_fondo VARCHAR(50) DEFAULT '#8B4513',
  color_texto VARCHAR(50) DEFAULT '#FFFFFF',
  color_boton VARCHAR(50) DEFAULT '#FF6B6B',
  boton_texto VARCHAR(100),
  boton_link VARCHAR(255),
  valor_descuento INTEGER, -- Para plantilla 'descuento' (ej: 20 = 20%)
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_fin TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_promo_banners_activo ON promo_banners(activo);
CREATE INDEX IF NOT EXISTS idx_promo_banners_orden ON promo_banners(orden);

-- RLS
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Banners visibles para todos" ON promo_banners
  FOR SELECT USING (activo = true);

-- Política para admins
CREATE POLICY "Admins pueden gestionar banners" ON promo_banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.rol = 'admin'
    )
  );

-- Insertar algunos banners de ejemplo
INSERT INTO promo_banners (nombre_interno, titulo, subtitulo, plantilla, color_fondo, color_texto, boton_texto, boton_link, valor_descuento, orden, activo) VALUES
('Bienvenida 20%', '¡20% OFF en tu primera compra!', 'Usa el código BIENVENIDO20', 'descuento', '#FF6B6B', '#FFFFFF', 'Comprar Ahora', '/productos', 20, 1, true),
('Envío gratis promo', 'Envío GRATIS', 'En compras sobre $5.000', 'envio_gratis', '#4CAF50', '#FFFFFF', 'Ver Productos', '/productos', NULL, 2, false),
('Temporada verano', 'Nuevas Cookies de Temporada', 'Sabores limitados de verano', 'nuevo', '#FF9800', '#FFFFFF', 'Descubrir', '/productos', NULL, 3, false);

COMMENT ON TABLE promo_banners IS 'Banners promocionales para mostrar en la homepage';
