# MarLo Cookies - Lista de Tareas del Equipo

## ✅ Completado

- [x] Estructura completa del proyecto (monorepo)
- [x] Esquema de base de datos PostgreSQL
- [x] Datos seed con productos iniciales
- [x] Configuración backend NestJS
- [x] Entidades TypeORM completas
- [x] Módulo de autenticación (JWT)
- [x] Sistema de roles y permisos
- [x] Configuración frontend Next.js 14
- [x] Branding y paleta de colores aplicada
- [x] Manual técnico completo
- [x] Manual de uso para el equipo
- [x] Manual de marca
- [x] Guía de deployment

## 🚧 Por Implementar

### Backend (API)

#### Módulos Core
- [ ] **Auth Module**
  - [ ] DTOs (RegisterDto, LoginDto)
  - [ ] Guards (JwtAuthGuard, RolesGuard)
  - [ ] Strategies (JWT, Local)
  - [ ] Decorators (@CurrentUser, @Roles)

- [ ] **Users Module**
  - [ ] UserService (CRUD completo)
  - [ ] UserController
  - [ ] DTOs (UpdateUserDto, FilterUsersDto)
  - [ ] Validaciones

- [ ] **Products Module**
  - [ ] ProductService (con lógica de productos rotativos)
  - [ ] ProductController
  - [ ] DTOs (CreateProductDto, UpdateProductDto)
  - [ ] Filtros y búsqueda
  - [ ] Upload de imágenes

- [ ] **Orders Module**
  - [ ] OrderService
  - [ ] OrderController
  - [ ] Descuento automático de stock
  - [ ] Cálculo de totales y descuentos
  - [ ] Estados y transiciones
  - [ ] Integración con WhatsApp

- [ ] **Loyalty Module**
  - [ ] LoyaltyService
  - [ ] Sumar puntos automático al entregar
  - [ ] Sistema de canjes
  - [ ] Historial de movimientos

- [ ] **Coupons Module**
  - [ ] CouponService
  - [ ] Validación de cupones
  - [ ] Aplicación de descuentos
  - [ ] Cupones automáticos (cumpleaños)

- [ ] **Finance Module**
  - [ ] CashRegisterService
  - [ ] Apertura/cierre de caja
  - [ ] Reportes financieros
  - [ ] Exportar Excel/PDF
  - [ ] Registro de gastos

- [ ] **WhatsApp Module**
  - [ ] WhatsAppService
  - [ ] Envío de templates
  - [ ] Webhook para mensajes entrantes
  - [ ] Auto-respuestas
  - [ ] Carrito abandonado

- [ ] **Notifications Module**
  - [ ] NotificationService
  - [ ] Creación de notificaciones
  - [ ] Marcar como leídas

- [ ] **Config Module**
  - [ ] Gestión de configuraciones
  - [ ] Actualización de reglas

#### Funcionalidades Adicionales
- [ ] Middleware de logging
- [ ] Exception filters
- [ ] Interceptors (transform, logging)
- [ ] Validators personalizados
- [ ] Seeders adicionales
- [ ] Tests unitarios
- [ ] Tests e2e

### Frontend (E-commerce + CRM)

#### Páginas Públicas (E-commerce)
- [ ] Home
  - [ ] Hero section
  - [ ] Productos destacados
  - [ ] Categorías
  - [ ] Testimonios
  - [ ] Instagram feed

- [ ] Catálogo
  - [ ] Grid de productos
  - [ ] Filtros por categoría
  - [ ] Búsqueda
  - [ ] Badges (limitado, sin stock)

- [ ] Detalle de Producto
  - [ ] Galería de imágenes
  - [ ] Información completa
  - [ ] Agregar al carrito
  - [ ] Productos relacionados

- [ ] Carrito
  - [ ] Lista de items
  - [ ] Actualizar cantidad
  - [ ] Aplicar cupón
  - [ ] Calcular totales

- [ ] Checkout
  - [ ] Datos de entrega
  - [ ] Método de pago
  - [ ] Usar puntos
  - [ ] Confirmación

- [ ] Auth
  - [ ] Login
  - [ ] Registro
  - [ ] Recuperar contraseña

- [ ] Perfil de Usuario
  - [ ] Datos personales
  - [ ] Mis pedidos
  - [ ] Seguimiento
  - [ ] Mis puntos
  - [ ] Historial de canjes

- [ ] Contenido Institucional
  - [ ] Quiénes somos
  - [ ] Contacto
  - [ ] FAQ
  - [ ] Términos y condiciones
  - [ ] Política de privacidad

#### Panel CRM (Staff)
- [ ] Dashboard
  - [ ] Métricas del día
  - [ ] Gráficos
  - [ ] Accesos rápidos

- [ ] Gestión de Pedidos
  - [ ] Lista con filtros
  - [ ] Detalle de pedido
  - [ ] Cambiar estado
  - [ ] Imprimir ticket
  - [ ] Búsqueda avanzada

