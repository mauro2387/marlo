-- Política para que admin pueda insertar en loyalty_history
-- Ejecutar en Supabase SQL Editor

-- Permitir INSERT para usuarios autenticados (el admin insertará cuando marque entregado)
CREATE POLICY "Authenticated users can insert loyalty history"
  ON public.loyalty_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Si quieres ser más restrictivo (solo admins), puedes usar:
-- CREATE POLICY "Only admins can insert loyalty history"
--   ON public.loyalty_history FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM public.users 
--       WHERE id = auth.uid() AND rol = 'admin'
--     )
--   );

-- Verificar la política creada
SELECT * FROM pg_policies WHERE tablename = 'loyalty_history';
