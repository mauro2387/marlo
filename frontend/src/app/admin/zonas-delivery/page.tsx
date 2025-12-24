'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { deliveryZonesGeoDB } from '@/lib/supabase-fetch';
import type { DeliveryZoneGeo } from '@/components/DeliveryZoneEditor';

// Importar editor dinámicamente para evitar SSR
const DeliveryZoneEditor = dynamic(
  () => import('@/components/DeliveryZoneEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '500px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando editor...</p>
        </div>
      </div>
    )
  }
);

const COLORES_DISPONIBLES = [
  '#22C55E', // Verde
  '#3B82F6', // Azul
  '#F59E0B', // Amarillo
  '#EF4444', // Rojo
  '#8B5CF6', // Violeta
  '#EC4899', // Rosa
  '#06B6D4', // Cyan
  '#F97316', // Naranja
];

export default function AdminZonasPage() {
  const [zones, setZones] = useState<DeliveryZoneGeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<DeliveryZoneGeo | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Formulario para nueva zona
  const [newZone, setNewZone] = useState<Partial<DeliveryZoneGeo>>({
    nombre: '',
    color: '#3B82F6',
    precio: 100,
    tiempo_estimado: '30-60 min',
    activo: true,
    orden: 0,
    poligono: []
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    setLoading(true);
    try {
      const { data, error } = await deliveryZonesGeoDB.getAll();
      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error cargando zonas:', error);
      setMessage({ type: 'error', text: 'Error al cargar las zonas' });
    } finally {
      setLoading(false);
    }
  };

  const handleZoneClick = (zone: DeliveryZoneGeo) => {
    setSelectedZone(zone);
    setIsDrawing(false);
  };

  const handlePolygonComplete = async (coordinates: [number, number][]) => {
    if (!newZone.nombre) {
      setMessage({ type: 'error', text: 'Ingresa un nombre para la zona antes de dibujar' });
      return;
    }

    const zoneToSave = {
      ...newZone,
      poligono: coordinates
    };

    setSaving(true);
    try {
      const { data, error } = await deliveryZonesGeoDB.create(zoneToSave);

      if (error) throw error;

      setZones(prev => [...prev, data]);
      setIsDrawing(false);
      setNewZone({
        nombre: '',
        color: COLORES_DISPONIBLES[(zones.length + 1) % COLORES_DISPONIBLES.length],
        precio: 100,
        tiempo_estimado: '30-60 min',
        activo: true,
        orden: zones.length + 1,
        poligono: []
      });
      setMessage({ type: 'success', text: `Zona "${data.nombre}" creada correctamente` });
    } catch (error) {
      console.error('Error guardando zona:', error);
      setMessage({ type: 'error', text: 'Error al guardar la zona' });
    } finally {
      setSaving(false);
    }
  };

  const handlePolygonUpdate = async (zoneId: string, coordinates: [number, number][]) => {
    try {
      const { error } = await deliveryZonesGeoDB.update(zoneId, { poligono: coordinates });

      if (error) throw error;

      setZones(prev => prev.map(z => 
        z.id === zoneId ? { ...z, poligono: coordinates } : z
      ));
    } catch (error) {
      console.error('Error actualizando polígono:', error);
    }
  };

  const handleUpdateZone = async () => {
    if (!selectedZone?.id) return;

    setSaving(true);
    try {
      const { error } = await deliveryZonesGeoDB.update(selectedZone.id, {
        nombre: selectedZone.nombre,
        color: selectedZone.color,
        precio: selectedZone.precio,
        tiempo_estimado: selectedZone.tiempo_estimado,
        activo: selectedZone.activo,
        orden: selectedZone.orden
      });

      if (error) throw error;

      setZones(prev => prev.map(z => 
        z.id === selectedZone.id ? selectedZone : z
      ));
      setMessage({ type: 'success', text: 'Zona actualizada correctamente' });
    } catch (error) {
      console.error('Error actualizando zona:', error);
      setMessage({ type: 'error', text: 'Error al actualizar la zona' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async () => {
    if (!selectedZone?.id) return;
    
    if (!confirm(`¿Eliminar la zona "${selectedZone.nombre}"?`)) return;

    setSaving(true);
    try {
      const { error } = await deliveryZonesGeoDB.delete(selectedZone.id);

      if (error) throw error;

      setZones(prev => prev.filter(z => z.id !== selectedZone.id));
      setSelectedZone(null);
      setMessage({ type: 'success', text: 'Zona eliminada correctamente' });
    } catch (error) {
      console.error('Error eliminando zona:', error);
      setMessage({ type: 'error', text: 'Error al eliminar la zona' });
    } finally {
      setSaving(false);
    }
  };

  const startDrawing = () => {
    setSelectedZone(null);
    setIsDrawing(true);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando zonas de delivery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <span className="material-icons">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Zonas de Delivery</h1>
                <p className="text-sm text-gray-500">Dibuja y configura las zonas de envío</p>
              </div>
            </div>
            
            {!isDrawing ? (
              <button
                onClick={startDrawing}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                <span className="material-icons text-sm">add</span>
                Nueva Zona
              </button>
            ) : (
              <button
                onClick={cancelDrawing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <span className="material-icons text-sm">close</span>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mensaje */}
      {message && (
        <div className={`mx-4 mt-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-current hover:opacity-70">
              <span className="material-icons text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor de mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <DeliveryZoneEditor
                zones={zones}
                selectedZoneId={selectedZone?.id}
                isDrawing={isDrawing}
                onZoneClick={handleZoneClick}
                onPolygonComplete={handlePolygonComplete}
                onPolygonUpdate={handlePolygonUpdate}
              />
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-4">
            {/* Formulario nueva zona (cuando está dibujando) */}
            {isDrawing && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="material-icons text-pink-500">add_circle</span>
                  Nueva Zona
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la zona *
                    </label>
                    <input
                      type="text"
                      value={newZone.nombre}
                      onChange={(e) => setNewZone(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                      placeholder="Ej: Centro, Punta del Este..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLORES_DISPONIBLES.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewZone(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full transition-transform ${
                            newZone.color === color ? 'ring-2 ring-offset-2 ring-pink-500 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio $
                      </label>
                      <input
                        type="number"
                        value={newZone.precio}
                        onChange={(e) => setNewZone(prev => ({ ...prev, precio: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo
                      </label>
                      <input
                        type="text"
                        value={newZone.tiempo_estimado}
                        onChange={(e) => setNewZone(prev => ({ ...prev, tiempo_estimado: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        placeholder="30-60 min"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                    <p className="font-medium mb-1">📍 Instrucciones:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Completa el nombre y precio</li>
                      <li>Haz clic en el mapa para agregar puntos</li>
                      <li>Doble clic para cerrar el polígono</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Editar zona seleccionada */}
            {selectedZone && !isDrawing && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedZone.color }}
                  />
                  Editar Zona
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={selectedZone.nombre}
                      onChange={(e) => setSelectedZone(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLORES_DISPONIBLES.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedZone(prev => prev ? { ...prev, color } : null)}
                          className={`w-8 h-8 rounded-full transition-transform ${
                            selectedZone.color === color ? 'ring-2 ring-offset-2 ring-pink-500 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio $
                      </label>
                      <input
                        type="number"
                        value={selectedZone.precio}
                        onChange={(e) => setSelectedZone(prev => prev ? { ...prev, precio: Number(e.target.value) } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo
                      </label>
                      <input
                        type="text"
                        value={selectedZone.tiempo_estimado}
                        onChange={(e) => setSelectedZone(prev => prev ? { ...prev, tiempo_estimado: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad (menor = mayor prioridad)
                    </label>
                    <input
                      type="number"
                      value={selectedZone.orden}
                      onChange={(e) => setSelectedZone(prev => prev ? { ...prev, orden: Number(e.target.value) } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                      min="0"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={selectedZone.activo}
                      onChange={(e) => setSelectedZone(prev => prev ? { ...prev, activo: e.target.checked } : null)}
                      className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                    />
                    <label htmlFor="activo" className="text-sm text-gray-700">
                      Zona activa
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleUpdateZone}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 transition-colors"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleDeleteZone}
                      disabled={saving}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 transition-colors"
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de zonas */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4">
                Zonas configuradas ({zones.length})
              </h3>
              
              <div className="space-y-2">
                {zones.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay zonas configuradas.<br/>
                    Haz clic en "Nueva Zona" para crear una.
                  </p>
                ) : (
                  zones.map(zone => (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneClick(zone)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        selectedZone?.id === zone.id 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      } ${!zone.activo ? 'opacity-50' : ''}`}
                    >
                      <span 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: zone.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{zone.nombre}</p>
                        <p className="text-sm text-gray-500">{zone.tiempo_estimado}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${zone.precio}</p>
                        {!zone.activo && (
                          <span className="text-xs text-gray-400">Inactiva</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-2">💡 Tips:</p>
              <ul className="space-y-1">
                <li>• Las zonas con menor número de orden tienen prioridad</li>
                <li>• Puedes arrastrar los puntos de una zona seleccionada</li>
                <li>• El cliente verá el precio automáticamente según su ubicación</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
