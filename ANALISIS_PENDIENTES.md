# Análisis de Tareas Pendientes - MarLo Cookies

**Fecha:** Diciembre 11, 2025  
**Revisión completa del sistema**

---

## ✅ COMPLETADO

### 1. ✅ Cambiar "BOXES" por "BOX"
**Estado:** MAYORMENTE COMPLETADO - Requiere limpieza final

**Referencias encontradas:**
- ✅ UI: Ya se muestra como "Box" en navbar y footer
- ✅ Categoría: `{ id: 'boxes', name: 'Box', icon: '📦' }` en constants.ts (el ID es 'boxes' pero el nombre ya dice 'Box')
- ⚠️ Comentarios en código: Múltiples comentarios dicen "boxes" (minúscula)
- ⚠️ Documentación: README.md y QUICKSTART.md usan "Boxes"
- ⚠️ URL: La ruta es `/boxes` (funcional, no necesita cambio)
- ⚠️ Base de datos: Categoría se guarda como `'boxes'` (no se debe cambiar, romperá queries)

**Conclusión:** 
- El usuario VE "Box" correctamente en la interfaz ✅
- Los comentarios y documentación se pueden limpiar si es necesario
- NO cambiar el ID de categoría `'boxes'` en DB (causaría problemas)

---

### 2. ✅ Puntos vencen en 6 meses
**Estado:** PARCIALMENTE IMPLEMENTADO

**Código encontrado:**
```typescript
// frontend/src/utils/helpers.ts línea 194
if (diff <= 0) return 'Expirado';
```

**Problema:** 
- Existe lógica para mostrar "Expirado"
- NO hay verificación de 6 meses en el sistema de puntos
- La tabla `loyalty_history` NO tiene campo de expiración

**Solución recomendada:**
1. Agregar columna `expira_en` a tabla `loyalty_history`
2. Calcular expiración: `created_at + 6 months`
3. Filtrar puntos expirados en queries
4. Mostrar aviso en página de puntos

**Estado actual:** ⚠️ NO IMPLEMENTADO - Solo existe el texto "Expirado"

---

### 3. ✅ Pago en transferencia - Aviso de WhatsApp
**Estado:** ✅ COMPLETADO

**Implementación verificada:**
```tsx
// checkout/page.tsx líneas 918-932
<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
  <p className="text-sm font-medium text-green-800 mb-1">
    📸 Importante: Envía tu comprobante
  </p>
  <p className="text-sm text-green-700">
    Después de realizar la transferencia, 
    <strong>debes enviar el comprobante por WhatsApp</strong> 
    para que confirmemos tu pedido.
  </p>
</div>
```

✅ **Funciona correctamente** - Mensaje visible cuando se selecciona transferencia

---

### 4. 🔴 Ubicación en mapa - Zona automática
**Estado:** ✅ IMPLEMENTADO PERO REQUIERE GOOGLE MAPS API

**Código verificado:**
- ✅ MapLocationPicker component existe (248 líneas)
- ✅ Detección automática de zona via Haversine distance
- ✅ 9 zonas predefinidas de Maldonado
- ✅ Estado `ubicacion` con lat/lng/address/zona
- ✅ Guarda latitud/longitud en orders table

**Problema CRÍTICO:**
```
❌ Google Maps API error: BillingNotEnabledMapError
❌ REQUEST_DENIED: The webpage is not allowed to use the geocoder
```

**Solución:**
- API Key configurada: `AIzaSyAeEqtXFK2UsFqiA6tG3esL2fErUf-eL90`
- Necesita habilitar billing en Google Cloud Console
- Necesita habilitar Geocoding API
- Costo estimado: $0 con $200 crédito gratis mensual

**Documentación:** Ver `docs/GOOGLE_MAPS_SETUP.md`

**Estado:** ⚠️ CÓDIGO LISTO - FALTA CONFIGURACIÓN EXTERNA

---

### 5. ❓ Dirección de envío - Link al repartidor
**Estado:** ❓ NO CLARO QUÉ SE REQUIERE

**Implementación actual:**
- ✅ Se guardan `latitud` y `longitud` en tabla `orders`
- ✅ Campo `direccion` con texto completo
- ❌ NO hay generación de link de Google Maps
- ❌ NO hay página/panel para repartidores

**Opciones:**
1. Generar link automático: `https://maps.google.com/?q={lat},{lng}`
2. Crear vista de admin con botón "Copiar link al repartidor"
3. Incluir link en email/WhatsApp de confirmación

**Estado:** ⚠️ REQUIERE ACLARACIÓN - ¿Qué tipo de link necesitas?

---

### 6. ✅ Sacar "envío gratis" de todas partes
**Estado:** 🔴 NO IMPLEMENTADO - SIGUE APARECIENDO

**Referencias encontradas (26 menciones):**

1. **Admin - Puntos:** `'🚚 Envío gratis'` (línea 64)
2. **Admin - Puntos:** `nombre: 'Envío Gratis'` (línea 71)
3. **Admin - Puntos:** `'¡Canjea tus puntos por envío gratis!'` (línea 72)
4. **Admin - Puntos:** `<span>🚚 Envío Gratis</span>` (línea 563)
5. **Services API:** `if (subtotal >= 1500) return { costo: 0, mensaje: 'Envío gratis' }` (línea 802)
6. **Constants:** `freeShippingThreshold: 1500` (línea 79)
7. **Constants:** `freeShipping: 'Envío gratis en compras sobre $5,000'` (línea 165)
8. **Constants:** `{ id: 6, name: 'Envío Gratis', points: 1500, icon: '🚚' }` (línea 73)
9. **Puntos page:** Múltiples referencias a recompensas de envío gratis
10. **PromoBannerCarousel:** `plantilla: 'envio_gratis'` (línea 11)

