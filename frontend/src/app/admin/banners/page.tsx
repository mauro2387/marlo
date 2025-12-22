'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { bannersDB, storageDB } from '@/lib/supabase-fetch';

interface PromoBanner {
  id: string;
  nombre_interno: string;
  titulo?: string;
  subtitulo?: string;
  plantilla: 'descuento' | 'nuevo' | 'envio_gratis' | 'puntos' | 'temporada' | 'custom';
  imagen_url?: string;
  color_fondo: string;
  color_texto: string;
  color_boton?: string;
  boton_texto?: string;
  boton_link?: string;
  valor_descuento?: number;
  orden: number;
  activo: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
}

const PLANTILLAS = [
  { id: 'descuento', nombre: 'Descuento', icon: 'percent', color: 'from-red-500 to-pink-500', desc: 'Promociones con %' },
  { id: 'nuevo', nombre: 'Nuevo Producto', icon: 'stars', color: 'from-amber-400 to-orange-500', desc: 'Lanzamientos' },

  { id: 'puntos', nombre: 'Puntos', icon: 'card_giftcard', color: 'from-purple-500 to-indigo-500', desc: 'Programa de lealtad' },
  { id: 'temporada', nombre: 'Temporada', icon: 'favorite', color: 'from-pink-400 to-rose-500', desc: 'Ofertas especiales' },
  { id: 'custom', nombre: 'Personalizado', icon: 'image', color: 'from-gray-400 to-gray-600', desc: 'Imagen propia' },
];

const emptyBanner: Partial<PromoBanner> = {
  nombre_interno: '',
  titulo: '',
  subtitulo: '',
  plantilla: 'custom',
  color_fondo: '#FF6B6B',
  color_texto: '#FFFFFF',
  color_boton: '#FFFFFF',
  boton_texto: '',
  boton_link: '',
  valor_descuento: undefined,
  orden: 0,
  activo: true,
};

