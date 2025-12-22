'use client';

import { useEffect, useState } from 'react';
import { zonesDB } from '@/lib/supabase-fetch';
import { zonesAPI } from '@/lib/api-optimized';

interface DeliveryZone {
  id: string;
  name: string;
  cost: number;
  estimated_time: string;
  available: boolean;
  order_priority: number;
}

export default function ZonasAdminPage() {
  const [zonas, setZonas] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZona, setEditingZona] = useState<DeliveryZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cost: 100,
    estimated_time: '30-45 min',
    available: true,
    order_priority: 0,
  });

  useEffect(() => {
    loadZonas();
  }, []);

  const loadZonas = async () => {
    try {
      const { data, error } = await zonesDB.getAll();
      if (error) throw error;
      setZonas(data || []);
    } catch (error) {
      console.error('Error cargando zonas:', error);
      setZonas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingZona) {
        const { error } = await zonesDB.update(editingZona.id, formData);
        if (error) throw error;
      } else {
        const { error } = await zonesDB.create(formData);
        if (error) throw error;
      }
      // Invalidar caché de zonas para que checkout las recargue
      zonesAPI.invalidate();
      await loadZonas();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error guardando zona:', error);
      alert('Error al guardar la zona');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cost: 100,
      estimated_time: '30-45 min',
      available: true,
      order_priority: 0,
    });
    setEditingZona(null);
  };

  const handleEdit = (zona: DeliveryZone) => {
    setFormData({
      name: zona.name,
      cost: zona.cost,
      estimated_time: zona.estimated_time,
      available: zona.available,
      order_priority: zona.order_priority,
    });
    setEditingZona(zona);
    setShowModal(true);
  };

  const handleToggleAvailable = async (id: string, currentState: boolean) => {
    try {
      const { error } = await zonesDB.update(id, { available: !currentState });
      if (error) throw error;
      // Invalidar caché de zonas
      zonesAPI.invalidate();
      setZonas(zonas.map(z => 
        z.id === id ? { ...z, available: !currentState } : z
      ));
    } catch (error) {
      console.error('Error actualizando zona:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de ELIMINAR PERMANENTEMENTE esta zona? Esta acción no se puede deshacer.')) return;
    try {
      const { error } = await zonesDB.delete(id);
      if (error) throw error;
      // Invalidar caché de zonas
      zonesAPI.invalidate();
      setZonas(zonas.filter(z => z.id !== id));
    } catch (error) {
      console.error('Error eliminando zona:', error);
      alert('Error al eliminar la zona. Puede que tenga pedidos asociados.');
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Zonas de Delivery</h1>
          <p className="text-gray-600">Gestiona las zonas y costos de envío</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
        >
          <span>+</span> Nueva Zona
        </button>
      </div>

      {/* Zonas Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zonas
          .sort((a, b) => a.order_priority - b.order_priority)
          .map((zona) => (
          <div
            key={zona.id}
            className={`bg-white rounded-lg shadow p-4 border-l-4 ${
              zona.available ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{zona.name}</h3>
                <p className="text-gray-500 text-sm">Prioridad: {zona.order_priority}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                zona.available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {zona.available ? 'Disponible' : 'No disponible'}
              </span>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Costo de envío:</span>
                <span className="font-bold text-pink-600">${zona.cost}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tiempo estimado:</span>
                <span className="font-medium">{zona.estimated_time}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex gap-2">
              <button
                onClick={() => handleEdit(zona)}
                className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleToggleAvailable(zona.id, zona.available)}
                className={`flex-1 px-3 py-1.5 text-sm rounded transition-colors ${
                  zona.available
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {zona.available ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => handleDelete(zona.id)}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {zonas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No hay zonas de delivery configuradas</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingZona ? 'Editar Zona' : 'Nueva Zona'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la zona
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Ej: Centro, Punta del Este..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo ($)
                  </label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <input
                    type="number"
                    value={formData.order_priority}
                    onChange={(e) => setFormData({ ...formData, order_priority: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo estimado
                </label>
                <select
                  value={formData.estimated_time}
                  onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="15-30 min">15-30 min</option>
                  <option value="30-45 min">30-45 min</option>
                  <option value="45-60 min">45-60 min</option>
                  <option value="60-90 min">60-90 min</option>
                  <option value="90-120 min">90-120 min</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="rounded text-pink-500 focus:ring-pink-500"
                />
                <label htmlFor="available" className="text-sm text-gray-700">
                  Zona disponible para delivery
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  {editingZona ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
