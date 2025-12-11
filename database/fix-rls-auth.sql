-- MarLo Cookies - Arreglos de RLS para autenticación
-- Ejecutar en Supabase SQL Editor

-- Permitir que usuarios autenticados inserten su propio registro
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir lectura de usuarios autenticados a su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Permitir actualización
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Permitir que admins vean todos los usuarios
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Permitir que admins actualicen usuarios
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin'
    )
  );
