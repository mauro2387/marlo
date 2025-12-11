# Guía: Subir Imágenes a Supabase Storage

Esta guía explica cómo configurar y usar Supabase Storage para las imágenes de productos de MarLo Cookies.

## 📋 Contenido
- [Configuración Inicial](#configuración-inicial)
- [Subir Imágenes Manualmente](#subir-imágenes-manualmente)
- [Configurar URLs en Productos](#configurar-urls-en-productos)
- [Integración con Frontend](#integración-con-frontend)

---

## 🔧 Configuración Inicial

### 1. Crear un Bucket en Supabase

1. Ve a tu proyecto en **https://app.supabase.com**
2. En el menú lateral: **Storage** → **Create a new bucket**
3. Configuración del bucket:
   ```
   Name: product-images
   Public bucket: ✅ (activado)
   File size limit: 5 MB
   Allowed MIME types: image/png, image/jpeg, image/jpg, image/webp
   ```
4. Click **Save**

### 2. Configurar Políticas de Acceso (RLS)

El bucket público ya permite lectura, pero para permitir subidas autenticadas:

```sql
-- Política para lectura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Política para subida solo usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- Política para actualizar/borrar solo el dueño
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'product-images' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-images' AND auth.uid() = owner );
```

---

## 📤 Subir Imágenes Manualmente

### Opción 1: Desde el Dashboard de Supabase

1. **Storage** → **product-images**
2. Click **Upload file**
3. Selecciona tus imágenes:
   - `cc.png`
   - `Cookies - 048.jpeg`
   - `Marlo logo imagen de galletita animada y texto.png`
   - `Marlo logo texto.png`
4. Las URLs generadas serán:
   ```
   https://[tu-proyecto].supabase.co/storage/v1/object/public/product-images/cc.png
   https://[tu-proyecto].supabase.co/storage/v1/object/public/product-images/Cookies-048.jpeg
   ```

### Opción 2: Desde JavaScript (Programáticamente)

```typescript
import { supabase } from '@/lib/supabase/client';

async function uploadImage(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
}
```

### Opción 3: Desde CLI (Supabase CLI)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Subir imagen
supabase storage cp ./IMG/cc.png supabase://product-images/cc.png
```

---

## 🔗 Configurar URLs en Productos

### 1. Obtener URL Base

Tu URL base de Storage será:
```
https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/
```

### 2. Actualizar Productos en la Base de Datos

Después de subir las imágenes, actualiza la columna `imagen` de los productos:

```sql
-- Actualizar producto con imagen
UPDATE public.products 
SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/cc.png'
WHERE nombre = 'Cookie Chocolate';

-- Actualizar múltiples productos
UPDATE public.products 
SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/cookies-048.jpeg'
WHERE categoria = 'cookies' AND nombre LIKE '%Chocochip%';
```

### 3. Script SQL para Todas las Imágenes

```sql
-- Cookies individuales
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/cc.png' WHERE nombre = 'Cookie Chocolate';
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/chocochip.jpg' WHERE nombre = 'Cookie Chocochip';
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/red-velvet.jpg' WHERE nombre = 'Cookie Red Velvet';
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/oreo.jpg' WHERE nombre = 'Cookie Oreo';
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/mantecol.jpg' WHERE nombre = 'Cookie Mantecol';
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/bon-o-bon.jpg' WHERE nombre = 'Cookie Bon o Bon';
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/chocotorta.jpg' WHERE nombre = 'Cookie Chocotorta';
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/lemon-pie.jpg' WHERE nombre = 'Cookie Lemon Pie';
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/pistacho.jpg' WHERE nombre = 'Cookie Pistacho';

-- Boxes
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/box-4.jpg' WHERE nombre = 'Box x4';
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/box-6.jpg' WHERE nombre = 'Box x6';
UPDATE public.products SET imagen = 'https://acrmuhijmangrhftavyl.supabase.co/storage/v1/object/public/product-images/box-12.jpg' WHERE nombre = 'Box x12';
```

---

## 🎨 Integración con Frontend

### Mostrar Imágenes de Productos

```tsx
import Image from 'next/image';

function ProductCard({ product }) {
  return (
    <div className="card">
      {product.imagen ? (
        <div className="relative w-full aspect-square">
          <Image
            src={product.imagen}
            alt={product.nombre}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      ) : (
        <div className="w-full aspect-square bg-gray-200 flex items-center justify-center">
          <span className="text-6xl">🍪</span>
        </div>
      )}
      <h3>{product.nombre}</h3>
      <p>${product.precio}</p>
    </div>
  );
}
```

### Helper para URLs de Storage

Crea un helper en `frontend/src/utils/storage.ts`:

```typescript
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const STORAGE_BUCKET = 'product-images';

export function getStorageUrl(path: string): string {
  if (path.startsWith('http')) {
    return path; // Ya es una URL completa
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

export function getProductImageUrl(productId: string, imageName: string): string {
  return getStorageUrl(`products/${productId}/${imageName}`);
}
```

Uso:

```tsx
import { getStorageUrl } from '@/utils/storage';

<Image src={getStorageUrl(product.imagen)} alt={product.nombre} />
```

---

## 📁 Estructura Recomendada de Carpetas

```
product-images/
├── cookies/
│   ├── chocolate.png
│   ├── chocochip.jpg
│   ├── red-velvet.jpg
│   ├── oreo.jpg
│   └── ...
├── boxes/
│   ├── box-4.jpg
│   ├── box-6.jpg
│   └── box-12.jpg
├── otros/
│   ├── roll-clasico.jpg
│   ├── chocotorta.jpg
│   └── alfajor.jpg
├── bebidas/
│   └── coca-cola.jpg
└── logos/
    ├── marlo-logo-full.png
    └── marlo-logo-text.png
```

---

## 🚀 Pasos Siguientes

### Para Ahora (Desarrollo):
1. ✅ Crear bucket `product-images` en Supabase
2. ✅ Subir las imágenes actuales desde `IMG/`
3. ✅ Obtener las URLs públicas
4. ✅ Actualizar los productos en la base de datos con las URLs

### Para Producción:
1. **Optimizar imágenes**: Convertir a WebP, comprimir
2. **CDN**: Habilitar Supabase CDN para mejor performance
3. **Thumbnails**: Generar miniaturas automáticas con funciones Edge
4. **Admin Panel**: Crear interfaz para subir/gestionar imágenes

---

## 🔍 Troubleshooting

### Problema: "Image failed to load"
**Solución**: Verifica que el bucket sea público y las URLs sean correctas.

```sql
-- Verificar configuración del bucket
SELECT * FROM storage.buckets WHERE name = 'product-images';
```

### Problema: "Access Denied"
**Solución**: Revisa las políticas RLS del bucket.

```sql
-- Ver políticas actuales
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Problema: Imágenes muy pesadas
**Solución**: Optimiza antes de subir:

```bash
# Usar ImageMagick para optimizar
magick convert cc.png -quality 85 -resize 800x800 cc-optimized.jpg

# O usar CLI tools
npm install -g sharp-cli
sharp -i cc.png -o cc-optimized.webp --webp
```

---

## 📚 Referencias

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)
- [Supabase Storage API](https://supabase.com/docs/reference/javascript/storage-from-upload)
