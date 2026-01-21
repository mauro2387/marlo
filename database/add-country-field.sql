-- Agregar campo de país a la tabla users

-- 1. Agregar columna country
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'UY';

-- Comentario para documentar
COMMENT ON COLUMN users.country IS 'Código ISO del país del usuario (UY, AR, CL, BR, etc.)';

-- 2. Actualizar usuarios existentes sin país a Uruguay por defecto
UPDATE users 
SET country = 'UY'
WHERE country IS NULL;
