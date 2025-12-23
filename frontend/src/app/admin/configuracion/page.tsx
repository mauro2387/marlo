'use client';

import { useEffect, useState, useRef } from 'react';
import { promoBannersDB, floatingImagesDB, storageDB, siteSettingsDB, productsDB } from '@/lib/supabase-fetch';
import LoadingSpinner from '@/components/LoadingSpinner';

const INTERNAL_PAGES = [
  { label: 'Página Principal', value: '/' },
  { label: 'Productos', value: '/productos' },
  { label: 'Boxes', value: '/boxes' },
  { label: 'Nosotros', value: '/nosotros' },
  { label: 'Contacto', value: '/contacto' },
  { label: 'Puntos', value: '/puntos' },
  { label: 'Registro', value: '/registro' },
];

const GRADIENT_OPTIONS = [
  { label: 'Púrpura/Rosa', value: 'from-purple-600 via-pink-600 to-purple-600' },
  { label: 'Azul/Púrpura', value: 'from-blue-600 via-purple-600 to-blue-600' },
  { label: 'Rosa/Naranja', value: 'from-pink-500 via-rose-500 to-orange-400' },
  { label: 'Verde/Azul', value: 'from-emerald-500 via-teal-500 to-cyan-500' },
  { label: 'Naranja/Rojo', value: 'from-orange-500 via-red-500 to-rose-500' },
  { label: 'Dorado', value: 'from-amber-500 via-yellow-500 to-amber-600' },
  { label: 'Navideño', value: 'from-red-600 via-red-500 to-green-600' },
  { label: 'Halloween', value: 'from-orange-500 via-purple-600 to-black' },
];

interface Banner {
  id: string;
  texto: string;
  link: string | null;
  activo: boolean;
  orden: number;
}

interface FloatingImage {
  id: string;
  imagen_url: string;
  orden: number;
  activo: boolean;
}

interface SiteSettings {
  limited_banner_title: string;
  limited_banner_subtitle: string;
  limited_banner_gradient: string;
  limited_banner_active: boolean;
  limited_banner_products: string[]; // IDs de productos seleccionados
  limited_banner_show_images: boolean;
}

