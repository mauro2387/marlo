// Configuración general de la aplicación

export const APP_CONFIG = {
  name: 'MarLo Cookies',
  tagline: 'Artesanales & Deliciosas',
  description: 'Las mejores cookies artesanales de Uruguay, hechas con amor y los mejores ingredientes.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1',
};

// Información de contacto
export const CONTACT_INFO = {
  phone: '(+598) 97 865 053',
  email: 'marlocookies2@gmail.com',
  emailRRHH: 'rrhhmarlocookies@gmail.com',
  address: 'Av. Juan Gorlero casi 25',
  city: 'Punta del Este',
  country: 'Uruguay',
  whatsapp: '+59897865053',
  whatsappNumber: '59897865053', // Sin + para links wa.me
};

// Redes sociales
export const SOCIAL_MEDIA = {
  instagram: 'https://www.instagram.com/marlo_cookies',
  facebook: 'https://www.facebook.com/profile.php?id=61580225619685',
  tiktok: 'https://www.tiktok.com/@marlo_cookies',
};

// Horarios de atención (formato por día)
// Ahora soporta múltiples rangos horarios separados por coma (ej: "9:00 - 13:00, 15:00 - 20:00")
export interface BusinessHour {
  day: string;
  hours: string; // Puede ser "HH:MM - HH:MM" o múltiples rangos separados por coma
  open: boolean;
  dayIndex?: number; // 0=Domingo, 1=Lunes... 6=Sábado
}

export const BUSINESS_HOURS: BusinessHour[] = [
  { day: 'Lunes', hours: '15:00 - 22:00', open: true, dayIndex: 1 },
  { day: 'Martes', hours: '15:00 - 22:00', open: true, dayIndex: 2 },
  { day: 'Miércoles', hours: '15:00 - 22:00', open: true, dayIndex: 3 },
  { day: 'Jueves', hours: '15:00 - 22:00', open: true, dayIndex: 4 },
  { day: 'Viernes', hours: '15:00 - 22:00', open: true, dayIndex: 5 },
  { day: 'Sábado', hours: '15:00 - 22:00', open: true, dayIndex: 6 },
  { day: 'Domingo', hours: '15:00 - 22:00', open: true, dayIndex: 0 },
];

// Nombres de días en español
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Parsear hora "15:00" a número decimal
const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes || 0) / 60;
};

// Parsear múltiples rangos horarios (ej: "9:00 - 13:00, 15:00 - 20:00")
const parseTimeRanges = (hoursString: string): Array<{open: number, close: number, openStr: string, closeStr: string}> => {
  const ranges = hoursString.split(',').map(range => range.trim());
  const parsed: Array<{open: number, close: number, openStr: string, closeStr: string}> = [];
  
  for (const range of ranges) {
    const match = range.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (match) {
      parsed.push({
        open: parseTime(match[1]),
        close: parseTime(match[2]),
        openStr: match[1],
        closeStr: match[2]
      });
    }
  }
  
  return parsed;
};

