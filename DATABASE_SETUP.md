# 🍪 MarLo Cookies - Guía de Configuración de Base de Datos

## Opción 1: Instalar PostgreSQL en Windows

### 1. Descargar PostgreSQL
- Descarga desde: https://www.postgresql.org/download/windows/
- Versión recomendada: PostgreSQL 14 o superior
- Ejecuta el instalador y sigue los pasos

### 2. Durante la instalación:
- **Puerto**: 5432 (por defecto)
- **Contraseña superusuario (postgres)**: Anota la que elijas
- **Locale**: Spanish, Chile (o el que prefieras)

### 3. Crear la base de datos

Abre **pgAdmin** (se instala con PostgreSQL) o usa la línea de comandos:

```sql
-- Conectarse a PostgreSQL (psql)
psql -U postgres

-- Crear la base de datos
CREATE DATABASE marlocookies;

-- Salir
\q
```

### 4. Ejecutar los scripts SQL

#### Opción A: Usar pgAdmin
1. Abre pgAdmin
2. Conecta al servidor local
3. Click derecho en "marlocookies" → Query Tool
4. Abre y ejecuta `database/schema.sql`
5. Luego ejecuta `database/seed.sql`

#### Opción B: Usar línea de comandos
```powershell
# Desde la carpeta del proyecto
psql -U postgres -d marlocookies -f database/schema.sql
psql -U postgres -d marlocookies -f database/seed.sql
```

### 5. Actualizar las credenciales

Edita `backend/.env` con tus credenciales:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=TU_CONTRASEÑA_AQUI
DB_DATABASE=marlocookies
```

---

## Opción 2: Usar Docker (Más rápido)

Si tienes Docker instalado:

```powershell
# Crear y ejecutar contenedor PostgreSQL
docker run --name marlocookies-db `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=marlocookies `
  -p 5432:5432 `
  -d postgres:14

# Esperar 5 segundos a que inicie
Start-Sleep -Seconds 5

# Ejecutar schema
Get-Content database/schema.sql | docker exec -i marlocookies-db psql -U postgres -d marlocookies

# Ejecutar seed data
Get-Content database/seed.sql | docker exec -i marlocookies-db psql -U postgres -d marlocookies
```

Para detener: `docker stop marlocookies-db`
Para reiniciar: `docker start marlocookies-db`

---

## Opción 3: Usar PostgreSQL en la nube (Gratis)

### Supabase (Recomendado)
1. Crea cuenta en https://supabase.com
2. Crea un nuevo proyecto
3. Copia las credenciales de conexión
4. Actualiza `backend/.env`:

```env
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_supabase
DB_DATABASE=postgres
```

5. Ejecuta los scripts en el SQL Editor de Supabase

---

## Verificar la conexión

Una vez configurado, ejecuta:

```powershell
npm run dev
```

Deberías ver:
```
[Nest] LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
```

---

## Solución de problemas

### Error: "role 'postgres' does not exist"
```sql
CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;
```

### Error: "database 'marlocookies' does not exist"
```sql
CREATE DATABASE marlocookies;
```

### Error: "password authentication failed"
Verifica que `DB_PASSWORD` en `.env` coincida con la contraseña de PostgreSQL

### PostgreSQL no inicia
```powershell
# Verificar si está corriendo
Get-Service postgresql*

# Iniciar servicio
Start-Service postgresql-x64-14  # Ajusta el nombre según tu versión
```

---

## ¿Qué contiene la base de datos?

Después de ejecutar los scripts tendrás:
- ✅ 15 tablas (users, products, orders, loyalty_history, etc.)
- ✅ Roles (Admin, Vendedor, Cliente)
- ✅ Usuario admin (email: admin@marlocookies.com / pass: Admin123!)
- ✅ 20+ productos con precios reales
- ✅ Configuración inicial del sistema

