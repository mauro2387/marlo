'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

// Cast supabase to any for flexibility with dynamic tables
const db = supabase as any;

interface Reward {
  id: string;
  nombre: string;
  descripcion: string;
  puntos_requeridos: number;
  icono: string;
  imagen_url: string | null;
  categoria: string;
  tipo_recompensa: string; // 'producto' | 'cupon_descuento' | 'cupon_envio' | 'box_personalizable'
  valor_descuento: number | null; // Para cupones: % o monto
  cantidad_cookies: number | null; // Para box: cantidad de cookies a elegir
  es_destacado: boolean;
  activo: boolean;
  stock: number;
  orden: number;
}

interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  puntos_usados: number;
  estado: string;
  order_id: string | null;
  codigo_cupon: string | null;
  notas: string | null;
  created_at: string;
  user?: { nombre: string; apellido: string; email: string };
  reward?: { nombre: string };
}

const iconOptions = [
  { value: 'coffee', label: '☕ Café' },
  { value: 'cookie', label: '🍪 Cookie' },
  { value: 'inventory_2', label: '📦 Box' },
  { value: 'card_giftcard', label: '🎁 Regalo' },
  { value: 'star', label: '⭐ Estrella' },
  { value: 'payments', label: '💰 Descuento' },
  { value: 'local_shipping', label: '🚚 Envío' },
  { value: 'celebration', label: '🎉 Celebración' },
  { value: 'cake', label: '🎂 Pastel' },
  { value: 'percent', label: '% Porcentaje' },
];

const categoriaOptions = [
  { value: 'producto', label: 'Producto Gratis' },
  { value: 'descuento', label: 'Descuento' },
  { value: 'especial', label: 'Especial' },
];

const tipoRecompensaOptions = [
  { value: 'producto', label: '🍪 Producto específico', desc: 'Se agrega al carrito y va al checkout' },
  { value: 'cupon_descuento', label: '💰 Cupón de descuento', desc: 'Genera un código de descuento único' },
  { value: 'box_personalizable', label: '📦 Box personalizable', desc: 'El cliente elige las cookies' },
];

// Plantillas rápidas
const plantillas = [
  {
    nombre: '10% de Descuento',
    descripcion: 'Cupón de 10% de descuento en tu próxima compra',
    icono: 'percent',
    categoria: 'descuento',
    tipo_recompensa: 'cupon_descuento',
    valor_descuento: 10,
    puntos_sugeridos: 2000,
  },
  {
    nombre: '20% de Descuento',
    descripcion: 'Cupón de 20% de descuento en tu próxima compra',
    icono: 'percent',
    categoria: 'descuento',
    tipo_recompensa: 'cupon_descuento',
    valor_descuento: 20,
    puntos_sugeridos: 4000,
  },
  {
    nombre: 'Box 4 Cookies a Elección',
    descripcion: '¡Elige 4 cookies de nuestro menú!',
    icono: 'inventory_2',
    categoria: 'producto',
    tipo_recompensa: 'box_personalizable',
    cantidad_cookies: 4,
    puntos_sugeridos: 5000,
  },
  {
    nombre: 'Box 6 Cookies a Elección',
    descripcion: '¡Elige 6 cookies de nuestro menú!',
    icono: 'inventory_2',
    categoria: 'producto',
    tipo_recompensa: 'box_personalizable',
    cantidad_cookies: 6,
    puntos_sugeridos: 7500,
  },
  {
    nombre: 'Cookie Gratis',
    descripcion: 'Una cookie gratis de cualquier sabor',
    icono: 'cookie',
    categoria: 'producto',
    tipo_recompensa: 'producto',
    puntos_sugeridos: 1000,
  },
];

