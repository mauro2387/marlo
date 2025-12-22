'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';

interface FeaturedCard {
  id: string;
  titulo: string;
  subtitulo: string;
  precio_desde: string;
  descripcion: string;
  icono: string;
  color_fondo: string;
  color_icono: string;
  enlace: string;
  imagen_url: string | null;
  orden: number;
  activo: boolean;
}

const defaultCards: Omit<FeaturedCard, 'id'>[] = [
  {
    titulo: 'Cookies Clásicas',
    subtitulo: 'Desde $199',
    precio_desde: '199',
    descripcion: 'Nuestras cookies tradicionales con chispas de chocolate',
    icono: 'cookie',
    color_fondo: 'from-secondary-crema to-secondary-rosa/30',
    color_icono: 'text-primary',
    enlace: '/productos',
    imagen_url: null,
    orden: 1,
    activo: true,
  },
  {
    titulo: 'Box Personalizados',
    subtitulo: 'Desde $540',
    precio_desde: '540',
    descripcion: 'Arma tu box con tus sabores favoritos (4, 6 o 9 unidades)',
    icono: 'inventory_2',
    color_fondo: 'from-secondary-salmon/20 to-secondary-rosa/30',
    color_icono: 'text-secondary-salmon',
    enlace: '/boxes',
    imagen_url: null,
    orden: 2,
    activo: true,
  },
  {
    titulo: 'Edición Limitada',
    subtitulo: 'Desde $219',
    precio_desde: '219',
    descripcion: 'Sabores únicos disponibles por tiempo limitado',
    icono: 'star',
    color_fondo: 'from-primary/10 to-secondary-crema',
    color_icono: 'text-yellow-500',
    enlace: '/productos',
    imagen_url: null,
    orden: 3,
    activo: true,
  },
];

const iconOptions = [
  { value: 'cookie', label: 'Cookie' },
  { value: 'inventory_2', label: 'Box' },
  { value: 'star', label: 'Estrella' },
  { value: 'cake', label: 'Pastel' },
  { value: 'celebration', label: 'Celebración' },
  { value: 'card_giftcard', label: 'Regalo' },
  { value: 'local_fire_department', label: 'Fuego' },
  { value: 'favorite', label: 'Corazón' },
];

export default function DestacadosAdminPage() {
  const [cards, setCards] = useState<FeaturedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<FeaturedCard | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      // Intentar cargar desde Supabase
      const { data, error } = await supabase
        .from('featured_cards')
        .select('*')
        .order('orden', { ascending: true });

      if (error) {
        // Si la tabla no existe, usar defaults
        console.log('Tabla featured_cards no existe, usando defaults');
        setCards(defaultCards.map((c, i) => ({ ...c, id: String(i + 1) })));
      } else if (data && data.length > 0) {
        setCards(data);
      } else {
        // Tabla existe pero vacía, insertar defaults
        setCards(defaultCards.map((c, i) => ({ ...c, id: String(i + 1) })));
      }
    } catch (err) {
      console.error('Error:', err);
      setCards(defaultCards.map((c, i) => ({ ...c, id: String(i + 1) })));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (card: FeaturedCard) => {
    setEditingCard(card);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingCard) return;
    setSaving(true);

    try {
      // Intentar guardar en Supabase
      const { error } = await supabase
        .from('featured_cards')
        .upsert(editingCard as any);

      if (error) {
        console.log('Error guardando en DB, guardando localmente');
      }

      // Actualizar estado local
      setCards(cards.map(c => c.id === editingCard.id ? editingCard : c));
      setShowModal(false);
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !editingCard) return;
    await uploadImage(e.target.files[0]);
  };

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
    
    if (!editingCard) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await uploadImage(files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    if (!editingCard) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setUploading(true);

    try {
      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `featured-${editingCard.id}-${Date.now()}.${fileExt}`;

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from('featured-images')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('featured-images')
        .getPublicUrl(fileName);

      setEditingCard({
        ...editingCard,
        imagen_url: urlData.publicUrl,
      });
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('Error al subir imagen. Verifica que el bucket "featured-images" existe en Supabase Storage.');
    } finally {
      setUploading(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brown-800">Productos Destacados</h2>
          <p className="text-gray-500 mt-1">Edita las 3 tarjetas de productos destacados en la página de inicio</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="material-icons text-blue-500">info</span>
        <div>
          <p className="font-medium text-blue-800">¿Cómo funciona?</p>
          <p className="text-sm text-blue-600">
            Estas tarjetas aparecen en la sección "Nuestros Productos Destacados" de la página de inicio.
            Puedes cambiar el título, precio, ícono o subir una imagen personalizada.
          </p>
        </div>
      </div>

      {/* Preview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow group"
            onClick={() => openEditModal(card)}
          >
            {/* Card Preview */}
            <div className={`aspect-square bg-gradient-to-br ${card.color_fondo} flex items-center justify-center relative`}>
              {card.imagen_url ? (
                <div className="relative w-full h-full">
                  <Image
                    src={card.imagen_url}
                    alt={card.titulo}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className={`material-icons ${card.color_icono}`} style={{ fontSize: '80px' }}>
                  {card.icono}
                </span>
              )}
              
              {/* Edit overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-icons text-white text-4xl">edit</span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-primary mb-1">{card.titulo}</h3>
              <p className="text-gray-600 mb-2">{card.subtitulo}</p>
              <p className="text-sm text-gray-500">{card.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edición */}
      {showModal && editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brown-800">Editar Tarjeta</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Preview */}
              <div className={`aspect-video bg-gradient-to-br ${editingCard.color_fondo} rounded-xl flex items-center justify-center relative overflow-hidden`}>
                {editingCard.imagen_url ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={editingCard.imagen_url}
                      alt={editingCard.titulo}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => setEditingCard({ ...editingCard, imagen_url: null })}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <span className={`material-icons ${editingCard.color_icono}`} style={{ fontSize: '60px' }}>
                    {editingCard.icono}
                  </span>
                )}
              </div>

              {/* Upload Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen (opcional)
                </label>
                {editingCard.imagen_url ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                    <Image
                      src={editingCard.imagen_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingCard({ ...editingCard, imagen_url: null })}
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
                    className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-primary bg-primary/10 scale-[1.02]' 
                        : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-2"></div>
                        <span className="text-sm text-gray-500">Subiendo imagen...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-4xl text-gray-400 mb-2">cloud_upload</span>
                        <span className="text-sm text-gray-600 font-medium">
                          {isDragging ? '¡Suelta la imagen aquí!' : 'Arrastra una imagen aquí'}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">o haz clic para seleccionar</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                )}
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={editingCard.titulo}
                  onChange={(e) => setEditingCard({ ...editingCard, titulo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Subtítulo (precio) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtítulo (ej: "Desde $199")
                </label>
                <input
                  type="text"
                  value={editingCard.subtitulo}
                  onChange={(e) => setEditingCard({ ...editingCard, subtitulo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editingCard.descripcion}
                  onChange={(e) => setEditingCard({ ...editingCard, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  rows={2}
                />
              </div>

              {/* Ícono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ícono (se usa si no hay imagen)
                </label>
                <select
                  value={editingCard.icono}
                  onChange={(e) => setEditingCard({ ...editingCard, icono: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  {iconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Enlace */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enlace
                </label>
                <input
                  type="text"
                  value={editingCard.enlace}
                  onChange={(e) => setEditingCard({ ...editingCard, enlace: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="/productos"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