// Función para verificar si está abierto ahora
export const isOpenNow = (hours?: BusinessHour[]): { open: boolean; message: string } => {
  const businessHours = hours || BUSINESS_HOURS;
  
  // Usar hora de Uruguay (UTC-3)
  const now = new Date();
  const uruguayTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Montevideo' }));
  
  const dayOfWeek = uruguayTime.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const currentHour = uruguayTime.getHours();
  const currentMinutes = uruguayTime.getMinutes();
  const currentTime = currentHour + currentMinutes / 60;
  const todayName = DAY_NAMES[dayOfWeek];
  
  // Formato de fecha actual para buscar horarios especiales (ej: "24/12")
  const dayOfMonth = uruguayTime.getDate();
  const month = uruguayTime.getMonth() + 1;
  const todayDate = `${dayOfMonth}/${month}`;
  const todayDatePadded = `${dayOfMonth.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
  
  console.log(`[isOpenNow] Hora Uruguay: ${currentHour}:${currentMinutes.toString().padStart(2, '0')}, Día: ${todayName}, Fecha: ${todayDate}, currentTime: ${currentTime.toFixed(2)}`);
  
  // PRIMERO buscar horario especial por fecha (ej: "24/12", "25/12")
  let todaySchedule = businessHours.find(h => 
    h.day === todayDate || h.day === todayDatePadded || h.day.includes(todayDate)
  );
  
  console.log(`[isOpenNow] Horario especial encontrado para ${todayDate}:`, todaySchedule);
  
  // Si no hay horario especial, buscar por día de la semana
  if (!todaySchedule) {
    todaySchedule = businessHours.find(h => 
      h.dayIndex === dayOfWeek || h.day === todayName || h.day.includes(todayName)
    );
    console.log(`[isOpenNow] Horario por día de semana (${todayName}):`, todaySchedule);
  }
  
  console.log(`[isOpenNow] Horario encontrado:`, todaySchedule);
  
  // Si no hay horario para hoy
  if (!todaySchedule) {
    const nextOpenDay = findNextOpenDay(businessHours, dayOfWeek);
    return { 
      open: false, 
      message: nextOpenDay ? `Cerrado - Abrimos ${nextOpenDay}` : 'Cerrado' 
    };
  }
  
  // Si está explícitamente cerrado (open: false O hours: "Cerrado")
  const isClosed = todaySchedule.open === false || todaySchedule.hours.toLowerCase() === 'cerrado';
  if (isClosed) {
    const nextOpenDay = findNextOpenDay(businessHours, dayOfWeek);
    return { 
      open: false, 
      message: nextOpenDay ? `Cerrado - Abrimos ${nextOpenDay}` : 'Cerrado' 
    };
  }
  
  // Parsear todos los rangos horarios del día
  const timeRanges = parseTimeRanges(todaySchedule.hours);
  
  console.log(`[isOpenNow] Rangos horarios:`, timeRanges);
  
  if (timeRanges.length === 0) {
    return { open: false, message: 'Horario no disponible' };
  }
  
  // Verificar si estamos dentro de algún rango horario
  for (const range of timeRanges) {
    console.log(`[isOpenNow] Verificando rango ${range.openStr}-${range.closeStr}: currentTime(${currentTime.toFixed(2)}) >= open(${range.open}) && < close(${range.close})`);
    
    // Caso especial: horario que cruza medianoche (ej: 15:00 - 01:00)
    if (range.close < range.open) {
      // El cierre es "mañana", entonces estamos abiertos si:
      // - currentTime >= apertura (ej: 22:00 >= 15:00) O
      // - currentTime < cierre (ej: 00:30 < 01:00)
      if (currentTime >= range.open || currentTime < range.close) {
        return { open: true, message: `Abierto ahora - Cierra a las ${range.closeStr}` };
      }
    } else {
      // Horario normal que no cruza medianoche
      if (currentTime >= range.open && currentTime < range.close) {
        return { open: true, message: `Abierto ahora - Cierra a las ${range.closeStr}` };
      }
    }
  }
  
  // No estamos en ningún rango abierto, buscar próxima apertura
  // Primero ver si abrimos más tarde hoy
  const futureRanges = timeRanges.filter(r => {
    // Para horarios que cruzan medianoche, si estamos después del cierre pero antes de la apertura
    if (r.close < r.open) {
      // Si ya pasó el cierre nocturno (ej: son las 10:00 y cerró a las 01:00)
      // y aún no llegó la apertura (ej: abre a las 15:00)
      return currentTime >= r.close && currentTime < r.open;
    }
    // Horario normal: verificar si aún no llegó la apertura
    return currentTime < r.open;
  });
  if (futureRanges.length > 0) {
    const nextRange = futureRanges[0];
    return { open: false, message: `Cerrado - Abrimos hoy a las ${nextRange.openStr}` };
  }
  
  // Si no, buscar próximo día abierto
  const nextOpenDay = findNextOpenDay(businessHours, dayOfWeek);
  return { 
    open: false, 
    message: nextOpenDay ? `Cerrado - Abrimos ${nextOpenDay}` : 'Cerrado' 
  };
};

// Encontrar próximo día que abre
const findNextOpenDay = (hours: BusinessHour[], currentDay: number): string | null => {
  for (let i = 1; i <= 7; i++) {
    const checkDay = (currentDay + i) % 7;
    const dayName = DAY_NAMES[checkDay];
    const schedule = hours.find(h => 
      h.dayIndex === checkDay || h.day === dayName || h.day.includes(dayName)
    );
    
    if (schedule && schedule.open && schedule.hours.toLowerCase() !== 'cerrado') {
      const timeRanges = parseTimeRanges(schedule.hours);
      if (timeRanges.length > 0) {
        const openTime = timeRanges[0].openStr;
        
        if (i === 1) {
          return `mañana a las ${openTime}`;
        }
        return `el ${dayName} a las ${openTime}`;
      }
    }
  }
  return null;
};

// Sistema de puntos
export const LOYALTY_CONFIG = {
  pointsPerPeso: 1, // $1 = 1 punto
  maxDiscountPercent: 30, // Máximo 30% de descuento con puntos
  pointsToMoneyRatio: 100, // 100 puntos = $1 descuento
  rewards: [
    { id: 1, name: '1 Café + 1 Cookie Gratis', points: 2000, icon: '☕' },
    { id: 2, name: 'Box 4 Unidades Gratis', points: 5000, icon: '📦' },
    { id: 3, name: 'Box 6 Unidades Gratis', points: 10000, icon: '🎁' },
    { id: 4, name: 'Cookie Edición Limitada', points: 2500, icon: '⭐' },
    { id: 5, name: '15% Descuento', points: 3000, icon: '💰' },
  ],
};

// Configuración de envíos
export const SHIPPING_CONFIG = {
  standardShippingCost: 80, // Costo de envío estándar
  estimatedDays: '1', // Días estimados de entrega
  regions: ['Maldonado'], // Departamentos con envío disponible
};

// Métodos de pago
export const PAYMENT_METHODS = [
  { 
    id: 'efectivo', 
    name: 'Efectivo contra entrega', 
    icon: '💵',
    description: 'Paga en efectivo cuando recibas tu pedido',
    available: true 
  },
  { 
    id: 'transferencia', 
    name: 'Transferencia Bancaria', 
    icon: '🏦',
    description: 'Recibirás los datos por email para transferir',
    available: true 
  },
  { 
    id: 'mercadopago', 
    name: 'Mercado Pago', 
    icon: '💳',
    description: 'Paga con tarjeta de crédito o débito',
    available: false 
  },
];

// Estados de pedidos
export const ORDER_STATUSES = {
  preparando: { label: 'Preparando', color: 'bg-blue-100 text-blue-700', icon: '👨‍🍳' },
  en_camino: { label: 'En Camino', color: 'bg-yellow-100 text-yellow-700', icon: '🚚' },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-700', icon: '✅' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: '❌' },
};

// Categorías de productos
export const PRODUCT_CATEGORIES = [
  { id: 'clasicas', name: 'Cookies Clásicas', icon: '🍪' },
  { id: 'premium', name: 'Premium', icon: '⭐' },
  { id: 'boxes', name: 'Box', icon: '📦' },
  { id: 'limitadas', name: 'Edición Limitada', icon: '💜' },
  { id: 'otros', name: 'Otros', icon: '🍰' },
];

// Tamaños de box disponibles
export const BOX_SIZES = [
  { id: 4, name: 'Box x4', precio: 540, ahorro: 60 },
  { id: 6, name: 'Box x6', precio: 800, ahorro: 80 },
  { id: 9, name: 'Box x9', precio: 1200, ahorro: 120 },
];

// Reglas de validación
export const VALIDATION_RULES = {
  phone: {
    pattern: /^(\+598|0)?9\d{7}$/,
    message: 'Formato: 09X XXX XXX o +598 9X XXX XXX',
  },
  email: {
    pattern: /\S+@\S+\.\S+/,
    message: 'Email inválido',
  },
  password: {
    minLength: 6,
    message: 'Mínimo 6 caracteres',
  },
};

// Mensajes del sistema
export const MESSAGES = {
  success: {
    itemAdded: '¡Producto agregado al carrito!',
    orderPlaced: '¡Pedido confirmado! Recibirás un email con los detalles',
    profileUpdated: 'Perfil actualizado correctamente',
    passwordChanged: 'Contraseña cambiada exitosamente',
  },
  error: {
    generic: 'Algo salió mal. Intenta nuevamente',
    emptyCart: 'Tu carrito está vacío',
    invalidForm: 'Por favor completa todos los campos correctamente',
    networkError: 'Error de conexión. Verifica tu internet',
  },
  info: {
    pointsEarned: 'Ganarás {points} puntos con esta compra',
    processing: 'Procesando tu pedido...',
  },
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  duration: {
    success: 3000,
    error: 5000,
    info: 4000,
    warning: 4000,
  },
  position: 'top-right',
  maxVisible: 3,
};

// Meta tags para SEO
export const SEO_CONFIG = {
  defaultTitle: 'MarLo Cookies - Las Mejores Cookies Artesanales de Uruguay',
  titleTemplate: '%s | MarLo Cookies',
  defaultDescription: 'Cookies artesanales hechas con los mejores ingredientes. Envío a domicilio en Maldonado. Programa de puntos y box personalizados.',
  keywords: [
    'cookies artesanales',
    'cookies maldonado',
    'cookies uruguay',
    'postres',
    'repostería',
    'box personalizados',
    'delivery maldonado',
    'cookies punta del este',
  ],
};