export default function RewardsAdminPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rewards' | 'redemptions'>('rewards');
  const [showModal, setShowModal] = useState(false);
  const [showPlantillasModal, setShowPlantillasModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    puntos_requeridos: 1000,
    icono: 'card_giftcard',
    imagen_url: '',
    categoria: 'producto',
    tipo_recompensa: 'producto',
    valor_descuento: 0,
    cantidad_cookies: 4,
    es_destacado: false,
    activo: true,
    stock: -1,
    orden: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .order('orden', { ascending: true });

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData || []);

      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          user:users(nombre, apellido, email),
          reward:rewards(nombre)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (redemptionsError) {
        console.log('Error cargando canjes:', redemptionsError);
      } else {
        setRedemptions(redemptionsData || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===== UPLOAD DE IMAGEN =====
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `reward-${Date.now()}.${fileExt}`;
      const filePath = `rewards/${fileName}`;

      // Intentar subir a diferentes buckets
      let uploadError: any = null;
      let bucketUsed = '';
      
      // Intentar primero con 'images'
      const { error: imagesError } = await db.storage
        .from('images')
        .upload(filePath, file, { upsert: true });
      
      if (imagesError) {
        console.log('Error en bucket images:', imagesError.message);
        // Intentar con 'productos'
        const { error: productosError } = await db.storage
          .from('productos')
          .upload(filePath, file, { upsert: true });
        
        if (productosError) {
          console.log('Error en bucket productos:', productosError.message);
          // Intentar con 'public'
          const { error: publicError } = await db.storage
            .from('public')
            .upload(filePath, file, { upsert: true });
          
          if (publicError) {
            uploadError = publicError;
          } else {
            bucketUsed = 'public';
          }
        } else {
          bucketUsed = 'productos';
        }
      } else {
        bucketUsed = 'images';
      }

      if (uploadError) {
        console.error('Error subiendo imagen:', uploadError);
        alert(`Error al subir la imagen: ${uploadError.message}\n\nVerifica que exista un bucket de Storage en Supabase.`);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketUsed)
        .getPublicUrl(filePath);

      console.log('Imagen subida a:', bucketUsed, publicUrl);
      setFormData({ ...formData, imagen_url: publicUrl });
    } catch (err: any) {
      console.error('Error subiendo imagen:', err);
      alert(`Error al subir la imagen: ${err.message || 'Error desconocido'}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imagen_url: '' });
  };

  // ===== MODALES =====
  const openCreateModal = () => {
    setEditingReward(null);
    setFormData({
      nombre: '',
      descripcion: '',
      puntos_requeridos: 1000,
      icono: 'card_giftcard',
      imagen_url: '',
      categoria: 'producto',
      tipo_recompensa: 'producto',
      valor_descuento: 0,
      cantidad_cookies: 4,
      es_destacado: false,
      activo: true,
      stock: -1,
      orden: rewards.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      nombre: reward.nombre,
      descripcion: reward.descripcion || '',
      puntos_requeridos: reward.puntos_requeridos,
      icono: reward.icono || 'card_giftcard',
      imagen_url: reward.imagen_url || '',
      categoria: reward.categoria || 'producto',
      tipo_recompensa: reward.tipo_recompensa || 'producto',
      valor_descuento: reward.valor_descuento || 0,
      cantidad_cookies: reward.cantidad_cookies || 4,
      es_destacado: reward.es_destacado,
      activo: reward.activo,
      stock: reward.stock,
      orden: reward.orden,
    });
    setShowModal(true);
  };

  const applyPlantilla = (plantilla: typeof plantillas[0]) => {
    setFormData({
      ...formData,
      nombre: plantilla.nombre,
      descripcion: plantilla.descripcion,
      icono: plantilla.icono,
      categoria: plantilla.categoria,
      tipo_recompensa: plantilla.tipo_recompensa,
      puntos_requeridos: plantilla.puntos_sugeridos,
      valor_descuento: (plantilla as any).valor_descuento || 0,
      cantidad_cookies: (plantilla as any).cantidad_cookies || 4,
    });
    setShowPlantillasModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      valor_descuento: formData.tipo_recompensa === 'cupon_descuento' ? formData.valor_descuento : null,
      cantidad_cookies: formData.tipo_recompensa === 'box_personalizable' ? formData.cantidad_cookies : null,
    };
    
    try {
      if (editingReward) {
        const supabaseAny = supabase as any;
        const { error } = await supabaseAny
          .from('rewards')
          .update(dataToSave)
          .eq('id', editingReward.id);

        if (error) throw error;
        setRewards(rewards.map(r => 
          r.id === editingReward.id ? { ...r, ...dataToSave } : r
        ));
      } else {
        const { data, error } = await supabase
          .from('rewards')
          .insert(dataToSave as any)
          .select()
          .single();

        if (error) throw error;
        setRewards([...rewards, data as Reward]);
      }
      
      setShowModal(false);
    } catch (err) {
      console.error('Error guardando:', err);
      alert('Error al guardar la recompensa');
    }
  };

  const deleteReward = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?\n\nEsta acción no se puede deshacer.`)) return;
    
    try {
      const supabaseAny = supabase as any;
      
      // Primero verificar si hay canjes asociados
      const { data: redemptionsData, error: checkError } = await supabaseAny
        .from('reward_redemptions')
        .select('id')
        .eq('reward_id', id);
      
      if (checkError) {
        console.error('Error verificando canjes:', checkError);
      }
      
      if (redemptionsData && redemptionsData.length > 0) {
        // Si hay canjes, preguntar qué hacer
        const action = prompt(
          `Esta recompensa tiene ${redemptionsData.length} canje(s) asociado(s).\n\nEscribe:\n• "ELIMINAR" para borrar la recompensa Y sus canjes\n• "desactivar" para solo desactivarla\n• Cancelar para no hacer nada`
        );
        
        if (!action) return;
        
        if (action.toUpperCase() === 'ELIMINAR') {
          // Eliminar primero los canjes asociados
          const { error: deleteRedemptionsError } = await supabaseAny
            .from('reward_redemptions')
            .delete()
            .eq('reward_id', id);
          
          if (deleteRedemptionsError) {
            console.error('Error eliminando canjes:', deleteRedemptionsError);
            throw new Error('No se pudieron eliminar los canjes asociados. Verifica permisos en Supabase.');
          }
          
          // Ahora eliminar la recompensa
          const { error: deleteError } = await supabaseAny
            .from('rewards')
            .delete()
            .eq('id', id);
          
          if (deleteError) throw deleteError;
          
          setRewards(rewards.filter(r => r.id !== id));
          setRedemptions(redemptions.filter(r => r.reward_id !== id));
          alert(`Recompensa "${nombre}" y ${redemptionsData.length} canje(s) eliminados correctamente`);
          return;
        } else if (action.toLowerCase() === 'desactivar') {
          const { error: updateError } = await supabaseAny
            .from('rewards')
            .update({ activo: false })
            .eq('id', id);
          
          if (updateError) throw updateError;
          
          setRewards(rewards.map(r => 
            r.id === id ? { ...r, activo: false } : r
          ));
          alert('Recompensa desactivada correctamente');
        }
        return;
      }
      
      // Si no hay canjes, eliminar normalmente
      const { error } = await supabaseAny
        .from('rewards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error de Supabase:', error);
        
        if (error.code === '42501' || error.message?.includes('policy')) {
          throw new Error('No tienes permisos para eliminar. Verifica que tu rol sea "admin" en la base de datos.');
        }
        if (error.code === '23503' || error.message?.includes('foreign key')) {
          throw new Error('Esta recompensa tiene registros asociados.');
        }
        throw error;
      }
      
      setRewards(rewards.filter(r => r.id !== id));
      alert('Recompensa eliminada correctamente');
    } catch (err: any) {
      console.error('Error eliminando:', err);
      alert(err.message || 'Error al eliminar. Revisa la consola para más detalles.');
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('rewards')
        .update({ activo: !currentActive })
        .eq('id', id);

      if (error) throw error;
      setRewards(rewards.map(r => 
        r.id === id ? { ...r, activo: !currentActive } : r
      ));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const updateRedemptionStatus = async (id: string, newStatus: string) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('reward_redemptions')
        .update({ estado: newStatus })
        .eq('id', id);

      if (error) throw error;
      setRedemptions(redemptions.map(r => 
        r.id === id ? { ...r, estado: newStatus } : r
      ));
    } catch (err) {
      console.error('Error:', err);
      alert('Error actualizando estado');
    }
  };

  const getTipoRecompensaLabel = (tipo: string) => {
    const option = tipoRecompensaOptions.find(o => o.value === tipo);
    return option?.label || tipo;
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
        <h2 className="text-2xl font-bold text-brown-800">Recompensas de Puntos</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPlantillasModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 flex items-center gap-2"
          >
            <span className="material-icons">auto_awesome</span>
            Plantillas
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 flex items-center gap-2"
          >
            <span className="material-icons">add</span>
            Nueva Recompensa
          </button>
        </div>
      </div>

      {/* Info de tipos */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
          <span className="material-icons">info</span>
          Tipos de Recompensas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white p-2 rounded-lg">
            <span className="font-medium">🍪 Producto</span>
            <p className="text-gray-500 text-xs">Va al checkout normal</p>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <span className="font-medium">💰 Cupón Descuento</span>
            <p className="text-gray-500 text-xs">Genera código único</p>
          </div>
          <div className="bg-white p-2 rounded-lg">
            <span className="font-medium">📦 Box Personalizable</span>
            <p className="text-gray-500 text-xs">Elige las cookies</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl shadow-md p-2">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'rewards' 
              ? 'bg-yellow-500 text-white' 
              : 'hover:bg-gray-100'
          }`}
        >
          <span className="material-icons">card_giftcard</span>
          Recompensas ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab('redemptions')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'redemptions' 
              ? 'bg-yellow-500 text-white' 
              : 'hover:bg-gray-100'
          }`}
        >
          <span className="material-icons">history</span>
          Canjes ({redemptions.length})
        </button>
      </div>

      {/* Contenido */}
      {activeTab === 'rewards' ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {rewards.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-icons text-6xl text-gray-300 mb-4">card_giftcard</span>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin recompensas</h3>
              <p className="text-gray-500 mb-4">Usa una plantilla para crear tu primera recompensa</p>
              <button
                onClick={() => setShowPlantillasModal(true)}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600"
              >
                Ver Plantillas
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-cream-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Recompensa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Puntos</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((reward) => (
                  <tr key={reward.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {reward.imagen_url ? (
                          <img 
                            src={reward.imagen_url} 
                            alt={reward.nombre}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span className="material-icons text-yellow-600 text-2xl">{reward.icono}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-brown-800">{reward.nombre}</p>
                          {reward.es_destacado && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              ⭐ Destacado
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {getTipoRecompensaLabel(reward.tipo_recompensa || 'producto')}
                      </span>
                      {reward.tipo_recompensa === 'cupon_descuento' && reward.valor_descuento && (
                        <span className="block text-xs text-gray-500 mt-1">
                          {reward.valor_descuento}% descuento
                        </span>
                      )}
                      {reward.tipo_recompensa === 'box_personalizable' && reward.cantidad_cookies && (
                        <span className="block text-xs text-gray-500 mt-1">
                          {reward.cantidad_cookies} cookies
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-yellow-600">
                        {reward.puntos_requeridos.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {reward.stock === -1 ? (
                        <span className="text-green-600">∞ Ilimitado</span>
                      ) : (
                        <span className={reward.stock < 10 ? 'text-red-600 font-medium' : ''}>
                          {reward.stock}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleActive(reward.id, reward.activo)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          reward.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {reward.activo ? '✓ Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(reward)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <span className="material-icons text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => deleteReward(reward.id, reward.nombre)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <span className="material-icons text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {redemptions.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-icons text-6xl text-gray-300 mb-4">history</span>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin canjes</h3>
              <p className="text-gray-500">Aún no hay canjes de puntos registrados</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-cream-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Recompensa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Puntos</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cupón</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((redemption) => (
                  <tr key={redemption.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(redemption.created_at).toLocaleDateString('es-UY', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-brown-800">
                          {redemption.user?.nombre} {redemption.user?.apellido}
                        </p>
                        <p className="text-xs text-gray-500">{redemption.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {redemption.reward?.nombre || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-red-600">
                        -{redemption.puntos_usados.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {redemption.codigo_cupon ? (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {redemption.codigo_cupon}
                        </code>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        redemption.estado === 'entregado' ? 'bg-green-100 text-green-800' :
                        redemption.estado === 'procesando' ? 'bg-blue-100 text-blue-800' :
                        redemption.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {redemption.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={redemption.estado}
                        onChange={(e) => updateRedemptionStatus(redemption.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="procesando">Procesando</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Plantillas */}
      {showPlantillasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brown-800 flex items-center gap-2">
                <span className="material-icons text-purple-500">auto_awesome</span>
                Plantillas Rápidas
              </h3>
              <button
                onClick={() => setShowPlantillasModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Selecciona una plantilla para crear una recompensa rápidamente:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plantillas.map((plantilla, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    applyPlantilla(plantilla);
                    setShowModal(true);
                  }}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <span className="material-icons text-purple-600 text-2xl">{plantilla.icono}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brown-800">{plantilla.nombre}</h4>
                      <p className="text-sm text-yellow-600 font-medium">
                        {plantilla.puntos_sugeridos.toLocaleString()} puntos
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{plantilla.descripcion}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowPlantillasModal(false);
                  openCreateModal();
                }}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-yellow-400 hover:text-yellow-600 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-icons">add</span>
                Crear desde cero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brown-800">
                {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Imagen con Drag & Drop */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen
                </label>
                {formData.imagen_url ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                    <img 
                      src={formData.imagen_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      dragActive 
                        ? 'border-yellow-500 bg-yellow-50' 
                        : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                    }`}
                  >
                    {uploading ? (
                      <LoadingSpinner size="md" />
                    ) : (
                      <>
                        <span className="material-icons text-4xl text-gray-400 mb-2">cloud_upload</span>
                        <p className="text-sm text-gray-500">
                          Arrastra una imagen o <span className="text-yellow-600 font-medium">haz clic</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                  rows={2}
                />
              </div>

              {/* Tipo de Recompensa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Recompensa *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {tipoRecompensaOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo_recompensa: opt.value })}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        formData.tipo_recompensa === opt.value
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      <span className="font-medium text-sm">{opt.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo específico para cupón de descuento */}
              {formData.tipo_recompensa === 'cupon_descuento' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-blue-800 mb-1">
                    Porcentaje de Descuento *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.valor_descuento}
                      onChange={(e) => setFormData({ ...formData, valor_descuento: Number(e.target.value) })}
                      className="w-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min={1}
                      max={100}
                    />
                    <span className="text-blue-800 font-medium">%</span>
                  </div>
                </div>
              )}

              {/* Campo específico para box personalizable */}
              {formData.tipo_recompensa === 'box_personalizable' && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-purple-800 mb-1">
                    Cantidad de Cookies a Elegir *
                  </label>
                  <select
                    value={formData.cantidad_cookies}
                    onChange={(e) => setFormData({ ...formData, cantidad_cookies: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={2}>2 cookies</option>
                    <option value={4}>4 cookies</option>
                    <option value={6}>6 cookies</option>
                    <option value={8}>8 cookies</option>
                    <option value={12}>12 cookies</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puntos Requeridos *
                  </label>
                  <input
                    type="number"
                    value={formData.puntos_requeridos}
                    onChange={(e) => setFormData({ ...formData, puntos_requeridos: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock (-1 = ilimitado)
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                    min={-1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ícono
                  </label>
                  <select
                    value={formData.icono}
                    onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                  >
                    {categoriaOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.es_destacado}
                    onChange={(e) => setFormData({ ...formData, es_destacado: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm">⭐ Destacado</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm">✓ Activo</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600"
                >
                  {editingReward ? 'Guardar Cambios' : 'Crear Recompensa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
