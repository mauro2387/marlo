'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

export interface DeliveryZoneGeo {
  id?: string;
  nombre: string;
  color: string;
  precio: number;
  tiempo_estimado: string;
  activo: boolean;
  orden: number;
  poligono: [number, number][]; // [[lat, lng], ...]
}

interface ZoneEditorProps {
  zones: DeliveryZoneGeo[];
  selectedZoneId?: string;
  isDrawing: boolean;
  onZoneClick: (zone: DeliveryZoneGeo) => void;
  onPolygonComplete: (coordinates: [number, number][]) => void;
  onPolygonUpdate: (zoneId: string, coordinates: [number, number][]) => void;
}

// Componente para dibujar nuevos polígonos
function DrawingHandler({ 
  isDrawing, 
  onComplete 
}: { 
  isDrawing: boolean; 
  onComplete: (coords: [number, number][]) => void;
}) {
  const [points, setPoints] = useState<[number, number][]>([]);
  const map = useMap();

  useMapEvents({
    click: (e) => {
      if (!isDrawing) return;
      
      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPoints(prev => [...prev, newPoint]);
    },
    dblclick: (e) => {
      if (!isDrawing || points.length < 3) return;
      
      e.originalEvent.preventDefault();
      // Cerrar el polígono
      const closedPolygon = [...points, points[0]];
      onComplete(closedPolygon);
      setPoints([]);
    }
  });

  // Dibujar puntos mientras se crea el polígono
  useEffect(() => {
    if (!isDrawing) {
      setPoints([]);
      return;
    }

    // Crear marcadores temporales
    const markers = points.map((point, idx) => {
      return L.circleMarker([point[0], point[1]], {
        radius: 6,
        fillColor: '#EC4899',
        color: '#fff',
        weight: 2,
        fillOpacity: 1
      }).addTo(map);
    });

    // Crear línea temporal
    let polyline: L.Polyline | null = null;
    if (points.length > 1) {
      polyline = L.polyline(points.map(p => [p[0], p[1]]), {
        color: '#EC4899',
        weight: 2,
        dashArray: '5, 10'
      }).addTo(map);
    }

    return () => {
      markers.forEach(m => m.remove());
      polyline?.remove();
    };
  }, [points, isDrawing, map]);

  return null;
}

// Componente para mostrar zonas existentes
function ZonePolygons({ 
  zones, 
  selectedZoneId, 
  onZoneClick,
  editMode,
  onPolygonUpdate
}: { 
  zones: DeliveryZoneGeo[];
  selectedZoneId?: string;
  onZoneClick: (zone: DeliveryZoneGeo) => void;
  editMode: boolean;
  onPolygonUpdate: (zoneId: string, coords: [number, number][]) => void;
}) {
  const map = useMap();
  const [editingPoints, setEditingPoints] = useState<{[key: string]: L.CircleMarker[]}>({});

  // Crear marcadores editables para zona seleccionada
  useEffect(() => {
    // Limpiar marcadores anteriores
    Object.values(editingPoints).flat().forEach(m => m.remove());
    
    if (!editMode || !selectedZoneId) {
      setEditingPoints({});
      return;
    }

    const zone = zones.find(z => z.id === selectedZoneId);
    if (!zone) return;

    const markers: L.CircleMarker[] = [];
    
    zone.poligono.forEach((point, idx) => {
      if (idx === zone.poligono.length - 1) return; // Saltar punto de cierre
      
      const marker = L.circleMarker([point[0], point[1]], {
        radius: 8,
        fillColor: zone.color,
        color: '#fff',
        weight: 3,
        fillOpacity: 1,
        className: 'cursor-move'
      })
      .addTo(map)
      .on('mousedown', function(e) {
        map.dragging.disable();
        
        const onMove = (moveEvent: L.LeafletMouseEvent) => {
          marker.setLatLng(moveEvent.latlng);
        };
        
        const onUp = () => {
          map.dragging.enable();
          map.off('mousemove', onMove);
          map.off('mouseup', onUp);
          
          // Actualizar polígono
          const newCoords: [number, number][] = zone.poligono.map((p, i) => {
            if (i === idx) {
              return [marker.getLatLng().lat, marker.getLatLng().lng];
            }
            // Actualizar también el punto de cierre si es el primero
            if (i === zone.poligono.length - 1 && idx === 0) {
              return [marker.getLatLng().lat, marker.getLatLng().lng];
            }
            return p;
          });
          
          onPolygonUpdate(zone.id!, newCoords);
        };
        
        map.on('mousemove', onMove);
        map.on('mouseup', onUp);
      });
      
      markers.push(marker);
    });

    setEditingPoints({ [selectedZoneId]: markers });

    return () => {
      markers.forEach(m => m.remove());
    };
  }, [editMode, selectedZoneId, zones, map]);

  return (
    <>
      {zones.filter(z => z.activo).map(zone => (
        <Polygon
          key={zone.id || zone.nombre}
          positions={zone.poligono.map(p => [p[0], p[1]] as L.LatLngExpression)}
          pathOptions={{
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: selectedZoneId === zone.id ? 0.5 : 0.3,
            weight: selectedZoneId === zone.id ? 3 : 2
          }}
          eventHandlers={{
            click: () => onZoneClick(zone)
          }}
        />
      ))}
    </>
  );
}

export default function DeliveryZoneEditor({
  zones,
  selectedZoneId,
  isDrawing,
  onZoneClick,
  onPolygonComplete,
  onPolygonUpdate
}: ZoneEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '500px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Cargando editor de zonas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        {isDrawing ? (
          <div className="flex items-start gap-2">
            <span className="text-blue-500">✏️</span>
            <div className="text-sm text-blue-700">
              <p className="font-medium">Modo dibujo activo</p>
              <p>Haz clic para agregar puntos. <strong>Doble clic</strong> para cerrar el polígono.</p>
            </div>
          </div>
        ) : selectedZoneId ? (
          <div className="flex items-start gap-2">
            <span className="text-blue-500">📍</span>
            <div className="text-sm text-blue-700">
              <p className="font-medium">Zona seleccionada</p>
              <p>Puedes editar los detalles en el panel lateral. Arrastra los puntos para modificar la forma.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <span className="text-blue-500">🗺️</span>
            <div className="text-sm text-blue-700">
              <p className="font-medium">Editor de zonas de delivery</p>
              <p>Haz clic en una zona para editarla, o usa "Nueva Zona" para dibujar una nueva.</p>
            </div>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height: '500px' }}>
        <MapContainer
          center={[-34.9, -54.95]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          doubleClickZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <ZonePolygons 
            zones={zones} 
            selectedZoneId={selectedZoneId}
            onZoneClick={onZoneClick}
            editMode={!!selectedZoneId}
            onPolygonUpdate={onPolygonUpdate}
          />
          
          <DrawingHandler 
            isDrawing={isDrawing} 
            onComplete={onPolygonComplete}
          />
        </MapContainer>
      </div>

      {/* Leyenda de zonas */}
      <div className="flex flex-wrap gap-2">
        {zones.filter(z => z.activo).map(zone => (
          <button
            key={zone.id || zone.nombre}
            onClick={() => onZoneClick(zone)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
              selectedZoneId === zone.id 
                ? 'ring-2 ring-offset-2 ring-pink-500' 
                : 'hover:bg-gray-100'
            }`}
            style={{ backgroundColor: `${zone.color}20` }}
          >
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: zone.color }}
            />
            <span className="font-medium">{zone.nombre}</span>
            <span className="text-gray-600">${zone.precio}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
