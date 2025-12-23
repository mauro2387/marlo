'use client';

import { useEffect, useState } from 'react';
import { popupsDB } from '@/lib/supabase-fetch';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Popup {
  id: string;
  nombre: string;
  activo: boolean;
  plantilla: string;
  titulo: string;
  subtitulo: string;
  imagen_url: string | null;
  color_fondo: string;
  color_titulo: string;
  color_texto: string;
  color_boton: string;
  color_boton_texto: string;
  gradiente: string | null;
  boton_texto: string;
  boton_link: string | null;
  boton_secundario_texto: string | null;
  boton_secundario_link: string | null;
  mostrar_input_email: boolean;
  mostrar_en: string;
  frecuencia: string;
  delay_segundos: number;
  generar_cupon: boolean;
  cupon_tipo: 'porcentaje' | 'fijo' | null;
  cupon_valor: number;
  cupon_monto_minimo: number;
  cupon_dias_validos: number;
  cupon_prefijo: string | null;
  cupon_descripcion: string | null;
}

const PLANTILLAS = [
  { id: 'default', nombre: 'Básico', icon: 'crop_square' },
  { id: 'newsletter', nombre: 'Newsletter', icon: 'mail' },
  { id: 'discount', nombre: 'Descuento', icon: 'local_offer' },
  { id: 'announcement', nombre: 'Anuncio', icon: 'campaign' },
];

const PAGINAS = [
  { value: 'home', label: 'Solo Home' },
  { value: 'productos', label: 'Solo Productos' },
  { value: 'checkout', label: 'Solo Checkout' },
  { value: 'todas', label: 'Todas las páginas' },
];

const FRECUENCIAS = [
  { value: 'siempre', label: 'Siempre' },
  { value: 'sesion', label: 'Una vez por sesión' },
  { value: 'una_vez', label: 'Solo una vez' },
  { value: 'cada_dia', label: 'Una vez al día' },
];

const defaultPopup: Partial<Popup> = {
  nombre: '',
  activo: false,
  plantilla: 'default',
  titulo: '',
  subtitulo: '',
  imagen_url: null,
  color_fondo: '#FFFFFF',
  color_titulo: '#4A3728',
  color_texto: '#666666',
  color_boton: '#4A3728',
  color_boton_texto: '#FFFFFF',
  gradiente: null,
  boton_texto: 'Aceptar',
  boton_link: null,
  mostrar_input_email: false,
  mostrar_en: 'home',
  frecuencia: 'sesion',
  delay_segundos: 3,
  generar_cupon: false,
  cupon_tipo: null,
  cupon_valor: 0,
  cupon_monto_minimo: 0,
  cupon_dias_validos: 30,
  cupon_prefijo: 'POPUP',
  cupon_descripcion: null,
};

