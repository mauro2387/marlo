# 🍪 MarLo Cookies - Sistema Completo

Sistema integral de e-commerce, CRM y gestión empresarial para MarLo Cookies.

## 🎉 Estado Actual del Proyecto

### ✅ Frontend E-commerce (100% Completado)
- **21+ páginas funcionales** con navegación consistente y Footer
- **10+ componentes reutilizables** (Navbar, MiniCart, Footer, LoadingSpinner, EmptyState, Badge, NotificationContainer, ActiveOrderBanner, PopupModal, ImageUploader)
- **Sistema de carrito completo** con persistencia en localStorage
- **Checkout funcional** con validaciones en tiempo real
- **Programa de puntos** integrado con canjes y ediciones limitadas
- **Diseño responsive** mobile-first y profesional
- **Animaciones suaves** (float, slide-in, fade-in) y transiciones
- **Arquitectura profesional** con tipos, validadores, helpers, hooks customizados
- **Cliente API centralizado** listo para integración
- **Configuración centralizada** (constants.ts con 14+ configuraciones)
- **Sistema de validación robusto** con validators.ts
- **25+ funciones helper** (formateo, validación, cálculos)
- **11 custom hooks** (loading, async, media queries, clipboard, etc.)
- **Variables de entorno** configuradas
- **Documentación completa** de integración API
- **Flujo de recuperación de contraseña** completo

### 🟡 Backend API (Estructura lista)
- Endpoints definidos
- Entidades configuradas
- Listo para implementación de lógica de negocio

### 📋 Páginas Frontend (21+ total)

1. **Homepage** (/) - Hero, categorías, Instagram feed, newsletter, mapa ubicación, horarios
2. **Productos** (/productos) - Catálogo con modal, badges, add to cart
3. **Boxes** (/boxes) - Builder personalizado con validación
4. **Carrito** (/carrito) - Gestión completa desde Zustand store
5. **Checkout** (/checkout) - Formulario con validaciones, métodos pago, uso de puntos (30% max)
6. **Confirmación** (/confirmacion) - Página de confirmación de pedido con confetti
7. **Login** (/login) - Auth integrado con redirect
8. **Registro** (/registro) - Formulario completo con validaciones
9. **Perfil** (/perfil) - Edición de datos usuario
10. **Pedidos** (/pedidos) - Historial con filtros y estados
11. **Puntos** (/puntos) - Sistema loyalty + canjes (2000/5000/10000/2500 pts) + ediciones limitadas
12. **Nosotros** (/nosotros) - Historia, misión, visión, valores, equipo
13. **Contacto** (/contacto) - Formulario + info + redes sociales + WhatsApp + solicitudes mayoristas
14. **Términos** (/terminos) - Términos y condiciones legales completos
15. **Privacidad** (/privacidad) - Política de privacidad (GDPR compliance)
16. **Recuperar contraseña** (/recuperar) - Solicitar link de recuperación
17. **Reset contraseña** (/reset-password) - Cambiar contraseña con token
18. **Confirmar email** (/confirmar-email) - Verificación de email
19. **Reenviar confirmación** (/reenviar-confirmacion) - Reenviar email de verificación
20. **Verificación pendiente** (/verificacion-pendiente) - Estado de verificación
21. **Trabaja con nosotros** (/trabaja-con-nosotros) - Formulario de postulación
22. **Ayuda** (/ayuda) - Centro de ayuda con FAQs
23. **404** (/not-found) - Página personalizada con animaciones

## 📋 Contenido del Proyecto

```
MarloCookies/
├── backend/                    # API REST con NestJS + PostgreSQL
│   ├── src/
│   │   ├── modules/           # Módulos funcionales (auth, products, orders, loyalty, users, etc.)
│   │   ├── entities/          # Modelos de datos TypeORM
│   │   └── config/            # Configuraciones TypeORM
│   └── package.json
│
├── frontend/                   # E-commerce con Next.js 14
│   ├── src/
│   │   ├── app/               # 15 páginas con App Router
│   │   ├── components/        # 9 componentes reutilizables
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MiniCart.tsx
│   │   │   ├── NotificationContainer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── Badge.tsx
│   │   ├── store/             # 3 stores Zustand (cart, auth, ui)
│   │   ├── services/          # API client centralizado
│   │   ├── types/             # Tipos TypeScript globales
│   │   ├── config/            # Constants (14+ configuraciones)
│   │   ├── utils/             # Helpers + Validators
│   │   └── hooks/             # 11 custom hooks
│   ├── .env.local.example     # Variables de entorno template
│   └── package.json
│
├── database/                   # Esquemas SQL
│   ├── schema.sql             # Estructura completa
│   └── seed.sql               # Datos iniciales
│
├── docs/                       # Documentación completa
│   ├── MANUAL_TECNICO.md      # Guía técnica detallada
│   ├── MANUAL_USO.md          # Guía usuario final
│   ├── SISTEMA_PUNTOS.md      # Loyalty program explicado
│   ├── DEPLOYMENT.md          # Guía de deployment
│   ├── API_INTEGRATION.md     # Guía integración con backend (NUEVO)
│   └── TESTING.md             # Estrategia de testing (NUEVO)
│
└── branding/                   # Brand assets
    └── MANUAL_MARCA.md        # Brand guidelines
```

