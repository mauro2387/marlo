'use client';

import { useEffect, useState } from 'react';
import { subscribersDB } from '@/lib/supabase-fetch';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Subscriber {
  id: string;
  email: string | null;
  nombre: string | null;
  activo: boolean;
  created_at: string;
}

export default function SuscriptoresPage() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const { data, error } = await subscribersDB.getAll();
      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error('Error cargando suscriptores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await subscribersDB.exportCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `suscriptores_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'CSV exportado correctamente' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al exportar' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este suscriptor?')) return;
    try {
      await subscribersDB.delete(id);
      setSubscribers(prev => prev.filter(s => s.id !== id));
      setSelectedSubscriber(null);
      setMessage({ type: 'success', text: 'Suscriptor eliminado' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al eliminar' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredSubscribers = subscribers.filter(s => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      s.email?.toLowerCase().includes(searchLower) ||
      s.nombre?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: subscribers.length,
    activos: subscribers.filter(s => s.activo).length,
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
          <span className="material-icons">contacts</span>
          Suscriptores del Newsletter
        </h2>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span className="material-icons text-sm">download</span>
          Exportar CSV
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-icons text-blue-600">group</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">Total suscriptores</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="material-icons text-green-600">check_circle</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.activos}</p>
              <p className="text-xs text-gray-500">Activos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por email o nombre..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <span className="material-icons text-4xl mb-2 block">inbox</span>
                    No hay suscriptores
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((s) => (
                  <tr 
                    key={s.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSubscriber(s)}
                  >
                    <td className="px-4 py-3 text-sm">
                      {s.email || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {s.nombre || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        s.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {s.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(s.created_at).toLocaleDateString('es-UY')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(s.id);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <span className="material-icons text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedSubscriber(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <button
              onClick={() => setSelectedSubscriber(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <span className="material-icons">close</span>
            </button>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                  <span className="material-icons text-3xl text-pink-600">person</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedSubscriber.nombre || 'Sin nombre'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedSubscriber.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-medium ${selectedSubscriber.activo ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedSubscriber.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fecha suscripción:</span>
                    <span className="font-medium">
                      {new Date(selectedSubscriber.created_at).toLocaleDateString('es-UY')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 flex gap-3">
                <a
                  href={`mailto:${selectedSubscriber.email}`}
                  className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-icons text-sm">email</span>
                  Enviar Email
                </a>
                <button
                  onClick={() => handleDelete(selectedSubscriber.id)}
                  className="px-4 py-2.5 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  <span className="material-icons text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info legal */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <span className="material-icons text-sm mr-2 align-middle">gavel</span>
        Estos datos se recopilan bajo consentimiento del usuario según los Términos y Condiciones. 
        El usuario puede solicitar la eliminación de sus datos en cualquier momento.
      </div>
    </div>
  );
}
