'use client';

import { useEffect, useState } from 'react';
import { jobApplicationsDB } from '@/lib/supabase-fetch';

interface Postulacion {
  id: string;
  position: string;
  name: string;
  email: string;
  phone: string;
  age: number | null;
  experience: string;
  availability: string;
  motivation: string;
  cv_url: string | null;
  estado: string;
  notes: string | null;
  created_at: string;
}

const estadoColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  revisado: 'bg-blue-100 text-blue-800',
  contactado: 'bg-green-100 text-green-800',
  descartado: 'bg-red-100 text-red-800',
};

export default function PostulacionesAdminPage() {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostulacion, setSelectedPostulacion] = useState<Postulacion | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  useEffect(() => {
    loadPostulaciones();
  }, []);

  const loadPostulaciones = async () => {
    try {
      const { data, error } = await jobApplicationsDB.getAll();
      if (error) throw error;
      setPostulaciones(data || []);
    } catch (error) {
      console.error('Error cargando postulaciones:', error);
      setPostulaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEstado = async (id: string, nuevoEstado: string) => {
    try {
      const { error } = await jobApplicationsDB.update(id, { estado: nuevoEstado });
      if (error) throw error;
      
      setPostulaciones(postulaciones.map(p => 
        p.id === id ? { ...p, estado: nuevoEstado } : p
      ));
      
      if (selectedPostulacion?.id === id) {
        setSelectedPostulacion({ ...selectedPostulacion, estado: nuevoEstado });
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const handleAddNote = async (id: string, note: string) => {
    try {
      const { error } = await jobApplicationsDB.update(id, { notes: note });
      if (error) throw error;
      
      setPostulaciones(postulaciones.map(p => 
        p.id === id ? { ...p, notes: note } : p
      ));
    } catch (error) {
      console.error('Error guardando nota:', error);
    }
  };

  const filteredPostulaciones = filterEstado === 'todos' 
    ? postulaciones 
    : postulaciones.filter(p => p.estado === filterEstado);

  const stats = {
    total: postulaciones.length,
    pendientes: postulaciones.filter(p => p.estado === 'pendiente').length,
    revisados: postulaciones.filter(p => p.estado === 'revisado').length,
    contactados: postulaciones.filter(p => p.estado === 'contactado').length,
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Postulaciones de Trabajo</h1>
        <p className="text-gray-600">Gestiona las solicitudes de empleo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
          <p className="text-yellow-600 text-sm">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pendientes}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <p className="text-blue-600 text-sm">Revisados</p>
          <p className="text-2xl font-bold text-blue-700">{stats.revisados}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-green-600 text-sm">Contactados</p>
          <p className="text-2xl font-bold text-green-700">{stats.contactados}</p>
        </div>
      </div>

      {/* Filtro */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          {['todos', 'pendiente', 'revisado', 'contactado', 'descartado'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFilterEstado(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterEstado === estado
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de postulaciones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puesto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPostulaciones.map((postulacion) => (
              <tr key={postulacion.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-pink-600 font-semibold">
                        {postulacion.name[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{postulacion.name}</div>
                      {postulacion.age && (
                        <div className="text-sm text-gray-500">{postulacion.age} años</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{postulacion.position}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{postulacion.email}</div>
                  <div className="text-sm text-gray-500">{postulacion.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={postulacion.estado}
                    onChange={(e) => handleChangeEstado(postulacion.id, e.target.value)}
                    className={`text-sm rounded-full px-3 py-1 font-medium ${estadoColors[postulacion.estado] || 'bg-gray-100'}`}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="revisado">Revisado</option>
                    <option value="contactado">Contactado</option>
                    <option value="descartado">Descartado</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(postulacion.created_at).toLocaleDateString('es-UY')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedPostulacion(postulacion)}
                    className="text-pink-600 hover:text-pink-900 text-sm font-medium"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPostulaciones.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay postulaciones {filterEstado !== 'todos' && `con estado "${filterEstado}"`}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedPostulacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold">{selectedPostulacion.name}</h3>
                <p className="text-gray-500">Postulación para: {selectedPostulacion.position}</p>
              </div>
              <button
                onClick={() => setSelectedPostulacion(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Contacto</h4>
                  <p className="text-gray-600">📧 {selectedPostulacion.email}</p>
                  <p className="text-gray-600">📱 {selectedPostulacion.phone}</p>
                  {selectedPostulacion.age && (
                    <p className="text-gray-600">🎂 {selectedPostulacion.age} años</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Disponibilidad</h4>
                  <p className="text-gray-600">{selectedPostulacion.availability || 'No especificada'}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Estado</h4>
                  <select
                    value={selectedPostulacion.estado}
                    onChange={(e) => handleChangeEstado(selectedPostulacion.id, e.target.value)}
                    className={`text-sm rounded-lg px-4 py-2 font-medium ${estadoColors[selectedPostulacion.estado]}`}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="revisado">Revisado</option>
                    <option value="contactado">Contactado</option>
                    <option value="descartado">Descartado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Experiencia</h4>
                  <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg text-sm">
                    {selectedPostulacion.experience || 'No especificada'}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Motivación</h4>
                  <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg text-sm">
                    {selectedPostulacion.motivation || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-700 mb-2">Notas internas</h4>
              <textarea
                defaultValue={selectedPostulacion.notes || ''}
                onBlur={(e) => handleAddNote(selectedPostulacion.id, e.target.value)}
                placeholder="Agregar notas sobre el candidato..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 h-24"
              />
            </div>

            {/* Acciones rápidas */}
            <div className="mt-6 flex gap-3">
              <a
                href={`mailto:${selectedPostulacion.email}?subject=Postulación MarLo Cookies - ${selectedPostulacion.position}`}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-center"
              >
                📧 Enviar Email
              </a>
              <a
                href={`https://wa.me/598${selectedPostulacion.phone.replace(/\D/g, '')}?text=Hola ${selectedPostulacion.name}, nos comunicamos de MarLo Cookies sobre tu postulación para ${selectedPostulacion.position}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-center"
              >
                💬 WhatsApp
              </a>
            </div>

            <button
              onClick={() => setSelectedPostulacion(null)}
              className="w-full mt-4 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
