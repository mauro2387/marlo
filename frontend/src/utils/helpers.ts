// Utilidades helper para el frontend

/**
 * Formatea un número como precio uruguayo
 */
export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString('es-UY')}`;
}

/**
 * Formatea una fecha en español
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };
  
  return new Date(date).toLocaleDateString('es-UY', defaultOptions);
}

/**
 * Formatea una fecha relativa (hace X tiempo)
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  return formatDate(date);
}

/**
 * Trunca un texto a una longitud específica
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Genera iniciales de un nombre completo
 */
export function getInitials(name: string, lastName?: string): string {
  if (!name) return '';
  
  const firstInitial = name.charAt(0).toUpperCase();
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return firstInitial + lastInitial;
}

/**
 * Valida un email
 */
export function isValidEmail(email: string): boolean {
  const pattern = /\S+@\S+\.\S+/;
  return pattern.test(email);
}

/**
 * Valida un teléfono uruguayo
 */
export function isValidPhone(phone: string): boolean {
  const pattern = /^\+?598\s?9\s?\d{3}\s?\d{3}$/;
  return pattern.test(phone.replace(/\s/g, ''));
}

/**
 * Formatea un teléfono uruguayo
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Calcula el porcentaje de descuento
 */
export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Genera un ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Convierte puntos a dinero
 */
export function pointsToMoney(points: number, ratio: number = 100): number {
  return Math.floor(points / ratio) * ratio;
}

/**
 * Calcula puntos a ganar de una compra
 */
export function calculatePointsEarned(amount: number, pointsPerPeso: number = 1): number {
  return Math.floor(amount * pointsPerPeso);
}

/**
 * Verifica si una fecha está en el pasado
 */
export function isPastDate(date: string | Date): boolean {
  return new Date(date) < new Date();
}

/**
 * Capitaliza la primera letra de cada palabra
 */
export function capitalize(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Slugify un texto (para URLs)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene color del estado de pedido
 */
export function getOrderStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    preparando: 'blue',
    en_camino: 'yellow',
    entregado: 'green',
    cancelado: 'red',
  };
  return colors[status] || 'gray';
}

/**
 * Calcula el tiempo restante hasta una fecha
 */
export function getTimeUntil(targetDate: string | Date): string {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'Expirado';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} día${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`;
  
  return 'Menos de 1 hora';
}

/**
 * Valida una cédula uruguaya (formato básico)
 */
export function isValidCI(ci: string): boolean {
  const cleaned = ci.replace(/\D/g, '');
  // CI uruguaya tiene entre 6 y 8 dígitos
  return cleaned.length >= 6 && cleaned.length <= 8;
}

/**
 * Formatea una cédula uruguaya
 */
export function formatCI(ci: string): string {
  const cleaned = ci.replace(/\D/g, '');
  if (cleaned.length < 6) return ci;
  
  // Formato: X.XXX.XXX-X
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 1)}.${cleaned.slice(1, 4)}.${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 7) {
    return `${cleaned.slice(0, 1)}.${cleaned.slice(1, 4)}.${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
  }
  
  return cleaned;
}
