'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { deliveryZonesGeoDB } from '@/lib/supabase-fetch';

// Fix para el ícono del marcador en Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface ZonaGeo {
  id: string;
  nombre: string;
  color: string;
  precio: number;
  tiempo_estimado: string;
  activo: boolean;
  poligono: [number, number][];
}

interface MapLocationPickerProps {
  onLocationChange: (location: { lat: number; lng: number; address: string; zona?: string; precio?: number; mapsLink?: string; fueraDeZona?: boolean }) => void;
  initialLat?: number;
  initialLng?: number;
  className?: string;
  showPolygons?: boolean; // Mostrar polígonos en el mapa (default: false)
}

// Algoritmo Ray Casting para detectar si un punto está dentro de un polígono
function puntoEnPoligono(lat: number, lng: number, poligono: [number, number][]): boolean {
  if (!poligono || poligono.length < 3) return false;
  
  let inside = false;
  const n = poligono.length;
  
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poligono[i][0], yi = poligono[i][1];
    const xj = poligono[j][0], yj = poligono[j][1];
    
    if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

// Detectar zona basado en polígonos
function detectarZonaGeo(lat: number, lng: number, zonas: ZonaGeo[]): ZonaGeo | null {
  for (const zona of zonas) {
    if (zona.activo && puntoEnPoligono(lat, lng, zona.poligono)) {
      return zona;
    }
  }
  return null;
}

// Geocodificación inversa usando Nominatim (OpenStreetMap)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MarloCookies'
        }
      }
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    
    // Construir dirección desde los componentes
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

export default function MapLocationPicker({ 
  onLocationChange, 
  initialLat = -34.9, 
  initialLng = -54.95,
  className = '',
  showPolygons = false
}: MapLocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zonasGeo, setZonasGeo] = useState<ZonaGeo[]>([]);
  const [zonaActual, setZonaActual] = useState<ZonaGeo | null>(null);
  const [fueraDeZona, setFueraDeZona] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Cargar zonas geográficas
    cargarZonas();
  }, []);

  const cargarZonas = async () => {
    try {
      const { data } = await deliveryZonesGeoDB.getActive();
      if (data && data.length > 0) {
        setZonasGeo(data);
        // Detectar zona inicial después de cargar
        handleLocationChange(initialLat, initialLng, data);
      }
    } catch (err) {
      console.error('Error cargando zonas:', err);
    }
  };

  const handleLocationChange = async (lat: number, lng: number, zonas?: ZonaGeo[]) => {
    setPosition([lat, lng]);
    setLoading(true);
    
    const zonasActuales = zonas || zonasGeo;
    const zonaDetectada = detectarZonaGeo(lat, lng, zonasActuales);
    setZonaActual(zonaDetectada);
    
    // Detectar si está fuera de zona
    const estaFueraDeZona = !zonaDetectada && zonasActuales.length > 0;
    setFueraDeZona(estaFueraDeZona);
    
    try {
      const address = await reverseGeocode(lat, lng);
      const mapsLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
      
      onLocationChange({
        lat,
        lng,
        address,
        zona: zonaDetectada?.nombre,
        precio: zonaDetectada?.precio,
        mapsLink,
        fueraDeZona: estaFueraDeZona
      });
    } catch (error) {
      const mapsLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
      
      onLocationChange({
        lat,
        lng,
        address: zonaDetectada ? `${zonaDetectada.nombre}` : `Ubicación seleccionada`,
        zona: zonaDetectada?.nombre,
        precio: zonaDetectada?.precio,
        mapsLink,
        fueraDeZona: estaFueraDeZona
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
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          handleLocationChange(lat, lng);
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

      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Solo mostrar polígonos si showPolygons está activo */}
          {showPolygons && zonasGeo.map(zona => (
            <Polygon
              key={zona.id}
              positions={zona.poligono}
              pathOptions={{
                color: zona.color,
                fillColor: zona.color,
                fillOpacity: zonaActual?.id === zona.id ? 0.4 : 0.2,
                weight: zonaActual?.id === zona.id ? 3 : 1
              }}
            />
          ))}
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
          <MapClickHandler onLocationChange={(lat, lng) => handleLocationChange(lat, lng)} />
        </MapContainer>
      </div>

      {/* Mensaje de fuera de zona */}
      {fueraDeZona && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <p className="font-medium">⚠️ Ubicación fuera de zona de delivery</p>
          <p className="text-xs mt-1">Por favor, selecciona una ubicación dentro de nuestras zonas de cobertura.</p>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        💡 Haz clic en el mapa o arrastra el marcador 📍 para seleccionar tu ubicación
      </div>
    </div>
  );
}
