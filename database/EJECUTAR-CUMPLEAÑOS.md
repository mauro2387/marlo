# 🎂 Sistema de Cupones de Cumpleaños - Instrucciones

## 📋 Archivos SQL a Ejecutar en Supabase

Debes ejecutar estos 2 archivos SQL **en este orden** en el SQL Editor de Supabase:

### 1️⃣ PRIMERO: `add-birthday-to-users.sql`
**Qué hace:**
- Agrega el campo `fecha_cumpleanos` a la tabla `public.users`
- Migra las fechas existentes desde `auth.users` metadata
- Crea un trigger para mantener sincronizado automáticamente

**Cómo ejecutar:**
1. Ir a Supabase Dashboard → SQL Editor
2. Copiar TODO el contenido de `add-birthday-to-users.sql`
3. Pegar y hacer click en "Run"
4. Verificar que aparezca ✅ en los mensajes

---

### 2️⃣ SEGUNDO: `birthday-coupons-system.sql`
**Qué hace:**
- Agrega configuración de cumpleaños a `site_settings`
- Crea tabla `birthday_coupons` para tracking
- Crea función `generate_birthday_coupons()` para generar cupones automáticamente
- Crea vista `upcoming_birthdays` para ver cumpleaños próximos
- Configura políticas RLS de seguridad

**Cómo ejecutar:**
1. En el mismo SQL Editor de Supabase
2. Copiar TODO el contenido de `birthday-coupons-system.sql`
3. Pegar y hacer click en "Run"
4. Verificar que todo se ejecute sin errores

---

## 📍 Dónde Encontrar Todo en el Admin

### 🎂 Ver Cumpleaños de Clientes
**Ubicación:** Admin → Clientes
- Ahora verás una columna "Cumpleaños / Edad" con:
  - 🎂 Fecha de cumpleaños
  - Edad actual
  - "No registrado" si no tiene

### ⚙️ Configurar Cupones de Cumpleaños
**Ubicación:** Admin → Configuración → Sección "Cupones de Cumpleaños"

Puedes configurar:
- ✅ Habilitar/deshabilitar sistema
- 📧 Enviar email automático (sí/no)
- 💰 Tipo de descuento: Porcentaje o Monto fijo
- 🔢 Valor del descuento (ej: 15% o $500)
- 📅 Días de validez del cupón (ej: 7 días)
- ✉️ Asunto del email
- 📝 Mensaje del email (usa %VALUE% y %CODE% como variables)

### 🎟️ Ver Cupones Generados
**Ubicación:** Admin → Cupones
- Los cupones de cumpleaños aparecen con el código `CUMPLE2025-XXXXXX`
- Tienen un banner naranja que dice "⚠️ Todos los cupones son SOLO ONLINE"

---

## 🔄 Cómo Funciona Automáticamente

### 1. Usuario se Registra
- Ingresa su fecha de cumpleaños en el formulario de registro
- Se valida que tenga mínimo 14 años (requisito de Meta)
- La fecha se guarda en `auth.users` metadata
- El trigger copia automáticamente a `public.users.fecha_cumpleanos`

### 2. Día del Cumpleaños
- Debes ejecutar la función `generate_birthday_coupons()` diariamente
- Puedes hacerlo de 3 formas:

#### Opción A: Manualmente en SQL Editor
```sql
SELECT * FROM generate_birthday_coupons();
```

#### Opción B: Con Supabase Cron (recomendado)
```sql
-- Configurar en Dashboard → Database → Cron Jobs
-- Ejecutar diariamente a las 8:00 AM
SELECT cron.schedule(
  'birthday-coupons-daily',
  '0 8 * * *',
  $$SELECT generate_birthday_coupons()$$
);
```

#### Opción C: Con un Edge Function
Crear una función serverless que se ejecute diariamente

### 3. Generación del Cupón
La función automáticamente:
- ✅ Busca usuarios que cumplen años HOY
- ✅ Verifica que no tengan cupón del año actual
- ✅ Genera código único: `CUMPLE2025-ABC123`
- ✅ Crea el cupón en la tabla `coupons`:
  - Válido por X días (según configuración)
  - Max 1 uso
  - Solo válido online
- ✅ Registra en `birthday_coupons` (evita duplicados)

### 4. Envío de Email
**PENDIENTE:** El sistema genera los cupones pero NO envía emails automáticamente todavía.

Para implementar emails necesitas:
- Configurar un servicio de email (Resend, SendGrid, etc.)
- Crear una Edge Function que:
  1. Ejecute `generate_birthday_coupons()`
  2. Tome los resultados (user_email, coupon_code, etc.)
  3. Envíe el email con la plantilla configurada

---

## 📊 Queries Útiles para Admin

### Ver próximos cumpleaños
```sql
SELECT * FROM upcoming_birthdays 
ORDER BY cumpleanos;
```

### Ver quién cumple años hoy
```sql
SELECT * FROM upcoming_birthdays 
WHERE dias_para_cumple = 'Hoy';
```

### Ver cupones de cumpleaños generados este año
```sql
SELECT 
    bc.user_id,
    bc.coupon_code,
    c.valor as descuento,
    c.valido_hasta,
    bc.sent_email,
    bc.generated_at
FROM birthday_coupons bc
JOIN coupons c ON c.code = bc.coupon_code
WHERE bc.birthday_year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY bc.generated_at DESC;
```

### Estadísticas
```sql
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(fecha_cumpleanos) as con_cumpleanos,
    ROUND(COUNT(fecha_cumpleanos)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje
FROM public.users;
```

---

## ⚠️ Importante

1. **Los cupones son SOLO ONLINE** - No funcionan en local físico
2. **Un cupón por usuario por año** - No se generan duplicados
3. **Validez configurable** - Por defecto 7 días desde la fecha de cumpleaños
4. **Emails pendientes** - Debes configurar servicio de envío de emails por separado
5. **Ejecutar diariamente** - Configura un cron job para automatizar la generación

---

## 🐛 Troubleshooting

### No aparecen cumpleaños en Admin → Clientes
- Verificar que ejecutaste `add-birthday-to-users.sql`
- Ejecutar: `SELECT COUNT(*) FROM users WHERE fecha_cumpleanos IS NOT NULL;`
- Si es 0, los usuarios deben actualizar su perfil o registrarse nuevamente

### La función generate_birthday_coupons() no devuelve nada
- Normal si nadie cumple años hoy
- Probar con: `SELECT * FROM upcoming_birthdays WHERE dias_para_cumple = 'Hoy';`

### Error al generar cupones
- Verificar que la tabla `coupons` tenga la columna `origen`
- Verificar que ejecutaste completamente `birthday-coupons-system.sql`

---

## 📝 Checklist

- [ ] Ejecutar `add-birthday-to-users.sql` en Supabase
- [ ] Ejecutar `birthday-coupons-system.sql` en Supabase
- [ ] Verificar columna cumpleaños en Admin → Clientes
- [ ] Configurar cupones en Admin → Configuración
- [ ] Probar `SELECT * FROM upcoming_birthdays;`
- [ ] Configurar cron job para ejecución diaria
- [ ] (Opcional) Implementar envío de emails

---

¿Preguntas? Revisa los comentarios en los archivos SQL o consulta la documentación de Supabase sobre Functions y Cron Jobs.
