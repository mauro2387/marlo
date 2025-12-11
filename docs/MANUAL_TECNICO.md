# 📘 Manual Técnico - Sistema MarLo Cookies

## Tabla de Contenidos
1. [Arquitectura del Sistema](#arquitectura)
2. [Instalación y Configuración](#instalación)
3. [Base de Datos](#base-de-datos)
4. [API Backend](#api-backend)
5. [Frontend](#frontend)
6. [Automatizaciones](#automatizaciones)
7. [Deployment](#deployment)
8. [Mantenimiento](#mantenimiento)

---

## 1. Arquitectura del Sistema

### Stack Tecnológico

**Backend**
- Framework: NestJS 10+
- Base de Datos: PostgreSQL 14+
- ORM: TypeORM
- Autenticación: JWT + Refresh Tokens
- Validación: class-validator
- Documentación API: Swagger

**Frontend**
- Framework: Next.js 14+ (App Router)
- UI Library: React 18
- Styling: TailwindCSS
- State Management: Zustand
- Forms: React Hook Form
- HTTP Client: Axios

**Integraciones**
- WhatsApp Business API
- Instagram Graph API (Meta)
- Mercado Pago (opcional)
- Cloudinary / S3 (imágenes)

### Estructura de Directorios

```
MarloCookies/
├── backend/
│   ├── src/
│   │   ├── modules/          # Módulos funcionales
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── loyalty/
│   │   │   ├── coupons/
│   │   │   ├── finance/
│   │   │   ├── notifications/
│   │   │   ├── whatsapp/
│   │   │   └── config/
│   │   ├── entities/         # Entidades TypeORM
│   │   ├── config/           # Configuraciones
│   │   ├── common/           # Utilidades compartidas
│   │   ├── guards/           # Guards de autenticación
│   │   ├── decorators/       # Decoradores personalizados
│   │   ├── interceptors/     # Interceptores
│   │   └── main.ts           # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/              # App Router (Next.js 14)
│   │   │   ├── (auth)/       # Rutas de autenticación
│   │   │   ├── (shop)/       # E-commerce
│   │   │   ├── (crm)/        # Panel CRM
│   │   │   └── layout.tsx
│   │   ├── components/       # Componentes React
│   │   │   ├── ui/           # Componentes UI base
│   │   │   ├── shop/         # Componentes e-commerce
│   │   │   └── crm/          # Componentes CRM
│   │   ├── lib/              # Utilidades
│   │   │   ├── api.ts        # Cliente API
│   │   │   ├── auth.ts       # Helpers auth
│   │   │   └── utils.ts
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   └── styles/           # Estilos globales
│   ├── public/               # Assets estáticos
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.ts
├── database/
│   ├── schema.sql            # Esquema completo
│   ├── seed.sql              # Datos iniciales
│   └── migrations/           # Migraciones
├── docs/
│   ├── MANUAL_TECNICO.md     # Este archivo
│   ├── MANUAL_USO.md         # Manual para MarLo
│   ├── API.md                # Documentación API
│   └── DEPLOYMENT.md         # Guía de deployment
└── branding/
    ├── colors.md             # Paleta de colores
    ├── typography.md         # Tipografías
    └── assets/               # Logos, iconos
```

---

## 2. Instalación y Configuración

### Prerrequisitos

- Node.js 18+ (recomendado 20+)
- PostgreSQL 14+
- npm, yarn o pnpm
- Git

### Instalación Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
# nano .env

# Crear base de datos PostgreSQL
psql -U postgres
CREATE DATABASE marlocookies;
\q

# Ejecutar esquema
psql -U postgres -d marlocookies -f ../database/schema.sql

# Ejecutar seed (datos iniciales)
psql -U postgres -d marlocookies -f ../database/seed.sql

# Iniciar en desarrollo
npm run start:dev
```

El backend estará disponible en `http://localhost:3001`

### Instalación Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local
# nano .env.local

# Iniciar en desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

---

## 3. Base de Datos

### Esquema Principal

#### Tablas Core

**users**
- Almacena todos los usuarios (clientes y staff)
- Campos: id, nombre, apellido, email, telefono, contrasena, puntos_totales, etc.
- Relaciones: ManyToMany con roles, OneToMany con orders

**roles**
- 6 roles predefinidos: Admin, Producción, Caja, Marketing, Soporte, Cliente
- Campo `permisos` JSONB para control granular

**products**
- Catálogo completo
- Tipos: fijos (es_fijo=true) y rotativos (es_limitado=true)
- Stock tracking automático
- 8 categorías: Cookies, Cookie especial, Boxes, Rolls, Toppings, Postres, Alfajores, Bebidas

**orders**
- Pedidos con estados: Pendiente → En producción → Listo → Entregado/Cancelado
- Tracking completo de fechas
- Puntos usados y ganados

**order_items**
- Items de cada pedido
- Snapshot de nombre y precio (no depende de cambios futuros del producto)

**loyalty_history**
- Historial completo de movimientos de puntos
- Tipos: suma, canje, ajuste
- Auditoría completa (saldo anterior/nuevo)

**cash_register**
- Caja diaria
- Totales por método de pago
- Cierre automático a las 23:59

**config**
- Configuraciones del sistema en JSONB
- Reglas de loyalty, costos de envío, horarios, etc.

### Vistas Útiles

**productos_activos**
```sql
SELECT * FROM productos_activos;
-- Filtra solo productos visibles y en stock
```

**pedidos_hoy**
```sql
SELECT * FROM pedidos_hoy;
-- Pedidos del día actual
```

**productos_mas_vendidos**
```sql
SELECT * FROM productos_mas_vendidos;
-- Ranking de productos por ventas
```

### Triggers Automáticos

- `update_updated_at_column()`: Actualiza timestamp en cada UPDATE
- `auto_close_cash_register()`: Cierra caja automáticamente

### Backups

**Backup completo**
```bash
pg_dump -U postgres marlocookies > backup_$(date +%Y%m%d).sql
```

**Restaurar**
```bash
psql -U postgres -d marlocookies < backup_20251124.sql
```

---

## 4. API Backend

### Endpoints Principales

#### 🔐 Autenticación (`/auth`)

**POST /auth/register**
- Registro de nuevo usuario
- Body: nombre, apellido, email, telefono, contrasena, fecha_nacimiento
- Retorna: user, access_token, refresh_token

**POST /auth/login**
- Inicio de sesión
- Body: email, contrasena
- Retorna: user, access_token, refresh_token

**POST /auth/refresh**
- Refrescar access token
- Headers: Authorization: Bearer {refresh_token}
- Retorna: access_token, refresh_token

#### 👤 Usuarios (`/users`)

**GET /users/me**
- Perfil del usuario autenticado

**PATCH /users/me**
- Actualizar perfil

**GET /users** (Admin, Marketing)
- Listar usuarios con filtros

**GET /users/:id** (Staff)
- Detalle de usuario

#### 🍪 Productos (`/products`)

**GET /products**
- Listar productos
- Query params: categoria, visible, destacado, search

**GET /products/:id**
- Detalle de producto

**POST /products** (Admin)
- Crear producto

**PATCH /products/:id** (Admin)
- Actualizar producto

**DELETE /products/:id** (Admin)
- Eliminar (soft delete: visible=false)

#### 📦 Pedidos (`/orders`)

**POST /orders**
- Crear pedido
- Descuenta stock automáticamente
- Envía notificación WhatsApp

**GET /orders**
- Mis pedidos (Cliente) o Todos (Staff)

**GET /orders/:id**
- Detalle de pedido

**PATCH /orders/:id/status** (Staff)
- Cambiar estado
- Estados: Pendiente → En producción → Listo → Entregado

#### 💎 Puntos (`/loyalty`)

**GET /loyalty/balance**
- Saldo actual de puntos

**GET /loyalty/history**
- Historial de movimientos

**POST /loyalty/redeem**
- Canjear puntos
- Body: puntos, descripcion

#### 🎟️ Cupones (`/coupons`)

**GET /coupons/validate/:codigo**
- Validar cupón

**POST /coupons** (Admin, Marketing)
- Crear cupón

#### 💰 Finanzas (`/finance`)

**GET /finance/cash-register**
- Caja del día

**POST /finance/cash-register/close** (Caja, Admin)
- Cerrar caja

**GET /finance/reports**
- Reportes financieros
- Query: fecha_desde, fecha_hasta, tipo

### Autenticación y Permisos

**JWT en Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Roles y Guards**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Producción')
async getOrders() { }
```

**Decorador de usuario actual**
```typescript
@CurrentUser() user: User
```

### Manejo de Errores

Todos los endpoints retornan errores estandarizados:

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request"
}
```

---

## 5. Frontend

### Estructura de Rutas (App Router)

```
/                      # Home
/catalogo              # Catálogo completo
/producto/[id]         # Detalle de producto
/carrito               # Carrito de compras
/checkout              # Proceso de pago
/login                 # Inicio de sesión
/register              # Registro
/perfil                # Perfil del usuario
/perfil/pedidos        # Mis pedidos
/perfil/puntos         # Mis puntos
/nosotros              # Quiénes somos
/contacto              # Contacto
/faq                   # Preguntas frecuentes

# CRM (requiere autenticación Staff)
/crm/dashboard         # Dashboard CRM
/crm/pedidos           # Gestión de pedidos
/crm/usuarios          # Gestión de usuarios
/crm/productos         # Gestión de productos
/crm/finanzas          # Finanzas y caja
/crm/cupones           # Cupones y promociones
/crm/reportes          # Reportes
```

### State Management (Zustand)

**authStore**
```typescript
{
  user: User | null,
  token: string | null,
  login: (email, password) => Promise<void>,
  logout: () => void,
  register: (data) => Promise<void>,
}
```

**cartStore**
```typescript
{
  items: CartItem[],
  addItem: (product, quantity) => void,
  removeItem: (productId) => void,
  updateQuantity: (productId, quantity) => void,
  clear: () => void,
  total: number,
}
```

**uiStore**
```typescript
{
  sidebarOpen: boolean,
  toggleSidebar: () => void,
  showNotification: (message, type) => void,
}
```

### Componentes Principales

**Layout**
- Navbar con logo, menú, carrito, usuario
- Footer con redes sociales, contacto
- Sidebar móvil

**ProductCard**
- Imagen, nombre, precio
- Badge si es limitado
- Botón agregar al carrito

**Cart**
- Lista de items
- Subtotal, envío, total
- Cupón de descuento
- Botón checkout

**OrderStatus**
- Timeline visual del estado del pedido
- Iconos personalizados por estado

### Integración con API

**Cliente API (lib/api.ts)**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 6. Automatizaciones

### WhatsApp Business API

**Configuración**
1. Crear cuenta en Meta Business
2. Configurar WhatsApp Business API
3. Obtener Phone ID y Access Token
4. Configurar webhook para mensajes entrantes

**Templates**
- `order_confirmation`: Confirmación de pedido
- `order_ready`: Pedido listo para retirar
- `thank_you_message`: Agradecimiento post-compra
- `cart_reminder`: Carrito abandonado (24h después)
- `birthday_coupon`: Cupón de cumpleaños

**Envío de mensajes**
```typescript
async sendWhatsAppMessage(to: string, templateName: string, params: any[]) {
  const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_ID}/messages`;
  
  await axios.post(url, {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'es_AR' },
      components: [
        {
          type: 'body',
          parameters: params,
        },
      ],
    },
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    },
  });
}
```

### Tareas Programadas (Cron)

**Cierre automático de caja (23:59)**
```typescript
@Cron('59 23 * * *')
async autoCloseCashRegister() {
  const today = new Date();
  const cashRegister = await this.cashRegisterRepository.findOne({
    where: { fecha: today, cerrado: false },
  });
  
  if (cashRegister) {
    await this.closeCashRegister(cashRegister.id, 'SYSTEM');
  }
}
```

**Ocultar productos rotativos vencidos (diario)**
```typescript
@Cron('0 0 * * *')
async hideExpiredProducts() {
  await this.productsRepository.update(
    {
      es_limitado: true,
      fecha_fin: LessThan(new Date()),
      visible: true,
    },
    { visible: false }
  );
}
```

**Notificación carrito abandonado (diario)**
```typescript
@Cron('0 10 * * *')
async sendAbandonedCartReminders() {
  // Lógica para detectar carritos abandonados
  // y enviar recordatorio por WhatsApp
}
```

---

## 7. Deployment

### Backend (Railway / Render)

**Railway**
```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Crear proyecto
railway init

# Agregar PostgreSQL
railway add

# Deploy
railway up
```

**Variables de entorno en producción**
- DATABASE_URL (provisto por Railway)
- JWT_SECRET (generar seguro)
- JWT_REFRESH_SECRET (generar seguro)
- WHATSAPP_ACCESS_TOKEN
- NODE_ENV=production

### Frontend (Vercel)

**Deploy automático**
1. Conectar repo GitHub con Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push a main

**Variables de entorno**
```
NEXT_PUBLIC_API_URL=https://api.marlocookies.com
NEXT_PUBLIC_SITE_URL=https://marlocookies.com
```

### Base de Datos (Producción)

**Railway PostgreSQL**
- Backups automáticos diarios
- SSL habilitado
- Escalable

**Alternativas**
- Supabase (PostgreSQL managed)
- AWS RDS
- Digital Ocean Managed DB

---

## 8. Mantenimiento

### Logs y Monitoreo

**Backend**
- NestJS Logger integrado
- Logs en consola (desarrollo)
- Logs en archivos (producción)

**Herramientas recomendadas**
- Sentry (error tracking)
- LogRocket (session replay)
- Google Analytics 4

### Actualizaciones

**Backend**
```bash
npm update
npm audit fix
```

**Frontend**
```bash
npm update
npm audit fix
```

### Backups

**Automatizar backups diarios**
```bash
#!/bin/bash
# backup.sh
pg_dump -U postgres marlocookies | gzip > ~/backups/marlocookies_$(date +%Y%m%d).sql.gz

# Eliminar backups de más de 30 días
find ~/backups -name "marlocookies_*.sql.gz" -mtime +30 -delete
```

**Cron job**
```
0 3 * * * /path/to/backup.sh
```

### Troubleshooting

**Error de conexión a DB**
- Verificar DATABASE_URL
- Confirmar que PostgreSQL está corriendo
- Revisar firewall/VPN

**Error de autenticación**
- Verificar JWT_SECRET
- Limpiar localStorage en frontend
- Regenerar tokens

**Productos no visibles**
- Verificar campo `visible = true`
- Si es limitado, revisar fecha_inicio/fecha_fin
- Verificar stock > 0

---

## Contacto Técnico

Para soporte técnico o consultas sobre el sistema:
- Email: dev@marlocookies.com
- Documentación API: https://api.marlocookies.com/docs

---

**Última actualización**: Noviembre 2025  
**Versión del sistema**: 1.0.0
