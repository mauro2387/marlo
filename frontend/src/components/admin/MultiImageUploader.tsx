'use client';

import { useState, useRef } from 'react';
import { storageDB } from '@/lib/supabase-fetch';

interface MultiImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  productName?: string;
  maxImages?: number;
}

export default function MultiImageUploader({ 
  images, 
  onImagesChange, 
  productName,
  maxImages = 5 
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Leer archivo en memoria para evitar problemas con OneDrive
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        alert('Formato no permitido. Usa: JPG, PNG, WebP o GIF');
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB');
        return null;
      }

      // Leer archivo en memoria primero
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const blob = new Blob([arrayBuffer], { type: file.type });
      const fileInMemory = new File([blob], file.name, { type: file.type });

      // Usar el mismo método que ImageUploader
      const { url, error } = await storageDB.uploadProductImage(fileInMemory, productName || 'product');

      if (error) {
        console.error('Error uploading:', error);
        alert(error.message || 'Error al subir la imagen');
        return null;
      }

      return url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.filter((url): url is string => url !== null);
      
      if (newUrls.length > 0) {
        onImagesChange([...images, ...newUrls]);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const setAsMain = (index: number) => {
    if (index === 0) return;
    moveImage(index, 0);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Imágenes del producto ({images.length}/{maxImages})
      </label>

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((img, index) => (
            <div 
              key={index} 
              className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                index === 0 ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'
              }`}
            >
              <img 
                src={img} 
                alt={`Imagen ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              
              {/* Badge principal */}
              {index === 0 && (
                <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">
                  Principal
                </div>
              )}

              {/* Controles */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {/* Mover a principal */}
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsMain(index)}
                    className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                    title="Hacer principal"
                  >
                    <span className="material-icons text-sm text-primary">star</span>
                  </button>
                )}
                
                {/* Mover izquierda */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                    title="Mover izquierda"
                  >
                    <span className="material-icons text-sm">chevron_left</span>
                  </button>
                )}
                
                {/* Mover derecha */}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                    title="Mover derecha"
                  >
                    <span className="material-icons text-sm">chevron_right</span>
                  </button>
                )}
                
                {/* Eliminar */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 bg-red-500 rounded-full hover:bg-red-600"
                  title="Eliminar"
                >
                  <span className="material-icons text-sm text-white">close</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zona de upload */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              <span className="text-gray-600">Subiendo imágenes...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="material-icons text-4xl text-gray-400">add_photo_alternate</span>
              <span className="text-gray-600 font-medium">
                Arrastra imágenes aquí o haz click para seleccionar
              </span>
              <span className="text-gray-400 text-sm">
                JPG, PNG, WebP o GIF • Máximo 5MB cada una
              </span>
            </div>
          )}
        </div>
      )}

      {/* Ayuda */}
      <p className="text-xs text-gray-500">
        💡 La primera imagen será la principal. Arrastra para reordenar. 
        {images.length === 0 && ' Si no subes imagen, se mostrará el emoji 🍪'}
      </p>
    </div>
  );
}
