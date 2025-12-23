import { NextResponse } from 'next/server';

// Cache en memoria (se reinicia con cada deploy, pero suficiente para evitar llamadas excesivas)
let cachedData: {
  rating: number;
  reviews_count: number;
  url: string;
  last_updated: string;
} | null = null;
let lastFetch: number = 0;

// Cachear por 1 hora (3600000 ms)
const CACHE_DURATION = 60 * 60 * 1000;

// Place ID de MarLo Cookies (obtenido de Google Maps)
const PLACE_ID = 'ChIJ0aytMAAVdZURRe6OeAMz7D4';

export async function GET() {
  const now = Date.now();
  
  // Si hay cache válido, devolverlo
  if (cachedData && (now - lastFetch) < CACHE_DURATION) {
    return NextResponse.json({
      ...cachedData,
      cached: true,
      cache_expires_in: Math.round((CACHE_DURATION - (now - lastFetch)) / 1000 / 60) + ' minutos'
    });
  }
  
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    // Si no hay API key, devolver valores por defecto
    console.log('⚠️ GOOGLE_PLACES_API_KEY no configurada, usando valores por defecto');
    return NextResponse.json({
      rating: 4.9,
      reviews_count: 21,
      url: 'https://www.google.com/maps/place/?q=place_id:' + PLACE_ID,
      last_updated: new Date().toISOString(),
      cached: false,
      error: 'API key no configurada'
    });
  }
  
  try {
    // Llamar a Google Places API (New)
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,userRatingCount,googleMapsUri`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Actualizar cache
    cachedData = {
      rating: data.rating || 4.9,
      reviews_count: data.userRatingCount || 0,
      url: data.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`,
      last_updated: new Date().toISOString()
    };
    lastFetch = now;
    
    console.log('✅ Google Reviews actualizado:', cachedData);
    
    return NextResponse.json({
      ...cachedData,
      cached: false
    });
    
  } catch (error: any) {
    console.error('❌ Error fetching Google Reviews:', error.message);
    
    // Si hay error pero tenemos cache viejo, usarlo
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
        stale: true,
        error: error.message
      });
    }
    
    // Fallback a valores por defecto
    return NextResponse.json({
      rating: 4.9,
      reviews_count: 21,
      url: 'https://www.google.com/maps/place/?q=place_id:' + PLACE_ID,
      last_updated: new Date().toISOString(),
      cached: false,
      error: error.message
    });
  }
}