## 🎯 Características Principales

### E-commerce
- ✅ Catálogo con 8 categorías de productos
- ✅ Productos fijos y rotativos (stock limitado)
- ✅ Carrito de compras
- ✅ Checkout con métodos de pago
- ✅ Sistema de envíos y retiro en local
- ✅ Registro obligatorio (sin invitados)

### Sistema de Puntos (Loyalty)
- 💎 **$1 = 1 punto** automáticamente
- 🎁 **Canjes disponibles**:
  - **2,000 pts** → 1 Café + 1 Cookie
  - **5,000 pts** → 1 Box x 4 gratis
  - **10,000 pts** → 1 Box x 6 gratis
  - **2,500 pts** → Cookie Edición Limitada
- 📊 Historial completo de transacciones
- ⏰ Puntos sin expiración
- ⭐ Acceso exclusivo a sabores limitados

### CRM Interno
- 👥 Gestión de usuarios y permisos
- 📦 Control de pedidos en tiempo real
- 🛍️ Gestión de productos (fijos y limitados)
- 💰 Finanzas y caja diaria
- 📊 Reportes y analytics
- 🎯 Sistema de promociones y cupones

### Automatizaciones
- 📱 WhatsApp API:
  - Confirmación de pedidos
  - Notificación pedido listo
  - Agradecimiento post-compra
  - Carrito abandonado
  - Cupón de cumpleaños
- 📷 Instagram auto-respuestas

### Roles del Sistema
- 🔑 **Admin**: Acceso total
- 🍪 **Producción**: Gestión de pedidos
- 💵 **Caja**: Pagos y cierres
- 📢 **Marketing**: Campañas y clientes
- 🎧 **Soporte**: Atención y reclamos

## 🎨 Branding

### Paleta de Colores
- **Primario**: `#461F10` (Marrón chocolate)
- **Rosa claro**: `#FBD2C7`
- **Salmón**: `#F6A690`
- **Crema**: `#FFF3EA`

### Tipografías
- **Logo**: Script handwritten
- **UI**: Poppins / Nunito (sans-serif)

## 🛠️ Stack Tecnológico

### Backend & Database
- **Base de Datos**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT + Cookies)
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (para imágenes)
- **API**: Supabase Client SDK
- **Row Level Security**: Políticas RLS automáticas

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TailwindCSS 3
- **State Management**: Zustand 4.x con persist middleware
  - `cartStore.ts` (87 líneas) - Carrito con 7 funciones
  - `authStore.ts` (46 líneas) - Auth con 4 funciones
  - `uiStore.ts` (56 líneas) - UI con 9 funciones
- **Persistencia**: localStorage con Zustand persist
- **Validaciones**: Sistema custom robusto (`validators.ts` con 10+ validadores)
- **Helpers**: 25+ funciones utilitarias (formateo, validación, cálculos)
- **Custom Hooks**: 11 hooks reutilizables (loading, async, media queries, clipboard, etc.)
- **Notificaciones**: Toast system custom con 4 tipos y auto-dismiss
- **Animaciones**: CSS keyframes (float, slide-in-right, fade-in) + Tailwind transitions
- **Tipografía**: Nunito (body) + Pacifico (script/logo)
- **Tipos TypeScript**: Sistema completo de tipos globales
- **API Client**: Cliente centralizado con manejo de errores y autenticación JWT
- **Variables de Entorno**: Sistema configurado con `.env.local`

### DevOps
- **Hosting**: Vercel (Next.js con Edge Functions)
- **Database**: Supabase Cloud (PostgreSQL)
- **CI/CD**: Vercel Git Integration (automático)
- **Domain**: Vercel Domains o custom
- **SSL**: Automático por Vercel

## 📦 Instalación Rápida

### Prerrequisitos
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)
- npm/yarn/pnpm

### Setup Local

#### 1. Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. En SQL Editor, ejecutar `database/supabase-schema.sql`
4. Copiar credenciales desde Settings → API:
   - Project URL
   - anon public key

#### 2. Configurar Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase
npm run dev
# App corriendo en http://localhost:3005
```

### Variables de Entorno

**Frontend (.env.local)**
```env
# Supabase (OBLIGATORIO)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend URL
NEXT_PUBLIC_SITE_URL=http://localhost:3005

# WhatsApp Business
NEXT_PUBLIC_WHATSAPP_NUMBER=56912345678

# Instagram
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/marlocookies

# Feature flags
NEXT_PUBLIC_ENABLE_LOYALTY=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
NEXT_PUBLIC_ENABLE_WHATSAPP=true

