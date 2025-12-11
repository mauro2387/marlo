# 🚀 Guía de Deployment - Sistema MarLo Cookies

---

## 📋 Prerrequisitos

Antes de deployar, asegúrate de tener:

- [ ] Cuenta de GitHub con el repositorio del proyecto
- [ ] Cuenta en Vercel (frontend)
- [ ] Cuenta en Railway o Render (backend + DB)
- [ ] Credenciales de WhatsApp Business API
- [ ] Dominio personalizado (opcional)

---

## 1. Preparar el Repositorio

### Estructura de Git

```bash
# Inicializar repositorio
git init

# Agregar .gitignore
cat > .gitignore << EOF
node_modules/
.env
.env.local
dist/
.next/
*.log
.DS_Store
coverage/
EOF

# Commit inicial
git add .
git commit -m "Initial commit: MarLo Cookies System"

# Subir a GitHub
git remote add origin https://github.com/tu-usuario/marlocookies.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy Backend (Railway)

### Paso 1: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Login con GitHub
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Autoriza acceso a tu repositorio
6. Selecciona el repositorio `marlocookies`

### Paso 2: Configurar Root Directory

Railway necesita saber dónde está el backend:

1. En Settings → Root Directory
2. Ingresa: `backend`
3. Guarda cambios

### Paso 3: Agregar PostgreSQL

1. En tu proyecto, click en "+ New"
2. Selecciona "Database"
3. Elige "PostgreSQL"
4. Railway creará la base de datos automáticamente

### Paso 4: Variables de Entorno

En Settings → Variables, agrega:

```env
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1

# Database (Railway la proporciona automáticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secrets (generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=tu-jwt-secret-aqui-minimo-32-caracteres
JWT_REFRESH_SECRET=tu-refresh-secret-aqui-minimo-32-caracteres
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# WhatsApp
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_ID=tu-phone-id
WHATSAPP_ACCESS_TOKEN=tu-access-token
WHATSAPP_VERIFY_TOKEN=tu-verify-token

# CORS
CORS_ORIGINS=https://marlocookies.com,https://www.marlocookies.com

# Frontend URL
FRONTEND_URL=https://marlocookies.com

# Bcrypt
BCRYPT_ROUNDS=10
```

### Paso 5: Ejecutar Migraciones

Railway permite ejecutar comandos:

1. En tu proyecto, abre la terminal
2. Ejecuta:

```bash
# Conectar a la base de datos
railway run psql $DATABASE_URL -f database/schema.sql

# Ejecutar seed
railway run psql $DATABASE_URL -f database/seed.sql
```

**Alternativa**: Usar cliente local

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link al proyecto
railway link

# Ejecutar comandos
railway run psql $DATABASE_URL -f ../database/schema.sql
railway run psql $DATABASE_URL -f ../database/seed.sql
```

### Paso 6: Deploy

Railway deploya automáticamente en cada push a `main`.

Verifica el deploy en:
- **Dashboard → Deployments**
- Click en el deployment activo
- Revisa logs

### Paso 7: Obtener URL del Backend

1. En Settings → Networking
2. Click en "Generate Domain"
3. Railway genera: `tu-proyecto.railway.app`
4. Guarda esta URL para configurar el frontend

**Dominio Personalizado** (opcional):
1. En Networking → Custom Domain
2. Agrega tu dominio: `api.marlocookies.com`
3. Configura DNS según instrucciones

---

## 3. Deploy Frontend (Vercel)

### Paso 1: Crear Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Login con GitHub
3. Click en "Add New Project"
4. Importa tu repositorio `marlocookies`

### Paso 2: Configurar Build

Vercel detecta Next.js automáticamente, pero verifica:

```
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Paso 3: Variables de Entorno

En Settings → Environment Variables:

```env
# API Backend (URL de Railway)
NEXT_PUBLIC_API_URL=https://tu-proyecto.railway.app/api/v1

# Site URL (se actualiza después del deploy)
NEXT_PUBLIC_SITE_URL=https://marlocookies.vercel.app

# WhatsApp (para botones directos)
NEXT_PUBLIC_WHATSAPP_NUMBER=5491112345678

# Instagram
NEXT_PUBLIC_INSTAGRAM_HANDLE=marlocookies

# Mercado Pago (opcional)
NEXT_PUBLIC_MP_PUBLIC_KEY=tu-public-key
```

### Paso 4: Deploy

1. Click en "Deploy"
2. Vercel construye y deploya automáticamente
3. Espera a que termine (2-3 minutos)

### Paso 5: Verificar Deploy

Vercel te da una URL: `marlocookies.vercel.app`

Prueba:
1. Abre la URL
2. Verifica que cargue el sitio
3. Prueba registro/login
4. Revisa conexión con backend

### Paso 6: Dominio Personalizado

1. En Settings → Domains
2. Agrega tu dominio: `marlocookies.com`
3. Configura DNS:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Espera propagación DNS (hasta 24hs)

### Paso 7: Actualizar Variables

Una vez configurado el dominio:

1. Edita `NEXT_PUBLIC_SITE_URL`
2. Cambia a: `https://marlocookies.com`
3. Guarda y redeploya

