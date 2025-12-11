-- MarLo Cookies - Tabla de Tarjetas Destacadas
-- Ejecutar en Supabase SQL Editor

-- ===============================
-- 1. CREAR TABLA
-- ===============================

CREATE TABLE IF NOT EXISTS featured_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(255),
    precio_desde VARCHAR(50),
    descripcion TEXT,
    icono VARCHAR(100) DEFAULT 'cookie',
    color_fondo VARCHAR(255) DEFAULT 'from-secondary-crema to-secondary-rosa/30',
    color_icono VARCHAR(100) DEFAULT 'text-primary',
    enlace VARCHAR(255) DEFAULT '/productos',
    imagen_url TEXT,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_featured_cards_orden ON featured_cards(orden);

-- ===============================
-- 2. INSERTAR DATOS POR DEFECTO
-- ===============================

INSERT INTO featured_cards (titulo, subtitulo, precio_desde, descripcion, icono, color_fondo, color_icono, enlace, orden) VALUES
('Cookies Clásicas', 'Desde $199', '199', 'Nuestras cookies tradicionales con chispas de chocolate', 'cookie', 'from-secondary-crema to-secondary-rosa/30', 'text-primary', '/productos', 1),
('Boxes Personalizados', 'Desde $540', '540', 'Arma tu box con tus sabores favoritos (4, 6 o 9 unidades)', 'inventory_2', 'from-secondary-salmon/20 to-secondary-rosa/30', 'text-secondary-salmon', '/boxes', 2),
('Edición Limitada', 'Desde $219', '219', 'Sabores únicos disponibles por tiempo limitado', 'star', 'from-primary/10 to-secondary-crema', 'text-yellow-500', '/productos', 3);

-- ===============================
-- 3. RLS POLICIES
-- ===============================

ALTER TABLE featured_cards ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Anyone can view featured cards"
  ON featured_cards FOR SELECT
  USING (activo = TRUE);

-- Admins pueden todo
CREATE POLICY "Admins can manage featured cards"
  ON featured_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND rol = 'admin'
    )
  );

-- ===============================
-- 4. CREAR BUCKET DE STORAGE
-- ===============================

-- Ejecutar en SQL o crear manualmente en Storage:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('featured-images', 'featured-images', true);

-- ===============================
-- VERIFICACIÓN
-- ===============================

SELECT 'Tabla featured_cards creada exitosamente' AS status;
SELECT * FROM featured_cards ORDER BY orden;
