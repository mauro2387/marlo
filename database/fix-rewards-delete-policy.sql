-- MarLo Cookies - Fix para política de eliminación de rewards
-- Ejecutar en Supabase SQL Editor si hay problemas al eliminar recompensas

-- ===============================
-- 1. ELIMINAR POLÍTICAS EXISTENTES
-- ===============================

DROP POLICY IF EXISTS "Admins can manage rewards" ON rewards;
DROP POLICY IF EXISTS "Anyone can view active rewards" ON rewards;
DROP POLICY IF EXISTS "Admin full access rewards" ON rewards;

-- ===============================
-- 2. CREAR NUEVAS POLÍTICAS MEJORADAS
-- ===============================

-- Política para ver recompensas activas (pública)
CREATE POLICY "Anyone can view active rewards"
  ON rewards FOR SELECT
  USING (activo = TRUE);

-- Política para admins: ver todas las recompensas (incluso inactivas)
CREATE POLICY "Admins can view all rewards"
  ON rewards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.rol = 'admin' OR users.rol = 'staff')
    )
  );

-- Política para admins: insertar recompensas
CREATE POLICY "Admins can insert rewards"
  ON rewards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.rol = 'admin'
    )
  );

-- Política para admins: actualizar recompensas
CREATE POLICY "Admins can update rewards"
  ON rewards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.rol = 'admin'
    )
  );

-- Política para admins: eliminar recompensas
CREATE POLICY "Admins can delete rewards"
  ON rewards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.rol = 'admin'
    )
  );

-- ===============================
-- 3. CAMBIAR RESTRICCIÓN DE FK
-- ===============================

-- Primero permitir NULL en reward_id
ALTER TABLE reward_redemptions 
  ALTER COLUMN reward_id DROP NOT NULL;

-- Cambiar de RESTRICT a SET NULL para permitir eliminación
-- (Primero eliminar la constraint existente)
ALTER TABLE reward_redemptions 
  DROP CONSTRAINT IF EXISTS reward_redemptions_reward_id_fkey;

-- Recrear con ON DELETE CASCADE (elimina los canjes cuando se elimina la recompensa)
ALTER TABLE reward_redemptions
  ADD CONSTRAINT reward_redemptions_reward_id_fkey
  FOREIGN KEY (reward_id)
  REFERENCES rewards(id)
  ON DELETE CASCADE;

-- ===============================
-- 4. VERIFICACIÓN
-- ===============================

-- Verificar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'rewards';

-- Mostrar confirmación
SELECT 'Políticas de rewards actualizadas correctamente' AS status;
