'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para el ícono del marcador en Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapLocationPickerProps {
  onLocationChange: (location: { lat: number; lng: number; address: string; zona?: string; mapsLink?: string }) => void;
  initialLat?: number;
  initialLng?: number;
  className?: string;
}

// Zonas de Maldonado con sus límites aproximados
const ZONAS_MALDONADO = [
  { name: 'Centro', lat: -34.9, lng: -54.95, radius: 3 },
  { name: 'Punta del Este', lat: -34.95, lng: -54.95, radius: 5 },
  { name: 'La Barra', lat: -34.87, lng: -54.77, radius: 4 },
  { name: 'Manantiales', lat: -34.85, lng: -54.75, radius: 3 },
  { name: 'José Ignacio', lat: -34.83, lng: -54.62, radius: 5 },
  { name: 'San Carlos', lat: -34.80, lng: -54.91, radius: 4 },
  { name: 'Piriápolis', lat: -34.86, lng: -55.28, radius: 4 },
  { name: 'Pan de Azúcar', lat: -34.79, lng: -55.23, radius: 5 },
  { name: 'Aiguá', lat: -34.20, lng: -54.77, radius: 6 }
];

// Función para calcular distancia entre dos puntos (fórmula de Haversine)
function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Detectar zona basado en coordenadas
function detectarZona(lat: number, lng: number): string {
  let zonaMasCercana = 'Otro';
  let distanciaMinima = Infinity;

  for (const zona of ZONAS_MALDONADO) {
    const distancia = calcularDistancia(lat, lng, zona.lat, zona.lng);
    if (distancia < zona.radius && distancia < distanciaMinima) {
      distanciaMinima = distancia;
      zonaMasCercana = zona.name;
    }
  }

  return zonaMasCercana;
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
  className = '' 
}: MapLocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Obtener dirección inicial
    handleLocationChange(initialLat, initialLng);
  }, []);

  const handleLocationChange = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setLoading(true);
    
    try {
      const address = await reverseGeocode(lat, lng);
      const zona = detectarZona(lat, lng);
      const mapsLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
      
      onLocationChange({
        lat,
        lng,
        address,
        zona,
        mapsLink
      });
    } catch (error) {
      // Fallback si falla el geocoding
      const zona = detectarZona(lat, lng);
      const mapsLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
      
      onLocationChange({
        lat,
        lng,
        address: `${zona} - Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        zona,
        mapsLink
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

      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
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
          <Marker 
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                handleLocationChange(position.lat, position.lng);
              },
            }}
          />
          <MapClickHandler onLocationChange={handleLocationChange} />
        </MapContainer>
      </div>

      <div className="text-xs text-gray-500 text-center">
        💡 Haz clic en el mapa o arrastra el marcador 📍 para seleccionar tu ubicación
      </div>
    </div>
  );
}
