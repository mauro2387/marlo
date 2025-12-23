-- =====================================================
-- AGREGAR GENERACIÓN DE CUPONES A POPUPS
-- Fecha: 2025-12-23
-- =====================================================
-- Esta migración agrega la capacidad de generar cupones
-- automáticamente cuando un usuario se suscribe a través
-- de un popup.
-- =====================================================

-- 1. Agregar columnas para configuración de cupones en popups
ALTER TABLE public.popups 
ADD COLUMN IF NOT EXISTS generar_cupon BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cupon_tipo VARCHAR(20) DEFAULT 'porcentaje' CHECK (cupon_tipo IN ('porcentaje', 'monto_fijo')),
ADD COLUMN IF NOT EXISTS cupon_valor DECIMAL(10, 2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS cupon_monto_minimo DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cupon_dias_validos INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS cupon_prefijo VARCHAR(10) DEFAULT 'POPUP',
ADD COLUMN IF NOT EXISTS cupon_descripcion TEXT DEFAULT 'Cupón de bienvenida';

-- 2. Crear tabla para trackear cupones generados por popups
CREATE TABLE IF NOT EXISTS public.popup_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id UUID NOT NULL REFERENCES public.popups(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  coupon_code VARCHAR(50) NOT NULL,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(popup_id, email) -- Un cupón por popup por email
);

CREATE INDEX IF NOT EXISTS idx_popup_coupons_popup_id ON public.popup_coupons(popup_id);
CREATE INDEX IF NOT EXISTS idx_popup_coupons_email ON public.popup_coupons(email);
CREATE INDEX IF NOT EXISTS idx_popup_coupons_code ON public.popup_coupons(coupon_code);

-- 3. RLS para popup_coupons
ALTER TABLE public.popup_coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read their popup coupons" ON public.popup_coupons;
CREATE POLICY "Anyone can read their popup coupons" ON public.popup_coupons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can insert popup coupons" ON public.popup_coupons;
CREATE POLICY "Service role can insert popup coupons" ON public.popup_coupons
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage popup coupons" ON public.popup_coupons;
CREATE POLICY "Admins can manage popup coupons" ON public.popup_coupons
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Función para generar código de cupón único
CREATE OR REPLACE FUNCTION generate_unique_coupon_code(prefix TEXT DEFAULT 'POPUP')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generar código: PREFIX + 4 letras aleatorias + 4 números
    new_code := prefix || 
                UPPER(substring(md5(random()::text) from 1 for 4)) ||
                LPAD(floor(random() * 10000)::text, 4, '0');
    
    -- Verificar si ya existe
    SELECT EXISTS(SELECT 1 FROM public.coupons WHERE codigo = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- 5. Función para generar cupón desde popup
CREATE OR REPLACE FUNCTION generate_coupon_from_popup(
  p_popup_id UUID,
  p_email VARCHAR(255)
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_popup RECORD;
  v_coupon_code TEXT;
  v_coupon_id UUID;
  v_existing_coupon RECORD;
  v_result JSON;
BEGIN
  -- Obtener configuración del popup
  SELECT * INTO v_popup 
  FROM public.popups 
  WHERE id = p_popup_id AND generar_cupon = true AND activo = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Popup no configurado para generar cupones'
    );
  END IF;
  
  -- Verificar si ya existe un cupón para este popup y email
  SELECT * INTO v_existing_coupon
  FROM public.popup_coupons
  WHERE popup_id = p_popup_id AND email = p_email;
  
  IF FOUND THEN
    -- Devolver cupón existente
    RETURN json_build_object(
      'success', true,
      'coupon_code', v_existing_coupon.coupon_code,
      'already_exists', true
    );
  END IF;
  
  -- Generar código único
  v_coupon_code := generate_unique_coupon_code(v_popup.cupon_prefijo);
  
  -- Crear cupón en la tabla coupons
  INSERT INTO public.coupons (
    codigo,
    descripcion,
    tipo,
    valor,
    monto_minimo,
    fecha_inicio,
    fecha_fin,
    usos_maximos,
    activo
  ) VALUES (
    v_coupon_code,
    v_popup.cupon_descripcion || ' - ' || p_email,
    v_popup.cupon_tipo,
    v_popup.cupon_valor,
    v_popup.cupon_monto_minimo,
    CURRENT_DATE,
    CURRENT_DATE + (v_popup.cupon_dias_validos || ' days')::INTERVAL,
    1, -- Un solo uso
    true
  )
  RETURNING id INTO v_coupon_id;
  
  -- Registrar en popup_coupons
  INSERT INTO public.popup_coupons (
    popup_id,
    email,
    coupon_code,
    coupon_id
  ) VALUES (
    p_popup_id,
    p_email,
    v_coupon_code,
    v_coupon_id
  );
  
  -- Construir respuesta
  v_result := json_build_object(
    'success', true,
    'coupon_code', v_coupon_code,
    'coupon_id', v_coupon_id,
    'tipo', v_popup.cupon_tipo,
    'valor', v_popup.cupon_valor,
    'monto_minimo', v_popup.cupon_monto_minimo,
    'valido_hasta', CURRENT_DATE + (v_popup.cupon_dias_validos || ' days')::INTERVAL,
    'already_exists', false
  );
  
  RETURN v_result;
END;
$$;

-- 6. Comentarios
COMMENT ON COLUMN public.popups.generar_cupon IS 'Si es true, genera un cupón único al suscribirse';
COMMENT ON COLUMN public.popups.cupon_tipo IS 'Tipo de cupón: porcentaje o monto_fijo';
COMMENT ON COLUMN public.popups.cupon_valor IS 'Valor del cupón (% o monto)';
COMMENT ON COLUMN public.popups.cupon_monto_minimo IS 'Monto mínimo de compra para usar el cupón';
COMMENT ON COLUMN public.popups.cupon_dias_validos IS 'Días de validez del cupón';
COMMENT ON COLUMN public.popups.cupon_prefijo IS 'Prefijo para el código del cupón generado';

COMMENT ON TABLE public.popup_coupons IS 'Cupones generados por popups';
COMMENT ON FUNCTION generate_unique_coupon_code IS 'Genera un código de cupón único';
COMMENT ON FUNCTION generate_coupon_from_popup IS 'Genera un cupón para un email desde un popup';

-- Verificación
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'popups' 
  AND column_name LIKE 'cupon%' OR column_name = 'generar_cupon'
ORDER BY ordinal_position;
