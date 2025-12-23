# Configuración de Email con Resend

## 🚨 Problema Actual
Los emails NO se están enviando porque falta configurar la API key de Resend.

Actualmente el sistema está en modo simulado (solo imprime en consola).

## ✅ Solución: Configurar Resend

### Paso 1: Crear cuenta en Resend
1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email

### Paso 2: Obtener API Key
1. En el dashboard de Resend, ve a **API Keys**
2. Click en **Create API Key**
3. Dale un nombre (ej: "MarLo Cookies Production")
4. Copia la API key (empieza con `re_...`)

### Paso 3: Verificar Dominio (Opcional pero Recomendado)
Para producción, es mejor usar tu propio dominio:

1. En Resend, ve a **Domains**
2. Click **Add Domain**
3. Ingresa tu dominio (ej: `marlocookies.com`)
4. Sigue las instrucciones para agregar los registros DNS
5. Una vez verificado, podrás enviar desde `noreply@marlocookies.com`

**Para testing inmediato:** Resend permite enviar desde `onboarding@resend.dev` sin verificar dominio.

### Paso 4: Configurar en Vercel

#### Opción A: Desde el Dashboard de Vercel
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Agrega:
   - `RESEND_API_KEY`: tu API key (`re_...`)
   - `FROM_EMAIL`: `MarLo Cookies <noreply@marlocookies.com>` (o `onboarding@resend.dev` para testing)
4. Aplica a: Production, Preview, Development
5. Click **Save**
6. **Redeploy** el proyecto para que tome las variables

#### Opción B: Desde la Terminal
```bash
vercel env add RESEND_API_KEY
# Pega tu API key cuando te lo pida

vercel env add FROM_EMAIL
# Ingresa: MarLo Cookies <noreply@marlocookies.com>

# Redeploy
vercel --prod
```

### Paso 5: Configurar Localmente (Desarrollo)

1. Crea/edita `frontend/.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=MarLo Cookies <onboarding@resend.dev>
```

2. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

## 🧪 Verificar Configuración

### Método 1: API Endpoint
Visita: `https://tu-dominio.vercel.app/api/notifications/email`

Deberías ver:
```json
{
  "configured": true,
  "from": "MarLo Cookies <noreply@marlocookies.com>",
  "message": "API de email configurada correctamente"
}
```

### Método 2: Prueba Real
1. Ve a tu sitio
2. Suscríbete al newsletter
3. Revisa tu bandeja de entrada
4. Si no llega, revisa:
   - Spam/Correo no deseado
   - Logs de Vercel (puede haber errores)
   - Dashboard de Resend (Activity log)

## 📧 Emails que se Envían

El sistema envía emails automáticamente en estos casos:

1. **Suscripción a Newsletter** (con/sin cupón)
2. **Suscripción desde Popup** (con/sin cupón)
3. **Confirmación de pedidos**
4. **Notificaciones de contacto**
5. **Actualización de perfil**
6. **Solicitudes de mayoristas**

## 🔍 Troubleshooting

### "Email simulado" en logs
**Problema:** La API key no está configurada o no la está leyendo Vercel.
**Solución:** Verifica las variables de entorno en Vercel y redeploy.

### "Error enviando email con Resend"
**Problema:** API key inválida o dominio no verificado.
**Solución:** 
- Verifica que la API key sea correcta
- Si usas dominio propio, verifica que esté configurado en Resend
- Usa `onboarding@resend.dev` temporalmente

### Emails no llegan
**Problema:** Pueden estar en spam o el email destino es inválido.
**Solución:**
- Revisa carpeta de spam
- Verifica logs en dashboard de Resend
- Prueba con otro email

## 💰 Límites de Resend (Plan Gratuito)

- ✅ 100 emails/día
- ✅ 3,000 emails/mes
- ✅ Gratis para siempre

Para más volumen, hay planes pagos desde $20/mes (50,000 emails/mes).

## 📚 Recursos

- [Resend Docs](https://resend.com/docs)
- [Resend API Keys](https://resend.com/api-keys)
- [Verificación de Dominios](https://resend.com/docs/dashboard/domains/introduction)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
