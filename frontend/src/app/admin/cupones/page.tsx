'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

// Cast para evitar problemas de tipos
const db = supabase as any;

interface Coupon {
  id: string;
  code: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number;
  minimo: number;
  max_usos: number | null;
  usos_actuales: number;
  valido_desde: string;
  valido_hasta: string;
  activo: boolean;
  imagen_url?: string | null;
  descripcion?: string | null;
}

const initialFormData = {
  code: '',
  tipo: 'porcentaje' as 'porcentaje' | 'fijo',
  valor: 10,
  minimo: 0,
  max_usos: null as number | null,
  valido_hasta: '',
  activo: true,
  imagen_url: null as string | null,
  descripcion: '',
};

export default function CuponesAdminPage() {
  const [cupones, setCupones] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCupones();
  }, []);

  const loadCupones = async () => {
    try {
      const { data, error } = await db
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCupones(data || []);
    } catch (error) {
      console.error('Error cargando cupones:', error);
      setCupones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const couponData = {
        code: formData.code.toUpperCase().trim(),
        tipo: formData.tipo,
        valor: formData.valor,
        minimo: formData.minimo || 0,
        max_usos: formData.max_usos || null,
        usos_actuales: 0,
        valido_desde: new Date().toISOString(),
        valido_hasta: formData.valido_hasta ? new Date(formData.valido_hasta).toISOString() : null,
        activo: formData.activo,
        descripcion: formData.descripcion || null,
        imagen_url: formData.imagen_url || null,
      };
      
      console.log('Guardando cupón:', couponData);
      
      if (editingId) {
        const { error } = await db
          .from('coupons')
          .update(couponData)
          .eq('id', editingId);
        
        if (error) {
          console.error('Error actualizando:', error);
          throw error;
        }
      } else {
        const { data, error } = await db
          .from('coupons')
          .insert(couponData)
          .select();
        
        if (error) {
          console.error('Error insertando:', error);
          alert(`Error al crear cupón: ${error.message}`);
          return;
        }
        console.log('Cupón creado:', data);
      }
      
      await loadCupones();
      setShowModal(false);
      setFormData(initialFormData);
      setEditingId(null);
      alert(editingId ? 'Cupón actualizado' : 'Cupón creado correctamente');
    } catch (error: any) {
      console.error('Error guardando cupón:', error);
      alert(`Error al guardar: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      tipo: coupon.tipo,
      valor: coupon.valor,
      minimo: coupon.minimo,
      max_usos: coupon.max_usos,
      valido_hasta: coupon.valido_hasta ? coupon.valido_hasta.split('T')[0] : '',
      activo: coupon.activo,
      imagen_url: coupon.imagen_url || null,
      descripcion: coupon.descripcion || '',
    });
    setEditingId(coupon.id);
    setShowModal(true);
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await db
        .from('coupons')
        .update({ activo: !currentState })
        .eq('id', id);
      
      if (error) throw error;
      setCupones(cupones.map(c => 
        c.id === id ? { ...c, activo: !currentState } : c
      ));
    } catch (error) {
      console.error('Error actualizando cupón:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;
    try {
      const { error } = await db
        .from('coupons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setCupones(cupones.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error eliminando cupón:', error);
      alert('Error al eliminar el cupón');
    }
  };

  // Manejo de drag and drop para imágenes
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await uploadImage(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setUploading(true);
    try {
      const fileName = `coupon-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      
      // Subir imagen a Supabase Storage
      const { data, error } = await db.storage
        .from('banners')
        .upload(fileName, file, { upsert: true });
      
      if (error) throw error;
      
      // Obtener URL pública
      const { data: urlData } = db.storage.from('banners').getPublicUrl(fileName);
      setFormData({ ...formData, imagen_url: urlData.publicUrl });
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('Error al subir imagen. Verifica que tengas permisos.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imagen_url: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cupones de Descuento</h1>
          <p className="text-gray-600">Gestiona los cupones promocionales</p>
        </div>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <span>+</span> Nuevo Cupón
        </button>
      </div>

      {/* Aviso importante */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="material-icons text-2xl">info</span>
          <div>
            <p className="font-bold text-lg">⚠️ Importante: Cupones Solo Online</p>
            <p className="text-sm opacity-90">
              Todos los cupones de descuento son válidos <strong>únicamente para compras realizadas a través de la web</strong>. 
              No pueden ser canjeados en el local físico.
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de cupones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mínimo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Válido hasta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cupones.map((cupon) => (
              <tr key={cupon.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="font-mono font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded">
                      {cupon.code}
                    </span>
                    {cupon.descripcion && (
                      <p className="text-xs text-gray-500 mt-1">{cupon.descripcion}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cupon.imagen_url ? (
                    <div className="relative w-16 h-10 rounded overflow-hidden">
                      <Image
                        src={cupon.imagen_url}
                        alt={cupon.code}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Sin imagen</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold">
                    {cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : `$${cupon.valor}`}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">
                    ({cupon.tipo})
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  ${cupon.minimo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-gray-900">{cupon.usos_actuales || 0}</span>
                  <span className="text-gray-400">
                    /{cupon.max_usos || '∞'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cupon.valido_hasta 
                    ? new Date(cupon.valido_hasta).toLocaleDateString('es-UY')
                    : 'Sin límite'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(cupon.id, cupon.activo)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      cupon.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cupon.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(cupon)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cupon.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cupones.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay cupones creados
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar Cupón' : 'Nuevo Cupón'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="DESCUENTO20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'porcentaje' | 'fijo' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compra Mínima
                  </label>
                  <input
                    type="number"
                    value={formData.minimo}
                    onChange={(e) => setFormData({ ...formData, minimo: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máx. Usos
                  </label>
                  <input
                    type="number"
                    value={formData.max_usos || ''}
                    onChange={(e) => setFormData({ ...formData, max_usos: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="Ilimitado"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Válido hasta
                </label>
                <input
                  type="date"
                  value={formData.valido_hasta}
                  onChange={(e) => setFormData({ ...formData, valido_hasta: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded text-pink-500 focus:ring-pink-500"
                />
                <label htmlFor="activo" className="text-sm text-gray-700">
                  Cupón activo
                </label>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Ej: ¡Cupón especial de Black Friday!"
                />
              </div>

              {/* Aviso de cupón online */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800 flex items-center gap-2">
                  <span className="material-icons text-base">info</span>
                  <strong>Todos los cupones son válidos únicamente para compras online</strong>
                </p>
                <p className="text-xs text-orange-600 mt-1 ml-6">
                  No pueden ser canjeados en el local físico
                </p>
              </div>

              {/* Imagen con Drag & Drop */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen promocional (opcional)
                </label>
                {formData.imagen_url ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                    <Image
                      src={formData.imagen_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragging 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-2"></div>
                        <span className="text-sm text-gray-500">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-3xl text-gray-400 mb-1">cloud_upload</span>
                        <span className="text-sm text-gray-500">Arrastra una imagen aquí</span>
                        <span className="text-xs text-gray-400">o haz clic para seleccionar</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  {editingId ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
