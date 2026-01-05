# 🚨 SOLUCIÓN URGENTE - Exceso de uso Supabase

## Estado actual: 🔴 CRÍTICO
- **Cache Egress**: 208% (10.4 GB / 5 GB límite)
- **REST requests**: 1,600 en 60 min
- **Problema**: Consultas excesivas sin cache

## ✅ ACCIONES INMEDIATAS (EJECUTAR HOY)

### 1. Ejecutar este SQL en Supabase AHORA:

```sql
-- DESACTIVAR REALTIME en tablas que no lo necesitan
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS products;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS featured_cards;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS floating_images;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS promo_banners;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS site_settings;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS popups;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS subscribers;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS coupons;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS loyalty_history;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS users;

-- SOLO DEJAR REALTIME en orders (la única tabla que realmente lo necesita)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### 2. Configurar Cache en Vercel

Ve a tu proyecto en Vercel → Settings → Headers → Add:

```json
{
  "source": "/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, s-maxage=60, stale-while-revalidate=300"
    }
  ]
}
```

### 3. Archivos SQL pendientes de ejecutar

Ejecuta estos en Supabase SQL Editor:

1. ✅ `database/add-customer-fields-to-orders.sql` - URGENTE (para que funcione el teléfono)
2. `database/fix-handle-new-user-trigger.sql` - IMPORTANTE (para birthday + teléfono)
3. `database/add-product-restrictions.sql` - Opcional

## 📊 PRÓXIMOS PASOS (Mañana)

### Implementar React Query (cache automático)

```bash
cd frontend
npm install @tanstack/react-query
```

### Monitorear uso

Ve a Supabase Dashboard cada hora para ver si baja el egress.

## 💰 DECISIÓN CLAVE

### Opción A - Upgrade a Pro ($25/mes)
**RECOMENDADO para un negocio real**
- 50 GB egress
- Sin riesgo de caídas
- Mejor performance
- Support incluido

### Opción B - Optimizar y esperar
**Solo si no hay presupuesto**
- Aplicar todas las optimizaciones
- Cruzar dedos hasta próximo ciclo
- Riesgo de fallos visibles

## 🎯 Meta: Bajar de 5 GB/mes

Con las optimizaciones deberías llegar a ~2-3 GB/mes.

## ⚠️ RLS Issues (177 warnings)

Estos no causan el problema de egress, pero son riesgo de seguridad.
Revisar después de resolver el tema crítico.

---

**STATUS**: Cambios de código ya desplegados ✅
**PENDIENTE**: Ejecutar SQL en Supabase ⚠️
