# 🏪 Sistema de Restricciones de Productos

## ✅ Implementado

Se agregaron 2 nuevas restricciones para productos:

### 1️⃣ Solo Retiro en Local 🏪
- **Campo:** `solo_retiro_local` (boolean)
- **Efecto:** El producto NO se puede pedir para envío, solo para retirar en el local físico
- **Validación:** 
  - En checkout, si hay productos marcados con esta restricción, se DESACTIVA la opción de delivery
  - Solo permite seleccionar "Retiro en Local"
  - Muestra banner naranja con lista de productos restringidos

### 2️⃣ No Disponible en Box 📦
- **Campo:** `no_disponible_box` (boolean) 
- **Efecto:** El producto NO aparece en el selector de box personalizado
- **Validación:**
  - Se filtra automáticamente de la lista de cookies disponibles en /boxes

---

## 📁 Archivos Modificados

### Base de Datos
- **`database/add-product-restrictions.sql`** (NUEVO)
  - Agrega campos `solo_retiro_local` y `no_disponible_box` a la tabla products
  - Crea índices para mejorar consultas
  - Ejecutar en Supabase SQL Editor

### Admin - Listado de Productos
- **`frontend/src/app/admin/productos/page.tsx`**
  - Nueva columna "Restricciones" en la tabla
  - Muestra badges:
    - 🏪 Solo retiro (naranja)
    - 📦 No en box (morado)

### Admin - Crear/Editar Producto
- **`frontend/src/app/admin/productos/nuevo/page.tsx`**
  - Nueva sección "Restricciones de Entrega" con checkboxes:
    - ✅ Solo Retiro en Local (con descripción)
    - ✅ No Disponible en Box Personalizado (con descripción)
  - Vista previa muestra los badges correspondientes

### Selector de Box
- **`frontend/src/app/boxes/page.tsx`**
  - Filtro automático: excluye productos con `no_disponible_box = true`
  - Solo muestra cookies activas y disponibles para box

### Checkout
- **`frontend/src/app/checkout/page.tsx`**
  - Verifica al cargar si hay productos con `solo_retiro_local = true`
  - Si los hay:
    - Fuerza tipo de entrega a "Retiro en Local"
    - Deshabilita botón de "Delivery"
    - Muestra banner naranja con advertencia
    - Lista los productos que requieren retiro

---

## 🔧 Cómo Usar

### Desde el Admin

1. **Ir a Admin → Productos**
2. **Crear producto nuevo o editar uno existente**
3. **Scroll hasta "Restricciones de Entrega"**
4. **Marcar las opciones deseadas:**
   - ☑️ **Solo Retiro en Local:** Para productos perecederos, frágiles o especiales
   - ☑️ **No Disponible en Box:** Para productos grandes, boxes pre-armados, bebidas, etc.

### Casos de Uso

#### Solo Retiro en Local 🏪
- Tortas personalizadas
- Productos muy frágiles
- Items que requieren refrigeración
- Productos especiales que no se pueden enviar

#### No Disponible en Box 📦
- Boxes pre-armados (no tiene sentido elegirlos para armar box)
- Bebidas
- Productos "Otros"
- Ediciones limitadas que no van en box personalizado

---

## 📋 SQL a Ejecutar

**Archivo:** `database/add-product-restrictions.sql`

```sql
-- Ejecutar en Supabase SQL Editor
-- Agrega los 2 campos nuevos a la tabla products
```

---

## 🧪 Testing

### Probar Solo Retiro Local
1. Marcar una cookie como "Solo Retiro Local"
2. Agregarla al carrito
3. Ir a checkout
4. Verificar que:
   - Aparece banner naranja con advertencia
   - Opción "Delivery" está deshabilitada y gris
   - Solo se puede seleccionar "Retiro en Local"

### Probar No Disponible Box
1. Marcar una cookie como "No Disponible en Box"
2. Ir a /boxes
3. Verificar que esa cookie NO aparece en el selector
4. Las cookies normales siguen apareciendo

---

## ⚠️ Importante

- **Ambas restricciones son independientes:** Puedes marcar solo una, ambas, o ninguna
- **Valores por defecto:** `false` para ambos campos (sin restricciones)
- **Retrocompatibilidad:** Productos existentes quedan sin restricciones
- **Admin puede ver restricciones:** En la columna "Restricciones" de la tabla

---

## 📊 Estadísticas

Query para ver productos restringidos:

```sql
-- Ver productos solo retiro
SELECT nombre, categoria, solo_retiro_local 
FROM products 
WHERE solo_retiro_local = true;

-- Ver productos no disponibles en box
SELECT nombre, categoria, no_disponible_box
FROM products 
WHERE no_disponible_box = true;

-- Resumen
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN solo_retiro_local THEN 1 ELSE 0 END) as solo_retiro,
  SUM(CASE WHEN no_disponible_box THEN 1 ELSE 0 END) as no_box
FROM products;
```

---

✅ **Todo listo para usar!** Primero ejecuta el SQL, luego despliega el frontend.
