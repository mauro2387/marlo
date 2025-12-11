# 🚀 Quick Start - MarLo Cookies

Guía ultra-rápida para levantar el proyecto en 5 minutos con **Supabase + Vercel**.

---

## ✅ Checklist Pre-Start

- [ ] Node.js 18+ instalado
- [ ] Cuenta en [Supabase](https://supabase.com) (crear gratis)
- [ ] Git instalado

---

## 📝 Paso 1: Clonar Repositorio

```bash
git clone <repo-url>
cd MarloCookies/frontend
npm install
```

---

## 🗄️ Paso 2: Configurar Supabase (2 minutos)

### A. Crear Proyecto

1. Ir a [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Completar:
   - Name: `marlocookies`
   - Database Password: (generar y guardar)
   - Region: **South America (São Paulo)** ← más cercano a Chile
4. Click **"Create project"**
5. ⏱️ Esperar 2 minutos...

### B. Ejecutar Schema

1. Ir a **SQL Editor** (ícono `</>` en menú lateral)
2. Click **"New query"**
3. Copiar TODO el contenido de `database/supabase-schema.sql`
4. Pegar en editor
5. Click **"Run"** o presionar `Ctrl + Enter`
6. ✅ Debe decir: **"Success. No rows returned"**

### C. Agregar Productos de Prueba

En el mismo SQL Editor, ejecutar:

```sql
INSERT INTO public.products (nombre, descripcion, precio, categoria, stock, activo) VALUES
('Cookie Chocolate', 'Deliciosa cookie con chips de chocolate', 199, 'cookies', 100, true),
('Cookie Red Velvet', 'Cookie suave con sabor a red velvet', 199, 'cookies', 80, true),
('Cookie Oreo', 'Cookie rellena con crema de oreo', 199, 'cookies', 90, true),
('Box x4', 'Caja con 4 cookies a elección', 720, 'boxes', 50, true),
('Box x6', 'Caja con 6 cookies a elección', 1080, 'boxes', 50, true);
```

### D. Obtener Credenciales

1. Ir a **Settings** → **API** (ícono engranaje)
2. Copiar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJI...` (la key LARGA)

⚠️ **NO copies** la `service_role` key!

---

## ⚙️ Paso 3: Configurar Frontend (1 minuto)

```bash
# Desde la carpeta frontend/
cp .env.local.example .env.local
```

Abrir `.env.local` y reemplazar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...tu-key-aqui...
NEXT_PUBLIC_SITE_URL=http://localhost:3005
```

---

## 🎯 Paso 4: Configurar Auth (30 segundos)

En Supabase:

1. Ir a **Authentication** → **Providers**
2. Habilitar **Email**
3. ✅ Marcar **"Enable auto-confirm emails"** (para testing)
4. Ir a **Authentication** → **URL Configuration**
5. Agregar en **"Site URL"**: `http://localhost:3005`

---

## 🚀 Paso 5: Iniciar App

```bash
npm run dev
```

Abrir: **http://localhost:3005**

---

## ✅ Verificación

### 1. Ver Productos
- Ir a `/productos`
- Deberías ver las 5 cookies que agregaste

### 2. Registrarse
- Ir a `/registro`
- Email: `test@example.com`
- Password: `Password123`
- ✅ Te debe redirigir a `/perfil`

### 3. Hacer Checkout
- Agregar productos al carrito
- Click **"Proceder al Pago"**
- Completar formulario
- ✅ Debe crear el pedido

---

## 🎨 Páginas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Homepage |
| `/productos` | Catálogo completo |
| `/carrito` | Carrito de compras |
| `/checkout` | Formulario de pago |
| `/login` | Inicio de sesión |
| `/registro` | Crear cuenta |
| `/perfil` | Editar perfil |
| `/pedidos` | Historial |
| `/puntos` | Programa de lealtad |

---

## 🐛 Troubleshooting

### Error: "Missing environment variables"
**Solución**: Verificar `.env.local` tiene las credenciales de Supabase

### Error: "Failed to fetch products"
**Solución**: Verificar que ejecutaste el schema SQL y agregaste productos

### Auth no funciona
**Solución**: Verificar que habilitaste "auto-confirm emails" y agregaste Site URL

---

## 📚 Próximos Pasos

1. **Deploy a Vercel**: Ver `docs/SUPABASE_VERCEL_DEPLOYMENT.md`
2. **Personalizar**: Editar `frontend/src/config/constants.ts`
3. **Agregar imágenes**: Subir a Supabase Storage
4. **Configurar WhatsApp**: Integrar API de WhatsApp Business

---

## 🎉 ¡Listo!

Tiempo total: **~5 minutos** ⚡

Ahora tienes:
- ✅ Frontend en localhost:3005
- ✅ Base de datos PostgreSQL en Supabase
- ✅ Auth funcionando
- ✅ 15 páginas completas
- ✅ Sistema de carrito y checkout
- ✅ Sistema de puntos

---

## 📖 Documentación Adicional

- **Deployment Completo**: `docs/SUPABASE_VERCEL_DEPLOYMENT.md`
- **Manual Técnico**: `docs/MANUAL_TECNICO.md`
- **Sistema de Puntos**: `docs/SISTEMA_PUNTOS.md`
- **Testing**: `docs/TESTING.md`
- [ ] WhatsApp API
- [ ] Mercado Pago
- [ ] Email notifications

### Fase 5: Deploy & Testing *(1 semana)*
- [ ] Tests
- [ ] Deploy a producción
- [ ] Monitoring
- [ ] QA

**Total estimado: 8-11 semanas**

---

¡Éxito con el desarrollo! 🍪✨
