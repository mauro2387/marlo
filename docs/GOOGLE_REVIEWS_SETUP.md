# 🌟 Google Reviews - API en Tiempo Real

## ✅ Implementación Actual

El sitio usa **Google Places API (New)** para obtener las reseñas en tiempo real.

### Características:
- ✅ Rating y cantidad de reseñas actualizados automáticamente
- ✅ Cache de 1 hora para optimizar costos
- ✅ Fallback a valores manuales si la API falla
- ✅ $200 USD de crédito gratuito mensual

---

## Configuración

### 1. Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la facturación (requerido, pero hay crédito gratuito)

### 2. Habilitar la API

1. Ve a **APIs & Services > Library**
2. Busca **"Places API (New)"**
3. Click en **Enable**

### 3. Crear API Key

1. Ve a **APIs & Services > Credentials**
2. Click en **Create Credentials > API Key**
3. Copia la API key generada

### 4. Restringir la API Key (IMPORTANTE)

1. Click en tu API key
2. En **Application restrictions**: HTTP referrers
3. Agrega:
   - `https://marlocookies.com/*`
   - `https://*.vercel.app/*`
4. En **API restrictions**: Solo **Places API (New)**
5. Click **Save**

### 5. Configurar en Vercel

```bash
vercel env add GOOGLE_PLACES_API_KEY
# Pega tu API key
# Selecciona todos los ambientes

vercel --prod  # Redesplegar
```

---

## Costos

| Concepto | Valor |
|----------|-------|
| Crédito gratuito mensual | $200 USD |
| Costo por consulta | ~$0.017 USD |
| Consultas con cache 1h | ~720/mes |
| Costo estimado | ~$12 USD (gratis) |

---

## Place ID

El Place ID de MarLo Cookies está configurado en:
`frontend/src/app/api/google-reviews/route.ts`

```typescript
const PLACE_ID = 'ChIJ0aytMAAVdZURRe6OeAMz7D4';
```

Para encontrar otro Place ID:
1. Ve a [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Busca tu negocio
3. Copia el Place ID

---

## Verificar Funcionamiento

Endpoint: `GET /api/google-reviews`

Respuesta:
```json
{
  "rating": 4.9,
  "reviews_count": 21,
  "url": "https://www.google.com/maps/place/...",
  "last_updated": "2024-12-23T10:30:00Z",
  "cached": true,
  "cache_expires_in": "45 minutos"
}
```

---

## Troubleshooting

| Error | Solución |
|-------|----------|
| "API key no configurada" | Agregar GOOGLE_PLACES_API_KEY en Vercel y redesplegar |
| "403 Forbidden" | Verificar restricciones de API key |
| "400 Bad Request" | Verificar Place ID |
| Valores no actualizan | Esperar 1 hora (cache) o redesplegar |

---

## Fallback Manual

Si la API no está configurada, el sistema usa valores manuales de Supabase.
Editar en: **Admin → Configuración → Google Reviews**

---

## Opción Alternativa: Elfsight Widget

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
