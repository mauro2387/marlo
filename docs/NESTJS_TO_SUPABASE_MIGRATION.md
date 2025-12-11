# 🔄 Migración de NestJS Backend a Supabase

Esta guía explica la decisión de migrar de un backend NestJS separado a Supabase como BaaS (Backend as a Service).

---

## 🎯 Por Qué Supabase

### Ventajas sobre NestJS + PostgreSQL separado

| Característica | NestJS Backend | Supabase |
|----------------|----------------|----------|
| **Setup inicial** | Complejo (TypeORM, JWT, configs) | Rápido (5 minutos) |
| **Auth** | Implementar desde cero | Incluido out-of-the-box |
| **Database** | Configurar PostgreSQL | PostgreSQL incluido |
| **Hosting** | Railway/Render ($10-20/mes) | Free tier generoso |
| **Real-time** | Implementar con WebSockets | Incluido |
| **Storage** | Implementar S3/Cloudinary | Incluido |
| **Row Level Security** | Middleware custom | Políticas RLS nativas |
| **API** | Crear endpoints REST | Client SDK directo |
| **Escalabilidad** | Manual | Automática |
| **Mantenimiento** | Alto | Bajo |
| **Costo inicial** | Alto | Gratis hasta escalar |

---

## 📊 Comparación de Arquitecturas

### Arquitectura Anterior (NestJS)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Next.js   │──────▶│   NestJS    │──────▶│ PostgreSQL  │
│  (Frontend) │ HTTP  │   (API)     │       │  (Database) │
└─────────────┘       └─────────────┘       └─────────────┘
     3005                  3000                   5432

Servicios separados:
- Frontend en Vercel
- Backend en Railway/Render
- Database en Railway/Supabase/Neon
```

### Arquitectura Nueva (Supabase)

```
┌─────────────┐       ┌──────────────────────────┐
│   Next.js   │──────▶│      Supabase Cloud      │
│  (Frontend) │ SDK   │  - PostgreSQL            │
└─────────────┘       │  - Auth (JWT)            │
     3005             │  - Storage               │
                      │  - Real-time             │
Vercel                │  - Edge Functions        │
                      └──────────────────────────┘

Todo en Supabase:
- Database
- Auth
- Storage
- API automática
```

---

## 🔑 Cambios Principales

### 1. Autenticación

**Antes (NestJS + JWT)**:
```typescript
// Implementar estrategia JWT
// Crear guards personalizados
// Manejar refresh tokens
// Hash passwords manualmente
// Validar tokens en cada request

@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Req() req) {
  return req.user;
}
```

**Ahora (Supabase Auth)**:
```typescript
// Todo incluido automáticamente
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Session management automático
const { data: { user } } = await supabase.auth.getUser();
```

### 2. Database Queries

**Antes (TypeORM)**:
```typescript
// Definir entities
// Crear repositories
// Escribir queries con QueryBuilder

@Entity()
class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  nombre: string;
}

const products = await this.productRepository
  .createQueryBuilder('product')
  .where('product.activo = :activo', { activo: true })
  .getMany();
