// Tipos globales del sistema MarLo Cookies

// Usuario
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fecha_cumpleanos?: string;
  puntos: number;
  avatar?: string;
  direccion?: string;
  zona?: string;
  region?: string;
  codigo_postal?: string;
  createdAt?: string;
}

// Producto
export interface Product {
  id: string | number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  imagen?: string;
  stock?: number;
  esLimitado?: boolean;
  activo?: boolean;
  ingredientes?: string[];
  alergenos?: string[];
}

// Item del carrito
export interface CartItem {
  id: string | number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  categoria?: string;
}

// Pedido
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  envio: number;
  descuento: number;
  total: number;
  estado: OrderStatus;
  metodoPago: PaymentMethod;
  direccionEnvio: Address;
  puntosGanados: number;
  puntosUsados: number;
  notas?: string;
  createdAt: string;
  updatedAt?: string;
}

// Item de pedido
export interface OrderItem {
  id: string;
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

// Dirección
export interface Address {
  direccion: string;
  comuna: string;
  region: string;
  codigoPostal?: string;
  referencia?: string;
}

// Estados de pedido
export type OrderStatus = 'preparando' | 'en_camino' | 'entregado' | 'cancelado';

// Métodos de pago
export type PaymentMethod = 'efectivo' | 'transferencia' | 'mercadopago';

// Historial de puntos
export interface LoyaltyHistory {
  id: string;
  userId: string;
  tipo: 'ganado' | 'canjeado';
  puntos: number;
  concepto: string;
  fecha: string;
  pedidoId?: string;
}

// Recompensa
export interface Reward {
  id: number;
  nombre: string;
  puntos: number;
  descripcion: string;
  icon: string;
  disponible?: boolean;
  destacado?: boolean;
}

// Notificación
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// Box personalizado
export interface CustomBox {
  size: number;
  precio: number;
  cookies: Array<{
    productoId: string;
    nombre: string;
    cantidad: number;
  }>;
}

// Cupón de descuento
export interface Coupon {
  code: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number;
  minimo?: number;
  validoHasta?: string;
  activo: boolean;
}

// Edición limitada
export interface LimitedEdition {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  icon: string;
  disponibleHasta: string;
  stock: number;
  color?: string;
}

// Configuración del sistema
export interface SystemConfig {
  puntosActivados: boolean;
  envioGratis: number;
  costoEnvio: number;
  puntosXPeso: number;
  maxDescuentoPuntos: number;
  horariosAtencion: BusinessHour[];
}

// Horario de atención
export interface BusinessHour {
  day: string;
  hours: string;
  open: boolean;
}

// Respuesta API genérica
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Paginación
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filtros de productos
export interface ProductFilters {
  categoria?: string;
  precioMin?: number;
  precioMax?: number;
  enStock?: boolean;
  limitados?: boolean;
  busqueda?: string;
  ordenar?: 'precio-asc' | 'precio-desc' | 'nombre' | 'nuevo';
}

// Estadísticas de usuario
export interface UserStats {
  totalPedidos: number;
  totalGastado: number;
  puntosAcumulados: number;
  puntosDisponibles: number;
  ultimoPedido?: string;
}

// Formulario de contacto
export interface ContactForm {
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}

// Formulario de checkout
export interface CheckoutForm {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  comuna: string;
  region: string;
  notas?: string;
  metodoPago: PaymentMethod;
  usarPuntos: boolean;
}

// Props comunes de componentes
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Variantes de componentes
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

// Toast notification
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
  timestamp: number;
}
