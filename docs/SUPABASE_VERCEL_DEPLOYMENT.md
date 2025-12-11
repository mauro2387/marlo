# MarLo Cookies - Deployment

## 🚀 Deploy en Vercel con Supabase

Esta guía explica cómo hacer el deploy del proyecto MarLo Cookies en Vercel usando Supabase como base de datos.

---

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Supabase](https://supabase.com)
- Repositorio Git (GitHub, GitLab, o Bitbucket)

---

## 1️⃣ Configurar Supabase

### Crear Proyecto en Supabase

1. Ir a [app.supabase.com](https://app.supabase.com)
2. Click en **"New Project"**
3. Completar:
   - **Name**: `marlocookies` (o el nombre que prefieras)
   - **Database Password**: Generar una contraseña segura (guardarla)
   - **Region**: Elegir la más cercana (ej: São Paulo para Chile)
   - **Pricing Plan**: Free (suficiente para empezar)
4. Click en **"Create new project"**
5. Esperar 2-3 minutos mientras se crea la base de datos

### Ejecutar Schema SQL

1. En el dashboard de Supabase, ir a **SQL Editor** (ícono de </> en el menú)
2. Click en **"New query"**
3. Copiar todo el contenido de `database/supabase-schema.sql`
4. Pegar en el editor
5. Click en **"Run"** (o presionar Ctrl+Enter)
6. Verificar que salga: **"Success. No rows returned"**

### Obtener Credenciales

1. Ir a **Settings** → **API**
2. Copiar las siguientes credenciales:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **IMPORTANTE**: Nunca compartas la `service_role` key públicamente. Solo usa la `anon` key en el frontend.

### Configurar Authentication

1. Ir a **Authentication** → **Providers**
2. Habilitar **"Email"**
3. Configurar opciones:
   - ✅ Enable email confirmations (opcional, deshabilitarlo para testing)
   - ✅ Enable auto-confirm emails (habilitar para testing)
4. Ir a **Authentication** → **URL Configuration**
5. Agregar URLs permitidas:
   - `http://localhost:3005` (desarrollo)
   - `https://tu-dominio.vercel.app` (producción)

### Datos Iniciales (Seed)

Para agregar productos de ejemplo, ejecutar en el SQL Editor:

```sql
-- Insertar productos de prueba
INSERT INTO public.products (nombre, descripcion, precio, categoria, stock, activo) VALUES
('Cookie Chocolate', 'Deliciosa cookie con chips de chocolate', 199, 'cookies', 100, true),
('Cookie Red Velvet', 'Cookie suave con sabor a red velvet', 199, 'cookies', 80, true),
('Cookie Oreo', 'Cookie rellena con crema de oreo', 199, 'cookies', 90, true),
('Box x4', 'Caja con 4 cookies a elección', 720, 'boxes', 50, true),
('Box x6', 'Caja con 6 cookies a elección', 1080, 'boxes', 50, true),
('Box x12', 'Caja con 12 cookies a elección', 2150, 'boxes', 30, true);
```

---

## 2️⃣ Configurar Vercel

### Conectar Repositorio

1. Hacer push del código a GitHub/GitLab/Bitbucket
2. Ir a [vercel.com/new](https://vercel.com/new)
3. **Import Git Repository**
4. Seleccionar el repositorio `MarloCookies`
5. Vercel detectará automáticamente que es un proyecto Next.js

### Configurar Build Settings

Vercel autodetecta Next.js, pero verificar:

- **Framework Preset**: Next.js
- **Root Directory**: `frontend` ⚠️ IMPORTANTE
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Agregar Variables de Entorno

En **Environment Variables**, agregar:

```bash
# Supabase (OBLIGATORIO)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site URL (usar tu dominio de Vercel)
NEXT_PUBLIC_SITE_URL=https://marlocookies.vercel.app

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=56912345678

# Instagram
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/marlocookies

# Feature Flags
NEXT_PUBLIC_ENABLE_LOYALTY=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
NEXT_PUBLIC_ENABLE_WHATSAPP=true

# Debug
NEXT_PUBLIC_DEBUG_MODE=false
```

**Aplicar en**: Production, Preview, Development (marcar las 3)

### Deploy

1. Click en **"Deploy"**
2. Esperar 2-3 minutos
3. ✅ Deploy completo!
4. Vercel te dará una URL: `https://marlocookies.vercel.app`

---

## 3️⃣ Configurar Dominio Personalizado (Opcional)

### En Vercel

1. Ir a **Settings** → **Domains**
2. Click en **"Add"**
3. Ingresar tu dominio: `marlocookies.com` (si lo tienes)
4. Seguir instrucciones para configurar DNS

### Registrar DNS

Si usas NIC Chile u otro proveedor, agregar estos records:

**Tipo A**:
```
@ → 76.76.21.21
```

**Tipo CNAME**:
```
www → cname.vercel-dns.com
```

⏱️ Esperar 24-48 horas para propagación DNS.

### Actualizar Supabase

1. Ir a Supabase → **Authentication** → **URL Configuration**
2. Agregar el nuevo dominio: `https://marlocookies.com` (si tienes dominio propio)

---

## 4️⃣ Verificación Post-Deploy

### Checklist

- [ ] La app carga en la URL de Vercel
- [ ] Puedes ver productos en `/productos`
- [ ] Puedes registrar una cuenta
- [ ] Puedes hacer login
- [ ] El carrito funciona
- [ ] Puedes crear un pedido (checkout)
- [ ] Los puntos se calculan correctamente

### Testing

```bash
# Registro
1. Ir a /registro
2. Completar formulario
3. Verificar que te redirige a /perfil

# Productos
1. Ir a /productos
2. Verificar que se cargan desde Supabase
3. Agregar al carrito

# Checkout
1. Ir a /carrito
2. Click en "Proceder al Pago"
3. Completar formulario
4. Verificar que se crea el pedido en Supabase

# Supabase Dashboard
1. Ir a Table Editor → orders
2. Verificar que aparece el pedido
```

---

## 5️⃣ Monitoreo y Logs

### Vercel Logs

1. Ir a tu proyecto en Vercel
2. Click en **"Logs"**
3. Ver logs en tiempo real de requests

### Supabase Logs

1. Ir a Supabase → **Logs**
2. Ver queries ejecutadas
3. Detectar errores de RLS

---

## 🔒 Seguridad

### Row Level Security (RLS)

El schema ya incluye políticas RLS para:
- ✅ Usuarios solo ven sus propios datos
- ✅ Productos son públicos (solo lectura)
- ✅ Órdenes son privadas por usuario
- ✅ Newsletter y contacto son públicos (solo INSERT)

### Variables de Entorno

- ✅ NUNCA expongas `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Solo usa `ANON_KEY` en frontend
- ✅ Verifica que las variables estén en Vercel

### HTTPS

- ✅ Vercel proporciona SSL automático
- ✅ Todas las conexiones son seguras

---

## 🔄 CI/CD Automático

Vercel implementa CI/CD automático:

1. **Push a `main`** → Deploy a producción
2. **Push a `develop`** → Preview deployment
3. **Pull Request** → Preview deployment automático

### Configurar Branches

En Vercel → **Settings** → **Git**:
- **Production Branch**: `main`
- **Preview Branches**: `develop`, `staging`

---

## 📊 Analytics (Opcional)

### Vercel Analytics

1. Ir a **Analytics** en Vercel
2. Click en **"Enable"**
3. Ver métricas de performance y tráfico

### Supabase Studio

1. Ver uso de base de datos
2. Métricas de auth
3. Storage usage

---

## 🆘 Troubleshooting

### Error: "Missing environment variables"

**Solución**: Verificar que todas las variables de entorno estén configuradas en Vercel.

```bash
# Verificar localmente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Error: "Row Level Security policy violation"

**Solución**: Verificar políticas RLS en Supabase SQL Editor:

```sql
-- Ver políticas actuales
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Error: "Authentication failed"

**Solución**:
1. Verificar que la URL del sitio esté en Supabase → Auth → URL Configuration
2. Verificar que las cookies funcionen (sin SameSite=Strict)

### Error de Build en Vercel

**Solución**:
1. Verificar que `Root Directory` sea `frontend`
2. Verificar que no haya errores de TypeScript: `npm run build` localmente
3. Ver logs completos en Vercel

---

## 📈 Escalabilidad

### Supabase Free Tier

- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users

### Upgrade a Pro

Si necesitas más:
- Ir a Supabase → **Settings** → **Billing**
- $25/mes por proyecto
- Database ilimitada
- Backups automáticos

### Vercel Free Tier

- ✅ 100GB bandwidth
- ✅ Deployments ilimitados
- ✅ Previews automáticos

---

## ✅ Checklist Final

- [ ] Proyecto creado en Supabase
- [ ] Schema SQL ejecutado correctamente
- [ ] Credenciales copiadas (URL + anon key)
- [ ] Repositorio conectado a Vercel
- [ ] Root directory configurado como `frontend`
- [ ] Variables de entorno agregadas en Vercel
- [ ] Deploy exitoso
- [ ] App funciona en producción
- [ ] Auth funciona (registro + login)
- [ ] Productos se cargan desde Supabase
- [ ] Checkout crea pedidos correctamente
- [ ] URLs permitidas configuradas en Supabase Auth

---

## 🎉 ¡Listo!

Tu app MarLo Cookies está en producción con:
- ✅ Next.js en Vercel
- ✅ Base de datos PostgreSQL en Supabase
- ✅ Auth integrado
- ✅ CI/CD automático
- ✅ SSL/HTTPS
- ✅ Escalable

**URL de Producción**: https://marlocookies.vercel.app

---

## 📚 Recursos

- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Supabase](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Vercel + Supabase Integration](https://vercel.com/integrations/supabase)