# Debug mode
NEXT_PUBLIC_DEBUG_MODE=false
```

### Acceso Rápido
- **Frontend**: http://localhost:3005
- **Supabase Studio**: https://app.supabase.com (dashboard)
- **Table Editor**: Ver y editar datos directamente
- **SQL Editor**: Ejecutar queries personalizadas

## 🗄️ Base de Datos (Supabase)

### Tablas Principales
- `users` - Usuarios del sistema (extiende auth.users)
- `products` - Catálogo de productos
- `orders` - Pedidos
- `order_items` - Detalles de pedidos
- `loyalty_history` - Historial de puntos
- `newsletter_subscribers` - Suscriptores
- `contact_messages` - Mensajes de contacto

### Características
- ✅ **Row Level Security (RLS)**: Usuarios solo ven sus datos
- ✅ **Triggers automáticos**: Actualización de puntos al entregar pedido
- ✅ **Auth integrado**: Supabase Auth con JWT
- ✅ **Real-time**: Subscripciones a cambios en tiempo real

Ver esquema completo en `/database/supabase-schema.sql`

## 📱 Integración con Supabase

### Supabase Client

El proyecto usa el SDK de Supabase directamente, sin necesidad de crear endpoints REST personalizados.

**Ejemplo de uso:**

```typescript
import { api } from '@/services/supabase-api';

// Login
const { user } = await api.auth.login(email, password);

// Obtener productos
const products = await api.products.getAll({ categoria: 'cookies' });

// Crear pedido
const order = await api.orders.create(orderData);

// Obtener puntos
const points = await api.loyalty.getPoints();
```

### Operaciones Disponibles

- **Auth**: `register`, `login`, `logout`, `getSession`, `getCurrentUser`
- **Products**: `getAll`, `getById`, `search`, `getByCategory`
- **Orders**: `create`, `getUserOrders`, `getById`, `cancel`
- **Loyalty**: `getPoints`, `getHistory`, `redeemReward`, `getUserStats`
- **Users**: `getProfile`, `updateProfile`, `changePassword`
- **Contact**: `sendMessage`
- **Newsletter**: `subscribe`

### Documentación
- Ver código completo en `/frontend/src/services/supabase-api.ts`
- Guía de deployment en `/docs/SUPABASE_VERCEL_DEPLOYMENT.md`

## 🚀 Deployment en Vercel + Supabase

### Guía Rápida

1. **Crear proyecto en Supabase**
   - Ir a [supabase.com](https://supabase.com)
   - Crear proyecto
   - Ejecutar `database/supabase-schema.sql`
   - Copiar URL y anon key

2. **Conectar a Vercel**
   - Push código a GitHub
   - Importar en [vercel.com](https://vercel.com/new)
   - Root Directory: `frontend`
   - Framework: Next.js (autodetectado)

3. **Configurar Variables de Entorno en Vercel**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   NEXT_PUBLIC_SITE_URL=https://marlocookies.vercel.app
   NEXT_PUBLIC_WHATSAPP_NUMBER=56912345678
   NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/marlocookies
   ```

4. **Deploy**
   - Click en "Deploy"
   - ✅ Listo en 2-3 minutos!

### Documentación Completa

Ver guía detallada paso a paso en:
📄 **`/docs/SUPABASE_VERCEL_DEPLOYMENT.md`**

Incluye:
- Configuración de Supabase con capturas
- Setup de Vercel con CI/CD
- Configuración de dominio custom
- Troubleshooting común
- Checklist de verificación

## 📊 Reglas de Negocio

1. **Sin invitados**: Registro obligatorio para comprar
2. **Productos rotativos**: Máximo 2 sabores activos por mes (15 días c/u, no vuelven)
3. **Puntos**: Solo se suman cuando el pedido está "Entregado"
4. **Caja**: Cierre automático diario a las 23:59
5. **Stock rotativos**: Se ocultan automáticamente cuando stock = 0
6. **WhatsApp**: Confirmación obligatoria de pedidos
7. **Ediciones Limitadas**: 2 sabores exclusivos por mes, disponibles 15 días, luego se retiran permanentemente

## 🎯 Catálogo de Productos

### Cookies Clásicas ($199 c/u)
- Clásica
- Chocochip
- Red Velvet
- Oreo
- Mantecol
- Bon o Bon
- Chocotorta
- Lemon Pie

### Cookie Especial
- Pistacho ($219)

### Boxes
- Box x4 ($720)
- Box x6 ($1080)
- Box x12 ($2150)

### Otros
- Roll clásico ($220)
- Chocotorta 300g ($330)
- Alfajor salchichón + nutella ($89)
- Bebidas (desde $45)

## 📞 Soporte

Para consultas técnicas o de uso:
- Email: soporte@marlocookies.com
- WhatsApp: [Número]

## 📄 Licencia

Propiedad privada de MarLo Cookies © 2025

---

**Desarrollado con ❤️ para MarLo Cookies**
