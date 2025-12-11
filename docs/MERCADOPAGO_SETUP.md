# 🛒 Integración de Mercado Pago - MarLo Cookies

## 📋 Pasos para Configurar

### 1. Obtener Credenciales de Mercado Pago

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.uy/developers/panel)
2. Crea una aplicación o usa una existente
3. Copia las credenciales:
   - **Public Key** → `NEXT_PUBLIC_MP_PUBLIC_KEY`
   - **Access Token** → `MP_ACCESS_TOKEN`

### 2. Configurar Variables de Entorno

Crea o edita `.env.local` en la carpeta `frontend/`:

```env
# Mercado Pago
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Service Role (para webhook)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-de-supabase
```

### 3. Ejecutar Script SQL en Supabase

1. Abre Supabase Dashboard → SQL Editor
2. Ejecuta el archivo `database/add-mercadopago-columns.sql`
3. Esto agregará las columnas necesarias para tracking de pagos

### 4. Configurar Webhook en Mercado Pago

1. Ve a tu aplicación en Mercado Pago Developers
2. Configura la URL de notificaciones (IPN):
   ```
   https://tu-dominio.vercel.app/api/mercadopago/webhook
   ```
3. Marca que deseas recibir notificaciones de **Pagos**

### 5. Probar en Modo Sandbox (Desarrollo)

Mercado Pago tiene un modo de prueba que puedes usar:

1. En el panel de desarrolladores, activa el modo TEST
2. Usa las credenciales de TEST (diferentes a las de producción)
3. Usa tarjetas de prueba: [Tarjetas de prueba](https://www.mercadopago.com.uy/developers/es/docs/checkout-api/testing)

Ejemplos de tarjetas de prueba:
- **VISA Aprobada:** 4509 9535 6623 3704 (CVV: 123, Venc: 11/25)
- **Mastercard Rechazada:** 5031 7557 3453 0604 (CVV: 123, Venc: 11/25)

### 6. Desplegar a Producción

```bash
cd frontend
vercel --prod
```

**IMPORTANTE:** Asegúrate de que las variables de entorno estén configuradas en Vercel:
1. Ve a tu proyecto en Vercel → Settings → Environment Variables
2. Agrega:
   - `NEXT_PUBLIC_MP_PUBLIC_KEY`
   - `MP_ACCESS_TOKEN`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔄 Flujo de Pago

1. **Usuario elige Mercado Pago** en checkout
2. **Frontend crea el pedido** en Supabase con estado `pendiente_pago`
3. **Frontend llama a `/api/mercadopago/create-preference`** con datos del pedido
4. **API crea preferencia** en MP y devuelve `init_point` (URL de pago)
5. **Usuario es redirigido** a Mercado Pago para pagar
6. **Usuario paga** con tarjeta/QR/etc
7. **Mercado Pago notifica** nuestro webhook `/api/mercadopago/webhook`
8. **Webhook actualiza** el estado del pedido según el resultado del pago:
   - `approved` → `confirmado`
   - `pending` → `pendiente_pago`
   - `rejected` → `cancelado`
9. **Usuario vuelve** a nuestra página de confirmación

---

## 🧪 Testing Local

Para probar localmente con webhook, necesitas exponer tu localhost:

### Opción 1: ngrok (Recomendado)
```bash
# Instalar ngrok: https://ngrok.com/download
ngrok http 3005
```

Esto te dará una URL pública temporal como:
```
https://abc123.ngrok.io
```

Configura esa URL en Mercado Pago:
```
https://abc123.ngrok.io/api/mercadopago/webhook
```

### Opción 2: Vercel Dev
```bash
vercel dev
```

---

## 📊 Estados de Pago

| Estado MP | Estado en DB | Descripción |
|-----------|--------------|-------------|
| `approved` | `confirmado` | Pago aprobado |
| `pending` | `pendiente_pago` | Esperando confirmación |
| `in_process` | `pendiente_pago` | En proceso |
| `rejected` | `cancelado` | Pago rechazado |
| `cancelled` | `cancelado` | Cancelado por el usuario |

---

## 🚨 Troubleshooting

### Webhook no recibe notificaciones
1. Verifica que la URL sea accesible públicamente
2. Verifica que retorne status 200
3. Revisa logs en Mercado Pago Developers → Webhooks

### Error "Mercado Pago no configurado"
- Verifica que `MP_ACCESS_TOKEN` esté en `.env.local`
- Reinicia el servidor de desarrollo

### Pago aprobado pero pedido sigue pendiente
- Revisa logs del webhook en Vercel/Supabase
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- Ejecuta el SQL para agregar las columnas de MP

---

## 💰 Recargo del 10%

El sistema agrega automáticamente un 10% de recargo al elegir Mercado Pago.
Esto está configurado en `checkout/page.tsx`:

```typescript
const recargoMP = metodoPago === 'mercadopago' 
  ? Math.round((totalSinEnvio + costoEnvioFinal) * 0.10) 
  : 0;
```

Para cambiar el porcentaje, modifica el `0.10` (10%) por el valor deseado.

---

## 📱 Métodos de Pago Disponibles

Con Mercado Pago, los clientes pueden pagar con:
- 💳 Tarjetas de crédito (hasta 12 cuotas)
- 💳 Tarjetas de débito
- 📱 Billetera de Mercado Pago
- 🏪 Efectivo (Abitab, Redpagos)
- 📲 QR de Mercado Pago

---

## 🔐 Seguridad

- ✅ El Access Token NUNCA se expone al frontend
- ✅ Las API routes corren en el servidor de Next.js
- ✅ El webhook valida que las notificaciones vengan de MP
- ✅ Los pagos se procesan en los servidores seguros de MP

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la [Documentación oficial de MP](https://www.mercadopago.com.uy/developers/es/docs)
2. Revisa los logs en Vercel
3. Contacta a soporte de Mercado Pago

---

## ✅ Checklist de Deployment

- [ ] Variables de entorno configuradas en Vercel
- [ ] Script SQL ejecutado en Supabase
- [ ] Webhook configurado en Mercado Pago
- [ ] Probado en modo TEST
- [ ] Credenciales de PRODUCCIÓN configuradas
- [ ] Deploy realizado
- [ ] Pago de prueba realizado en producción

---

¡Listo! Mercado Pago está integrado 🚀
