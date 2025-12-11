-- MarLo Cookies - Tabla de Recompensas (Productos de Puntos)
-- Ejecutar en Supabase SQL Editor

-- ===============================
-- 1. CREAR TABLA DE RECOMPENSAS
-- ===============================

CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    puntos_requeridos INTEGER NOT NULL CHECK (puntos_requeridos > 0),
    icono VARCHAR(100) DEFAULT 'card_giftcard',
    imagen_url TEXT,
    categoria VARCHAR(50) DEFAULT 'producto', -- 'producto', 'descuento', 'envio', 'especial'
    es_destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    stock INTEGER DEFAULT -1, -- -1 = ilimitado
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_rewards_activo ON rewards(activo);
CREATE INDEX IF NOT EXISTS idx_rewards_puntos ON rewards(puntos_requeridos);
CREATE INDEX IF NOT EXISTS idx_rewards_orden ON rewards(orden);

-- ===============================
-- 2. INSERTAR RECOMPENSAS POR DEFECTO
-- ===============================

INSERT INTO rewards (nombre, descripcion, puntos_requeridos, icono, categoria, es_destacado, orden) VALUES
('1 Café + 1 Cookie Gratis', 'Disfruta de un café caliente acompañado de tu cookie favorita', 2000, 'coffee', 'producto', FALSE, 1),
('Box 4 Unidades Gratis', 'Un box de 4 cookies a tu elección completamente gratis', 5000, 'inventory_2', 'producto', FALSE, 2),
('Box 6 Unidades Gratis', 'Box de 6 cookies premium totalmente gratis', 10000, 'card_giftcard', 'producto', FALSE, 3),
('Cookie Edición Limitada', 'Acceso exclusivo a las cookies de edición limitada del mes', 2500, 'star', 'especial', TRUE, 4),
('15% Descuento', '15% de descuento en tu próxima compra', 3000, 'payments', 'descuento', FALSE, 5),
('Envío Gratis', 'Envío gratis en tu próximo pedido sin mínimo de compra', 1500, 'local_shipping', 'envio', FALSE, 6);

-- ===============================
-- 3. CREAR TABLA DE CANJES
-- ===============================

CREATE TABLE IF NOT EXISTS reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
    puntos_usados INTEGER NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'procesando', 'entregado', 'cancelado'
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Si se vincula a un pedido
    codigo_cupon VARCHAR(50), -- Si genera un cupón de descuento
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_reward ON reward_redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_estado ON reward_redemptions(estado);
CREATE INDEX IF NOT EXISTS idx_redemptions_fecha ON reward_redemptions(created_at DESC);

-- ===============================
-- 4. RLS POLICIES
-- ===============================

-- Habilitar RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Políticas para rewards (públicas para leer, solo admin para modificar)
CREATE POLICY "Anyone can view active rewards"
  ON rewards FOR SELECT
  USING (activo = TRUE);

CREATE POLICY "Admins can manage rewards"
  ON rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND rol = 'admin'
    )
  );

-- Políticas para reward_redemptions
CREATE POLICY "Users can view their own redemptions"
  ON reward_redemptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own redemptions"
  ON reward_redemptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all redemptions"
  ON reward_redemptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND rol = 'admin'
    )
  );

CREATE POLICY "Admins can update redemptions"
  ON reward_redemptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND rol = 'admin'
    )
  );

-- ===============================
-- 5. FUNCIÓN PARA TRIGGER
-- ===============================

CREATE OR REPLACE FUNCTION update_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rewards_timestamp
    BEFORE UPDATE ON rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_rewards_updated_at();

CREATE TRIGGER update_redemptions_timestamp
    BEFORE UPDATE ON reward_redemptions
    FOR EACH ROW
    EXECUTE FUNCTION update_rewards_updated_at();

-- ===============================
-- VERIFICACIÓN
-- ===============================

SELECT 'Tablas de recompensas creadas exitosamente' AS status;
SELECT COUNT(*) AS total_recompensas FROM rewards;
