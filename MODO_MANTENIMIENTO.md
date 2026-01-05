# Modo Mantenimiento - MarLo Cookies

## Estado Actual
✅ **MODO MANTENIMIENTO ACTIVADO**

La página web está en modo mantenimiento. Los usuarios verán un cartel de cierre temporal y no podrán realizar pedidos ni acceder a ninguna funcionalidad de la tienda.

## Archivos Modificados

### 1. Componente de Mantenimiento
- **Archivo**: `frontend/src/components/MaintenanceMode.tsx`
- **Descripción**: Página completa que muestra el mensaje de cierre temporal con el logo de MarLo Cookies

### 2. Layout Principal
- **Archivo**: `frontend/src/app/layout.tsx`
- **Cambios**: 
  - Importa el componente `MaintenanceMode`
  - Lee la variable de entorno `NEXT_PUBLIC_MAINTENANCE_MODE`
  - Muestra el modo mantenimiento cuando está activado

### 3. Variables de Entorno
- **Archivo**: `frontend/.env.local`
- **Variable agregada**: `NEXT_PUBLIC_MAINTENANCE_MODE=true`

## Cómo Usar

### Para ACTIVAR el modo mantenimiento:
```env
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

### Para DESACTIVAR el modo mantenimiento:
```env
NEXT_PUBLIC_MAINTENANCE_MODE=false
```
O simplemente comentar/eliminar la línea.

## Reiniciar el Servidor

Después de cambiar la variable de entorno, debes **reiniciar el servidor de Next.js**:

```bash
# Detener el servidor (Ctrl+C)
# Luego volver a iniciar:
npm run dev
```

## Características del Modo Mantenimiento

✅ Bloquea completamente el acceso a la tienda  
✅ Muestra un mensaje claro y profesional  
✅ Incluye el logo de MarLo Cookies  
✅ Diseño responsive (móvil y desktop)  
✅ Enlaces a redes sociales  
✅ Mensaje esperanzador de que volverán pronto  

## Configuración en Vercel (PRODUCCIÓN)

Para activar el modo mantenimiento en tu sitio en producción (Vercel):

### Paso 1: Acceder a Variables de Entorno
1. Ve a [vercel.com](https://vercel.com)
2. Entra a tu proyecto MarLo Cookies
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Agregar la Variable
1. Crea una nueva variable de entorno:
   - **Name**: `NEXT_PUBLIC_MAINTENANCE_MODE`
   - **Value**: `true`
   - **Environment**: Selecciona **Production** (y Preview si lo deseas)
2. Haz clic en **Save**

### Paso 3: Redesplegar
Vercel necesita redesplegar para aplicar la nueva variable:
- Ve a la pestaña **Deployments**
- Haz clic en los **tres puntos** (⋯) del último deployment
- Selecciona **Redeploy**
- ✅ En 1-2 minutos tu sitio mostrará el modo mantenimiento

### Para Reabrir la Tienda en Vercel:
1. Ve a **Settings** → **Environment Variables**
2. Encuentra `NEXT_PUBLIC_MAINTENANCE_MODE`
3. Cámbiala a `false` o elimínala
4. Redespliega desde la pestaña **Deployments**

## Para Reabrir la Tienda (Local)

Cuando estés listo para reabrir en desarrollo local:

1. Edita el archivo `frontend/.env.local`
2. Cambia `NEXT_PUBLIC_MAINTENANCE_MODE=true` a `false`
3. Reinicia el servidor de desarrollo con `npm run dev`
4. La tienda volverá a funcionar normalmente

## Nota Importante

⚠️ **Recuerda**: 
- En desarrollo local: Los cambios requieren reiniciar el servidor
- En Vercel: Los cambios requieren redesplegar el proyecto
