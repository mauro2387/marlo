# 🤖 Guía de Configuración: WhatsApp IA Bot para Marlo Cookies

## ✅ Implementación Completada

Se ha implementado un sistema completo de chatbot con IA para WhatsApp Business que:
- ✅ Recibe mensajes automáticamente
- ✅ Genera respuestas inteligentes con OpenAI
- ✅ Responde consultas sobre productos, horarios, pedidos
- ✅ Mantiene tono amigable y profesional
- ✅ Deriva a agentes humanos cuando es necesario

---

## 📋 Pasos para Activar el Bot

### 1️⃣ Configurar WhatsApp Business API en Meta

**En el panel de Meta que tienes abierto:**

1. **Obtener Access Token:**
   - Ve a `WhatsApp` > `API Setup`
   - Copia el **"Temporary access token"** (válido 24h)
   - Para producción: Genera un token permanente en `System Users`

2. **Obtener Phone Number ID:**
   - En la misma sección `API Setup`
   - Copia el **"Phone number ID"** (número largo)

3. **Obtener Business Account ID:**
   - En la URL o en la configuración de la app
   - Formato: `153305251600683`

4. **Crear Verify Token:**
   - Crea una cadena aleatoria segura
   - Ejemplo: `marlo_cookies_2026_wh_verify_xyz789`
   - Guárdalo, lo necesitarás después

---

### 2️⃣ Obtener API Key de OpenAI

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta o inicia sesión
3. Ve a `API Keys` y crea una nueva key
4. Copia la key (empieza con `sk-...`)
5. **Importante:** Asegúrate de tener créditos ($5-10 USD es suficiente para empezar)

---

### 3️⃣ Configurar Variables de Entorno

Edita el archivo `.env` en `backend/`:

```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=marlo_cookies_2026_wh_verify_xyz789
WHATSAPP_BUSINESS_ACCOUNT_ID=153305251600683

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```

---

### 4️⃣ Desplegar el Backend

**Opción A: Deployment en producción (recomendado)**

```bash
# Sube tu código a producción (Heroku, Railway, AWS, etc.)
# Tu webhook URL será algo como:
https://api-marlocookies.com/whatsapp/webhook
```

**Opción B: Pruebas locales con ngrok**

```bash
# 1. Instala ngrok
npm install -g ngrok

# 2. Inicia tu backend
cd backend
npm run start:dev

# 3. En otra terminal, expón el puerto
ngrok http 3000

# 4. Copia la URL HTTPS que te da (ej: https://abc123.ngrok.io)
```

---

### 5️⃣ Configurar Webhook en Meta

Vuelve al panel de Meta:

1. Ve a `WhatsApp` > `Configuration`
2. Click en **"Edit"** en la sección "Webhook"
3. Ingresa:
   - **Callback URL:** `https://tu-dominio.com/whatsapp/webhook`
   - **Verify token:** El mismo que pusiste en `.env` (ej: `marlo_cookies_2026_wh_verify_xyz789`)
4. Click en **"Verify and Save"**
5. Si todo está bien, verás ✅ "Verified"

6. Suscríbete al campo **"messages"**:
   - Marca el checkbox de `messages`
   - Click en "Subscribe"

---

### 6️⃣ Probar el Bot

**Desde el panel de Meta:**

1. Ve a `API Setup`
2. En "Send and receive messages", verás un número de prueba
3. Agrega ese número a WhatsApp en tu teléfono
4. Envía un mensaje como: `Hola, quisiera información sobre las cookies`
5. El bot debería responder automáticamente 🎉

**Verifica los logs del backend:**
```bash
cd backend
npm run start:dev

# Deberías ver:
# 📨 Mensaje recibido de Cliente (+59891234567): Hola...
# ✅ Respuesta enviada a +59891234567
```

---

## 🎛️ Configuración Avanzada

### Personalizar las Respuestas de la IA

Edita [`backend/src/modules/whatsapp/whatsapp.service.ts`](backend/src/modules/whatsapp/whatsapp.service.ts) en el método `generateAIResponse()`:

```typescript
const systemPrompt = `Eres el asistente virtual de MarLo Cookies...

INFORMACIÓN DE LA TIENDA:
- Productos: [Actualiza con tus productos reales]
- Horarios: [Actualiza con tus horarios]
- Teléfono: [Tu número real]
- Email: [Tu email real]
...
`;
```

### Cambiar el Modelo de IA

En el mismo archivo, puedes cambiar el modelo:

```typescript
model: 'gpt-4o-mini',  // Rápido y económico
// O usa: 'gpt-4o' para respuestas más sofisticadas (más costoso)
```

### Agregar Comandos Especiales

Puedes detectar palabras clave y dar respuestas específicas:

```typescript
async processIncomingMessage(from: string, messageBody: string, senderName: string) {
  // Comandos especiales
  if (messageBody.toLowerCase().includes('catálogo') || messageBody.toLowerCase().includes('productos')) {
    await this.sendMessage(from, 'Puedes ver nuestro catálogo completo aquí: https://marlocookies.com/productos 🍪');
    return;
  }
  
  if (messageBody.toLowerCase().includes('pedido') || messageBody.toLowerCase().includes('comprar')) {
    await this.sendInteractiveMessage(from, '¿Cómo te gustaría hacer tu pedido?', [
      { id: 'web', title: '🌐 Por la web' },
      { id: 'whatsapp', title: '💬 Por WhatsApp' },
    ]);
    return;
  }
  
  // Para otros mensajes, usa IA
  const aiResponse = await this.generateAIResponse(messageBody, senderName);
  await this.sendMessage(from, aiResponse);
}
```

---

## 🔍 Solución de Problemas

### ❌ "Webhook verification failed"
- Verifica que el `WHATSAPP_VERIFY_TOKEN` en `.env` coincida exactamente con el que ingresaste en Meta
- Asegúrate de que tu backend esté corriendo y accesible públicamente

### ❌ "No recibo mensajes"
- Verifica que estés suscrito al webhook field "messages"
- Revisa los logs del backend para ver si llegan las peticiones
- Confirma que el Access Token no haya expirado

### ❌ "OpenAI error"
- Verifica que tu `OPENAI_API_KEY` sea válida
- Confirma que tengas créditos disponibles en tu cuenta de OpenAI
- Revisa los logs para ver el error específico

### ❌ "El bot no responde"
- Verifica que el número esté en la lista de números de prueba (en desarrollo)
- Para producción, necesitas pasar la revisión de Meta Business

---

## 🚀 Siguiente Nivel

### Agregar más funcionalidades:

1. **Consultar estado de pedidos:**
   - Integra con tu base de datos
   - Permite a clientes preguntar "¿Dónde está mi pedido #123?"

2. **Hacer pedidos por WhatsApp:**
   - Implementa un flujo conversacional
   - Guarda pedidos en tu sistema

3. **Notificaciones proactivas:**
   - Envía confirmaciones de pedido
   - Avisos de delivery
   - Ofertas especiales

4. **Dashboard de conversaciones:**
   - Guarda historial de chats
   - Métricas de uso
   - Handoff a agentes humanos

---

## 📞 Soporte

Si tienes problemas, revisa:
- Logs del backend: `npm run start:dev`
- Webhooks de Meta: Panel > WhatsApp > Configuration > Webhooks > View recent deliveries
- Documentación oficial: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)

---

✨ **¡Tu bot está listo! Los clientes ahora pueden chatear con tu IA 24/7.**