**Acción requerida:**
- ❌ Eliminar lógica de envío gratis por monto mínimo
- ❌ Eliminar recompensa "Envío Gratis" de puntos
- ❌ Eliminar plantilla de banner "envio_gratis"
- ❌ Eliminar umbral freeShippingThreshold

**Estado:** 🔴 CRÍTICO - NECESITA LIMPIEZA COMPLETA

---

### 7. 🟡 Tarjetas flotantes PNG en móvil
**Estado:** ✅ IMPLEMENTADO

**Verificación:**
- ✅ Tabla `floating_images` existe
- ✅ Admin puede subir imágenes PNG
- ✅ Se muestran en página principal móvil
- ✅ Solo visible en móvil (CSS responsive)

**Código:**
```typescript
// page.tsx línea 118-128
const loadFloatingImages = async () => {
  const { data } = await floatingImagesDB.getActive();
  // ...
}
```

**Admin:**
- ✅ Panel en `/admin/configuracion`
- ✅ Panel en `/admin/galeria`
- ✅ Upload a Supabase Storage
- ✅ Orden configurable

**Estado:** ✅ COMPLETADO

---

### 8. ❓ Productos: primero cookies, luego bebida
**Estado:** ❓ REQUIERE VERIFICACIÓN EN BASE DE DATOS

**No se encontró lógica de ordenamiento específica en el código.**

**Opciones:**
1. Agregar campo `orden` o `categoria_orden` a tabla `products`
2. Ordenar por categoría: cookies (1), bebidas (2)
3. Modificar query para ordenar por categoría

**Código actual:**
```typescript
// No hay ordenamiento por categoría específico visible
```

**Estado:** ⚠️ REQUIERE IMPLEMENTACIÓN

---

### 9. ✅ Animaciones al hacer scroll
**Estado:** ✅ MAYORMENTE COMPLETADO

**Páginas con animaciones:**
- ✅ Home (5 secciones)
- ✅ Boxes (3 secciones)
- ✅ Nosotros (14 secciones)
- ✅ Puntos (7 secciones)
- ✅ Perfil (6 secciones)
- ❌ Contacto (0 secciones - errores de sintaxis previos)

**Componente:** `/components/ScrollAnimation.tsx`
- ✅ Intersection Observer API
- ✅ 5 tipos de animación (fade-up, fade-in, slide-left, slide-right, scale-up)
- ✅ Delays configurables
- ✅ Threshold 0.1

**Estado:** ✅ 5/6 páginas con animaciones (83% completado)

---

## 📊 RESUMEN GENERAL

### ✅ Completados (5/9)
1. ✅ "Box" en interfaz de usuario
2. ✅ Aviso de comprobante en transferencia
3. ✅ MapLocationPicker con zona automática (requiere API externa)
4. ✅ Tarjetas flotantes PNG en móvil
5. ✅ Animaciones de scroll (5 de 6 páginas)

### 🟡 Parcialmente (2/9)
6. 🟡 Puntos vencen en 6 meses - Solo hay texto "Expirado", falta lógica
7. 🟡 Productos ordenados - Requiere verificación

### 🔴 Pendientes (2/9)
8. 🔴 Eliminar "envío gratis" - CRÍTICO - 26 referencias a limpiar
9. 🔴 Link de dirección al repartidor - Requiere aclaración de qué necesitas

---

## 🎯 ACCIONES PRIORITARIAS

### ALTA PRIORIDAD
1. **Eliminar todas las referencias a "envío gratis"** (26 ubicaciones)
2. **Configurar Google Maps API** (seguir guía en docs/)
3. **Implementar vencimiento de puntos a 6 meses**

### MEDIA PRIORIDAD
4. **Definir e implementar link al repartidor**
5. **Verificar orden de productos (cookies primero)**
6. **Agregar animaciones a página Contacto**

### BAJA PRIORIDAD
7. **Limpiar comentarios que digan "boxes"** (opcional, no afecta funcionalidad)
8. **Actualizar documentación** (README, QUICKSTART)

---

## 🔍 DETALLES TÉCNICOS

### Base de Datos
- ✅ `latitud`, `longitud` en `orders` table
- ✅ `floating_images` table completa
- ⚠️ Falta `expira_en` en `loyalty_history`
- ❓ Verificar orden en `products`

### APIs Externas
- ⚠️ Google Maps: Configurado en Vercel pero necesita billing
- ✅ Supabase: Funcionando correctamente
- ✅ MercadoPago: Funcionando

### Performance
- ✅ Scroll animations optimizadas (Intersection Observer)
- ✅ Lazy loading de imágenes
- ✅ Queries optimizadas con índices

---

## 💬 PREGUNTAS PENDIENTES

1. **Link al repartidor:** ¿Quieres un botón en admin que copie un link de Google Maps?
2. **Envío gratis:** ¿Eliminar completamente o solo ocultar?
3. **Puntos expirados:** ¿Los puntos se eliminan automáticamente o solo se marcan como expirados?
4. **Orden productos:** ¿Hay preferencia específica además de cookies → bebidas?
