# 🚀 GUÍA RÁPIDA - Confirmar Pagos de MercadoPago

## ⚡ Solución Inmediata

Si ayer no dejaba pagar con MercadoPago y hoy no puedes confirmar los pagos, **ahora tienes un botón para confirmar manualmente**.

---

## 📍 PASO A PASO

### 1️⃣ Identifica el Pedido Pendiente

En el **Admin → Pedidos**, busca pedidos con:
- 🟠 Estado: **"Pendiente de Pago"**
- 💳 Método: **"MercadoPago"**

```
┌────────────────────────────────────┐
│ MLO-6B52480F    🟠 Pendiente Pago │
│ Yazmin Llama                        │
│ 💳 MercadoPago                     │
│ Total: $5,935                       │
│                                     │
│ [🟠 Confirmar Pago Recibido]      │ ← BOTÓN NUEVO
└────────────────────────────────────┘
```

### 2️⃣ Verifica el Pago en MercadoPago

1. Abre [mercadopago.com.uy](https://www.mercadopago.com.uy)
2. Ve a **"Actividad"** → **"Ventas y pagos"**
3. Busca el pedido por:
   - Número (ej: MLO-6B52480F)
   - Monto ($5,935)
   - Fecha/hora del pedido

4. **¿El pago dice "Aprobado"?** ✅
   - **SÍ** → Ve al paso 3
   - **NO** → Espera o contacta al cliente

### 3️⃣ Confirma en el Admin

**Opción A - Desde la Lista de Pedidos:**
```
1. Haz clic en el botón naranja "Confirmar Pago Recibido"
2. Confirma la acción
3. ✅ El pedido pasa a "Preparando"
```

**Opción B - Desde el Detalle del Pedido:**
```
1. Entra al pedido (clic en "Ver detalle completo")
2. En el panel "💳 Método de Pago"
3. Haz clic en "Confirmar Pago Recibido"
4. Confirma la acción
5. ✅ El pedido pasa a "Preparando"
```

---

## 🔥 CASOS DE USO

### Caso 1: Cliente pagó ayer pero sigue pendiente
```
✅ SOLUCIÓN:
1. Verifica en MercadoPago que el pago fue aprobado
2. Confirma manualmente desde el admin
3. Prepara el pedido normalmente
```

### Caso 2: Cliente dice que pagó pero no veo el pedido
```
⚠️ ACCIÓN:
1. Busca el pago en MercadoPago por fecha/hora
2. Si existe, busca el pedido por número de referencia
3. Si no existe el pedido, contacta al cliente
```

### Caso 3: Webhook no está funcionando
```
✅ SOLUCIÓN TEMPORAL:
Usa la confirmación manual para todos los pedidos de MP
hasta que se resuelva el webhook
```

---

## ⚠️ IMPORTANTE

### ✅ CONFIRMA SOLO SI:
- Verificaste el pago en MercadoPago
- El estado en MP es "Aprobado"
- El monto coincide con el pedido

### ❌ NO CONFIRMES SI:
- El pago está "Pendiente" en MP
- El pago fue rechazado
- No verificaste en MercadoPago
- El cliente no completó el pago

---

## 🎨 IDENTIFICACIÓN VISUAL

### Botones por Método de Pago:

```
🟡 Transferencia (Amarillo)
  [⏳ Confirmar Transferencia]
  ↓
  Requiere verificar transferencia bancaria

🟠 MercadoPago (Naranja)
  [✓ Confirmar Pago Recibido]
  ↓
  Requiere verificar en plataforma MP
```

---

## 📱 ACCESO RÁPIDO

### Desde el navegador móvil:

1. **Admin → Pedidos**
2. **Busca el pedido con 🟠**
3. **Scroll hasta "Pago"**
4. **Toca el botón naranja**

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Cuánto tarda el webhook normalmente?**  
R: Entre 1-5 minutos. Si pasan más de 10 minutos, usa la confirmación manual.

**P: ¿Puedo confirmar sin verificar en MP?**  
R: NO. Siempre verifica primero que el pago fue aprobado.

**P: ¿Qué pasa si confirmo por error?**  
R: El pedido pasará a "Preparando". Si fue error, tendrás que cancelarlo.

**P: ¿El botón funciona en móvil?**  
R: SÍ. Funciona en cualquier dispositivo.

---

## 🆘 SI ALGO SALE MAL

1. **Recarga la página** (F5)
2. **Verifica tu conexión**
3. **Revisa la consola** (F12 → Console)
4. **Contacta soporte** con:
   - ID del pedido
   - Captura de pantalla
   - Mensaje de error

---

**¡Ahora puedes procesar todos tus pedidos de MercadoPago sin esperar al webhook!** 🎉
