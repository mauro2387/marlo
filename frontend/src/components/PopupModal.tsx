'use client';

import { useState, useEffect } from 'react';
import { popupsDB, subscribersDB } from '@/lib/supabase-fetch';

interface Popup {
  id: string;
  nombre: string;
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
  delay_segundos: number;
  frecuencia: string;
}

interface PopupModalProps {
  pagina: 'home' | 'productos' | 'checkout' | string;
}

export default function PopupModal({ pagina }: PopupModalProps) {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    loadActivePopup();
  }, [pagina]);

  const loadActivePopup = async () => {
    try {
      const { data, error } = await popupsDB.getActive(pagina);
      
      if (error || !data || data.length === 0) return;
      
      const activePopup = data[0];
      
      // Verificar frecuencia
      const storageKey = `popup_${activePopup.id}_shown`;
      const lastShown = localStorage.getItem(storageKey);
      
      if (activePopup.frecuencia === 'una_vez' && lastShown) {
        return; // Ya se mostró una vez
      }
      
      if (activePopup.frecuencia === 'sesion') {
        const sessionShown = sessionStorage.getItem(storageKey);
        if (sessionShown) return;
      }
      
      if (activePopup.frecuencia === 'cada_dia' && lastShown) {
        const lastDate = new Date(lastShown);
        const today = new Date();
        if (lastDate.toDateString() === today.toDateString()) {
          return; // Ya se mostró hoy
        }
      }
      
      setPopup(activePopup);
      
      // Mostrar después del delay
      setTimeout(() => {
        setVisible(true);
        
        // Marcar como mostrado
        localStorage.setItem(storageKey, new Date().toISOString());
        if (activePopup.frecuencia === 'sesion') {
          sessionStorage.setItem(storageKey, 'true');
        }
      }, (activePopup.delay_segundos || 3) * 1000);
      
    } catch (err) {
      console.error('Error cargando popup:', err);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setPopup(null), 300);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribing) return;
    
    setSubscribing(true);
    try {
      // Usar método subscribe que detecta automáticamente si es usuario registrado
      await subscribersDB.subscribe({
        email
      });
      setSubscribed(true);
      setTimeout(handleClose, 2000);
    } catch (err) {
      console.error('Error suscribiendo:', err);
    } finally {
      setSubscribing(false);
    }
  };

  const handleButtonClick = () => {
    if (popup?.boton_link) {
      window.location.href = popup.boton_link;
    }
    handleClose();
  };

  if (!popup) return null;

  const bgStyle = popup.gradiente 
    ? { background: popup.gradiente }
    : { backgroundColor: popup.color_fondo };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className={`relative max-w-md w-full rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={bgStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors z-10"
        >
          <span className="material-icons text-xl">close</span>
        </button>
        
        {/* Imagen */}
        {popup.imagen_url && (
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={popup.imagen_url} 
              alt={popup.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Contenido */}
        <div className="p-8 text-center">
          {/* Icono según plantilla */}
          {popup.plantilla === 'newsletter' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-icons text-4xl" style={{ color: popup.color_titulo }}>mail</span>
            </div>
          )}
          {popup.plantilla === 'discount' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-icons text-4xl" style={{ color: popup.color_titulo }}>local_offer</span>
            </div>
          )}
          {popup.plantilla === 'announcement' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-icons text-4xl" style={{ color: popup.color_titulo }}>campaign</span>
            </div>
          )}
          
          <h2 
            className="text-2xl font-bold mb-3"
            style={{ color: popup.color_titulo }}
          >
            {popup.titulo}
          </h2>
          
          {popup.subtitulo && (
            <p 
              className="mb-6"
              style={{ color: popup.color_texto }}
            >
              {popup.subtitulo}
            </p>
          )}
          
          {/* Input email si está habilitado */}
          {popup.mostrar_input_email && !subscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-white/30 bg-white/10 text-inherit placeholder:text-inherit/60 focus:outline-none focus:border-white/50"
                style={{ color: popup.color_texto }}
              />
              <button
                type="submit"
                disabled={subscribing}
                className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ 
                  backgroundColor: popup.color_boton,
                  color: popup.color_boton_texto 
                }}
              >
                {subscribing ? 'Suscribiendo...' : popup.boton_texto}
              </button>
            </form>
          ) : subscribed ? (
            <div className="py-4">
              <span className="material-icons text-5xl text-green-500 mb-2">check_circle</span>
              <p className="font-semibold" style={{ color: popup.color_titulo }}>
                ¡Gracias por suscribirte!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleButtonClick}
                className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: popup.color_boton,
                  color: popup.color_boton_texto 
                }}
              >
                {popup.boton_texto}
              </button>
              
              {popup.boton_secundario_texto && (
                <button
                  onClick={() => {
                    if (popup.boton_secundario_link) {
                      window.location.href = popup.boton_secundario_link;
                    }
                    handleClose();
                  }}
                  className="w-full py-2 text-sm underline opacity-80 hover:opacity-100 transition-opacity"
                  style={{ color: popup.color_texto }}
                >
                  {popup.boton_secundario_texto}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
