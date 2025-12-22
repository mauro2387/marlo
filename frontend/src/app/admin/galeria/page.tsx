'use client';

import { useEffect, useState, useRef } from 'react';
import { storageDB, productsDB, floatingImagesDB } from '@/lib/supabase-fetch';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ImageItem {
  id: string;
  url: string;
  name: string;
  type: 'product' | 'floating' | 'storage';
  productName?: string;
}

export default function GaleriaPage() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'product' | 'floating'>('all');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const [productsRes, floatingRes] = await Promise.all([
        productsDB.getAll(),
        floatingImagesDB.getAll()
      ]);

      const allImages: ImageItem[] = [];

      // Imágenes de productos
      if (productsRes.data) {
        productsRes.data.forEach((p: any) => {
          if (p.imagen && (p.imagen.startsWith('http') || p.imagen.startsWith('/'))) {
            allImages.push({
              id: `product-${p.id}`,
              url: p.imagen,
              name: p.nombre,
              type: 'product',
              productName: p.nombre
            });
          }
        });
      }

      // Imágenes flotantes
      if (floatingRes.data) {
        floatingRes.data.forEach((f: any) => {
          allImages.push({
            id: `floating-${f.id}`,
            url: f.imagen_url,
            name: `Cookie flotante ${f.orden}`,
            type: 'floating'
          });
        });
      }

      setImages(allImages);
    } catch (err) {
      console.error('Error cargando imágenes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, type: 'product' | 'floating') => {
    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });
      const fileInMemory = new File([blob], file.name, { type: file.type });

      const { url, error } = await storageDB.uploadProductImage(fileInMemory, type === 'floating' ? 'floating-cookie' : 'product');
      
      if (error) throw error;
      if (!url) throw new Error('No se obtuvo URL');

      if (type === 'floating') {
        const { data: floatingData } = await floatingImagesDB.getAll();
        await floatingImagesDB.create({
          imagen_url: url,
          orden: (floatingData?.length || 0) + 1,
          activo: true
        });
      }

      await loadImages();
      setMessage({ type: 'success', text: 'Imagen subida correctamente' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error al subir imagen' });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filteredImages = images.filter(img => {
    if (filter === 'all') return true;
    return img.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brown-800 flex items-center gap-2">
          <span className="material-icons">photo_library</span>
          Galería de Imágenes
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-icons text-sm">add_photo_alternate</span>
            {uploading ? 'Subiendo...' : 'Subir Imagen'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const type = confirm('¿Es una imagen flotante para el home?\n\nOK = Imagen flotante\nCancelar = Imagen de producto') ? 'floating' : 'product';
                await handleUpload(file, type);
              }
              e.target.value = '';
            }}
            className="hidden"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-brown-800 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Todas ({images.length})
        </button>
        <button
          onClick={() => setFilter('product')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'product' ? 'bg-brown-800 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <span className="material-icons text-sm mr-1 align-middle">cookie</span>
          Productos ({images.filter(i => i.type === 'product').length})
        </button>
        <button
          onClick={() => setFilter('floating')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'floating' ? 'bg-brown-800 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <span className="material-icons text-sm mr-1 align-middle">auto_awesome</span>
          Flotantes ({images.filter(i => i.type === 'floating').length})
        </button>
      </div>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredImages.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <span className="material-icons text-6xl mb-4 block">image_not_supported</span>
            <p>No hay imágenes en esta categoría</p>
          </div>
        ) : (
          filteredImages.map((img) => (
            <div
              key={img.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              <div className="aspect-square bg-gradient-to-br from-cream-100 to-pink-50 flex items-center justify-center">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ccc"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                  }}
                />
              </div>

              {/* Overlay info */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                <span className={`px-2 py-1 rounded text-xs font-medium mb-2 ${
                  img.type === 'product' ? 'bg-amber-500 text-white' : 'bg-purple-500 text-white'
                }`}>
                  {img.type === 'product' ? 'Producto' : 'Flotante'}
                </span>
                <p className="text-white text-xs text-center truncate w-full">{img.name}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(img.url);
                    setMessage({ type: 'success', text: 'URL copiada' });
                    setTimeout(() => setMessage(null), 2000);
                  }}
                  className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded transition-colors"
                >
                  <span className="material-icons text-xs mr-1">content_copy</span>
                  Copiar URL
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <span className="material-icons text-sm mr-2 align-middle">info</span>
        Las imágenes se almacenan en Supabase Storage. Para cambiar la imagen de un producto, edítalo desde la sección de Productos.
      </div>
    </div>
  );
}
