'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface MapaZonasEditorProps {
  zonas: Zona[];
  zonaEditando: Zona | null;
  modoCrear: boolean;
  colorNuevaZona?: string;
  onPoligonoCreado: (coords: [number, number][]) => void;
  onPoligonoEditado: (coords: [number, number][]) => void;
  onZonaClick: (zona: Zona) => void;
}

export default function MapaZonasEditor({
  zonas,
  zonaEditando,
  modoCrear,
  colorNuevaZona = '#3B82F6',
  onPoligonoCreado,
  onPoligonoEditado,
  onZonaClick
}: MapaZonasEditorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const zonasLayerRef = useRef<L.LayerGroup | null>(null);
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);
  const [puntosNuevos, setPuntosNuevos] = useState<[number, number][]>([]);
  const [puntosEditando, setPuntosEditando] = useState<[number, number][]>([]);
  
  // Refs para acceder al estado actual dentro del event listener
  const modoCrearRef = useRef(modoCrear);
  const zonaEditandoRef = useRef(zonaEditando);
  
  // Mantener refs actualizadas
  useEffect(() => {
    modoCrearRef.current = modoCrear;
  }, [modoCrear]);
  
  useEffect(() => {
    zonaEditandoRef.current = zonaEditando;
  }, [zonaEditando]);
  
  // Centro en Maldonado
  const centro: [number, number] = [-34.9167, -54.9500];

  // Manejar click en mapa - usando refs para acceder al estado actual
  const handleMapClick = useCallback((lat: number, lng: number) => {
    console.log('Click en mapa:', lat, lng, 'modoCrear:', modoCrearRef.current, 'editando:', !!zonaEditandoRef.current);
    
    if (modoCrearRef.current) {
      setPuntosNuevos(prev => [...prev, [lat, lng]]);
    } else if (zonaEditandoRef.current) {
      setPuntosEditando(prev => [...prev, [lat, lng]]);
    }
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: centro,
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Layers para zonas y dibujo
    zonasLayerRef.current = L.layerGroup().addTo(map);
    drawingLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Click en mapa para dibujar
    map.on('click', (e: L.LeafletMouseEvent) => {
      handleMapClick(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [handleMapClick]);

  // Cuando cambian los puntos nuevos, notificar y redibujar
  useEffect(() => {
    onPoligonoCreado(puntosNuevos);
    dibujarPuntosTemporales(puntosNuevos, colorNuevaZona);
  }, [puntosNuevos, colorNuevaZona]);

  // Cuando cambian los puntos editando
  useEffect(() => {
    if (zonaEditando) {
      onPoligonoEditado(puntosEditando);
      dibujarPuntosTemporales(puntosEditando, zonaEditando.color);
    }
  }, [puntosEditando]);

  // Inicializar puntos cuando se empieza a editar una zona
  useEffect(() => {
    if (zonaEditando) {
      setPuntosEditando(zonaEditando.poligono || []);
    } else {
      setPuntosEditando([]);
    }
  }, [zonaEditando?.id]);

  // Limpiar puntos cuando cambia el modo
  useEffect(() => {
    if (!modoCrear) {
      setPuntosNuevos([]);
      if (drawingLayerRef.current) {
        drawingLayerRef.current.clearLayers();
      }
    }
  }, [modoCrear]);

  // Dibujar puntos temporales (mientras se dibuja)
  const dibujarPuntosTemporales = (puntos: [number, number][], color: string) => {
    if (!drawingLayerRef.current) return;
    
    drawingLayerRef.current.clearLayers();

    if (puntos.length === 0) return;

    // Dibujar marcadores en cada punto
    puntos.forEach((p, i) => {
      const isFirst = i === 0;
      const marker = L.circleMarker([p[0], p[1]], {
        radius: isFirst ? 10 : 6,
        fillColor: isFirst ? '#FFFFFF' : color,
        color: color,
        weight: 2,
        fillOpacity: 1
      });
      
      if (isFirst && puntos.length >= 3) {
        marker.bindTooltip('Clic para cerrar', { permanent: false });
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          // Cerrar polígono
          if (modoCrear) {
            // Ya está cerrado, los puntos están guardados
          }
        });
      }
      
      marker.addTo(drawingLayerRef.current!);
    });

    // Dibujar líneas entre puntos
    if (puntos.length >= 2) {
      const polyline = L.polyline(puntos, {
        color: color,
        weight: 2,
        dashArray: '5, 5'
      });
      polyline.addTo(drawingLayerRef.current);
    }

    // Si hay 3+ puntos, mostrar área semi-transparente
    if (puntos.length >= 3) {
      const polygon = L.polygon(puntos, {
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '5, 5'
      });
      polygon.addTo(drawingLayerRef.current);
    }
  };

  // Dibujar zonas existentes
  useEffect(() => {
    if (!zonasLayerRef.current) return;
    
    zonasLayerRef.current.clearLayers();

    zonas.forEach(zona => {
      // No dibujar la zona que está siendo editada (se dibuja en drawing layer)
      if (zonaEditando?.id === zona.id) return;
      
      if (!zona.poligono || zona.poligono.length < 3) return;

      const polygon = L.polygon(zona.poligono, {
        color: zona.color,
        fillColor: zona.color,
        fillOpacity: zona.activo ? 0.3 : 0.1,
        weight: 2
      });

      polygon.bindTooltip(`
        <strong>${zona.nombre}</strong><br/>
        $${zona.precio} - ${zona.tiempo_estimado}
      `, { sticky: true });

      polygon.on('click', () => {
        onZonaClick(zona);
      });

      polygon.addTo(zonasLayerRef.current!);
    });
  }, [zonas, zonaEditando?.id]);

  // Función para limpiar dibujo actual
  const limpiarDibujo = () => {
    if (modoCrear) {
      setPuntosNuevos([]);
    } else if (zonaEditando) {
      setPuntosEditando([]);
    }
  };

  // Deshacer último punto
  const deshacerPunto = () => {
    if (modoCrear) {
      setPuntosNuevos(prev => prev.slice(0, -1));
    } else if (zonaEditando) {
      setPuntosEditando(prev => prev.slice(0, -1));
    }
  };

  const puntosActuales = modoCrear ? puntosNuevos : puntosEditando;

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        style={{ height: '500px', width: '100%' }}
        className="rounded-lg"
      />
      
      {/* Controles de dibujo */}
      {(modoCrear || zonaEditando) && (
        <div className="absolute top-3 left-3 z-[1000] bg-white rounded-lg shadow-lg p-2 space-y-2">
          <div className="text-xs font-medium text-gray-700 px-2">
            {modoCrear ? '🎨 Dibujando nueva zona' : `✏️ Editando: ${zonaEditando?.nombre}`}
          </div>
          <div className="text-xs text-gray-500 px-2">
            Puntos: {puntosActuales.length}
          </div>
          <div className="flex gap-1">
            <button
              onClick={deshacerPunto}
              disabled={puntosActuales.length === 0}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Deshacer último punto"
            >
              ↩️ Deshacer
            </button>
            <button
              onClick={limpiarDibujo}
              disabled={puntosActuales.length === 0}
              className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Limpiar todo"
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Indicador de modo */}
      {modoCrear && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          👆 Haz clic en el mapa para agregar puntos
        </div>
      )}
    </div>
  );
}