```

**Ahora (Supabase Client)**:
```typescript
// Client SDK type-safe
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .eq('activo', true);
```

### 3. API Endpoints

**Antes (NestJS Controllers)**:
```typescript
@Controller('products')
export class ProductsController {
  @Get()
  async findAll() {
    return this.productsService.findAll();
  }
  
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
```

**Ahora (Supabase Direct)**:
```typescript
// Sin endpoints, queries directas desde cliente
const { data: products } = await supabase
  .from('products')
  .select('*');

// RLS protege automáticamente
const { data: newProduct } = await supabase
  .from('products')
  .insert({ nombre, precio });
```

### 4. Row Level Security

**Antes (Middleware NestJS)**:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async delete(@Param('id') id: string, @Req() req) {
  // Verificar ownership manualmente
  const product = await this.findOne(id);
  if (product.userId !== req.user.id) {
    throw new ForbiddenException();
  }
  return this.delete(id);
}
```

**Ahora (RLS Policies)**:
```sql
-- Automático en database
CREATE POLICY "Users can only update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 📁 Archivos Eliminados/Obsoletos

Con la migración a Supabase, estos archivos del backend NestJS ya **no son necesarios**:

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/              ❌ Reemplazado por Supabase Auth
│   │   ├── products/          ❌ Queries directas desde frontend
│   │   ├── orders/            ❌ Queries directas desde frontend
│   │   ├── loyalty/           ❌ Triggers automáticos SQL
│   │   └── users/             ❌ Gestionado por Supabase
│   ├── entities/              ❌ Schema en SQL
│   ├── config/                ❌ Variables de entorno simplificadas
│   └── main.ts                ❌ No hay servidor backend separado
├── .env                       ❌ Solo .env.local en frontend
├── nest-cli.json              ❌ No usa NestJS
└── package.json               ❌ Dependencias solo en frontend
```

### ¿Qué pasa con el código backend?

1. **Auth Module** → Supabase Auth integrado
2. **Products Service** → `frontend/src/services/supabase-api.ts`
3. **Orders Service** → Mismo archivo
4. **Loyalty Logic** → SQL triggers en `database/supabase-schema.sql`
5. **Validation** → `frontend/src/utils/validators.ts`
6. **Types** → `frontend/src/types/index.ts`

---

## 🔐 Seguridad

### NestJS Guards vs Supabase RLS

**Antes**: Guards y middleware en cada endpoint
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
@Get('my-orders')
async getMyOrders(@Req() req) {
  return this.ordersService.findByUser(req.user.id);
}
```

**Ahora**: Row Level Security en database
```sql
-- Automático, imposible de bypassear
CREATE POLICY "Users see only their orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);
```

**Ventajas RLS**:
- ✅ Imposible de bypassear (nivel database)
- ✅ No requiere código en frontend
- ✅ Funciona en todas las queries automáticamente
- ✅ Auditable desde Supabase Studio

---

## 💾 Database Schema

### Antes (TypeORM Migrations)

```typescript
// 001-create-users.ts
export class CreateUsers1234567890 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'email', type: 'varchar' },
          // ...
        ],
      })
    );
  }
}
```

### Ahora (Supabase SQL)

```sql
-- Ejecutar una vez en Supabase SQL Editor
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  -- ...
);
```

**Ventajas**:
- ✅ SQL puro, más legible
- ✅ Ejecutar directamente en Supabase Studio
- ✅ Ver cambios en tiempo real
- ✅ Rollback fácil

---

## 📦 Servicios Incluidos en Supabase

### 1. Authentication
- Email/Password
- Magic Links
- OAuth (Google, GitHub, etc.)
- Phone (SMS)
- JWT automático
- Session management
- Password reset

### 2. Database
- PostgreSQL 15
- pgAdmin incluido
- Backups automáticos (Pro plan)
- Point-in-time recovery

### 3. Storage
- Subir imágenes de productos
- Resize automático
- CDN global
- Políticas de acceso

### 4. Real-time
- Subscripciones a cambios
- Broadcast
- Presence (usuarios online)

### 5. Edge Functions (opcional)
- Serverless functions
- Deno runtime
- Para lógica compleja si se necesita

---

## 💰 Costos

### Stack Anterior (NestJS)

| Servicio | Costo/mes | Total |
|----------|-----------|-------|
| Railway (Backend) | $5-10 | $5-10 |
| Supabase (DB) | $0-25 | $0-25 |
| Vercel (Frontend) | $0 | $0 |
| **TOTAL** | | **$5-35/mes** |

### Stack Nuevo (Supabase)

| Servicio | Costo/mes | Total |
|----------|-----------|-------|
| Supabase (Todo) | $0* | $0 |
| Vercel (Frontend) | $0 | $0 |
| **TOTAL** | | **$0/mes** |

*Free tier: 500MB DB, 1GB storage, 2GB bandwidth

### Cuándo Upgrade a Pro ($25/mes)

- Más de 500MB en database
- Más de 50,000 usuarios activos/mes
- Backups automáticos
- Point-in-time recovery
- Soporte prioritario

---

## 🚀 Ventajas para MarLo Cookies

1. **Desarrollo más rápido**: Setup en 5 minutos vs días
2. **Menos código**: ~70% menos código de backend
3. **Mantenimiento mínimo**: Sin servidor que mantener
4. **Escalabilidad automática**: Supabase escala solo
5. **Costo inicial $0**: Ideal para MVP y primeros clientes
6. **Type-safe**: Client SDK con TypeScript
7. **Real-time gratis**: Para notificaciones futuras
8. **Storage incluido**: Para imágenes de productos

---

## ⚠️ Consideraciones

### Cuándo NO usar Supabase

- Lógica de negocio MUY compleja
- Necesitas control total del servidor
- Workflows que requieren jobs programados complejos
- Integración con sistemas legacy muy específicos

### Para MarLo Cookies

✅ **Supabase es ideal** porque:
- E-commerce estándar
- CRUD simple (productos, pedidos, usuarios)
- Auth básico (email/password)
- Sistema de puntos (puede ser SQL triggers)
- No hay workflows extremadamente complejos

---

## 📚 Recursos de Migración

- **Schema SQL**: `database/supabase-schema.sql`
- **API Service**: `frontend/src/services/supabase-api.ts`
- **Deployment**: `docs/SUPABASE_VERCEL_DEPLOYMENT.md`
- **Quick Start**: `QUICKSTART.md`

---

## ✅ Checklist de Migración

- [x] Instalar Supabase client
- [x] Crear schema SQL adaptado
- [x] Implementar RLS policies
- [x] Crear service API con Supabase SDK
- [x] Actualizar variables de entorno
- [x] Migrar auth a Supabase Auth
- [x] Configurar Vercel
- [x] Actualizar documentación
- [ ] Testear todo el flujo
- [ ] Deploy a producción

---

## 🎉 Resultado Final

**Antes**: 3 servicios separados, configuración compleja, $5-35/mes

**Ahora**: 2 servicios (Vercel + Supabase), configuración simple, $0/mes

**Tiempo de desarrollo**: Reducido en ~60%

**Complejidad**: Reducida en ~70%

**Mantenimiento**: Mínimo

---

Esta migración posiciona a MarLo Cookies para:
- ✅ MVP más rápido
- ✅ Costos iniciales mínimos
- ✅ Escalabilidad futura
- ✅ Mantenimiento sencillo
- ✅ Deploy automatizado
