# ⚠️ Nota sobre el Backend NestJS

## Estado Actual

El código del backend NestJS en la carpeta `/backend` está **EN PAUSA** y **NO se está usando actualmente**.

## ¿Por qué?

El proyecto ha migrado a **Supabase** como solución Backend-as-a-Service (BaaS), lo que elimina la necesidad de mantener un servidor backend separado.

## ¿Qué significa esto?

### ❌ NO Usar Actualmente

- Los módulos de NestJS (`auth`, `products`, `orders`, etc.)
- TypeORM entities y migrations
- Controllers y services
- El servidor en `localhost:3000`

### ✅ Usar en su lugar

- **Supabase** para database (PostgreSQL)
- **Supabase Auth** para autenticación
- **Supabase Client SDK** para queries
- Todo desde `frontend/src/services/supabase-api.ts`

## ¿Se eliminará el código backend?

**NO**. Se mantiene por:

1. **Referencia**: Útil para entender la lógica de negocio original
2. **Documentación**: Endpoints y DTOs están bien documentados
3. **Futuro**: Si se necesita migrar de vuelta o crear microservicios específicos
4. **Comparación**: Para entender las diferencias arquitecturales

## ¿Cómo funciona ahora?

```
Antes:
Next.js Frontend → NestJS API → PostgreSQL

Ahora:
Next.js Frontend → Supabase (Database + Auth + Storage)
```

## Archivos Relevantes Ahora

| Archivo Antes (NestJS) | Archivo Ahora (Supabase) |
|------------------------|--------------------------|
| `backend/src/modules/auth/` | Supabase Auth integrado |
| `backend/src/modules/products/` | `frontend/src/services/supabase-api.ts` |
| `backend/src/entities/` | `database/supabase-schema.sql` |
| `backend/.env` | `frontend/.env.local` |

## ¿Cuándo usaría el backend NestJS?

Considera volver a NestJS si:

- Necesitas lógica de negocio MUY compleja
- Requieres control total del servidor
- Integraciones con sistemas legacy específicos
- Jobs programados complejos (aunque Supabase tiene Edge Functions)

Para el 95% de casos de e-commerce, **Supabase es suficiente y superior**.

## Migración Completa

Ver documentación detallada en:
📄 `docs/NESTJS_TO_SUPABASE_MIGRATION.md`

## Quick Start Actual

Ver instrucciones actualizadas en:
📄 `QUICKSTART.md`

---

**Última actualización**: Noviembre 2025  
**Estado**: Backend NestJS en pausa, proyecto usa Supabase  
**Documentación**: Actualizada para reflejar arquitectura Supabase