export default function AdminBannersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'admin';
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<PromoBanner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    loadBanners();
  }, [user, isAdmin, router]);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await bannersDB.getAll();
      if (data && !error) {
        setBanners(data);
      }
    } catch (err) {
      console.error('Error loading banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreate = () => {
    setEditingBanner({ ...emptyBanner, orden: banners.length });
    setShowForm(true);
  };

  const handleEdit = (banner: PromoBanner) => {
    setEditingBanner({ ...banner });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingBanner(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!editingBanner) {
      showMessage('error', 'Error: No hay banner para guardar');
      return;
    }
    
    // Validar nombre interno obligatorio
    if (!editingBanner.nombre_interno?.trim()) {
      showMessage('error', 'El nombre interno es obligatorio');
      return;
    }
    
    // Validar que tenga imagen si es custom
    if (editingBanner.plantilla === 'custom' && !editingBanner.imagen_url) {
      showMessage('error', 'Debes subir una imagen para el banner personalizado');
      return;
    }

    setSaving(true);
    try {
      if (editingBanner.id) {
        // Actualizar
        const { error } = await bannersDB.update(editingBanner.id, editingBanner);
        if (error) throw error;
        showMessage('success', 'Banner actualizado');
      } else {
        // Crear
        const { error } = await bannersDB.create(editingBanner);
        if (error) throw error;
        showMessage('success', 'Banner creado');
      }
      await loadBanners();
      handleCancel();
    } catch (err) {
      showMessage('error', 'Error al guardar el banner');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este banner?')) return;
    
    try {
      const { error } = await bannersDB.delete(id);
      if (error) throw error;
      showMessage('success', 'Banner eliminado');
      await loadBanners();
    } catch (err) {
      showMessage('error', 'Error al eliminar');
      console.error(err);
    }
  };

  const handleToggleActive = async (banner: PromoBanner) => {
    try {
      const { error } = await bannersDB.toggleActive(banner.id, !banner.activo);
      if (error) throw error;
      await loadBanners();
    } catch (err) {
      showMessage('error', 'Error al cambiar estado');
      console.error(err);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
    const updates = newBanners.map((b, i) => ({ id: b.id, orden: i }));
    await bannersDB.reorder(updates);
    await loadBanners();
  };

  const handleMoveDown = async (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
    const updates = newBanners.map((b, i) => ({ id: b.id, orden: i }));
    await bannersDB.reorder(updates);
    await loadBanners();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Subir a storage de Supabase
      const fileName = `banner-${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const { data, error } = await storageDB.upload('banners', fileName, file);
      
      if (error) throw error;
      
      // Obtener URL pública
      const publicUrl = storageDB.getPublicUrl('banners', fileName);
      
      setEditingBanner(prev => prev ? { ...prev, imagen_url: publicUrl } : null);
      showMessage('success', 'Imagen subida correctamente');
    } catch (err) {
      console.error('Error uploading:', err);
      showMessage('error', 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const renderPreview = () => {
    if (!editingBanner) return null;

    const plantilla = PLANTILLAS.find(p => p.id === editingBanner.plantilla);
    const isCustom = editingBanner.plantilla === 'custom';

    if (isCustom && editingBanner.imagen_url) {
      return (
        <div 
          className="w-48 aspect-square rounded-2xl overflow-hidden relative mx-auto"
          style={{
            backgroundImage: `url(${editingBanner.imagen_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
            <h4 className="text-white font-bold text-sm">{editingBanner.titulo || 'Título'}</h4>
            <p className="text-white/80 text-xs">{editingBanner.subtitulo || 'Subtítulo'}</p>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`w-48 aspect-square rounded-2xl overflow-hidden relative mx-auto bg-gradient-to-br ${plantilla?.color || 'from-gray-400 to-gray-600'}`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="absolute right-2 bottom-2 text-3xl opacity-20">🍪</div>
        <div className="absolute left-2 top-2 text-xl opacity-15">🍪</div>
        <div className="relative h-full flex flex-col items-center justify-center p-3 text-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-2">
            {editingBanner.plantilla === 'descuento' && editingBanner.valor_descuento ? (
              <span className="font-bold text-sm">{editingBanner.valor_descuento}%</span>
            ) : plantilla?.icon ? (
              <span className="material-icons text-lg">{plantilla.icon}</span>
            ) : (
              <span className="material-icons text-lg">star</span>
            )}
          </div>
          <h4 className="text-white font-bold text-sm leading-tight">{editingBanner.titulo || 'Título'}</h4>
          <p className="text-white/80 text-xs mt-1">{editingBanner.subtitulo || 'Subtítulo'}</p>
          {editingBanner.boton_texto && (
            <div className="mt-2 px-3 py-1 bg-white rounded-full text-gray-800 text-xs font-medium">
              {editingBanner.boton_texto}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Banners Promocionales</h1>
              <p className="text-gray-500 text-sm">Gestiona los anuncios del carrusel</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <span className="material-icons">add</span>
            Nuevo Banner
          </button>
        </div>

        {/* Mensaje */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Formulario */}
        {showForm && editingBanner && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                {editingBanner.id ? 'Editar Banner' : 'Nuevo Banner'}
              </h2>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Nombre interno - OBLIGATORIO */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Interno * <span className="text-gray-400 font-normal">(solo visible en el admin)</span>
              </label>
              <input
                type="text"
                value={editingBanner.nombre_interno || ''}
                onChange={(e) => setEditingBanner({ ...editingBanner, nombre_interno: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Ej: Promo Navidad 2025, Banner verano, etc."
              />
            </div>

            {/* Selección de plantilla */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Banner</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {PLANTILLAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setEditingBanner({ ...editingBanner, plantilla: p.id as any })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      editingBanner.plantilla === p.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${p.color} flex items-center justify-center mx-auto mb-2`}>
                      <span className="material-icons text-white">{p.icon}</span>
                    </div>
                    <p className="text-xs font-medium text-center">{p.nombre}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Imagen personalizada */}
            {editingBanner.plantilla === 'custom' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Banner</label>
                
                {/* Zona de drag & drop */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    editingBanner.imagen_url 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-pink-500', 'bg-pink-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-pink-500', 'bg-pink-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-pink-500', 'bg-pink-50');
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const fakeEvent = { target: { files: [file] } } as any;
                      handleImageUpload(fakeEvent);
                    }
                  }}
                >
                  {editingBanner.imagen_url ? (
                    <div className="space-y-3">
                      <img 
                        src={editingBanner.imagen_url} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-xl mx-auto"
                      />
                      <p className="text-sm text-green-600 font-medium">✓ Imagen cargada</p>
                      <button
                        type="button"
                        onClick={() => setEditingBanner({ ...editingBanner, imagen_url: '' })}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Eliminar imagen
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="material-icons text-4xl text-gray-400">cloud_upload</span>
                      <p className="text-gray-600">Arrastra una imagen aquí o</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg cursor-pointer hover:bg-pink-600 transition-colors">
                        <span className="material-icons text-sm">upload</span>
                        {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-xs text-red-500 font-semibold mt-2">⚠️ Tamaño requerido: 400x400 px (cuadrado), formato JPG o PNG</p>
              </div>
            )}

            {/* Campos del formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título (opcional)</label>
                <input
                  type="text"
                  value={editingBanner.titulo || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Ej: ¡20% OFF en todo!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={editingBanner.subtitulo || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Ej: Solo por hoy"
                />
              </div>
              
              {editingBanner.plantilla === 'descuento' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje de Descuento</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={editingBanner.valor_descuento || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, valor_descuento: parseInt(e.target.value) || undefined })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ej: 20"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Botón</label>
                <input
                  type="text"
                  value={editingBanner.boton_texto || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, boton_texto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Ej: Ver Ofertas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link del Botón</label>
                <input
                  type="text"
                  value={editingBanner.boton_link || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, boton_link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Ej: /productos"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vista Previa</label>
              {renderPreview()}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio (opcional)</label>
                <input
                  type="datetime-local"
                  value={editingBanner.fecha_inicio?.slice(0, 16) || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, fecha_inicio: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (opcional)</label>
                <input
                  type="datetime-local"
                  value={editingBanner.fecha_fin?.slice(0, 16) || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, fecha_fin: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Activo */}
            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                id="activo"
                checked={editingBanner.activo}
                onChange={(e) => setEditingBanner({ ...editingBanner, activo: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                Banner activo (visible en la página)
              </label>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors"
              >
                <span className="material-icons text-xl">save</span>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de banners */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 mt-4">Cargando banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No hay banners</h3>
            <p className="text-gray-500 mb-6">Crea tu primer banner promocional</p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Crear Banner
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner, index) => {
              const plantilla = PLANTILLAS.find(p => p.id === banner.plantilla);
              return (
                <div
                  key={banner.id}
                  className={`bg-white rounded-xl shadow p-4 flex items-center gap-4 ${
                    !banner.activo ? 'opacity-60' : ''
                  }`}
                >
                  {/* Orden */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <span className="material-icons text-sm">arrow_upward</span>
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === banners.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      <span className="material-icons text-sm">arrow_downward</span>
                    </button>
                  </div>

                  {/* Icono */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plantilla?.color || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                    {plantilla?.icon ? (
                      <span className="material-icons text-white">{plantilla.icon}</span>
                    ) : (
                      <span className="material-icons text-white">star</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{banner.nombre_interno}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {plantilla?.nombre} • {banner.titulo || '(Solo imagen)'}
                    </p>
                  </div>

                  {/* Estado */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    banner.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {banner.activo ? 'Activo' : 'Inactivo'}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`p-2 rounded-lg transition-colors ${
                        banner.activo ? 'hover:bg-gray-100' : 'hover:bg-green-100'
                      }`}
                      title={banner.activo ? 'Desactivar' : 'Activar'}
                    >
                      {banner.activo ? <span className="material-icons text-gray-500">visibility_off</span> : <span className="material-icons text-green-500">visibility</span>}
                    </button>
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <span className="material-icons text-amber-600">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <span className="material-icons text-red-500">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <h4 className="font-semibold text-amber-800 mb-2">💡 Consejos</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Los banners se muestran en orden (usa las flechas para reordenar)</li>
            <li>• Puedes programar banners con fechas de inicio y fin</li>
            <li>• <strong>Si solo hay 1 banner activo</strong>, se muestra fijo (sin carrusel)</li>
            <li>• <strong>Si hay 2+ banners activos</strong>, se muestra como carrusel automático</li>
            <li className="text-red-600 font-semibold">• ⚠️ Para imágenes personalizadas, usa tamaño 400x400 px (cuadrado)</li>
            <li>• El título y subtítulo son opcionales - puedes subir solo una imagen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
