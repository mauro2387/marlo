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

// Horarios de atención
export const BUSINESS_HOURS = [
  { day: 'Miércoles - Lunes', hours: '15:00 - 20:00', open: true },
  { day: 'Martes', hours: 'Cerrado', open: false },
];

// Función para verificar si está abierto ahora
export const isOpenNow = (): { open: boolean; message: string } => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hour + minutes / 60;

  // Martes (2) está cerrado
  if (dayOfWeek === 2) {
    return { open: false, message: 'Cerrado - Abrimos mañana a las 15:00' };
  }

  // Miércoles a Lunes: 15:00 - 20:00
  if (currentTime >= 15 && currentTime < 20) {
    return { open: true, message: 'Abierto Ahora - Cierra a las 20:00' };
  }

  // Fuera del horario de atención
  if (currentTime < 15) {
    return { open: false, message: dayOfWeek === 1 ? 'Cerrado - Abrimos mañana a las 15:00' : 'Cerrado - Abrimos hoy a las 15:00' };
  } else {
    return { open: false, message: dayOfWeek === 1 ? 'Cerrado - Abrimos mañana a las 15:00' : 'Cerrado - Abrimos mañana a las 15:00' };
  }
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