---

## 4. Configurar WhatsApp Business API

### Requisitos

- Cuenta de Meta Business
- Teléfono verificado
- Número de WhatsApp Business

### Paso 1: Meta Developer Console

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Crea una aplicación
3. Agrega producto "WhatsApp"

### Paso 2: Configurar Número

1. En WhatsApp → Getting Started
2. Agrega y verifica tu número
3. Obtén:
   - `Phone Number ID`
   - `WhatsApp Business Account ID`

### Paso 3: Generar Token

1. En WhatsApp → API Setup
2. Genera `Access Token` temporal
3. Para producción, crea un Token permanente

### Paso 4: Crear Templates de Mensajes

En WhatsApp → Message Templates, crea:

**1. order_confirmation**
```
¡Hola {{1}}! 🍪

Tu pedido #{{2}} ha sido confirmado.
Total: ${{3}}

Lo estaremos preparando con mucho cariño.

Seguí tu pedido: {{4}}

¡Gracias por elegirnos!
MarLo Cookies
```

**2. order_ready**
```
¡Hola {{1}}! 🎉

Tu pedido #{{2}} está listo para retirar.

📍 Retirá por: [Dirección]
⏰ Horario: [Horario]

¡Te esperamos!
MarLo Cookies 🍪
```

**3. thank_you_message**
```
¡Gracias por tu compra, {{1}}! ❤️

Ganaste {{2}} puntos de fidelidad 💎

Acumulá puntos y canjeá por premios increíbles.

¡Volvé pronto!
MarLo Cookies
```

### Paso 5: Configurar Webhook

1. En WhatsApp → Configuration
2. Webhook URL: `https://tu-backend.railway.app/api/v1/whatsapp/webhook`
3. Verify Token: el que configuraste en `.env`
4. Suscribe a eventos:
   - `messages`
   - `messaging_optins`

### Paso 6: Actualizar Backend

Asegúrate que las variables estén en Railway:

```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_ID=tu-phone-number-id
WHATSAPP_ACCESS_TOKEN=tu-access-token-permanente
WHATSAPP_VERIFY_TOKEN=tu-verify-token
```

---

## 5. Configurar SSL y Seguridad

### Railway (Backend)

Railway provee SSL automáticamente. Verifica:
1. URL debe ser `https://`
2. Certificado válido

### Vercel (Frontend)

Vercel provee SSL automáticamente:
1. Certificados Let's Encrypt
2. Renovación automática
3. HTTP → HTTPS redirect automático

### Headers de Seguridad

En `backend/src/main.ts`, agrega:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

## 6. Configurar Monitoreo

### Sentry (Error Tracking)

**Backend**

```bash
npm install @sentry/node
```

```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Frontend**

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Google Analytics

En `frontend/src/app/layout.tsx`:

```typescript
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 7. Backups Automáticos

### Railway PostgreSQL

Railway hace backups automáticos, pero crea backups manuales adicionales:

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
railway run pg_dump $DATABASE_URL | gzip > backup_$DATE.sql.gz

# Subir a S3 o similar
aws s3 cp backup_$DATE.sql.gz s3://marlocookies-backups/
```

**Cron job** (ejecutar diariamente):
```
0 3 * * * /path/to/backup.sh
```

---

## 8. CI/CD con GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Build
        run: cd frontend && npm run build

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Railway
        run: echo "Railway deploys automatically"
      - name: Deploy to Vercel
        run: echo "Vercel deploys automatically"
```

---

## 9. Checklist Final de Deploy

### Pre-Deploy

- [ ] Todos los tests pasan
- [ ] Variables de entorno configuradas
- [ ] Secretos generados de forma segura
- [ ] Base de datos migrada
- [ ] Datos seed cargados

### Post-Deploy

- [ ] Backend responde en `/health`
- [ ] Frontend carga correctamente
- [ ] Login/Registro funcionan
- [ ] Catálogo carga productos
- [ ] Pedidos se crean correctamente
- [ ] Puntos se suman
- [ ] WhatsApp envía mensajes
- [ ] SSL activo en ambos
- [ ] Dominio apunta correctamente

### Monitoreo

- [ ] Sentry configurado
- [ ] Google Analytics activo
- [ ] Logs accesibles
- [ ] Backups automatizados

---

## 10. Mantenimiento Post-Deploy

### Actualizaciones

```bash
# Desarrollo local
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git commit -m "Add: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# Crear PR en GitHub
# Mergear a main después de review

# Deploy automático a producción
```

### Rollback

Si algo sale mal:

**Vercel**:
1. Dashboard → Deployments
2. Click en deployment anterior
3. "Promote to Production"

**Railway**:
1. Dashboard → Deployments
2. Click en deployment anterior
3. "Redeploy"

---

## 📞 Soporte

**Problemas con el deploy**:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- GitHub Actions: https://docs.github.com/actions

---

**Guía actualizada**: Noviembre 2025  
**Sistema**: MarLo Cookies v1.0.0

¡Éxito con el deployment! 🚀🍪
