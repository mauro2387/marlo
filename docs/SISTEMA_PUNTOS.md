# 💎 Sistema de Puntos - MarLo Cookies

## Resumen Ejecutivo

El sistema de lealtad de MarLo Cookies está diseñado para recompensar a nuestros clientes más fieles con beneficios exclusivos y productos gratis.

---

## 📊 Mecánica del Sistema

### Acumulación de Puntos

**Regla Base**: `$1 gastado = 1 punto ganado`

- ✅ Los puntos se acumulan **automáticamente** en cada compra
- ✅ Los puntos se registran cuando el pedido está en estado **"Entregado"**
- ✅ Los puntos **NO tienen fecha de expiración**
- ✅ El saldo de puntos es visible en tiempo real en el dashboard del usuario

#### Ejemplo de Acumulación
```
Compra 1: Box x4 ($720) → +720 puntos
Compra 2: 3 Cookies ($597) → +597 puntos
Compra 3: Box x6 ($1,080) → +1,080 puntos
Total acumulado: 2,397 puntos
```

---

## 🎁 Tabla de Canjes

| Puntos Requeridos | Recompensa | Valor Equivalente | Descripción |
|-------------------|------------|-------------------|-------------|
| **2,000 pts** | 1 Café + 1 Cookie | ~$400 | Café caliente + cookie a elección |
| **5,000 pts** | Box x 4 Unidades | $720 | Box con 4 cookies personalizables |
| **10,000 pts** | Box x 6 Unidades | $1,080 | Box con 6 cookies personalizables |
| **2,500 pts** | Cookie Edición Limitada | $249 | Acceso a sabores exclusivos del mes |
| **3,000 pts** | 15% Descuento | Variable | Cupón 15% en próxima compra |
| **1,500 pts** | Envío Gratis | ~$150 | Sin mínimo de compra |

---

## ⭐ Cookies Edición Limitada

### Concepto

Cada mes lanzamos **2 sabores exclusivos** que:
- ✨ Están disponibles **solo por 15 días**
- 🔥 Tienen **stock limitado**
- 🚫 **NO vuelven una vez terminados**
- 💎 Son **canjeables con 2,500 puntos**

### Ciclo de Rotación

```
┌─────────────────────────────────────────┐
│ Mes 1: Días 1-15                        │
│ ├─ Sabor A: Lavanda & Miel              │
│ └─ Sabor B: Frambuesa & Chocolate Blanco│
├─────────────────────────────────────────┤
│ Mes 1: Días 16-30                       │
│ ├─ Sabor C: Nuevo sabor X               │
│ └─ Sabor D: Nuevo sabor Y               │
├─────────────────────────────────────────┤
│ Mes 2: Días 1-15                        │
│ ├─ Sabor E: Nuevo sabor Z               │
│ └─ Sabor F: Nuevo sabor W               │
└─────────────────────────────────────────┘
```

### Gestión Técnica

**En la base de datos:**
```sql
INSERT INTO products (
  nombre, 
  descripcion, 
  categoria, 
  precio, 
  es_fijo, 
  es_limitado,
  fecha_inicio, 
  fecha_fin, 
  stock, 
  visible, 
  destacado
) VALUES (
  'Cookie Lavanda & Miel',
  'Cookie aromática con lavanda francesa y miel orgánica',
  'Cookies',
  249.00,
  FALSE,           -- No es producto fijo
  TRUE,            -- Es edición limitada
  '2025-11-25',    -- Fecha de inicio
  '2025-12-10',    -- Fecha de fin (15 días)
  200,             -- Stock limitado
  TRUE,            -- Visible en catálogo
  TRUE             -- Destacado en homepage
);
```

**Estado del Producto:**
- **Activo** (fecha_inicio ≤ HOY ≤ fecha_fin): Visible en catálogo
- **Próximamente** (HOY < fecha_inicio): No visible, anuncio en homepage
- **Finalizado** (HOY > fecha_fin): Archivado, no visible

