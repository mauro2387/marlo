-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Agregar vencimiento de puntos (6 meses)
-- =====================================================

-- Agregar columna expires_at a loyalty_history
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loyalty_history' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE loyalty_history 
    ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    
    -- Actualizar registros existentes: 6 meses desde created_at
    UPDATE loyalty_history 
    SET expires_at = created_at + INTERVAL '6 months'
    WHERE tipo = 'ganado' AND expires_at IS NULL;
  END IF;
END $$;

-- Crear función para calcular puntos disponibles (excluyendo expirados)
CREATE OR REPLACE FUNCTION get_available_points(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  points_earned INTEGER;
  points_spent INTEGER;
  points_expired INTEGER;
BEGIN
  -- Puntos ganados no expirados
  SELECT COALESCE(SUM(puntos), 0) INTO points_earned
  FROM loyalty_history
  WHERE user_id = user_uuid 
    AND tipo = 'ganado'
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Puntos canjeados
  SELECT COALESCE(SUM(ABS(puntos)), 0) INTO points_spent
  FROM loyalty_history
  WHERE user_id = user_uuid 
    AND tipo = 'canjeado';
  
  RETURN points_earned - points_spent;
END;
$$ LANGUAGE plpgsql;

-- Crear función para marcar puntos expirados automáticamente
CREATE OR REPLACE FUNCTION expire_old_points()
RETURNS void AS $$
BEGIN
  -- No eliminar, solo marcar como referencia que están expirados
  -- Los puntos expirados simplemente no se contarán en los cálculos
  -- porque la función get_available_points los filtra
  
  -- Log de puntos que expiran hoy (opcional)
  INSERT INTO loyalty_history (user_id, puntos, tipo, concepto, expires_at)
  SELECT 
    user_id,
    -puntos,
    'expirado',
    CONCAT('Puntos expirados de: ', concepto),
    NOW()
  FROM loyalty_history
  WHERE tipo = 'ganado'
    AND expires_at < NOW()
    AND NOT EXISTS (
      SELECT 1 FROM loyalty_history lh2 
      WHERE lh2.user_id = loyalty_history.user_id 
        AND lh2.tipo = 'expirado'
        AND lh2.concepto LIKE CONCAT('%', loyalty_history.id, '%')
    );
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar expires_at automáticamente en nuevos puntos
CREATE OR REPLACE FUNCTION set_points_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'ganado' AND NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + INTERVAL '6 months';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS loyalty_history_expiration_trigger ON loyalty_history;
CREATE TRIGGER loyalty_history_expiration_trigger
  BEFORE INSERT ON loyalty_history
  FOR EACH ROW
  EXECUTE FUNCTION set_points_expiration();

-- Índice para mejorar performance de queries de expiración
CREATE INDEX IF NOT EXISTS idx_loyalty_history_expires 
  ON loyalty_history(user_id, tipo, expires_at) 
  WHERE tipo = 'ganado';

-- Comentarios
COMMENT ON COLUMN loyalty_history.expires_at IS 'Fecha de expiración de los puntos (6 meses desde created_at)';
COMMENT ON FUNCTION get_available_points IS 'Calcula puntos disponibles excluyendo expirados';
COMMENT ON FUNCTION expire_old_points IS 'Marca puntos expirados (ejecutar diariamente con cron)';
COMMENT ON FUNCTION set_points_expiration IS 'Trigger que establece fecha de expiración automáticamente';

-- Mensaje de confirmación
SELECT 
  'Sistema de expiración de puntos configurado correctamente' AS status,
  'Los puntos ahora vencen en 6 meses' AS info,
  'Usar get_available_points(user_id) para obtener balance correcto' AS uso;