export default function PopupsPage() {
  const [loading, setLoading] = useState(true);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Popup>>(defaultPopup);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    try {
      const { data, error } = await popupsDB.getAll();
      if (error) throw error;
      setPopups(data || []);
    } catch (err) {
      console.error('Error cargando popups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.titulo) {
      setMessage({ type: 'error', text: 'Nombre y título son requeridos' });
      return;
    }

    setSaving(true);
    try {
      if (selectedPopup) {
        await popupsDB.update(selectedPopup.id, formData);
      } else {
        await popupsDB.create(formData);
      }
      await loadPopups();
      setIsEditing(false);
      setSelectedPopup(null);
      setFormData(defaultPopup);
      setMessage({ type: 'success', text: selectedPopup ? 'Popup actualizado' : 'Popup creado' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error al guardar' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este popup?')) return;
    try {
      await popupsDB.delete(id);
      setPopups(prev => prev.filter(p => p.id !== id));
      setMessage({ type: 'success', text: 'Popup eliminado' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al eliminar' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleActive = async (popup: Popup) => {
    try {
      await popupsDB.update(popup.id, { activo: !popup.activo });
      setPopups(prev => prev.map(p => p.id === popup.id ? { ...p, activo: !p.activo } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (popup: Popup) => {
    setSelectedPopup(popup);
    setFormData(popup);
    setIsEditing(true);
  };

  const handleNew = () => {
    setSelectedPopup(null);
    setFormData(defaultPopup);
    setIsEditing(true);
  };

  const handleSelectPlantilla = (plantillaId: string) => {
    const presets: Record<string, Partial<Popup>> = {
      newsletter: {
        titulo: '¡Suscríbete!',
        subtitulo: 'Recibe ofertas exclusivas y novedades',
        boton_texto: 'Suscribirme',
        mostrar_input_email: true,
        color_boton: '#E91E63',
        gradiente: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      discount: {
        titulo: '¡10% de descuento!',
        subtitulo: 'En tu primera compra',
        boton_texto: 'Ir a comprar',
        boton_link: '/productos',
        color_boton: '#4CAF50',
        gradiente: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      },
      announcement: {
        titulo: '¡Novedad!',
        subtitulo: 'Nuevos productos disponibles',
        boton_texto: 'Ver más',
        color_boton: '#FF9800',
        gradiente: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      default: {
        titulo: '',
        subtitulo: '',
        boton_texto: 'Aceptar',
        mostrar_input_email: false,
        gradiente: null,
      },
    };

    setFormData(prev => ({
      ...prev,
      plantilla: plantillaId,
      ...presets[plantillaId],
    }));
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
          <span className="material-icons">web_stories</span>
          Pop-ups Promocionales
        </h2>
        {!isEditing && (
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <span className="material-icons text-sm">add</span>
            Nuevo Pop-up
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {isEditing ? (
        /* Editor de Popup */
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{selectedPopup ? 'Editar' : 'Nuevo'} Pop-up</h3>
              <button
                onClick={() => { setIsEditing(false); setSelectedPopup(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Plantillas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla</label>
              <div className="grid grid-cols-4 gap-2">
                {PLANTILLAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPlantilla(p.id)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      formData.plantilla === p.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="material-icons">{p.icon}</span>
                    <span className="text-xs">{p.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre interno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (interno)</label>
              <input
                type="text"
                value={formData.nombre || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="Ej: Popup bienvenida"
              />
            </div>

            {/* Título y subtítulo */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.titulo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Título del popup"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={formData.subtitulo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitulo: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Texto descriptivo"
                />
              </div>
            </div>

            {/* Colores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Colores</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Fondo</label>
                  <input
                    type="color"
                    value={formData.color_fondo || '#FFFFFF'}
                    onChange={(e) => setFormData(prev => ({ ...prev, color_fondo: e.target.value }))}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Título</label>
                  <input
                    type="color"
                    value={formData.color_titulo || '#4A3728'}
                    onChange={(e) => setFormData(prev => ({ ...prev, color_titulo: e.target.value }))}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Botón</label>
                  <input
                    type="color"
                    value={formData.color_boton || '#4A3728'}
                    onChange={(e) => setFormData(prev => ({ ...prev, color_boton: e.target.value }))}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Botón */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto del botón</label>
                <input
                  type="text"
                  value={formData.boton_texto || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, boton_texto: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link del botón</label>
                <input
                  type="text"
                  value={formData.boton_link || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, boton_link: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="/productos"
                />
              </div>
            </div>

            {/* Opciones */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mostrar en</label>
                <select
                  value={formData.mostrar_en || 'home'}
                  onChange={(e) => setFormData(prev => ({ ...prev, mostrar_en: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  {PAGINAS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                <select
                  value={formData.frecuencia || 'sesion'}
                  onChange={(e) => setFormData(prev => ({ ...prev, frecuencia: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  {FRECUENCIAS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.mostrar_input_email || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, mostrar_input_email: e.target.checked }))}
                  className="w-4 h-4 rounded text-pink-500"
                />
                <span className="text-sm">Mostrar campo de email</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.generar_cupon || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, generar_cupon: e.target.checked }))}
                  className="w-4 h-4 rounded text-pink-500"
                />
                <span className="text-sm">Generar cupón automático</span>
              </label>
            </div>

            {/* Configuración de cupones */}
            {formData.generar_cupon && (
              <div className="border-l-4 border-pink-500 pl-4 space-y-4 bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Configuración del cupón</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de descuento</label>
                    <select
                      value={formData.cupon_tipo || 'porcentaje'}
                      onChange={(e) => setFormData(prev => ({ ...prev, cupon_tipo: e.target.value as 'porcentaje' | 'fijo' }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="porcentaje">Porcentaje (%)</option>
                      <option value="fijo">Monto fijo ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor {formData.cupon_tipo === 'porcentaje' ? '(%)' : '($)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cupon_valor || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, cupon_valor: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="Ej: 10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Compra mínima ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cupon_monto_minimo || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, cupon_monto_minimo: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="0 = sin mínimo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Días de validez</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.cupon_dias_validos || 30}
                      onChange={(e) => setFormData(prev => ({ ...prev, cupon_dias_validos: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prefijo del código</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.cupon_prefijo || 'POPUP'}
                    onChange={(e) => setFormData(prev => ({ ...prev, cupon_prefijo: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="POPUP"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ejemplo: {formData.cupon_prefijo || 'POPUP'}ABCD1234</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                  <textarea
                    value={formData.cupon_descripcion || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cupon_descripcion: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                    rows={2}
                    placeholder="Descripción interna del cupón"
                  />
                </div>
              </div>
            )}

            {/* Delay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delay (segundos): {formData.delay_segundos || 3}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.delay_segundos || 3}
                onChange={(e) => setFormData(prev => ({ ...prev, delay_segundos: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-icons text-sm">save</span>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="material-icons text-sm">visibility</span>
                Preview
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-center min-h-[500px]">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{ 
                background: formData.gradiente || formData.color_fondo,
              }}
            >
              {/* Header con gradiente si aplica */}
              {formData.gradiente && (
                <div className="h-24" style={{ background: formData.gradiente }}></div>
              )}
              
              <div className="p-6 text-center" style={{ backgroundColor: formData.color_fondo }}>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: formData.color_titulo }}
                >
                  {formData.titulo || 'Título del popup'}
                </h3>
                <p 
                  className="mb-6"
                  style={{ color: formData.color_texto }}
                >
                  {formData.subtitulo || 'Subtítulo descriptivo'}
                </p>

                {formData.mostrar_input_email && (
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border rounded-lg mb-4"
                    disabled
                  />
                )}

                <button
                  className="w-full py-3 rounded-lg font-semibold transition-colors"
                  style={{ 
                    backgroundColor: formData.color_boton,
                    color: formData.color_boton_texto
                  }}
                >
                  {formData.boton_texto || 'Aceptar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Lista de popups */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popups.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-md">
              <span className="material-icons text-6xl text-gray-300 mb-4">web_stories</span>
              <p className="text-gray-500">No hay pop-ups creados</p>
              <button
                onClick={handleNew}
                className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg"
              >
                Crear el primero
              </button>
            </div>
          ) : (
            popups.map(popup => (
              <div
                key={popup.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                  popup.activo ? 'ring-2 ring-green-400' : ''
                }`}
              >
                {/* Preview mini */}
                <div 
                  className="h-24 flex items-center justify-center text-white font-bold"
                  style={{ 
                    background: popup.gradiente || popup.color_boton || '#4A3728'
                  }}
                >
                  {popup.titulo}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{popup.nombre}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      popup.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {popup.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div>
                      <span className="material-icons text-xs mr-1">place</span>
                      {PAGINAS.find(p => p.value === popup.mostrar_en)?.label}
                      <span className="mx-2">•</span>
                      <span className="material-icons text-xs mr-1">schedule</span>
                      {FRECUENCIAS.find(f => f.value === popup.frecuencia)?.label}
                    </div>
                    {popup.generar_cupon && (
                      <div className="flex items-center text-pink-600 font-medium">
                        <span className="material-icons text-xs mr-1">local_offer</span>
                        Cupón: {popup.cupon_tipo === 'porcentaje' ? `${popup.cupon_valor}%` : `$${popup.cupon_valor}`} descuento
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(popup)}
                      className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${
                        popup.activo
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {popup.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleEdit(popup)}
                      className="px-3 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200"
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(popup.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
