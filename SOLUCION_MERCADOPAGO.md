# 🛠️ Solución: Problema con MercadoPago - Confirmación Manual de Pagos

## 🔴 Problema Identificado

Los pedidos con MercadoPago quedan en estado **"pendiente_pago"** y no se pueden avanzar al siguiente estado porque:

1. **Webhook no notifica automáticamente**: El webhook de MercadoPago puede tardar o fallar en notificar
2. **Sin opción manual**: No existía forma de confirmar manualmente el pago en el admin
3. **Pedidos bloqueados**: Los pedidos quedaban sin poder procesar hasta que llegara la notificación

## ✅ Solución Implementada

He agregado un **botón de confirmación manual** para pagos de MercadoPago en el panel de administración.

### Cambios Realizados:

#### 1. **Backend** (`supabase-fetch.ts`)
- ✅ Agregada función `confirmPayment()` para actualizar estado a "preparando"

#### 2. **Admin - Lista de Pedidos** (`admin/pedidos/page.tsx`)
- ✅ Botón "Confirmar Pago Recibido" para pedidos con MP pendientes
- ✅ Aparece naranja para diferenciarlo del botón de transferencias
- ✅ Al confirmar, el pedido pasa a estado "Preparando"

#### 3. **Admin - Detalle de Pedido** (`admin/pedidos/[id]/page.tsx`)
- ✅ Mismo botón en la vista de detalle del pedido
- ✅ Confirmación antes de procesar
- ✅ Mensaje de éxito al confirmar

## 🎯 Cómo Usar

### Para Confirmar un Pago de MercadoPago:

1. **Ve al panel de Admin → Pedidos**
2. **Busca el pedido** con estado "Pendiente de Pago" 🟠
3. **Verifica en tu cuenta de MercadoPago** que el pago fue acreditado
4. **Haz clic en "Confirmar Pago Recibido"** (botón naranja)
5. **Confirma la acción** en el diálogo
6. ✅ **El pedido pasa automáticamente a "Preparando"**

### Ubicación de los Botones:

```
📋 Lista de Pedidos
  └─ Tarjeta del pedido
     └─ Sección "Pago"
        └─ [🟠 Confirmar Pago Recibido]

📄 Detalle del Pedido
  └─ Panel "💳 Método de Pago"
     └─ [🟠 Confirmar Pago Recibido]
```

## 🔄 Flujo Completo de MercadoPago

### Flujo Automático (Ideal):
1. Cliente paga con MercadoPago
2. Pedido se crea con estado `pendiente_pago`
3. **Webhook recibe notificación** de MP
4. Estado cambia automáticamente a `preparando`
5. Admin prepara el pedido

### Flujo Manual (Backup):
1. Cliente paga con MercadoPago
2. Pedido se crea con estado `pendiente_pago`
3. Webhook NO notifica (falla/demora)
4. **Admin verifica pago en MercadoPago**
5. **Admin hace clic en "Confirmar Pago Recibido"**
6. Estado cambia a `preparando`
7. Admin prepara el pedido

## 🔍 Verificar Pagos en MercadoPago

Para confirmar que un pago fue recibido:

1. **Ingresa a tu cuenta de MercadoPago**
2. **Ve a "Actividad" → "Ventas y pagos"**
3. **Busca el pedido** por:
   - Número de pedido (ej: MLO-186CB809)
   - Monto
   - Fecha/hora
4. **Verifica que el estado sea "Aprobado"** ✅
5. **Regresa al admin y confirma manualmente**

## 🚨 Cuándo Usar la Confirmación Manual

Usa el botón de confirmación manual cuando:

- ✅ Verificaste el pago en MercadoPago
- ✅ El webhook no actualizó automáticamente
- ✅ El cliente te contactó confirmando que pagó
- ✅ Han pasado más de 5 minutos sin actualización

**NO uses el botón si:**
- ❌ No verificaste el pago en MP
- ❌ El pago está rechazado/pendiente
- ❌ El cliente no completó el pago

## 📊 Estados de Pago MP

| Estado en MP | Estado en DB | ¿Confirmar Manual? |
|--------------|--------------|-------------------|
| `approved` | `preparando` | ✅ Sí, si no se actualizó |
| `pending` | `pendiente_pago` | ❌ No, esperar |
| `in_process` | `pendiente_pago` | ❌ No, esperar |
| `rejected` | `cancelado` | ❌ No |
| `cancelled` | `cancelado` | ❌ No |

## 🛠️ Solución de Problemas

### "No aparece el botón de confirmar"
- Verifica que el pedido esté en estado `pendiente_pago`
- Verifica que el método de pago sea `mercadopago`
- Recarga la página

### "Error al confirmar el pago"
- Verifica tu conexión a internet
- Intenta nuevamente
- Revisa los logs del navegador (F12 → Console)

### "Webhook sigue sin funcionar"
- Verifica que `MP_ACCESS_TOKEN` esté configurado
- Verifica que la URL del webhook sea pública
- Revisa logs en Vercel/Render

## 📞 Soporte

Si el problema persiste:
1. Revisa los logs en la consola del navegador
2. Contacta al desarrollador con:
   - ID del pedido
   - Estado actual
   - Mensaje de error (si hay)
   - Screenshot

---

**Última actualización**: 12 de enero de 2026
**Versión**: 1.0
