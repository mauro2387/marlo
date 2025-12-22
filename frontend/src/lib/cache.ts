// Sistema de caché local para MarLo Cookies
// Mantiene datos en memoria y localStorage para acceso rápido

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live en milisegundos
  key: string;
}

// Configuración de caché por tipo de dato
export const CACHE_CONFIG = {
  products: { key: 'marlo_products', ttl: 1 * 60 * 1000 }, // 1 minuto (stock cambia frecuentemente)
  zones: { key: 'marlo_zones', ttl: 30 * 60 * 1000 }, // 30 minutos
  user: { key: 'marlo_user', ttl: 10 * 60 * 1000 }, // 10 minutos
  stats: { key: 'marlo_stats', ttl: 2 * 60 * 1000 }, // 2 minutos
} as const;

// Caché en memoria para acceso ultra-rápido
const memoryCache = new Map<string, CacheItem<any>>();

// Guardar en caché
export function setCache<T>(config: CacheConfig, data: T): void {
  const item: CacheItem<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + config.ttl,
  };

  // Guardar en memoria
  memoryCache.set(config.key, item);

  // Guardar en localStorage para persistencia
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(config.key, JSON.stringify(item));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }
}

// Obtener de caché
export function getCache<T>(config: CacheConfig): T | null {
  // Primero buscar en memoria (más rápido)
  const memItem = memoryCache.get(config.key) as CacheItem<T> | undefined;
  if (memItem && memItem.expiresAt > Date.now()) {
    return memItem.data;
  }

  // Si no está en memoria, buscar en localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(config.key);
      if (stored) {
        const item: CacheItem<T> = JSON.parse(stored);
        if (item.expiresAt > Date.now()) {
          // Restaurar a memoria
          memoryCache.set(config.key, item);
          return item.data;
        } else {
          // Expirado, eliminar
          localStorage.removeItem(config.key);
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
  }

  return null;
}

// Invalidar caché específico
export function invalidateCache(config: CacheConfig): void {
  memoryCache.delete(config.key);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(config.key);
  }
}

// Invalidar todo el caché
export function clearAllCache(): void {
  memoryCache.clear();
  if (typeof window !== 'undefined') {
    Object.values(CACHE_CONFIG).forEach(config => {
      localStorage.removeItem(config.key);
    });
  }
}

// Hook helper para verificar si hay datos en caché
export function hasCachedData(config: CacheConfig): boolean {
  return getCache(config) !== null;
}

// Obtener datos con fallback (caché expirado pero mejor que nada)
export function getCacheWithFallback<T>(config: CacheConfig): { data: T | null; isStale: boolean } {
  // Primero intentar caché válido
  const validData = getCache<T>(config);
  if (validData) {
    return { data: validData, isStale: false };
  }

  // Si no hay válido, buscar expirado en localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(config.key);
      if (stored) {
        const item: CacheItem<T> = JSON.parse(stored);
        return { data: item.data, isStale: true };
      }
    } catch (e) {
      // Ignorar errores
    }
  }

  return { data: null, isStale: false };
}
