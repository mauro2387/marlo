# 🌟 Integración de Google Reviews - Guía Completa

## Opción 1: Elfsight Widget (RECOMENDADA - Más Fácil) ⭐

### Ventajas:
- ✅ **Gratis** hasta 200 vistas/mes (suficiente para empezar)
- ✅ Setup en 5 minutos
- ✅ Se actualiza automáticamente con nuevas reseñas
- ✅ Diseño responsive y personalizable
- ✅ No requiere código backend

### Pasos:

1. **Crear cuenta en Elfsight:**
   - Ve a: https://elfsight.com/google-reviews-widget/
   - Click en "Get Started Free"
   - Regístrate con tu email

2. **Conectar Google My Business:**
   - En el panel de Elfsight, click "Add Widget"
   - Selecciona "Google Reviews"
   - Ingresa el nombre de tu negocio o URL de Google Maps
   - Elfsight lo encontrará automáticamente

3. **Personalizar diseño:**
   - Elige layout: Grid (recomendado), Slider, List
   - Colores: Puedes usar #8B4513 (marrón) y #FF69B4 (rosa)
   - Cantidad de reseñas a mostrar: 3-6
   - Mostrar estrellas, fechas, fotos de perfil

4. **Obtener código:**
   - Click en "Publish"
   - Copia el código del widget (se ve así):
   ```html
   <script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
   <div class="elfsight-app-XXXXX-XXXXX-XXXXX"></div>
   ```

5. **Instalar en tu sitio:**
   - Dame el código que te da Elfsight
   - Lo integro en la página principal reemplazando las reseñas mock

---

## Opción 2: Google Places API (Más Control) 🔧

### Ventajas:
- ✅ Control total sobre el diseño
- ✅ Datos en tiempo real desde Google
- ✅ Puedes filtrar, ordenar, personalizar

### Desventajas:
- ⚠️ Requiere API Key de Google
- ⚠️ Puede tener costos si tenés mucho tráfico
- ⚠️ Más complejo de configurar

### Pasos:

1. **Google Cloud Console:**
   - Ve a: https://console.cloud.google.com
   - Crea un proyecto nuevo
   - Habilita "Places API"
   
2. **Obtener API Key:**
   - En "Credentials" → "Create Credentials" → "API Key"
   - Restringe la key: Solo "Places API" y tu dominio

3. **Obtener Place ID:**
   - Busca tu negocio en: https://developers.google.com/maps/documentation/places/web-service/place-id
   - O usa: https://www.google.com/maps → Busca tu negocio → Copia el ID de la URL

4. **Yo creo el servicio:**
   ```typescript
   // services/google-reviews.ts
   - Servicio para obtener reseñas
   - Cacheo para evitar exceder límites
   - Componente React para mostrarlas
   ```

5. **Necesito de vos:**
   - API Key de Google Places
   - Place ID de tu negocio
   - Agregar API Key a Vercel

**Costos:** 
- Primeros 28,500 requests/mes: GRATIS
- Después: $17 USD por cada 1,000 requests

---

## Opción 3: Embed Simple (Más Limitado) 🗺️

### Ventajas:
- ✅ 100% gratis
- ✅ No requiere configuración
- ✅ Setup en 1 minuto

### Desventajas:
- ⚠️ Diseño fijo de Google (no personalizable)
- ⚠️ Puede verse genérico

### Pasos:

1. **Google Maps:**
   - Ve a: https://www.google.com/maps
   - Busca tu negocio

2. **Compartir:**
   - Click en el botón "Compartir"
   - Selecciona "Insertar un mapa"
   - Copia el código iframe

3. **Dame el código:**
   - Se ve así:
   ```html
   <iframe src="https://www.google.com/maps/embed?pb=..." 
           width="600" height="450" ...></iframe>
   ```
   - Lo integro en la página

---

## 🎯 MI RECOMENDACIÓN:

### Para empezar: **Opción 1 - Elfsight**

**Razones:**
1. Setup en 5 minutos
2. Gratis para empezar
3. Se ve profesional
4. Actualización automática
5. Responsive y personalizable

### Cuando escales: **Opción 2 - Google Places API**

**Cuándo cambiar:**
- Cuando tengas >200 vistas/mes en Elfsight
- Si querés control total del diseño
- Si querés integrar las reseñas en múltiples páginas

---

## 📋 REQUISITO PREVIO (TODAS LAS OPCIONES):

**Debes tener un perfil en Google My Business:**

1. Ve a: https://business.google.com
2. Agrega tu negocio "MarLo Cookies"
3. Verifica tu negocio (Google te manda una postal con código)
4. Agrega:
   - Dirección
   - Horarios
   - Fotos
   - Descripción
   
**Pedí a tus clientes que dejen reseñas:**
- Enviales un link directo: https://g.page/r/[TU-PLACE-ID]/review
- Agregá el link en tus emails de confirmación
- Ponelo en tus redes sociales

---

## 🚀 ¿QUÉ OPCIÓN ELEGÍS?

Avisame qué opción preferís y te ayudo a implementarla:

**A)** Elfsight (5 minutos) - Solo necesito el código del widget
**B)** Google Places API (15 minutos) - Necesito API Key y Place ID
**C)** Embed simple (1 minuto) - Solo necesito el iframe

Una vez que me digas, actualizo el código y reemplazo las reseñas mock por las reales.
