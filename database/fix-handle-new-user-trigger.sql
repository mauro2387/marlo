-- ========================================
-- FIX: Trigger handle_new_user
-- ========================================
-- Actualizar el trigger para copiar teléfono y fecha de cumpleaños

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nombre, apellido, telefono, fecha_cumpleanos)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', 'Nuevo'),
    NEW.raw_user_meta_data->>'telefono',
    (NEW.raw_user_meta_data->>'fecha_cumpleanos')::date
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Trigger handle_new_user actualizado correctamente';
    RAISE NOTICE 'ℹ️ Ahora el trigger copiará teléfono y fecha de cumpleaños al crear usuarios';
END $$;
