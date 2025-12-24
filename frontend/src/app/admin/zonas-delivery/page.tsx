'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { deliveryZonesGeoDB } from '@/lib/supabase-fetch';

// Importar mapa dinámicamente
const MapaZonas = dynamic(
  () => import('@/components/MapaZonasEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '500px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando mapa...</p>
        </div>
      </div>
    )
  }
);

interface Zona {
  id?: string;
  nombre: string;
  color: string;
  precio: number;
  tiempo_estimado: string;
  activo: boolean;
  orden: number;
  poligono: [number, number][];
}

const COLORES = [
  { nombre: 'Verde', valor: '#22C55E' },
  { nombre: 'Azul', valor: '#3B82F6' },
  { nombre: 'Amarillo', valor: '#F59E0B' },
  { nombre: 'Rojo', valor: '#EF4444' },
  { nombre: 'Violeta', valor: '#8B5CF6' },
  { nombre: 'Rosa', valor: '#EC4899' },
  { nombre: 'Cyan', valor: '#06B6D4' },
  { nombre: 'Naranja', valor: '#F97316' },
];

export default function ZonasDeliveryPage() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  
  // Estado para nueva zona
  const [modoCrear, setModoCrear] = useState(false);
  const [nuevaZona, setNuevaZona] = useState<Zona>({
    nombre: '',
    color: '#3B82F6',
    precio: 100,
    tiempo_estimado: '30-60 min',
    activo: true,
    orden: 0,
    poligono: []
  });
  
  // Zona seleccionada para editar
  const [zonaEditando, setZonaEditando] = useState<Zona | null>(null);

  useEffect(() => {
    cargarZonas();
  }, []);

  const cargarZonas = async () => {
    setLoading(true);
    try {
      const { data, error } = await deliveryZonesGeoDB.getAll();
      if (error) throw error;
      setZonas(data || []);
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar zonas' });
    } finally {
      setLoading(false);
    }
  };

  const handlePoligonoCreado = (coords: [number, number][]) => {
    setNuevaZona(prev => ({ ...prev, poligono: coords }));
  };

  const handlePoligonoEditado = (coords: [number, number][]) => {
    if (zonaEditando) {
      setZonaEditando({ ...zonaEditando, poligono: coords });
    }
  };

  const guardarNuevaZona = async () => {
    if (!nuevaZona.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'Ingresa un nombre para la zona' });
      return;
    }
    if (nuevaZona.poligono.length < 3) {
      setMensaje({ tipo: 'error', texto: 'Dibuja un área en el mapa (mínimo 3 puntos)' });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await deliveryZonesGeoDB.create({
        ...nuevaZona,
        orden: zonas.length + 1
      });
      if (error) throw error;
      
      setZonas(prev => [...prev, data]);
      setModoCrear(false);
      setNuevaZona({
        nombre: '',
        color: COLORES[(zonas.length + 1) % COLORES.length].valor,
        precio: 100,
        tiempo_estimado: '30-60 min',
        activo: true,
        orden: 0,
        poligono: []
      });
      setMensaje({ tipo: 'success', texto: `Zona "${data.nombre}" guardada correctamente` });
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar la zona' });
    } finally {
      setSaving(false);
    }
  };

  const guardarEdicion = async () => {
    if (!zonaEditando?.id) return;

    setSaving(true);
    try {
      const { error } = await deliveryZonesGeoDB.update(zonaEditando.id, {
        nombre: zonaEditando.nombre,
        color: zonaEditando.color,
        precio: zonaEditando.precio,
        tiempo_estimado: zonaEditando.tiempo_estimado,
        activo: zonaEditando.activo,
        poligono: zonaEditando.poligono
      });
      if (error) throw error;
      
      setZonas(prev => prev.map(z => z.id === zonaEditando.id ? zonaEditando : z));
      setZonaEditando(null);
      setMensaje({ tipo: 'success', texto: 'Zona actualizada' });
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar' });
    } finally {
      setSaving(false);
    }
  };

  const eliminarZona = async (zona: Zona) => {
    if (!zona.id) return;
    if (!confirm(`¿Eliminar la zona "${zona.nombre}"?`)) return;

    try {
      const { error } = await deliveryZonesGeoDB.delete(zona.id);
      if (error) throw error;
      
      setZonas(prev => prev.filter(z => z.id !== zona.id));
      if (zonaEditando?.id === zona.id) setZonaEditando(null);
      setMensaje({ tipo: 'success', texto: 'Zona eliminada' });
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando zonas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zonas de Delivery</h1>
          <p className="text-gray-600">Dibuja las zonas en el mapa y asigna precios</p>
        </div>
        {!modoCrear && !zonaEditando && (
          <button
            onClick={() => setModoCrear(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <span className="material-icons">add</span>
            Nueva Zona
          </button>
        )}
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div className={`p-4 rounded-lg flex items-center justify-between ${
          mensaje.tipo === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{mensaje.texto}</span>
          <button onClick={() => setMensaje(null)} className="hover:opacity-70">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <MapaZonas
              zonas={zonas}
              zonaEditando={zonaEditando}
              modoCrear={modoCrear}
              colorNuevaZona={modoCrear ? nuevaZona.color : undefined}
              onPoligonoCreado={handlePoligonoCreado}
              onPoligonoEditado={handlePoligonoEditado}
              onZonaClick={(zona) => {
                if (!modoCrear) {
                  setZonaEditando(zona);
                }
              }}
            />
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Formulario Nueva Zona */}
          {modoCrear && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-icons text-pink-500">add_circle</span>
                Nueva Zona
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={nuevaZona.nombre}
                    onChange={(e) => setNuevaZona(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300"
                    placeholder="Ej: Centro, Punta del Este..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORES.map(c => (
                      <button
                        key={c.valor}
                        onClick={() => setNuevaZona(prev => ({ ...prev, color: c.valor }))}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          nuevaZona.color === c.valor ? 'border-gray-800 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.valor }}
                        title={c.nombre}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio $</label>
                    <input
                      type="number"
                      value={nuevaZona.precio}
                      onChange={(e) => setNuevaZona(prev => ({ ...prev, precio: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo</label>
                    <input
                      type="text"
                      value={nuevaZona.tiempo_estimado}
                      onChange={(e) => setNuevaZona(prev => ({ ...prev, tiempo_estimado: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="30-60 min"
                    />
                  </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-blue-800 mb-1">📍 Cómo dibujar:</p>
                  <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Haz clic en el mapa para agregar puntos</li>
                    <li>Cierra el área haciendo clic en el primer punto</li>
                    <li>Presiona "Guardar Zona" cuando termines</li>
                  </ol>
                </div>

                {nuevaZona.poligono.length > 0 && (
                  <p className="text-sm text-green-600">
                    ✓ Área dibujada con {nuevaZona.poligono.length} puntos
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={guardarNuevaZona}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 font-medium"
                  >
                    {saving ? 'Guardando...' : '💾 Guardar Zona'}
                  </button>
                  <button
                    onClick={() => {
                      setModoCrear(false);
                      setNuevaZona(prev => ({ ...prev, poligono: [] }));
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulario Editar Zona */}
          {zonaEditando && !modoCrear && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: zonaEditando.color }} />
                Editar Zona
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={zonaEditando.nombre}
                    onChange={(e) => setZonaEditando(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORES.map(c => (
                      <button
                        key={c.valor}
                        onClick={() => setZonaEditando(prev => prev ? { ...prev, color: c.valor } : null)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          zonaEditando.color === c.valor ? 'border-gray-800 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.valor }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio $</label>
                    <input
                      type="number"
                      value={zonaEditando.precio}
                      onChange={(e) => setZonaEditando(prev => prev ? { ...prev, precio: Number(e.target.value) } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo</label>
                    <input
                      type="text"
                      value={zonaEditando.tiempo_estimado}
                      onChange={(e) => setZonaEditando(prev => prev ? { ...prev, tiempo_estimado: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={zonaEditando.activo}
                    onChange={(e) => setZonaEditando(prev => prev ? { ...prev, activo: e.target.checked } : null)}
                    className="rounded"
                  />
                  <label htmlFor="activo" className="text-sm text-gray-700">Zona activa</label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={guardarEdicion}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 font-medium"
                  >
                    {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                  </button>
                  <button
                    onClick={() => eliminarZona(zonaEditando)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    🗑️
                  </button>
                </div>
                <button
                  onClick={() => setZonaEditando(null)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de zonas */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">
              Zonas ({zonas.length})
            </h3>
            
            {zonas.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No hay zonas. Haz clic en "Nueva Zona" para crear una.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {zonas.map(zona => (
                  <button
                    key={zona.id}
                    onClick={() => !modoCrear && setZonaEditando(zona)}
                    disabled={modoCrear}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      zonaEditando?.id === zona.id 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${!zona.activo ? 'opacity-50' : ''} ${modoCrear ? 'cursor-not-allowed' : ''}`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: zona.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{zona.nombre}</p>
                      <p className="text-xs text-gray-500">{zona.tiempo_estimado}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${zona.precio}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