interface Product {
  id: string;
  nombre: string;
  imagen: string | null;
  es_limitado: boolean;
  categoria: string;
  precio: number;
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [floatingImages, setFloatingImages] = useState<FloatingImage[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const floatingImageInputRef = useRef<HTMLInputElement>(null);
  const [previewBannerIndex, setPreviewBannerIndex] = useState(0);
  
  // Banner de Ediciones Limitadas
  const [limitedSettings, setLimitedSettings] = useState<SiteSettings>({
    limited_banner_title: 'Ediciones Limitadas',
    limited_banner_subtitle: 'Sabores exclusivos por tiempo limitado. ¡No te las pierdas!',
    limited_banner_gradient: 'from-purple-600 via-pink-600 to-purple-600',
    limited_banner_active: true,
    limited_banner_products: [],
    limited_banner_show_images: true
  });
  const [limitedProducts, setLimitedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  
  // Nuevo banner form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBanner, setNewBanner] = useState({ texto: '', link: '', linkType: 'none' as 'none' | 'internal' | 'external' });
  
  // Horarios del negocio - formato por día de la semana
  const [businessHours, setBusinessHours] = useState([
    { day: 'Lunes', hours: '15:00 - 22:00', open: true, dayIndex: 1 },
    { day: 'Martes', hours: '15:00 - 22:00', open: true, dayIndex: 2 },
    { day: 'Miércoles', hours: '15:00 - 22:00', open: true, dayIndex: 3 },
    { day: 'Jueves', hours: '15:00 - 22:00', open: true, dayIndex: 4 },
    { day: 'Viernes', hours: '15:00 - 22:00', open: true, dayIndex: 5 },
    { day: 'Sábado', hours: '15:00 - 22:00', open: true, dayIndex: 6 },
    { day: 'Domingo', hours: '15:00 - 22:00', open: true, dayIndex: 0 },
  ]);
  const [editingHours, setEditingHours] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-rotate preview
  useEffect(() => {
    const activeBanners = banners.filter(b => b.activo);
    if (activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setPreviewBannerIndex(prev => (prev + 1) % activeBanners.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [banners]);

  const fetchData = async () => {
    try {
      const [bannersRes, imagesRes, settingsRes, productsRes] = await Promise.all([
        promoBannersDB.getAll(),
        floatingImagesDB.getAll(),
        siteSettingsDB.get(),
        productsDB.getAll()
      ]);
      setBanners(bannersRes.data || []);
      setFloatingImages(imagesRes.data || []);
      
      // Todos los productos
      const products = productsRes.data || [];
      setAllProducts(products);
      
      // Settings del banner de ediciones limitadas
      if (settingsRes.data) {
        const savedProducts = settingsRes.data.limited_banner_products || [];
        setLimitedSettings({
          limited_banner_title: settingsRes.data.limited_banner_title || 'Ediciones Limitadas',
          limited_banner_subtitle: settingsRes.data.limited_banner_subtitle || 'Sabores exclusivos por tiempo limitado. ¡No te las pierdas!',
          limited_banner_gradient: settingsRes.data.limited_banner_gradient || 'from-purple-600 via-pink-600 to-purple-600',
          limited_banner_active: settingsRes.data.limited_banner_active ?? true,
          limited_banner_products: savedProducts,
          limited_banner_show_images: settingsRes.data.limited_banner_show_images ?? true
        });
        
        // Cargar horarios guardados
        if (settingsRes.data.business_hours) {
          setBusinessHours(settingsRes.data.business_hours);
        }
        
        // Productos seleccionados para el banner
        const selected = products.filter((p: Product) => savedProducts.includes(p.id));
        setLimitedProducts(selected);
      } else {
        // Fallback: mostrar productos con es_limitado = true
        const limited = products.filter((p: Product) => p.es_limitado);
        setLimitedProducts(limited);
      }
    } catch (err) {
      console.error('Error cargando configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await promoBannersDB.getAll();
      if (error) throw error;
      setBanners(data || []);
    } catch (err) {
      console.error('Error cargando banners:', err);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    setSaving(banner.id);
    try {
      const { error } = await promoBannersDB.update(banner.id, { activo: !banner.activo });
      if (error) throw error;
      
      setBanners(prev => prev.map(b => 
        b.id === banner.id ? { ...b, activo: !b.activo } : b
      ));
      setMessage({ type: 'success', text: `Banner ${!banner.activo ? 'activado' : 'desactivado'}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error al actualizar' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUpdateBanner = async (id: string, updates: Partial<Banner>) => {
    setSaving(id);
    try {
      const { error } = await promoBannersDB.update(id, updates);
      if (error) throw error;
      
      setBanners(prev => prev.map(b => 
        b.id === id ? { ...b, ...updates } : b
      ));
      setMessage({ type: 'success', text: 'Banner actualizado' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error al actualizar' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('¿Eliminar este banner?')) return;
    
    setSaving(id);
    try {
      const { error } = await promoBannersDB.delete(id);
      if (error) throw error;
      
      setBanners(prev => prev.filter(b => b.id !== id));
      setMessage({ type: 'success', text: 'Banner eliminado' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error al eliminar' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCreateBanner = async () => {
    if (!newBanner.texto.trim()) {
      setMessage({ type: 'error', text: 'El texto es requerido' });
      return;
    }

    setSaving('new');
    try {
      let link: string | null = null;
      if (newBanner.linkType !== 'none' && newBanner.link) {
        link = newBanner.link;
      }

      const { data, error } = await promoBannersDB.create({
        texto: newBanner.texto,
        link,
        activo: true,
        orden: banners.length + 1
      });
      
      if (error) throw error;
      
      await fetchBanners();
      setNewBanner({ texto: '', link: '', linkType: 'none' });
      setShowNewForm(false);
      setMessage({ type: 'success', text: 'Banner creado' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error al crear' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUpdateLimitedSettings = async () => {
    setSaving('limited');
    try {
      const { error } = await siteSettingsDB.update(limitedSettings);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Banner de ediciones limitadas actualizado' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error al guardar' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Agregar producto al banner
  const handleAddProductToBanner = (product: Product) => {
    if (limitedSettings.limited_banner_products.includes(product.id)) return;
    
    const newProducts = [...limitedSettings.limited_banner_products, product.id];
    setLimitedSettings(prev => ({ ...prev, limited_banner_products: newProducts }));
    setLimitedProducts(prev => [...prev, product]);
    setProductSearch('');
  };

  // Guardar horarios
  const handleSaveBusinessHours = async () => {
    setSaving('hours');
    try {
      const { error } = await siteSettingsDB.update({ business_hours: businessHours });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Horarios actualizados correctamente' });
      setEditingHours(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error al guardar horarios' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUpdateHour = (index: number, field: 'day' | 'hours' | 'open' | 'dayIndex', value: string | boolean | number) => {
    setBusinessHours(prev => prev.map((h, i) => 
      i === index ? { ...h, [field]: value } : h
    ));
  };

  const handleAddHourSlot = () => {
    setBusinessHours(prev => [...prev, { day: 'Nuevo horario', hours: '00:00 - 00:00', open: true, dayIndex: -1 }]);
  };

  const handleRemoveHourSlot = (index: number) => {
    if (businessHours.length <= 1) {
      setMessage({ type: 'error', text: 'Debe haber al menos un horario' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setBusinessHours(prev => prev.filter((_, i) => i !== index));
  };

  // Quitar producto del banner
  const handleRemoveProductFromBanner = (productId: string) => {
    const newProducts = limitedSettings.limited_banner_products.filter(id => id !== productId);
    setLimitedSettings(prev => ({ ...prev, limited_banner_products: newProducts }));
    setLimitedProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Filtrar productos en el buscador
  const filteredProducts = allProducts.filter(p => 
    p.nombre.toLowerCase().includes(productSearch.toLowerCase()) &&
    !limitedSettings.limited_banner_products.includes(p.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const activeBanners = banners.filter(b => b.activo);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brown-800">⚙️ Configuración del Sitio</h2>
      </div>

      {/* Mensaje */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Banner de Ediciones Limitadas */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            ⭐ Banner Ediciones Limitadas
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={limitedSettings.limited_banner_active}
              onChange={(e) => setLimitedSettings(prev => ({ ...prev, limited_banner_active: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              {limitedSettings.limited_banner_active ? 'Activo' : 'Inactivo'}
            </span>
          </label>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Este banner aparece en la página de productos. Selecciona los productos que quieres destacar.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={limitedSettings.limited_banner_title}
                onChange={(e) => setLimitedSettings(prev => ({ ...prev, limited_banner_title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ediciones Limitadas"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
              <input
                type="text"
                value={limitedSettings.limited_banner_subtitle}
                onChange={(e) => setLimitedSettings(prev => ({ ...prev, limited_banner_subtitle: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Sabores exclusivos por tiempo limitado..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estilo de Fondo</label>
              <select
                value={limitedSettings.limited_banner_gradient}
                onChange={(e) => setLimitedSettings(prev => ({ ...prev, limited_banner_gradient: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {GRADIENT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Toggle mostrar imágenes */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-700">Mostrar imágenes de productos</span>
                <p className="text-xs text-gray-500">Muestra la foto del producto junto al nombre</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={limitedSettings.limited_banner_show_images}
                  onChange={(e) => setLimitedSettings(prev => ({ ...prev, limited_banner_show_images: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
            
            <button
              onClick={handleUpdateLimitedSettings}
              disabled={saving === 'limited'}
              className="w-full py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving === 'limited' ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>

          {/* Vista previa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vista Previa</label>
            <div className={`bg-gradient-to-r ${limitedSettings.limited_banner_gradient} rounded-xl shadow-lg overflow-hidden p-6 text-white`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl animate-pulse">⭐</span>
                <h2 className="text-xl font-bold">{limitedSettings.limited_banner_title || 'Título'}</h2>
              </div>
              <p className="text-white/90 text-sm mb-3">
                {limitedSettings.limited_banner_subtitle || 'Subtítulo'}
              </p>
              <div className="flex flex-wrap gap-2">
                {limitedProducts.slice(0, 4).map(p => (
                  <a 
                    key={p.id} 
                    href={`/productos/${p.id}`}
                    className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-white/30 transition-colors cursor-pointer"
                  >
                    {limitedSettings.limited_banner_show_images && p.imagen?.startsWith('http') ? (
                      <img src={p.imagen} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : limitedSettings.limited_banner_show_images ? (
                      <span>🍪</span>
                    ) : null}
                    {p.nombre}
                  </a>
                ))}
                {limitedProducts.length === 0 && (
                  <span className="text-white/70 text-xs">Selecciona productos abajo</span>
                )}
                {limitedProducts.length > 4 && (
                  <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                    +{limitedProducts.length - 4} más
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selector de Productos */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-800">🎯 Productos en el Banner</h4>
              <p className="text-xs text-gray-500">{limitedProducts.length} productos seleccionados</p>
            </div>
            <button
              onClick={() => setShowProductSelector(!showProductSelector)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
            >
              {showProductSelector ? '✕ Cerrar' : '+ Agregar Producto'}
            </button>
          </div>

          {/* Buscador de productos */}
          {showProductSelector && (
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Buscar producto</label>
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Escribe el nombre del producto..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              
              {/* Resultados de búsqueda */}
              {productSearch && (
                <div className="mt-3 max-h-60 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No se encontraron productos</p>
                  ) : (
                    <div className="grid gap-2">
                      {filteredProducts.slice(0, 10).map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleAddProductToBanner(product)}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-purple-100 transition-colors text-left border border-gray-200"
                        >
                          {product.imagen?.startsWith('http') ? (
                            <img src={product.imagen} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">🍪</div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{product.nombre}</p>
                            <p className="text-xs text-gray-500">{product.categoria} • ${product.precio}</p>
                          </div>
                          <span className="text-purple-500 font-bold">+</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sugerencias rápidas: productos limitados */}
              {!productSearch && allProducts.filter(p => p.es_limitado && !limitedSettings.limited_banner_products.includes(p.id)).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Sugerencias (productos marcados como limitados):</p>
                  <div className="flex flex-wrap gap-2">
                    {allProducts
                      .filter(p => p.es_limitado && !limitedSettings.limited_banner_products.includes(p.id))
                      .map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleAddProductToBanner(product)}
                          className="px-3 py-1.5 bg-white rounded-full text-sm hover:bg-purple-100 transition-colors border border-purple-200 flex items-center gap-2"
                        >
                          {product.imagen?.startsWith('http') && (
                            <img src={product.imagen} alt="" className="w-5 h-5 rounded-full object-cover" />
                          )}
                          {product.nombre}
                          <span className="text-purple-500">+</span>
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lista de productos seleccionados */}
          {limitedProducts.length > 0 ? (
            <div className="grid gap-2">
              {limitedProducts.map((product, idx) => (
                <div 
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                >
                  <span className="text-xs font-bold text-purple-400 w-6">#{idx + 1}</span>
                  {product.imagen?.startsWith('http') ? (
                    <img src={product.imagen} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">🍪</div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{product.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {product.categoria} • 
                      <a 
                        href={`/productos/${product.id}`} 
                        target="_blank" 
                        className="text-purple-500 hover:underline ml-1"
                      >
                        Ver producto ↗
                      </a>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveProductFromBanner(product.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Quitar del banner"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <span className="text-4xl block mb-2">🎯</span>
              <p>No hay productos seleccionados.</p>
              <p className="text-sm">Usa el botón "Agregar Producto" para seleccionar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Banners Promocionales */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            📢 Banners Promocionales (Barra Superior)
          </h3>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            {showNewForm ? '✕ Cancelar' : '+ Nuevo Banner'}
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Los banners rotan automáticamente cada 10 segundos en la barra roja superior.
        </p>

        {/* Vista previa de TODOS los banners */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Vista Previa de Todos los Banners ({activeBanners.length} activos)
          </label>
          
          {/* Banner actual animado */}
          <div className="relative overflow-hidden rounded-lg mb-4" style={{ backgroundColor: '#F25252' }}>
            <div className="h-10 flex items-center justify-center text-white font-bold text-sm transition-all">
              {activeBanners[previewBannerIndex]?.texto || 'Sin banners activos'}
            </div>
            {activeBanners.length > 1 && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                {activeBanners.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setPreviewBannerIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === previewBannerIndex ? 'bg-white scale-125' : 'bg-white/40'}`} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Grid de todos los banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {banners.map((banner, idx) => (
              <div 
                key={banner.id}
                className={`relative overflow-hidden rounded-lg transition-all cursor-pointer ${
                  banner.activo ? 'ring-2 ring-green-400' : 'opacity-50'
                }`}
                style={{ backgroundColor: banner.activo ? '#F25252' : '#9CA3AF' }}
                onClick={() => {
                  if (banner.activo) {
                    const activeIdx = activeBanners.findIndex(b => b.id === banner.id);
                    if (activeIdx >= 0) setPreviewBannerIndex(activeIdx);
                  }
                }}
              >
                <div className="h-10 flex items-center justify-center text-white font-medium text-xs px-2 truncate">
                  {banner.texto}
                </div>
                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  banner.activo ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <div className="absolute bottom-1 left-1 bg-black/30 text-white text-[10px] px-1 rounded">
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario nuevo banner */}
        {showNewForm && (
          <div className="bg-pink-50 rounded-lg p-4 mb-4 border border-pink-200">
            <h4 className="font-medium text-gray-800 mb-3">Nuevo Banner</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={newBanner.texto}
                onChange={(e) => setNewBanner(prev => ({ ...prev, texto: e.target.value }))}
                placeholder="Texto del banner (ej: 🍪 ¡Nueva promo de la semana!)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                maxLength={100}
              />
              
              {/* Preview del nuevo banner */}
              {newBanner.texto && (
                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#F25252' }}>
                  <div className="h-10 flex items-center justify-center text-white font-bold text-sm">
                    {newBanner.texto}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setNewBanner(prev => ({ ...prev, linkType: 'none', link: '' }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    newBanner.linkType === 'none' ? 'bg-pink-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  Sin enlace
                </button>
                <button
                  type="button"
                  onClick={() => setNewBanner(prev => ({ ...prev, linkType: 'internal' }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    newBanner.linkType === 'internal' ? 'bg-pink-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  Página interna
                </button>
                <button
                  type="button"
                  onClick={() => setNewBanner(prev => ({ ...prev, linkType: 'external' }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    newBanner.linkType === 'external' ? 'bg-pink-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  Link externo
                </button>
              </div>

              {newBanner.linkType === 'internal' && (
                <select
                  value={newBanner.link}
                  onChange={(e) => setNewBanner(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">-- Seleccionar página --</option>
                  {INTERNAL_PAGES.map(page => (
                    <option key={page.value} value={page.value}>{page.label}</option>
                  ))}
                </select>
              )}

              {newBanner.linkType === 'external' && (
                <input
                  type="url"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://ejemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              )}

              <button
                onClick={handleCreateBanner}
                disabled={saving === 'new'}
                className="w-full py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
              >
                {saving === 'new' ? 'Creando...' : '✓ Crear Banner'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de banners */}
        <div className="space-y-3">
          {banners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">📢</span>
              No hay banners creados. ¡Crea el primero!
            </div>
          ) : (
            banners.map((banner, index) => (
              <div 
                key={banner.id}
                className={`border rounded-lg p-4 transition-all ${
                  banner.activo ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Toggle activo */}
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={banner.activo}
                      onChange={() => handleToggleActive(banner)}
                      disabled={saving === banner.id}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>

                  {/* Contenido */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={banner.texto}
                      onChange={(e) => {
                        setBanners(prev => prev.map(b => 
                          b.id === banner.id ? { ...b, texto: e.target.value } : b
                        ));
                      }}
                      onBlur={(e) => {
                        if (e.target.value !== banner.texto) {
                          handleUpdateBanner(banner.id, { texto: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm"
                    />
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>🔗</span>
                      <span>{banner.link || 'Sin enlace'}</span>
                      <span className="mx-2">•</span>
                      <span>Orden: {banner.orden}</span>
                    </div>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    disabled={saving === banner.id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar banner"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Horarios del Negocio */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            🕒 Horarios del Negocio
          </h3>
          {!editingHours && (
            <button
              onClick={() => setEditingHours(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <span className="material-icons text-sm">edit</span>
              Editar Horarios
            </button>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Configura los horarios de atención. Los clientes verán si estás abierto o cerrado en la página principal.
        </p>

        {editingHours ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                <span className="font-medium">💡 Tip:</span> Define el horario para cada día de la semana. 
                Para días especiales (feriados, eventos), agrega una línea extra con la fecha específica.
              </p>
            </div>
            
            {businessHours.map((schedule, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-700">
                    {schedule.dayIndex !== undefined && schedule.dayIndex >= 0 ? '📅' : '⭐'} {schedule.day || 'Sin nombre'}
                  </span>
                  {businessHours.length > 1 && (
                    <button
                      onClick={() => handleRemoveHourSlot(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Eliminar"
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Día / Fecha</label>
                    <input
                      type="text"
                      value={schedule.day}
                      onChange={(e) => handleUpdateHour(index, 'day', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Ej: Lunes, 24/12, Feriado"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Horario</label>
                    <input
                      type="text"
                      value={schedule.hours}
                      onChange={(e) => handleUpdateHour(index, 'hours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Ej: 15:00 - 22:00"
                      disabled={!schedule.open}
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer py-2">
                      <input
                        type="checkbox"
                        checked={schedule.open}
                        onChange={(e) => {
                          handleUpdateHour(index, 'open', e.target.checked);
                          if (!e.target.checked) {
                            handleUpdateHour(index, 'hours', 'Cerrado');
                          }
                        }}
                        className="w-4 h-4 rounded text-blue-500"
                      />
                      <span className={`text-sm ${schedule.open ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                        {schedule.open ? '✓ Abierto' : 'Cerrado'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddHourSlot}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-icons text-sm">add</span>
              Agregar Día / Horario Especial
            </button>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveBusinessHours}
                disabled={saving === 'hours'}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-icons text-sm">save</span>
                {saving === 'hours' ? 'Guardando...' : 'Guardar Horarios'}
              </button>
              <button
                onClick={() => {
                  setEditingHours(false);
                  fetchData(); // Recargar datos originales
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Vista de horarios actuales */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h4 className="font-semibold text-sm text-gray-700">Horarios Configurados</h4>
              </div>
              <div className="divide-y divide-gray-200">
                {businessHours.map((schedule, index) => (
                  <div key={index} className="px-4 py-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {schedule.dayIndex !== undefined && schedule.dayIndex >= 0 ? '📅' : '⭐'} {schedule.day}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${schedule.open ? 'text-gray-600' : 'text-red-500'}`}>
                        {schedule.hours}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        schedule.open 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {schedule.open ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Imágenes Flotantes del Home */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            🍪 Imágenes Flotantes (Home)
          </h3>
          <button
            onClick={() => floatingImageInputRef.current?.click()}
            disabled={uploadingImage}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {uploadingImage ? '⏳ Subiendo...' : '+ Agregar Imagen'}
          </button>
          <input
            ref={floatingImageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              
              setUploadingImage(true);
              try {
                // Leer archivo en memoria
                const arrayBuffer = await file.arrayBuffer();
                const blob = new Blob([arrayBuffer], { type: file.type });
                const fileInMemory = new File([blob], file.name, { type: file.type });
                
                const { url, error } = await storageDB.uploadProductImage(fileInMemory, 'floating-cookie');
                if (error) throw error;
                if (!url) throw new Error('No se obtuvo URL');
                
                // Crear en base de datos
                const { error: dbError } = await floatingImagesDB.create({
                  imagen_url: url,
                  orden: floatingImages.length + 1,
                  activo: true
                });
                if (dbError) throw dbError;
                
                // Recargar
                const { data } = await floatingImagesDB.getAll();
                setFloatingImages(data || []);
                setMessage({ type: 'success', text: 'Imagen agregada' });
              } catch (err: any) {
                setMessage({ type: 'error', text: err?.message || 'Error al subir imagen' });
              } finally {
                setUploadingImage(false);
                e.target.value = '';
                setTimeout(() => setMessage(null), 3000);
              }
            }}
            className="hidden"
          />
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Estas son las imágenes de cookies que rotan en el centro de la página principal. Recomendado: PNG con fondo transparente.
        </p>

        {/* Lista de imágenes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {floatingImages.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">🍪</span>
              No hay imágenes. Se usarán las imágenes por defecto.
            </div>
          ) : (
            floatingImages.map((img) => (
              <div 
                key={img.id}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                  img.activo ? 'border-green-400' : 'border-gray-200 opacity-50'
                }`}
              >
                <div className="aspect-square bg-gradient-to-br from-secondary-crema to-secondary-rosa/20 flex items-center justify-center">
                  <img 
                    src={img.imagen_url} 
                    alt="Cookie flotante"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                
                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={async () => {
                      setSaving(img.id);
                      try {
                        await floatingImagesDB.update(img.id, { activo: !img.activo });
                        setFloatingImages(prev => prev.map(i => 
                          i.id === img.id ? { ...i, activo: !i.activo } : i
                        ));
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSaving(null);
                      }
                    }}
                    className={`p-2 rounded-lg text-white transition-colors ${
                      img.activo ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                    title={img.activo ? 'Desactivar' : 'Activar'}
                  >
                    {img.activo ? '👁️' : '👁️‍🗨️'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('¿Eliminar esta imagen?')) return;
                      setSaving(img.id);
                      try {
                        await floatingImagesDB.delete(img.id);
                        setFloatingImages(prev => prev.filter(i => i.id !== img.id));
                        setMessage({ type: 'success', text: 'Imagen eliminada' });
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSaving(null);
                        setTimeout(() => setMessage(null), 3000);
                      }
                    }}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
                
                {/* Badge de estado */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  img.activo ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {img.activo ? 'Activa' : 'Inactiva'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
