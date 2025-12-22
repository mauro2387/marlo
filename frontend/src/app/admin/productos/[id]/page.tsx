'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { productsDB } from '@/lib/supabase-fetch';
import LoadingSpinner from '@/components/LoadingSpinner';
import MultiImageUploader from '@/components/admin/MultiImageUploader';

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string | null;
  imagenes: string[] | null;
  stock: number;
  es_limitado: boolean;
  activo: boolean;
}

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'cookies',
    imagenes: [] as string[],
    stock: '0',
    es_limitado: false,
    activo: true
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data: product, error } = await productsDB.getById(productId);
      if (error) throw error;
      if (product) {
        // Migrar imagen antigua a array si no hay imagenes
        let imagenes = product.imagenes || [];
        if (imagenes.length === 0 && product.imagen && 
            (product.imagen.startsWith('http') || product.imagen.startsWith('/'))) {
          imagenes = [product.imagen];
        }
        
        setFormData({
          nombre: product.nombre,
          descripcion: product.descripcion || '',
          precio: product.precio.toString(),
          categoria: product.categoria,
          imagenes: imagenes,
          stock: product.stock.toString(),
          es_limitado: product.es_limitado,
          activo: product.activo
        });
      }
    } catch (err) {
      console.error('Error cargando producto:', err);
      setError('No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, imagenes: images }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const productData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        categoria: formData.categoria,
        imagen: formData.imagenes[0] || '🍪', // Primera imagen como principal (compatibilidad)
        imagenes: formData.imagenes,
        stock: parseInt(formData.stock),
        es_limitado: formData.es_limitado,
        activo: formData.activo
      };

      if (!productData.nombre) {
        throw new Error('El nombre es requerido');
      }
      if (isNaN(productData.precio) || productData.precio <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      const { error } = await productsDB.update(productId, productData);
      if (error) throw error;
      router.push('/admin/productos');
    } catch (err) {
      console.error('Error actualizando producto:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/productos"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← Volver
        </Link>
        <h2 className="text-2xl font-bold text-brown-800">Editar Producto</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Producto *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Ej: Cookie Chocolate Chip"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            placeholder="Describe tu deliciosa cookie..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio (UYU) *
            </label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              required
              min="1"
              step="1"
              placeholder="150"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="cookies">🍪 Cookies</option>
            <option value="boxes">📦 Boxes</option>
            <option value="bebidas">🥤 Bebidas</option>
            <option value="otros">✨ Otros</option>
          </select>
        </div>

        {/* Imagen - Nuevo componente */}
        <MultiImageUploader
          images={formData.imagenes}
          onImagesChange={handleImagesChange}
          productName={formData.nombre}
        />

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="es_limitado"
              checked={formData.es_limitado}
              onChange={handleChange}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">⭐ Producto Limitado</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">✓ Activo (visible en tienda)</span>
          </label>
        </div>

        {/* Vista previa */}
        <div className="p-4 bg-cream-50 rounded-lg">
          <p className="text-sm font-medium text-gray-600 mb-3">Vista Previa:</p>
          <div className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-cream-100 rounded-lg flex items-center justify-center text-3xl overflow-hidden">
              {formData.imagenes.length > 0 ? (
                <img src={formData.imagenes[0]} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span>🍪</span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-brown-800">
                {formData.nombre || 'Nombre del producto'}
                {formData.es_limitado && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">⭐ Limitado</span>}
                {formData.imagenes.length > 1 && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    📷 {formData.imagenes.length} imágenes
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-500">{formData.descripcion || 'Descripción...'}</p>
              <p className="text-lg font-bold text-pink-600 mt-1">
                ${formData.precio ? parseInt(formData.precio).toLocaleString() : '0'} UYU
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <Link
            href="/admin/productos"
            className="flex-1 px-4 py-3 text-center bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                Guardando...
              </>
            ) : (
              '✓ Guardar Cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