- [ ] Gestión de Usuarios
  - [ ] Lista de clientes
  - [ ] Perfil completo
  - [ ] Historial de compras
  - [ ] Gestión de puntos
  - [ ] Notas internas
  - [ ] Blacklist

- [ ] Gestión de Productos
  - [ ] CRUD completo
  - [ ] Upload de imágenes
  - [ ] Gestión de stock
  - [ ] Productos rotativos
  - [ ] Control de visibilidad

- [ ] Finanzas
  - [ ] Caja del día
  - [ ] Historial de cajas
  - [ ] Reportes
  - [ ] Gastos
  - [ ] Exportar datos

- [ ] Cupones
  - [ ] Crear/editar
  - [ ] Estadísticas
  - [ ] Historial de uso

- [ ] Reportes
  - [ ] Ventas
  - [ ] Productos más vendidos
  - [ ] Clientes top
  - [ ] Métodos de pago

#### Componentes UI
- [ ] Navbar
- [ ] Footer
- [ ] ProductCard
- [ ] CartDrawer
- [ ] OrderStatusTimeline
- [ ] LoadingSpinner
- [ ] Modal
- [ ] Toast/Notification
- [ ] Tabs
- [ ] Dropdown
- [ ] DatePicker
- [ ] DataTable
- [ ] Charts

#### State Management
- [ ] authStore (Zustand)
- [ ] cartStore
- [ ] uiStore
- [ ] Persistent storage

#### Integraciones
- [ ] API client (axios)
- [ ] React Query (cache)
- [ ] Error boundaries
- [ ] SEO optimization
- [ ] Analytics

### Database & DevOps

- [ ] Migraciones TypeORM
- [ ] Seeders adicionales (productos completos)
- [ ] Scripts de backup
- [ ] Scripts de restore
- [ ] Índices optimizados
- [ ] Views adicionales

### Testing

- [ ] Tests unitarios backend
- [ ] Tests e2e backend
- [ ] Tests unitarios frontend
- [ ] Tests de integración
- [ ] Cypress (E2E frontend)

### Deployment

- [ ] Configurar Railway (backend)
- [ ] Configurar PostgreSQL en Railway
- [ ] Configurar Vercel (frontend)
- [ ] Configurar WhatsApp Business API
- [ ] Configurar dominio personalizado
- [ ] SSL certificates
- [ ] CI/CD con GitHub Actions
- [ ] Monitoring (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Backups automáticos

### Documentación Final

- [ ] README completo con instrucciones
- [ ] Documentación API (Swagger)
- [ ] Diagramas de arquitectura
- [ ] Diagramas de flujo
- [ ] Videos tutoriales (opcional)
- [ ] Changelog

## 📝 Notas del Equipo

### Prioridades
1. ✅ **Fase 1** (Completada): Estructura y configuración base
2. 🔄 **Fase 2** (En progreso): Implementar módulos backend
3. ⏳ **Fase 3**: Desarrollar frontend e-commerce
4. ⏳ **Fase 4**: CRM interno
5. ⏳ **Fase 5**: Integraciones (WhatsApp, pagos)
6. ⏳ **Fase 6**: Testing y deployment

### Estimación de Tiempo
- Backend API completo: 3-4 semanas
- Frontend E-commerce: 3-4 semanas
- CRM: 2-3 semanas
- Integraciones: 1-2 semanas
- Testing y QA: 1-2 semanas
- **Total estimado**: 10-15 semanas

### Recursos Necesarios
- 2-3 desarrolladores backend
- 2-3 desarrolladores frontend
- 1 diseñador UI/UX
- 1 QA tester
- 1 DevOps (part-time)

## 💡 Recomendaciones

1. **Desarrollo iterativo**: Lanzar MVP primero, luego agregar funcionalidades
2. **Code reviews**: Todo código debe ser revisado antes de mergear
3. **Tests**: Escribir tests desde el principio
4. **Documentación**: Documentar mientras se desarrolla
5. **Commits semánticos**: Usar conventional commits
6. **Branches**: feature/nombre, fix/nombre, hotfix/nombre

## 🚀 MVP Mínimo (Lanzamiento Rápido)

Si se necesita lanzar rápido, priorizar:

**Backend MVP**
- [x] Auth (login/registro)
- [ ] Products (listar, detalle)
- [ ] Orders (crear, listar)
- [ ] Loyalty básico (sumar puntos)

**Frontend MVP**
- [ ] Home básico
- [ ] Catálogo
- [ ] Carrito
- [ ] Checkout simplificado
- [ ] Login/Registro

**Sin CRM inicialmente** → Gestión manual mientras se desarrolla

## 📞 Contacto

**Project Manager**: admin@marlocookies.com
**Tech Lead**: dev@marlocookies.com

---

**Última actualización**: Noviembre 2025