---

## 🔄 Flujo de Canje

### Desde el Dashboard del Usuario

1. Usuario navega a `/puntos`
2. Ve su saldo actual de puntos
3. Explora recompensas disponibles
4. Selecciona una recompensa
5. Sistema valida puntos suficientes
6. Usuario confirma canje
7. Sistema genera:
   - Cupón con código único
   - Descuento de puntos en saldo
   - Registro en `loyalty_history`
   - Notificación al usuario
8. Usuario usa cupón en próxima compra

### Validaciones del Sistema

```typescript
// Pseudo-código de validación
function validarCanje(userId, rewardId, puntosRequeridos) {
  const saldoUsuario = getSaldoPuntos(userId);
  
  if (saldoUsuario < puntosRequeridos) {
    return { error: 'Puntos insuficientes' };
  }
  
  if (rewardId === 'limited_edition') {
    const cookiesLimitadas = getProductosLimitadosActivos();
    if (cookiesLimitadas.length === 0) {
      return { error: 'No hay ediciones limitadas disponibles' };
    }
  }
  
  return { success: true };
}
```

---

## 📈 Historial de Transacciones

Cada movimiento de puntos se registra en `loyalty_history`:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `tipo` | "suma" o "resta" | "suma" |
| `puntos` | Cantidad de puntos | 720 |
| `saldo_anterior` | Saldo antes de la operación | 1,450 |
| `saldo_nuevo` | Saldo después de la operación | 2,170 |
| `descripcion` | Detalle de la transacción | "Compra Box x4" |
| `order_id` | ID del pedido relacionado (opcional) | uuid |
| `created_at` | Fecha de la transacción | timestamp |

**Ejemplo de Historial:**
```
+720 pts  | Compra Box x4              | 25 Nov 2025
-2000 pts | Canje: Café + Cookie       | 22 Nov 2025
+450 pts  | Compra 3 cookies           | 18 Nov 2025
-5000 pts | Canje: Box x4 gratis       | 10 Nov 2025
+1200 pts | Compra Box x6              | 05 Nov 2025
```

---

## 🎯 Estrategias de Marketing

### Incentivos para Acumulación

1. **Compra sugerida**: "¡Estás a 280 puntos de tu próxima recompensa!"
2. **Email semanal**: Resumen de puntos y recompensas desbloqueables
3. **Push notification**: "Nueva edición limitada disponible por 15 días"
4. **Banner homepage**: Countdown de ediciones limitadas

### Promociones Especiales

- 🎂 **Cumpleaños**: Doble puntos durante tu mes
- 🎉 **Primera compra**: Bonus de 200 puntos
- 📦 **Compras grandes**: +10% puntos en pedidos >$5,000
- ⭐ **Referidos**: 500 puntos por amigo referido

---

## 🛠️ Configuración del Sistema

### Parámetros Editables (tabla `config`)

```sql
-- Tasa de conversión
UPDATE config SET value = '1' WHERE key = 'loyalty_points_rate';

-- Canjes
UPDATE config SET value = '2000' WHERE key = 'loyalty_redeem_cafe_cookie';
UPDATE config SET value = '5000' WHERE key = 'loyalty_redeem_box4';
UPDATE config SET value = '10000' WHERE key = 'loyalty_redeem_box6';
UPDATE config SET value = '2500' WHERE key = 'loyalty_redeem_limited';
```

### API Endpoints

**Obtener saldo**
```http
GET /api/v1/loyalty/balance
Authorization: Bearer {token}

Response:
{
  "puntos_actuales": 3450,
  "puntos_totales_ganados": 5450,
  "puntos_totales_canjeados": 2000
}
```

**Canjear puntos**
```http
POST /api/v1/loyalty/redeem
Authorization: Bearer {token}
Content-Type: application/json

{
  "reward_id": "cafe_cookie",
  "puntos": 2000
}

Response:
{
  "success": true,
  "nuevo_saldo": 1450,
  "cupon_codigo": "CANJE-2000-ABC123",
  "mensaje": "¡Canje exitoso! Tu cupón estará disponible en 'Mis Cupones'"
}
```

