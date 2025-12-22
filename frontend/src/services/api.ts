// Servicio API centralizado para comunicación con el backend
import type { 
  User, 
  Product, 
  Order, 
  ApiResponse, 
  PaginatedResponse,
  ProductFilters,
  CheckoutForm,
  ContactForm,
  LoyaltyHistory
} from '@/types';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Clase de error personalizada
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper para manejar respuestas
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.message || `Error ${response.status}`
    );
  }
  return response.json();
}

// Helper para obtener token de autenticación
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const authStore = localStorage.getItem('marlo-auth-store');
    if (!authStore) return null;
    
    const parsed = JSON.parse(authStore);
    return parsed.state?.user?.token || null;
  } catch {
    return null;
  }
}

// Helper para construir headers
function buildHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// ==================== AUTH ====================

export const authApi = {
  // Login
  login: async (email: string, password: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: buildHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<ApiResponse<User>>(response);
  },

  // Registro
  register: async (userData: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono?: string;
  }): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: buildHeaders(false),
      body: JSON.stringify(userData),
    });
    return handleResponse<ApiResponse<User>>(response);
  },

  // Verificar sesión
  verifySession: async (): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: buildHeaders(true),
    });
    return handleResponse<ApiResponse<User>>(response);
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: buildHeaders(true),
    });
    return handleResponse<ApiResponse<void>>(response);
  },
};

// ==================== PRODUCTS ====================

export const productsApi = {
  // Obtener todos los productos
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const url = `${API_BASE_URL}/products?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(false),
    });
    return handleResponse<PaginatedResponse<Product>>(response);
  },

  // Obtener producto por ID
  getById: async (id: string | number): Promise<ApiResponse<Product>> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: buildHeaders(false),
    });
    return handleResponse<ApiResponse<Product>>(response);
  },

  // Obtener productos por categoría
  getByCategory: async (categoria: string): Promise<PaginatedResponse<Product>> => {
    const response = await fetch(`${API_BASE_URL}/products?categoria=${categoria}`, {
      method: 'GET',
      headers: buildHeaders(false),
    });
    return handleResponse<PaginatedResponse<Product>>(response);
  },

  // Buscar productos
  search: async (query: string): Promise<PaginatedResponse<Product>> => {
    const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: buildHeaders(false),
    });
    return handleResponse<PaginatedResponse<Product>>(response);
  },
};

// ==================== ORDERS ====================

export const ordersApi = {
  // Crear orden
  create: async (orderData: CheckoutForm & { items: any[] }): Promise<ApiResponse<Order>> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(orderData),
    });
    return handleResponse<ApiResponse<Order>>(response);
  },

  // Obtener órdenes del usuario
  getUserOrders: async (userId: string): Promise<PaginatedResponse<Order>> => {
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
      method: 'GET',
      headers: buildHeaders(true),
    });
    return handleResponse<PaginatedResponse<Order>>(response);
  },

  // Obtener orden por ID
  getById: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: buildHeaders(true),
    });
    return handleResponse<ApiResponse<Order>>(response);
  },

  // Cancelar orden
  cancel: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: buildHeaders(true),
    });
    return handleResponse<ApiResponse<Order>>(response);
  },
};

// ==================== LOYALTY ====================

export const loyaltyApi = {
  // Obtener puntos del usuario
  getPoints: async (userId: string): Promise<ApiResponse<{ puntos: number }>> => {
    const response = await fetch(`${API_BASE_URL}/loyalty/points/${userId}`, {
      method: 'GET',
      headers: buildHeaders(true),
    });
    return handleResponse<ApiResponse<{ puntos: number }>>(response);
  },

  // Obtener historial de puntos
  getHistory: async (userId: string): Promise<PaginatedResponse<LoyaltyHistory>> => {
    const response = await fetch(`${API_BASE_URL}/loyalty/history/${userId}`, {
      method: 'GET',
      headers: buildHeaders(true),
    });
    return handleResponse<PaginatedResponse<LoyaltyHistory>>(response);
  },

  // Canjear recompensa
  redeemReward: async (userId: string, rewardId: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/loyalty/redeem`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({ userId, rewardId }),
    });
    return handleResponse<ApiResponse<any>>(response);
  },

  // Usar puntos en compra
  usePoints: async (userId: string, points: number, orderId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/loyalty/use-points`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({ userId, points, orderId }),
    });
    return handleResponse<ApiResponse<any>>(response);
  },
};

// ==================== USERS ====================

export const usersApi = {
  // Obtener perfil
  getProfile: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: buildHeaders(true),
    });
    return handleResponse<ApiResponse<User>>(response);
  },

  // Actualizar perfil
  updateProfile: async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify(userData),
    });
    return handleResponse<ApiResponse<User>>(response);
  },

  // Cambiar contraseña
  changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse<ApiResponse<void>>(response);
  },
};

// ==================== CONTACT ====================

export const contactApi = {
  // Enviar mensaje de contacto
  sendMessage: async (formData: ContactForm): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: buildHeaders(false),
      body: JSON.stringify(formData),
    });
    return handleResponse<ApiResponse<void>>(response);
  },
};

// ==================== NEWSLETTER ====================

export const newsletterApi = {
  // Suscribirse al newsletter
  subscribe: async (email: string, nombre?: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: buildHeaders(false),
      body: JSON.stringify({ email, nombre }),
    });
    return handleResponse<ApiResponse<void>>(response);
  },
};

// Exportar todo el API como objeto
export const api = {
  auth: authApi,
  products: productsApi,
  orders: ordersApi,
  loyalty: loyaltyApi,
  users: usersApi,
  contact: contactApi,
  newsletter: newsletterApi,
};

export default api;
