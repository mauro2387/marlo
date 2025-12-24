'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from 'react-leaflet';
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

interface DeliveryZoneGeo {
  id: string;
  nombre: string;
  color: string;
  precio: number;
  tiempo_estimado: string;
  activo: boolean;
  poligono: [number, number][];
}

interface MapLocationPickerGeoProps {
  zones: DeliveryZoneGeo[];
  onLocationChange: (location: { 
    lat: number; 
    lng: number; 
    address: string; 
    zona?: string;
    zonaPrecio?: number;
    zonaTiempo?: string;
    zonaColor?: string;
    mapsLink?: string;
    fueraDeZona?: boolean;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  className?: string;
}

// Algoritmo Ray Casting para detectar si un punto está dentro de un polígono
function pointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  const n = polygon.length;
  
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

// Detectar zona basado en polígonos
function detectarZonaGeo(lat: number, lng: number, zones: DeliveryZoneGeo[]): DeliveryZoneGeo | null {
  for (const zone of zones) {
    if (!zone.activo) continue;
    if (pointInPolygon(lat, lng, zone.poligono)) {
      return zone;
    }
  }
  return null;
}

// Geocodificación inversa usando Nominatim
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'MarloCookies' } }
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    const address = data.address;
    const parts = [];
    
    if (address.road) parts.push(address.road);
    if (address.house_number) parts.push(address.house_number);
    if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood);
    if (address.city || address.town || address.village) parts.push(address.city || address.town || address.village);
    
    return parts.length > 0 ? parts.join(', ') : data.display_name;
  } catch (error) {
    console.error('Error en geocodificación:', error);
    throw error;
  }
}

// Componente para manejar clics en el mapa
function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Componente para mostrar las zonas en el mapa
function ZonePolygons({ zones, selectedZone }: { zones: DeliveryZoneGeo[]; selectedZone?: string }) {
  return (
    <>
      {zones.filter(z => z.activo).map(zone => (
        <Polygon
          key={zone.id}
          positions={zone.poligono.map(p => [p[0], p[1]] as L.LatLngExpression)}
          pathOptions={{
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: selectedZone === zone.nombre ? 0.4 : 0.2,
            weight: selectedZone === zone.nombre ? 3 : 2
          }}
        />
      ))}
    </>
  );
}

export default function MapLocationPickerGeo({ 
  zones,
  onLocationChange, 
  initialLat = -34.9, 
  initialLng = -54.95,
  className = '' 
}: MapLocationPickerGeoProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | undefined>();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocationChange = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setLoading(true);
    
    try {
      const address = await reverseGeocode(lat, lng);
      const zone = detectarZonaGeo(lat, lng, zones);
      const mapsLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
      
      setSelectedZone(zone?.nombre);
      
      onLocationChange({
        lat,
        lng,
        address,
        zona: zone?.nombre || 'Fuera de zona',
        zonaPrecio: zone?.precio,
        zonaTiempo: zone?.tiempo_estimado,
        zonaColor: zone?.color,
        mapsLink,
        fueraDeZona: !zone
      });
    } catch (error) {
      const zone = detectarZonaGeo(lat, lng, zones);
      const mapsLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
      
      setSelectedZone(zone?.nombre);
      
      onLocationChange({
        lat,
        lng,
        address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        zona: zone?.nombre || 'Fuera de zona',
        zonaPrecio: zone?.precio,
        zonaTiempo: zone?.tiempo_estimado,
        zonaColor: zone?.color,
        mapsLink,
        fueraDeZona: !zone
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationChange(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error('Error al obtener ubicación:', err);
          setLoading(false);
          alert('No se pudo obtener tu ubicación. Por favor, marca manualmente en el mapa.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  };

  if (!mounted) {
    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ height: '400px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Cargando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Botón ubicación */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={getUserLocation}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Obteniendo...
            </span>
          ) : (
            '📍 Usar mi ubicación actual'
          )}
        </button>
      </div>

      {/* Mapa */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        <MapContainer
          center={position}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Mostrar zonas */}
          <ZonePolygons zones={zones} selectedZone={selectedZone} />
          
          {/* Marcador */}
          <Marker 
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                handleLocationChange(pos.lat, pos.lng);
              },
            }}
          />
          <MapClickHandler onLocationChange={handleLocationChange} />
        </MapContainer>
      </div>

      {/* Leyenda de zonas */}
      <div className="flex flex-wrap gap-2">
        {zones.filter(z => z.activo).map(zone => (
          <div
            key={zone.id}
            className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
              selectedZone === zone.nombre ? 'ring-2 ring-pink-500' : ''
            }`}
            style={{ backgroundColor: `${zone.color}20` }}
          >
            <span 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: zone.color }}
            />
            <span>{zone.nombre}</span>
            <span className="text-gray-600">${zone.precio}</span>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 text-center">
        💡 Haz clic en el mapa o arrastra el marcador 📍 para seleccionar tu ubicación
      </div>
    </div>
  );
}