**Historial**
```http
GET /api/v1/loyalty/history?limit=10&offset=0
Authorization: Bearer {token}

Response:
{
  "transacciones": [
    {
      "id": "uuid",
      "tipo": "suma",
      "puntos": 720,
      "descripcion": "Compra Box x4",
      "fecha": "2025-11-25T14:30:00Z"
    },
    ...
  ],
  "total": 45
}
```

---

## 📊 Métricas y Reportes

### KPIs Clave

1. **Tasa de canje**: % de usuarios que han canjeado al menos una vez
2. **Puntos promedio por usuario**: Total puntos / Total usuarios
3. **Recompensa más popular**: Canje más frecuente
4. **Tasa de retención**: Usuarios activos con programa de puntos vs sin programa
5. **Valor de vida del cliente (CLV)**: Ventas totales de usuarios con puntos activos

### Dashboard Administrativo

```
┌─────────────────────────────────────────────┐
│ 📊 Sistema de Puntos                        │
├─────────────────────────────────────────────┤
│ Total puntos en circulación: 2,450,000 pts │
│ Usuarios activos: 1,234                     │
│ Canjes este mes: 89                         │
│ Puntos canjeados (mes): 178,000 pts        │
│                                             │
│ Recompensa más popular: Café + Cookie      │
│ Tasa de canje: 37.2%                       │
│ Engagement rate: 68%                        │
└─────────────────────────────────────────────┘
```

---

## 🚨 Consideraciones Importantes

### Seguridad

- ✅ Los canjes deben validarse en el backend (nunca confiar en el frontend)
- ✅ Transacciones atómicas para evitar doble canje
- ✅ Logs de auditoría para todas las operaciones de puntos
- ✅ Límite de canjes por día por usuario (prevenir fraude)

### UX/UI

- ✅ Feedback visual inmediato al canjear
- ✅ Animaciones de celebración al desbloquear recompensas
- ✅ Progress bars para recompensas próximas
- ✅ Badges destacados para ediciones limitadas
- ✅ Countdown timer para productos limitados

### Performance

- ✅ Caché de saldo de puntos (actualizar solo en transacciones)
- ✅ Índices en `loyalty_history.user_id` y `loyalty_history.created_at`
- ✅ Paginación en historial de transacciones
- ✅ Query optimizada para productos limitados activos

---

## 📅 Calendario de Ediciones Limitadas 2025

| Periodo | Sabor 1 | Sabor 2 | Tema |
|---------|---------|---------|------|
| Nov 25 - Dic 10 | Lavanda & Miel | Frambuesa & Chocolate Blanco | Primavera Aromática |
| Dic 11 - Dic 25 | Jengibre & Canela | Naranja & Arándanos | Especias Navideñas |
| Ene 1 - Ene 15 | Coco & Lima | Mango & Maracuyá | Tropical Verano |
| Ene 16 - Ene 30 | Café Expresso | Caramelo Salado | Dulce Tentación |

> **Nota**: Programar con 30 días de anticipación para gestión de inventario y marketing

---

## 🆘 Soporte y Preguntas Frecuentes

### ¿Los puntos expiran?
No, los puntos acumulados no tienen fecha de expiración.

### ¿Puedo transferir puntos a otro usuario?
No, los puntos son personales e intransferibles.

### ¿Qué pasa si cancelo un pedido?
Si el pedido ya estaba "Entregado" y sumó puntos, al cancelar se restarán los puntos correspondientes.

### ¿Puedo combinar puntos con cupones?
Sí, puedes usar un canje de puntos junto con cupones de descuento.

### ¿Cómo sé cuándo llegan las ediciones limitadas?
Te notificaremos por email y WhatsApp 3 días antes del lanzamiento.

---

**Última actualización**: Noviembre 25, 2025  
**Versión del documento**: 1.0
