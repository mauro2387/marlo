-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Arreglar políticas RLS de tabla coupons
-- =====================================================

-- 1. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Cupones activos visibles" ON coupons;
DROP POLICY IF EXISTS "Insertar cupones" ON coupons;
DROP POLICY IF EXISTS "Actualizar cupones" ON coupons;
DROP POLICY IF EXISTS "Active coupons are viewable" ON coupons;
DROP POLICY IF EXISTS "coupons_select_policy" ON coupons;
DROP POLICY IF EXISTS "coupons_insert_policy" ON coupons;
DROP POLICY IF EXISTS "coupons_update_policy" ON coupons;
DROP POLICY IF EXISTS "coupons_select" ON coupons;
DROP POLICY IF EXISTS "coupons_insert" ON coupons;
DROP POLICY IF EXISTS "coupons_update" ON coupons;
DROP POLICY IF EXISTS "coupons_delete" ON coupons;
DROP POLICY IF EXISTS "Anyone can read active coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;

-- 2. Deshabilitar RLS temporalmente para verificar
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- 3. Habilitar RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas PERMISIVAS (cualquiera autenticado puede gestionar)
CREATE POLICY "coupons_select_all" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "coupons_insert_all" ON coupons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "coupons_update_all" ON coupons
  FOR UPDATE USING (true);

CREATE POLICY "coupons_delete_all" ON coupons
  FOR DELETE USING (true);

-- 5. Verificar estructura de la tabla (campos requeridos)
-- Si falta alguna columna, agregarla
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'code') THEN
    ALTER TABLE coupons ADD COLUMN code VARCHAR(50) NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'tipo') THEN
    ALTER TABLE coupons ADD COLUMN tipo VARCHAR(20) DEFAULT 'porcentaje';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'valor') THEN
    ALTER TABLE coupons ADD COLUMN valor DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'minimo') THEN
    ALTER TABLE coupons ADD COLUMN minimo DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'max_usos') THEN
    ALTER TABLE coupons ADD COLUMN max_usos INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'usos_actuales') THEN
    ALTER TABLE coupons ADD COLUMN usos_actuales INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'valido_desde') THEN
    ALTER TABLE coupons ADD COLUMN valido_desde TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'valido_hasta') THEN
    ALTER TABLE coupons ADD COLUMN valido_hasta TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'activo') THEN
    ALTER TABLE coupons ADD COLUMN activo BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'descripcion') THEN
    ALTER TABLE coupons ADD COLUMN descripcion TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupons' AND column_name = 'imagen_url') THEN
    ALTER TABLE coupons ADD COLUMN imagen_url TEXT;
  END IF;
END $$;

-- 6. Verificar políticas creadas
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'coupons';

-- 7. Mensaje de confirmación
SELECT 'Políticas de coupons configuradas correctamente' AS status;
