'use client';

import { useEffect, useState } from 'react';
import { wholesaleDB } from '@/lib/supabase-fetch';
import LoadingSpinner from '@/components/LoadingSpinner';

interface WholesaleRequest {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string | null;
  tipo_negocio: string | null;
  cantidad_estimada: string | null;
  productos_interes: string | null;
  mensaje: string | null;
  estado: string;
  notas_admin: string | null;
  created_at: string;
  updated_at: string;
}

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: 'schedule' },
  { value: 'contactado', label: 'Contactado', color: 'bg-blue-100 text-blue-700', icon: 'phone_callback' },
  { value: 'en_negociacion', label: 'En Negociación', color: 'bg-purple-100 text-purple-700', icon: 'handshake' },
  { value: 'aprobado', label: 'Aprobado', color: 'bg-green-100 text-green-700', icon: 'check_circle' },
  { value: 'rechazado', label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: 'cancel' },
];

const TIPOS_NEGOCIO: Record<string, string> = {
  'cafeteria': '☕ Cafetería',
  'restaurante': '🍽️ Restaurante',
  'hotel': '🏨 Hotel',
  'tienda': '🏪 Tienda',
  'eventos': '🎉 Eventos',
  'catering': '🍴 Catering',
  'oficina': '🏢 Oficina',
  'otro': '📦 Otro',
};

