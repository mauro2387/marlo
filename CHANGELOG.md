# Changelog - Sistema MarLo Cookies

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] - 2025-11-24

### 🎉 Lanzamiento Inicial

Primera versión completa del sistema MarLo Cookies.

### ✨ Agregado

#### Base de Datos
- Esquema PostgreSQL completo con 15+ tablas
- Sistema de roles (Admin, Producción, Caja, Marketing, Soporte, Cliente)
- Entidades: Users, Products, Orders, Loyalty, Coupons, Cash Register
- Triggers automáticos (updated_at, cierre de caja)
- Vistas útiles (productos_activos, pedidos_hoy, productos_mas_vendidos)
- Seed data con productos iniciales
- Soporte para productos fijos y rotativos

#### Backend (NestJS)
- Arquitectura modular con 9 módulos principales
- Autenticación JWT con refresh tokens
- Sistema de roles y permisos granulares
- Entidades TypeORM completas
- Configuración de TypeORM
- Variables de entorno documentadas
- Estructura base de controladores y servicios
- Swagger para documentación API
- CORS configurado
- Validación global con class-validator

#### Frontend (Next.js)
- Configuración Next.js 14 con App Router
- TailwindCSS con branding aplicado
- Paleta de colores corporativa (#461F10, #FBD2C7, #F6A690, #FFF3EA)
- Tipografía Nunito y Pacifico
- CSS globals con componentes reutilizables
- Estructura de carpetas optimizada
- Variables de entorno configuradas

#### Documentación
- Manual técnico completo (50+ páginas)
- Manual de uso para el equipo MarLo
- Manual de marca con branding detallado
- Guía de deployment (Railway + Vercel)
- README principal con overview del proyecto
- TODO.md con roadmap del proyecto
- Changelog (este archivo)

#### Branding
- Paleta de colores definida
- Tipografías especificadas
- Guías de uso del logo
- Estilos de iconografía
- Guidelines de fotografía
- Aplicaciones en diferentes medios

### 📋 Funcionalidades Documentadas

#### Sistema de Puntos
- $1 = 1 punto automáticamente
- Canjes: 2000, 5000, 10000 puntos
- Historial completo de movimientos
- Sin expiración de puntos

#### Gestión de Pedidos
- Estados: Pendiente → En producción → Listo → Entregado/Cancelado
- Tracking completo con timestamps
- Descuento automático de stock
- Notificaciones WhatsApp

#### Productos
- 8 categorías (Cookies, Cookie especial, Boxes, Rolls, Toppings, Postres, Alfajores, Bebidas)
- Productos fijos (siempre disponibles)
- Productos rotativos (stock limitado, fechas de vigencia)
- Gestión de stock automática
- Control de visibilidad

#### Finanzas
- Caja diaria con totales por método de pago
- Cierre automático a las 23:59
- Registro de gastos
- Reportes exportables (Excel, PDF)

#### Automatizaciones
- WhatsApp: confirmación, pedido listo, gracias, carrito abandonado, cumpleaños
- Instagram: auto-reply por keywords
- Tareas cron: cierre de caja, productos vencidos

### 🛠️ Configuración

- Node.js 18+
- PostgreSQL 14+
- TypeScript 5+
- ESLint y Prettier
- Git con .gitignore configurado

### 📦 Dependencias Principales

**Backend**
- @nestjs/core 10.0.0
- @nestjs/typeorm 10.0.1
- typeorm 0.3.19
- pg 8.11.3
- @nestjs/jwt 10.2.0
- bcrypt 5.1.1

**Frontend**
- next 14.0.4
- react 18.2.0
- tailwindcss 3.3.0
- axios 1.6.5
- zustand 4.4.7

### 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT con expiración configurable
- Refresh tokens para sesiones largas
- CORS configurado
- Validación de inputs
- SQL injection prevention (TypeORM)

### 📚 Estructura del Proyecto

```
MarloCookies/
├── backend/          # API NestJS
├── frontend/         # E-commerce Next.js
├── database/         # Schema y seeds SQL
├── docs/            # Documentación completa
├── branding/        # Manual de marca
└── README.md        # Este archivo
```

---

## [Unreleased]

### 🔜 Próximas Funcionalidades

#### Backend
- [ ] Implementar DTOs y validaciones completas
- [ ] Guards y decoradores personalizados
- [ ] Servicios de todos los módulos
- [ ] Integración WhatsApp Business API
- [ ] Upload de imágenes (Cloudinary/S3)
- [ ] Sistema de reportes
- [ ] Tests unitarios y e2e

#### Frontend
- [ ] Páginas del e-commerce
- [ ] Componentes UI reutilizables
- [ ] Carrito de compras funcional
- [ ] Checkout completo
- [ ] Panel CRM para staff
- [ ] Dashboard con métricas
- [ ] Sistema de notificaciones
- [ ] SEO optimization

#### Integraciones
- [ ] WhatsApp Business API
- [ ] Mercado Pago
- [ ] Google Analytics
- [ ] Sentry (error tracking)
- [ ] Email notifications

#### DevOps
- [ ] CI/CD con GitHub Actions
- [ ] Deploy en Railway (backend)
- [ ] Deploy en Vercel (frontend)
- [ ] Backups automáticos
- [ ] Monitoring y alertas

---

## Versionado

Usamos [SemVer](https://semver.org/lang/es/) para el versionado:

- **MAJOR** (1.x.x): Cambios incompatibles en la API
- **MINOR** (x.1.x): Nueva funcionalidad compatible
- **PATCH** (x.x.1): Corrección de bugs

## Notas

### Tipos de Cambios

- **✨ Agregado**: Nueva funcionalidad
- **🔄 Cambiado**: Cambios en funcionalidad existente
- **🗑️ Deprecado**: Funcionalidad que será removida
- **❌ Removido**: Funcionalidad removida
- **🐛 Corregido**: Corrección de bugs
- **🔒 Seguridad**: Vulnerabilidades corregidas

---

**Proyecto**: MarLo Cookies System  
**Versión Actual**: 1.0.0  
**Última Actualización**: Noviembre 24, 2025  
**Mantenido por**: Equipo de Desarrollo MarLo Cookies
