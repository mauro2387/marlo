'use client';

import { useState, useRef, useCallback } from 'react';
import { storageDB } from '@/lib/supabase-fetch';

interface ImageUploaderProps {
  currentImage: string;
  onImageChange: (imageUrl: string) => void;
  productName?: string;
  disabled?: boolean;
}

export default function ImageUploader({ 
  currentImage, 
  onImageChange, 
  productName,
  disabled = false 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url' | 'emoji'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUrl = (str: string) => str?.startsWith('http') || str?.startsWith('/');
  const isEmoji = (str: string) => str && !isUrl(str) && str.length <= 4;

  // Leer archivo en memoria inmediatamente para evitar problemas con OneDrive
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('No se pudo leer el archivo. Si está en OneDrive, espera a que termine de sincronizar.'));
      reader.readAsArrayBuffer(file);
    });
  };

  const processFile = async (file: File) => {
    // Validar tipo
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Formato no válido. Usa PNG, JPG, WEBP o GIF.');
      return;
    }

    // Validar tamaño (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setError('La imagen es muy grande. Máximo 25MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Leer archivo INMEDIATAMENTE en memoria para evitar problemas con OneDrive
      console.log('📁 Leyendo archivo en memoria...');
      const arrayBuffer = await readFileAsArrayBuffer(file);
      
      // Crear un nuevo Blob desde el ArrayBuffer (ya en memoria)
      const blob = new Blob([arrayBuffer], { type: file.type });
      const fileInMemory = new File([blob], file.name, { type: file.type });
      
      console.log(`✅ Archivo leído: ${(fileInMemory.size / 1024).toFixed(1)}KB`);

      // Preview local
      const previewUrl = URL.createObjectURL(blob);
      setPreview(previewUrl);

      // Subir a Supabase
      const { url, error } = await storageDB.uploadProductImage(fileInMemory, productName);
      
      // Limpiar preview URL
      URL.revokeObjectURL(previewUrl);
      
      if (error) {
        setError(error.message || 'Error al subir la imagen');
        setPreview(null);
      } else if (url) {
        onImageChange(url);
        setPreview(null);
      }
    } catch (err: any) {
      console.error('❌ Error procesando archivo:', err);
      setError(err.message || 'Error al leer el archivo');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  // Drag and Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        await processFile(file);
      } else {
        setError('Solo se permiten archivos de imagen');
      }
    }
  }, [disabled, uploading, productName]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImageChange(e.target.value);
  };

  const handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImageChange(e.target.value);
  };

  const renderPreviewImage = () => {
    const imageToShow = preview || currentImage;
    
    if (uploading) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-cream-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-2"></div>
          <span className="text-xs text-gray-500">Subiendo...</span>
        </div>
      );
    }

    if (isUrl(imageToShow)) {
      return (
        <img 
          src={imageToShow} 
          alt="Preview" 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '';
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    
    if (imageToShow) {
      return <span className="text-4xl">{imageToShow}</span>;
    }

    return (
      <div className="text-center text-gray-400">
        <span className="text-3xl block mb-1">📷</span>
        <span className="text-xs">Sin imagen</span>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Imagen del Producto
      </label>

      {/* Tabs de modo */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setUploadMode('file')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            uploadMode === 'file'
              ? 'text-pink-600 border-b-2 border-pink-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📤 Subir Archivo
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            uploadMode === 'url'
              ? 'text-pink-600 border-b-2 border-pink-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔗 URL Externa
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('emoji')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            uploadMode === 'emoji'
              ? 'text-pink-600 border-b-2 border-pink-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          😊 Emoji
        </button>
      </div>

      <div className="flex gap-4">
        {/* Preview */}
        <div className="w-24 h-24 bg-cream-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 flex-shrink-0">
          {renderPreviewImage()}
        </div>

        {/* Controles según modo */}
        <div className="flex-1">
          {uploadMode === 'file' && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileSelect}
                disabled={disabled || uploading}
                className="hidden"
              />
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
                className={`w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer
                           transition-all flex flex-col items-center justify-center gap-2
                           ${isDragging 
                             ? 'border-pink-500 bg-pink-50 scale-[1.02]' 
                             : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
                           }
                           ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <>
                    <span className="animate-spin text-2xl">⏳</span>
                    <span className="text-sm text-gray-600">Subiendo...</span>
                  </>
                ) : isDragging ? (
                  <>
                    <span className="text-3xl">📥</span>
                    <span className="text-sm text-pink-600 font-medium">¡Suelta la imagen aquí!</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">📤</span>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium text-pink-600">Click para seleccionar</span> o arrastra una imagen
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP o GIF. Máximo 25MB.
              </p>
            </div>
          )}

          {uploadMode === 'url' && (
            <div className="space-y-2">
              <input
                type="url"
                value={isUrl(currentImage) ? currentImage : ''}
                onChange={handleUrlChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={disabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <p className="text-xs text-gray-500">
                Pega una URL directa a la imagen.
              </p>
            </div>
          )}

          {uploadMode === 'emoji' && (
            <div className="space-y-2">
              <input
                type="text"
                value={isEmoji(currentImage) ? currentImage : '🍪'}
                onChange={handleEmojiChange}
                placeholder="🍪"
                maxLength={4}
                disabled={disabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-center text-2xl"
              />
              <p className="text-xs text-gray-500">
                Usa un emoji como placeholder.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm space-y-1">
          <div className="flex items-center gap-2 font-medium">
            <span>⚠️</span>
            Error al subir imagen
          </div>
          <p className="text-red-600">{error}</p>
          {error.includes('bucket') && (
            <p className="text-xs text-red-500 mt-2">
              💡 Debes crear el bucket "product-images" en Supabase Dashboard → Storage → New bucket (marcarlo como público)
            </p>
          )}
        </div>
      )}

      {/* Info de imagen actual */}
      {currentImage && isUrl(currentImage) && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <span>✅</span>
          <span className="truncate flex-1">{currentImage}</span>
          <button
            type="button"
            onClick={() => onImageChange('🍪')}
            className="text-red-500 hover:text-red-700 px-2"
            title="Quitar imagen"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