export default function MayoristasPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WholesaleRequest[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<WholesaleRequest | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      console.log('🔄 Cargando solicitudes mayoristas...');
      const { data, error } = await wholesaleDB.getAll();
      console.log('📦 Resultado:', { data, error });
      if (error) {
        console.error('❌ Error RLS o fetch:', error);
        throw error;
      }
      setRequests(data || []);
      console.log('✅ Solicitudes cargadas:', data?.length || 0);
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await wholesaleDB.update(id, { estado: newStatus });
      setRequests(prev => prev.map(r => 
        r.id === id ? { ...r, estado: newStatus } : r
      ));
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, estado: newStatus });
      }
      setMessage({ type: 'success', text: 'Estado actualizado' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al actualizar' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    try {
      await wholesaleDB.update(selectedRequest.id, { notas_admin: editingNotes });
      setRequests(prev => prev.map(r => 
        r.id === selectedRequest.id ? { ...r, notas_admin: editingNotes } : r
      ));
      setSelectedRequest({ ...selectedRequest, notas_admin: editingNotes });
      setMessage({ type: 'success', text: 'Notas guardadas' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    try {
      await wholesaleDB.delete(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      setSelectedRequest(null);
      setMessage({ type: 'success', text: 'Solicitud eliminada' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al eliminar' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredRequests = requests.filter(r => {
    if (filter !== 'all' && r.estado !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        r.nombre.toLowerCase().includes(searchLower) ||
        r.email.toLowerCase().includes(searchLower) ||
        r.empresa?.toLowerCase().includes(searchLower) ||
        r.telefono.includes(search)
      );
    }
    return true;
  });

  const stats = {
    total: requests.length,
    pendientes: requests.filter(r => r.estado === 'pendiente').length,
    contactados: requests.filter(r => r.estado === 'contactado').length,
    en_negociacion: requests.filter(r => r.estado === 'en_negociacion').length,
    aprobados: requests.filter(r => r.estado === 'aprobado').length,
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
        <h2 className="text-2xl font-bold text-brown-800 flex items-center gap-2">
          <span className="material-icons">storefront</span>
          Pedidos por Mayor
        </h2>
        <div className="text-sm text-gray-500">
          {stats.pendientes > 0 && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
              {stats.pendientes} pendientes
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-icons text-blue-600">inbox</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="material-icons text-yellow-600">schedule</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.pendientes}</p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-icons text-blue-600">phone_callback</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.contactados}</p>
              <p className="text-xs text-gray-500">Contactados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="material-icons text-purple-600">handshake</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.en_negociacion}</p>
              <p className="text-xs text-gray-500">Negociando</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="material-icons text-green-600">check_circle</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.aprobados}</p>
              <p className="text-xs text-gray-500">Aprobados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-brown-800 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {ESTADOS.map(e => (
            <button
              key={e.value}
              onClick={() => setFilter(e.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                filter === e.value ? e.color : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="material-icons text-sm">{e.icon}</span>
              {e.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email, empresa..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="material-icons text-4xl mb-2 block">inbox</span>
            No hay solicitudes
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRequests.map((request) => {
              const estadoInfo = ESTADOS.find(e => e.value === request.estado) || ESTADOS[0];
              return (
                <div 
                  key={request.id}
                  onClick={() => {
                    setSelectedRequest(request);
                    setEditingNotes(request.notas_admin || '');
                  }}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${estadoInfo.color}`}>
                      <span className="material-icons">{estadoInfo.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{request.nombre}</h3>
                        {request.empresa && (
                          <span className="text-sm text-gray-500">• {request.empresa}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-xs">email</span>
                          {request.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-xs">phone</span>
                          {request.telefono}
                        </span>
                        {request.tipo_negocio && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                            {TIPOS_NEGOCIO[request.tipo_negocio] || request.tipo_negocio}
                          </span>
                        )}
                      </div>
                      {request.productos_interes && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          📦 {request.productos_interes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                        <span className="material-icons text-xs">{estadoInfo.icon}</span>
                        {estadoInfo.label}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(request.created_at).toLocaleDateString('es-UY')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedRequest(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <span className="material-icons">close</span>
            </button>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="material-icons text-white text-3xl">storefront</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedRequest.nombre}</h3>
                  {selectedRequest.empresa && (
                    <p className="text-gray-500">{selectedRequest.empresa}</p>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                <div className="flex flex-wrap gap-2">
                  {ESTADOS.map(e => (
                    <button
                      key={e.value}
                      onClick={() => handleUpdateStatus(selectedRequest.id, e.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        selectedRequest.estado === e.value 
                          ? e.color + ' ring-2 ring-offset-2 ring-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span className="material-icons text-sm">{e.icon}</span>
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Info de contacto */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <span className="material-icons text-sm">contact_mail</span>
                    Contacto
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-base">email</span>
                      <a href={`mailto:${selectedRequest.email}`} className="text-blue-600 hover:underline">
                        {selectedRequest.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-base">phone</span>
                      <span>{selectedRequest.telefono}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <a
                      href={`https://wa.me/${selectedRequest.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 flex items-center justify-center gap-1"
                    >
                      <span className="material-icons text-sm">chat</span>
                      WhatsApp
                    </a>
                    <a
                      href={`mailto:${selectedRequest.email}`}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center justify-center gap-1"
                    >
                      <span className="material-icons text-sm">email</span>
                      Email
                    </a>
                  </div>
                </div>

                {/* Info de negocio */}
                <div className="bg-amber-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                    <span className="material-icons text-sm">business</span>
                    Información del Negocio
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedRequest.tipo_negocio && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">
                          {TIPOS_NEGOCIO[selectedRequest.tipo_negocio] || selectedRequest.tipo_negocio}
                        </span>
                      </div>
                    )}
                    {selectedRequest.cantidad_estimada && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cantidad estimada:</span>
                        <span className="font-medium">{selectedRequest.cantidad_estimada} uds/mes</span>
                      </div>
                    )}
                    {selectedRequest.productos_interes && (
                      <div>
                        <span className="text-gray-600">Productos de interés:</span>
                        <p className="font-medium mt-1">{selectedRequest.productos_interes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mensaje */}
              {selectedRequest.mensaje && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="material-icons text-sm">message</span>
                    Mensaje
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.mensaje}</p>
                </div>
              )}

              {/* Notas del admin */}
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                  <span className="material-icons text-sm">note</span>
                  Notas Internas
                </h4>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Agregar notas sobre esta solicitud..."
                  rows={3}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600"
                >
                  Guardar Notas
                </button>
              </div>

              {/* Fecha */}
              <div className="text-sm text-gray-500 mb-6">
                <p>📅 Solicitud recibida: {new Date(selectedRequest.created_at).toLocaleString('es-UY')}</p>
                {selectedRequest.updated_at !== selectedRequest.created_at && (
                  <p>✏️ Última actualización: {new Date(selectedRequest.updated_at).toLocaleString('es-UY')}</p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleDelete(selectedRequest.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                >
                  <span className="material-icons text-sm">delete</span>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
