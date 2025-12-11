# Configuración de Email Verification en Supabase

## 📧 Páginas Creadas

Se han creado dos páginas para el flujo de verificación de email:

1. **`/verificacion-pendiente`** - Página que se muestra después del registro
2. **`/confirmar-email`** - Página donde llega el usuario al hacer click en el email

---

## ⚙️ Configuración en Supabase Dashboard

### 1. Habilitar Email Confirmation

1. Ve a tu proyecto en **https://app.supabase.com**
2. **Authentication** → **Providers** → **Email**
3. Configuración:
   ```
   ✅ Enable Email provider
   ✅ Confirm email (activado para producción)
   ⬜ Secure email change (opcional)
   ```

### 2. Configurar URLs de Redirección

En **Authentication** → **URL Configuration**:

#### Site URL (Desarrollo):
```
http://localhost:3005
```

#### Redirect URLs (Desarrollo):
```
http://localhost:3005/**
http://localhost:3005/confirmar-email**
http://localhost:3005/auth/callback**
```

#### Site URL (Producción):
```
https://tudominio.vercel.app
```

#### Redirect URLs (Producción):
```
https://tudominio.vercel.app/**
https://tudominio.vercel.app/confirmar-email**
https://tudominio.vercel.app/auth/callback**
```

### 3. Personalizar Email Templates

En **Authentication** → **Email Templates** → **Confirm signup**:

#### Subject:
```
Confirma tu email - MarLo Cookies 🍪
```

#### Email Body (HTML):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #FFF8F0;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #6B3410 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 60px;
      margin-bottom: 10px;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #FF8F6B 0%, #FF6B9D 100%);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 12px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      box-shadow: 0 4px 6px rgba(255, 143, 107, 0.4);
    }
    .button:hover {
      box-shadow: 0 6px 8px rgba(255, 143, 107, 0.6);
    }
    .footer {
      background-color: #FFF8F0;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #999;
    }
    .benefits {
      background-color: #FFF8F0;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
    }
    .benefit-item {
      display: flex;
      align-items: center;
      margin: 10px 0;
      font-size: 15px;
      color: #666;
    }
    .benefit-icon {
      font-size: 24px;
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🍪</div>
      <h1 class="title">MarLo Cookies</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Artesanales & Deliciosas</p>
    </div>
    
    <div class="content">
      <p class="greeting">¡Hola! 👋</p>
      
      <p class="message">
        ¡Bienvenido a la familia MarLo Cookies! 🎉<br><br>
        Estamos emocionados de que te unas a nosotros. Solo falta un paso más para comenzar 
        a disfrutar de nuestras deliciosas cookies artesanales.
      </p>

      <div style="text-align: center; margin: 40px 0;">
        <a href="{{ .ConfirmationURL }}" class="button">
          ✅ Confirmar mi Email
        </a>
      </div>

      <div class="benefits">
        <h3 style="color: #8B4513; margin-top: 0;">Al confirmar tu email podrás:</h3>
        <div class="benefit-item">
          <span class="benefit-icon">⭐</span>
          <span>Ganar puntos con cada compra</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">🎁</span>
          <span>Acceder a ofertas exclusivas</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">🚚</span>
          <span>Seguimiento de tus pedidos</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">💝</span>
          <span>Descuentos en tu cumpleaños</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #999; margin-top: 30px;">
        <strong>Nota:</strong> Este link expira en 24 horas por seguridad. 
        Si no solicitaste esta cuenta, ignora este email.
      </p>
    </div>

    <div class="footer">
      <p>
        <strong>MarLo Cookies</strong><br>
        Punta del Este, Uruguay<br>
        📞 (+598) 97 865 053 | 📧 marlocookies2@gmail.com
      </p>
      <p style="margin-top: 20px;">
        <a href="https://www.instagram.com/marlo_cookies" style="color: #FF8F6B; text-decoration: none; margin: 0 10px;">📸 Instagram</a>
        <a href="https://marlocookies.vercel.app" style="color: #FF8F6B; text-decoration: none; margin: 0 10px;">🌐 Sitio Web</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 🔄 Flujo de Verificación

### Cuando el usuario se registra:

1. **Usuario completa el formulario** de registro
2. **Supabase crea la cuenta** (pero sin confirmar)
3. **Usuario es redirigido** a `/verificacion-pendiente?email=usuario@email.com`
4. **Supabase envía email** con el link de confirmación
5. **Usuario hace click** en el botón del email
6. **Usuario llega** a `/confirmar-email?token=xxx&type=signup`
7. **Sistema verifica** el token automáticamente
8. **Usuario confirmado** y redirigido a `/productos`

### Si el email no llega:

- Usuario puede hacer click en **"Reenviar Email"**
- Sistema usa `supabase.auth.resend()` para reenviar
- Se muestra mensaje de confirmación

---

## 🔐 Seguridad

### Políticas RLS ya configuradas:

```sql
-- El trigger handle_new_user() crea el perfil automáticamente
-- cuando Supabase confirma el email
```

### Variables de Entorno:

En `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://acrmuhijmangrhftavyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3005
```

En **producción** (Vercel):
```bash
NEXT_PUBLIC_SITE_URL=https://tudominio.vercel.app
```

---

## 📱 Testing

### Modo Desarrollo (Auto-confirm):

Para desarrollo, puedes desactivar la confirmación:

1. **Authentication** → **Providers** → **Email**
2. **Desactiva** "Confirm email"
3. Los usuarios se registran automáticamente sin verificación

### Modo Producción (Confirm requerido):

1. **Activa** "Confirm email"
2. Configura el template HTML arriba
3. Prueba el flujo completo:
   - Registrarse
   - Revisar email
   - Hacer click en confirmar
   - Verificar redirección

---

## 🎨 Personalización Adicional

### Cambiar tiempo de expiración del link:

En Supabase Dashboard → **Authentication** → **URL Configuration**:
```
Link expiry: 86400 seconds (24 hours) - default
```

### Email de recuperación de contraseña:

También puedes personalizar el template de "Reset Password" siguiendo el mismo diseño.

---

## 🐛 Troubleshooting

### Email no llega:
1. Verifica que el email esté bien escrito
2. Revisa spam/correo no deseado
3. Usa el botón "Reenviar Email"
4. Verifica SMTP settings en Supabase

### Link inválido o expirado:
1. El usuario debe solicitar un nuevo email
2. Los links expiran en 24 horas por seguridad

### Usuario no redirige después de confirmar:
1. Verifica que las Redirect URLs estén configuradas
2. Chequea que `NEXT_PUBLIC_SITE_URL` esté correcta
3. Revisa la consola del navegador por errores

---

## ✅ Checklist de Implementación

- [ ] Crear bucket `product-images` en Storage
- [ ] Subir imágenes de productos
- [ ] Ejecutar `supabase-schema.sql`
- [ ] Ejecutar `supabase-seed.sql`
- [x] Crear páginas de verificación
- [ ] Configurar Email Templates en Supabase
- [ ] Configurar Redirect URLs
- [ ] Habilitar Email Confirmation
- [ ] Probar flujo completo de registro
- [ ] Probar reenvío de email
- [ ] Verificar redirecciones

---

## 🚀 Próximos Pasos

1. **Ahora**: Configura las URLs y templates en Supabase
2. **Después**: Prueba el flujo de registro completo
3. **Luego**: Personaliza los colores del email con tu marca
4. **Finalmente**: Despliega a Vercel y prueba en producción
