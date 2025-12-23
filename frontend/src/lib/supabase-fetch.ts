// Cliente Supabase usando Fetch directo (más rápido y confiable)
// Soluciona problemas de timeout del cliente JS

// Limpiar posibles caracteres de salto de línea en las variables de entorno
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/[\r\n]/g, '');
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/[\r\n]/g, '');

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

// Verificar si un JWT está expirado
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // convertir a milisegundos
    return Date.now() >= exp;
  } catch {
    return true; // Si no se puede decodificar, asumimos expirado
  }
}

// Obtener token de sesión del localStorage
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    // Primero intentar con el store de Zustand (marlocookies-auth)
    const zustandStore = localStorage.getItem('marlocookies-auth');
    if (zustandStore) {
      const parsed = JSON.parse(zustandStore);
      if (parsed.state?.token) {
        // Verificar si el token no está expirado
        if (!isTokenExpired(parsed.state.token)) {
          return parsed.state.token;
        } else {
          console.warn('⚠️ Token expirado en Zustand store');
        }
      }
    }
    
    // Fallback: buscar en formato Supabase nativo
    const storageKey = `sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.access_token && !isTokenExpired(parsed.access_token)) {
        return parsed.access_token;
      }
    }
  } catch (e) {
    console.error('Error getting access token:', e);
  }
  return null;
}

// Fetch base con auth
async function supabaseFetch<T>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<{ data: T | null; error: any; count?: number }> {
  const accessToken = getAccessToken();
  
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': options.method === 'GET' ? 'count=exact' : 'return=representation',
    ...options.headers,
  };

  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    console.log(`🔗 Supabase ${options.method || 'GET'}: ${endpoint}`);
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const contentRange = response.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : undefined;

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`❌ Supabase error (${options.method || 'GET'} ${endpoint}):`, error);
      return { data: null, error, count };
    }

    const data = await response.json();
    console.log(`✅ Supabase ${options.method || 'GET'} ${endpoint}: OK`, Array.isArray(data) ? `(${data.length} items)` : '');
    return { data, error: null, count };
  } catch (error: any) {
    console.error(`❌ Supabase fetch error:`, error);
    return { data: null, error: { message: error.message } };
  }
}

// ==================== PRODUCTOS ====================
export const productsDB = {
  getAll: async (activeOnly = true) => {
    const filter = activeOnly ? '&activo=eq.true' : '';
    const { data, error } = await supabaseFetch<any[]>(`products?select=*${filter}`);
    
    // Ordenar por categoría: cookies primero, luego bebidas, luego boxes, luego otros
    if (data) {
      const categoryOrder: { [key: string]: number } = {
        'cookies': 1,
        'bebidas': 2,
        'boxes': 3,
        'otros': 4
      };
      
      data.sort((a, b) => {
        const orderA = categoryOrder[a.categoria] || 999;
        const orderB = categoryOrder[b.categoria] || 999;
        if (orderA !== orderB) return orderA - orderB;
        return a.nombre.localeCompare(b.nombre); // Alfabético dentro de categoría
      });
    }
    
    return { data, error };
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabaseFetch<any[]>(`products?id=eq.${id}`);
    return { data: data?.[0] || null, error };
  },
  
  create: async (product: any) => {
    return supabaseFetch<any>('products', { 
      method: 'POST', 
      body: product,
      headers: { 'Prefer': 'return=representation' }
    });
  },
  
  update: async (id: string, updates: any) => {
    return supabaseFetch<any>(`products?id=eq.${id}`, { 
      method: 'PATCH', 
      body: updates 
    });
  },
  
  delete: async (id: string) => {
    return supabaseFetch<any>(`products?id=eq.${id}`, { 
      method: 'DELETE'
    });
  },

  // Descontar stock de un producto
  decrementStock: async (id: string, quantity: number) => {
    console.log(`📉 decrementStock llamado: id=${id}, quantity=${quantity}`);
    
    // Usar import dinámico para el cliente de Supabase
    const { supabase } = await import('@/lib/supabase/client');
    
    // Primero obtenemos el stock actual
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError || !product) {
      console.error('❌ Error obteniendo producto para descontar stock:', fetchError, 'ID:', id);
      return { success: false, error: fetchError || 'Producto no encontrado' };
    }
    
    const productData = product as any;
    const currentStock = productData.stock || 0;
    const newStock = Math.max(0, currentStock - quantity);
    
    console.log(`📊 Stock: actual=${currentStock}, a descontar=${quantity}, nuevo=${newStock}`);
    
    // Usar el cliente de Supabase directamente para el update
    const { data: updateResult, error: updateError } = await supabase
      .from('products')
      // @ts-expect-error - Ignorar error de tipos para compatibilidad
      .update({ stock: newStock })
      .eq('id', id)
      .select();
    
    console.log('📝 Resultado update:', { updateResult, updateError });
    
    if (updateError) {
      console.error('❌ Error actualizando stock:', updateError);
      return { success: false, error: updateError };
    }
    
    console.log(`✅ Stock actualizado: ${productData.nombre} ${currentStock} -> ${newStock}`);
    return { success: true, newStock, productName: productData.nombre };
  },

  // Descontar stock de múltiples productos (para pedidos)
  decrementStockBulk: async (items: { productId: string; quantity: number }[]) => {
    const results = [];
    for (const item of items) {
      const result = await productsDB.decrementStock(item.productId, item.quantity);
      results.push({ ...item, ...result });
    }
    return results;
  },
};

// ==================== ZONAS DE ENVÍO ====================
export const zonesDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('delivery_zones?select=*&order=order_priority');
  },
  
  getAvailable: async () => {
    return supabaseFetch<any[]>('delivery_zones?select=*&available=eq.true&order=order_priority');
  },
  
  update: async (id: string, updates: any) => {
    return supabaseFetch<any>(`delivery_zones?id=eq.${id}`, { 
      method: 'PATCH', 
      body: updates 
    });
  },
  
  create: async (zone: any) => {
    return supabaseFetch<any>('delivery_zones', { 
      method: 'POST', 
      body: zone 
    });
  },
  
  delete: async (id: string) => {
    return supabaseFetch<any>(`delivery_zones?id=eq.${id}`, { 
      method: 'DELETE'
    });
  },
};

// ==================== ÓRDENES ====================
export const ordersDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('orders?select=*,users(nombre,apellido,email,telefono),order_items(*)&order=created_at.desc');
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabaseFetch<any[]>(
      `orders?id=eq.${id}&select=*,users(nombre,apellido,email,telefono,puntos),order_items(*)`
    );
    return { data: data?.[0] || null, error };
  },
  
  // Obtener pedidos del usuario autenticado
  getUserOrders: async (userId: string) => {
    return supabaseFetch<any[]>(
      `orders?user_id=eq.${userId}&select=*,order_items(*)&order=created_at.desc`
    );
  },
  
  // Obtener pedidos activos del usuario (preparando, listo o en_camino)
  getActiveOrders: async (userId: string) => {
    // Usar in() en vez de or() para evitar problemas de sintaxis
    return supabaseFetch<any[]>(
      `orders?user_id=eq.${userId}&estado=in.(preparando,listo,en_camino)&select=id,estado,total,created_at,direccion,tipo_entrega,order_items(nombre,cantidad)&order=created_at.desc&limit=3`
    );
  },
  
  // Contar pedidos pendientes de pago (efectivo/transferencia no entregados)
  getPendingPaymentOrdersCount: async (userId: string) => {
    // Pedidos con método efectivo o transferencia que NO están entregados ni cancelados
    const { data, error } = await supabaseFetch<any[]>(
      `orders?user_id=eq.${userId}&metodo_pago=in.(efectivo,transferencia)&estado=in.(preparando,listo,en_camino)&select=id`
    );
    return { count: data?.length || 0, error };
  },
  
  create: async (order: any) => {
    return supabaseFetch<any>('orders', { 
      method: 'POST', 
      body: order,
      headers: { 'Prefer': 'return=representation' }
    });
  },
  
  updateStatus: async (id: string, estado: string) => {
    console.log(`Actualizando pedido ${id} a estado: ${estado}`);
    const result = await supabaseFetch<any>(`orders?id=eq.${id}`, { 
      method: 'PATCH', 
      body: { estado },
      headers: { 'Prefer': 'return=representation' }
    });
    console.log('Resultado actualización:', result);
    return result;
  },
  
  confirmTransfer: async (id: string) => {
    return supabaseFetch<any>(`orders?id=eq.${id}`, { 
      method: 'PATCH', 
      body: { transferencia_confirmada: true },
      headers: { 'Prefer': 'return=representation' }
    });
  },
  
  update: async (id: string, data: any) => {
    return supabaseFetch<any>(`orders?id=eq.${id}`, { 
      method: 'PATCH', 
      body: data,
      headers: { 'Prefer': 'return=representation' }
    });
  },
};

// ==================== ORDER ITEMS ====================
export const orderItemsDB = {
  create: async (items: any[]) => {
    return supabaseFetch<any>('order_items', { 
      method: 'POST', 
      body: items,
      headers: { 'Prefer': 'return=representation' }
    });
  },
};

// ==================== USUARIOS ====================
export const usersDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('users?select=*&order=created_at.desc');
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabaseFetch<any[]>(`users?id=eq.${id}`);
    return { data: data?.[0] || null, error };
  },
  
  getByEmail: async (email: string) => {
    const { data, error } = await supabaseFetch<any[]>(`users?email=eq.${encodeURIComponent(email)}`);
    return { data: data?.[0] || null, error };
  },
  
  create: async (user: any) => {
    return supabaseFetch<any>('users', { 
      method: 'POST', 
      body: user,
      headers: { 'Prefer': 'return=representation' }
    });
  },
  
  update: async (id: string, updates: any) => {
    return supabaseFetch<any>(`users?id=eq.${id}`, { 
      method: 'PATCH', 
      body: updates 
    });
  },
  
  // Actualizar puntos del usuario
  updatePoints: async (id: string, puntos: number) => {
    return supabaseFetch<any>(`users?id=eq.${id}`, { 
      method: 'PATCH', 
      body: { puntos } 
    });
  },
};

// ==================== CUPONES ====================
export const couponsDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('coupons?select=*&order=created_at.desc');
  },
  
  getByCode: async (code: string) => {
    const { data, error } = await supabaseFetch<any[]>(
      `coupons?code=eq.${encodeURIComponent(code)}&activo=eq.true`
    );
    return { data: data?.[0] || null, error };
  },
  
  // Verificar si el usuario ya usó este cupón
  checkUserUsage: async (couponId: string, userId: string) => {
    const { data, error } = await supabaseFetch<any[]>(
      `coupon_uses?coupon_id=eq.${couponId}&user_id=eq.${userId}`
    );
    return { hasUsed: (data && data.length > 0), error };
  },
  
  // Registrar uso del cupón
  registerUsage: async (couponId: string, orderId: string, userId: string, discountApplied: number) => {
    return supabaseFetch<any>('coupon_uses', { 
      method: 'POST', 
      body: {
        coupon_id: couponId,
        order_id: orderId,
        user_id: userId,
        discount_applied: discountApplied
      }
    });
  },
  
  // Incrementar contador de usos
  incrementUsage: async (couponId: string) => {
    // Primero obtener el valor actual
    const { data } = await supabaseFetch<any[]>(`coupons?id=eq.${couponId}&select=usos_actuales`);
    const currentUses = data?.[0]?.usos_actuales || 0;
    
    return supabaseFetch<any>(`coupons?id=eq.${couponId}`, { 
      method: 'PATCH', 
      body: { usos_actuales: currentUses + 1 }
    });
  },
  
  create: async (coupon: any) => {
    return supabaseFetch<any>('coupons', { 
      method: 'POST', 
      body: coupon 
    });
  },
  
  update: async (id: string, updates: any) => {
    return supabaseFetch<any>(`coupons?id=eq.${id}`, { 
      method: 'PATCH', 
      body: updates 
    });
  },
  
  delete: async (id: string) => {
    return supabaseFetch<any>(`coupons?id=eq.${id}`, { 
      method: 'DELETE' 
    });
  },
};

// ==================== POSTULACIONES ====================
export const jobApplicationsDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('job_applications?select=*&order=created_at.desc');
  },
  
  update: async (id: string, updates: any) => {
    return supabaseFetch<any>(`job_applications?id=eq.${id}`, { 
      method: 'PATCH', 
      body: updates 
    });
  },
};

// ==================== STATS ====================
export const statsDB = {
  get: async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const [ordersAllRes, ordersTodayRes, productsRes, usersRes, usersTodayRes] = await Promise.all([
      supabaseFetch<any[]>('orders?select=total,estado'),
      supabaseFetch<any[]>(`orders?select=total,estado&created_at=gte.${today}T00:00:00`),
      supabaseFetch<any[]>('products?select=id,stock'),
      supabaseFetch<any[]>('users?select=id'),
      supabaseFetch<any[]>(`users?select=id&created_at=gte.${today}T00:00:00`),
    ]);

    const allOrders = ordersAllRes.data || [];
    const todayOrders = ordersTodayRes.data || [];
    const products = productsRes.data || [];
    
    return {
      data: {
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter(o => o.estado === 'preparando' || o.estado === 'listo').length,
        todayOrders: todayOrders.length,
        totalRevenue: allOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.stock < 10).length,
        totalCustomers: usersRes.data?.length || 0,
        newCustomersToday: usersTodayRes.data?.length || 0,
      },
      error: null,
    };
  },
};

// ==================== AUTH (REST API directo) ====================
const AUTH_URL = `${SUPABASE_URL}/auth/v1`;

// Storage key para tokens
const getStorageKey = () => `sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`;

// Cache de usuario en memoria para evitar llamadas repetidas
let cachedUser: any = null;
let cachedSession: any = null;

export const authDB = {
  // Login con email/password - REST directo
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${AUTH_URL}/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { 
          data: null, 
          error: { message: data.error_description || data.msg || 'Error de autenticación' } 
        };
      }

      // Guardar sesión en localStorage (formato compatible con Supabase JS)
      const session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        expires_in: data.expires_in,
        token_type: data.token_type,
        user: data.user,
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(getStorageKey(), JSON.stringify(session));
      }
      
      // Actualizar cache
      cachedSession = session;
      cachedUser = data.user;

      // Obtener datos completos del usuario desde public.users
      const { data: userData, error: userError } = await usersDB.getById(data.user.id);
      
      // Si no existe en public.users, crear registro
      if (!userData && !userError) {
        const newUser = {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.user_metadata?.nombre || email.split('@')[0],
          apellido: data.user.user_metadata?.apellido || '',
          telefono: data.user.user_metadata?.telefono || '',
          puntos: 0,
          rol: 'cliente',
        };
        await usersDB.create(newUser);
        return { data: { session, user: data.user, userData: newUser }, error: null };
      }

      return { data: { session, user: data.user, userData }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Error de conexión' } };
    }
  },

  // Registro de usuario
  signup: async (data: { email: string; password: string; nombre: string; apellido?: string; telefono?: string; fecha_cumpleanos?: string }) => {
    try {
      const response = await fetch(`${AUTH_URL}/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          data: {
            nombre: data.nombre,
            apellido: data.apellido || '',
            telefono: data.telefono || '',
            fecha_cumpleanos: data.fecha_cumpleanos || null,
          },
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { 
          data: null, 
          error: { message: result.error_description || result.msg || 'Error en registro' } 
        };
      }

      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Error de conexión' } };
    }
  },

  // Logout
  logout: async () => {
    const token = getAccessToken();
    
    if (token) {
      try {
        await fetch(`${AUTH_URL}/logout`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (e) {
        // Ignorar errores de logout
      }
    }
    
    // Limpiar localStorage y cache
    if (typeof window !== 'undefined') {
      localStorage.removeItem(getStorageKey());
    }
    cachedUser = null;
    cachedSession = null;
    
    return { error: null };
  },

  // Obtener sesión actual (desde cache/localStorage, sin llamada a red)
  getSession: () => {
    if (cachedSession) return { data: { session: cachedSession }, error: null };
    
    if (typeof window === 'undefined') return { data: { session: null }, error: null };
    
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const session = JSON.parse(stored);
        // Verificar si no ha expirado
        if (session.expires_at && session.expires_at > Math.floor(Date.now() / 1000)) {
          cachedSession = session;
          cachedUser = session.user;
          return { data: { session }, error: null };
        }
      }
    } catch (e) {
      console.error('Error parsing session:', e);
    }
    
    return { data: { session: null }, error: null };
  },

  // Obtener usuario actual (desde cache, sin llamada a red)
  getUser: () => {
    const { data } = authDB.getSession();
    return { data: { user: data?.session?.user || null }, error: null };
  },

  // Obtener usuario con datos completos de public.users
  getCurrentUserWithProfile: async () => {
    const { data } = authDB.getSession();
    if (!data?.session?.user?.id) {
      return { data: null, error: { message: 'No hay sesión activa' } };
    }
    
    return usersDB.getById(data.session.user.id);
  },

  // Refrescar token si está por expirar
  refreshSession: async () => {
    if (typeof window === 'undefined') return { data: null, error: null };
    
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (!stored) return { data: null, error: null };
      
      const session = JSON.parse(stored);
      if (!session.refresh_token) return { data: null, error: null };
      
      // Solo refrescar si expira en menos de 60 segundos
      const expiresIn = session.expires_at - Math.floor(Date.now() / 1000);
      if (expiresIn > 60) return { data: { session }, error: null };
      
      const response = await fetch(`${AUTH_URL}/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });

      if (!response.ok) {
        // Token inválido, limpiar
        localStorage.removeItem(getStorageKey());
        cachedSession = null;
        cachedUser = null;
        return { data: null, error: { message: 'Session expired' } };
      }

      const data = await response.json();
      const newSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        expires_in: data.expires_in,
        token_type: data.token_type,
        user: data.user,
      };
      
      localStorage.setItem(getStorageKey(), JSON.stringify(newSession));
      cachedSession = newSession;
      cachedUser = data.user;
      
      return { data: { session: newSession }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  // Verificar si hay sesión válida
  isAuthenticated: () => {
    const { data } = authDB.getSession();
    return !!data?.session?.access_token;
  },

  // Obtener ID del usuario actual
  getCurrentUserId: (): string | null => {
    const { data } = authDB.getSession();
    return data?.session?.user?.id || null;
  },

  // Cambiar contraseña
  updatePassword: async (newPassword: string) => {
    const token = getAccessToken();
    if (!token) return { error: { message: 'No hay sesión activa' } };
    
    try {
      const response = await fetch(`${AUTH_URL}/user`, {
        method: 'PUT',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: { message: data.message || 'Error al cambiar contraseña' } };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },
};

// ==================== STORAGE (Imágenes) ====================
const STORAGE_BUCKET = 'product-images';

export const storageDB = {
  // Verificar si el bucket existe
  checkBucket: async (): Promise<boolean> => {
    try {
      const url = `${SUPABASE_URL}/storage/v1/bucket/${STORAGE_BUCKET}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Subir imagen de producto (el File ya debe estar en memoria)
  uploadProductImage: async (file: File, productName?: string): Promise<{ url: string | null; error: any }> => {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      console.error('❌ No hay sesión activa para subir imágenes');
      return { url: null, error: { message: 'Debes iniciar sesión para subir imágenes' } };
    }
    
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const safeName = productName 
      ? productName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)
      : 'product';
    const fileName = `${safeName}-${timestamp}.${fileExt}`;
    
    // Determinar content-type
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
    };
    const contentType = file.type || mimeTypes[fileExt] || 'image/jpeg';
    
    try {
      const url = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${fileName}`;
      console.log(`📤 Subiendo a Supabase: ${fileName}`);
      console.log(`📦 Tamaño: ${(file.size / 1024).toFixed(1)}KB`);
      
      // El archivo ya está en memoria (Blob), enviarlo directamente
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: file, // File extiende Blob, funciona directamente
      });

      console.log(`📡 Response: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || response.statusText };
        }
        
        // Mensaje de error más descriptivo
        if (response.status === 404) {
          console.error('❌ Bucket no encontrado. Debes crear el bucket "product-images" en Supabase Storage');
          return { url: null, error: { message: 'El bucket de storage no existe. Créalo en Supabase Dashboard > Storage > New bucket > "product-images"' } };
        }
        if (response.status === 403) {
          console.error('❌ Sin permisos para subir. Verifica las políticas RLS del bucket');
          return { url: null, error: { message: 'Sin permisos para subir imágenes. Verifica las políticas del bucket en Supabase.' } };
        }
        
        console.error('❌ Error subiendo imagen:', errorData);
        return { url: null, error: errorData };
      }

      // Construir URL pública
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
      console.log(`✅ Imagen subida: ${publicUrl}`);
      
      return { url: publicUrl, error: null };
    } catch (error: any) {
      console.error('❌ Error en upload:', error);
      
      // Error de red o CORS
      if (error.message === 'Failed to fetch') {
        return { 
          url: null, 
          error: { 
            message: 'Error de conexión. Verifica que el bucket "product-images" exista en Supabase Storage y sea público.' 
          } 
        };
      }
      
      return { url: null, error: { message: error.message } };
    }
  },

  // Eliminar imagen del storage
  deleteImage: async (imageUrl: string): Promise<{ error: any }> => {
    const accessToken = getAccessToken();
    
    // Extraer el nombre del archivo de la URL
    const fileName = imageUrl.split(`${STORAGE_BUCKET}/`).pop();
    if (!fileName) {
      return { error: { message: 'URL de imagen inválida' } };
    }
    
    try {
      const url = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${fileName}`;
      console.log(`🗑️ Eliminando imagen: ${fileName}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        console.error('❌ Error eliminando imagen:', error);
        return { error };
      }

      console.log('✅ Imagen eliminada');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Error en delete:', error);
      return { error: { message: error.message } };
    }
  },

  // Obtener URL pública de una imagen
  getPublicUrl: (bucket: string, fileName: string): string => {
    if (fileName.startsWith('http')) return fileName;
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
  },

  // Subir archivo a un bucket específico (genérico)
  upload: async (bucket: string, fileName: string, file: File): Promise<{ data: any; error: any }> => {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      return { data: null, error: { message: 'Debes iniciar sesión para subir archivos' } };
    }
    
    // Determinar content-type
    const contentType = file.type || 'image/jpeg';
    
    try {
      const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;
      console.log(`📤 Subiendo a ${bucket}: ${fileName}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: file,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || response.statusText };
        }
        console.error('❌ Error subiendo archivo:', errorData);
        return { data: null, error: errorData };
      }

      const data = await response.json().catch(() => ({}));
      console.log(`✅ Archivo subido a ${bucket}`);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error en upload:', error);
      return { data: null, error: { message: error.message } };
    }
  },
};

// Alias para compatibilidad
// ==================== CONFIGURACIÓN DEL SITIO ====================
export const siteSettingsDB = {
  get: async () => {
    const { data, error } = await supabaseFetch<any[]>('site_settings?id=eq.main');
    return { data: data?.[0] || null, error };
  },
  
  update: async (updates: { 
    promo_text?: string; 
    promo_link?: string | null; 
    promo_active?: boolean;
    limited_banner_title?: string;
    limited_banner_subtitle?: string;
    limited_banner_gradient?: string;
    limited_banner_active?: boolean;
    limited_banner_products?: string[];
    limited_banner_show_images?: boolean;
    business_hours?: any;
  }) => {
    return supabaseFetch<any>('site_settings?id=eq.main', { 
      method: 'PATCH', 
      body: { ...updates, updated_at: new Date().toISOString() }
    });
  },
};

// ==================== IMÁGENES FLOTANTES (HOME) ====================
export const floatingImagesDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('floating_images?select=*&order=orden');
  },
  
  getActive: async () => {
    return supabaseFetch<any[]>('floating_images?activo=eq.true&select=*&order=orden');
  },
  
  create: async (image: { imagen_url: string; orden?: number; activo?: boolean }) => {
    return supabaseFetch<any>('floating_images', { 
      method: 'POST', 
      body: image,
      headers: { 'Prefer': 'return=representation' }
    });
  },
  
  update: async (id: string, updates: { imagen_url?: string; orden?: number; activo?: boolean }) => {
    return supabaseFetch<any>(`floating_images?id=eq.${id}`, { 
      method: 'PATCH', 
      body: updates
    });
  },
  
  delete: async (id: string) => {
    return supabaseFetch<any>(`floating_images?id=eq.${id}`, { 
      method: 'DELETE'
    });
  },
};

// ==================== BANNERS PROMOCIONALES ====================
export const promoBannersDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('promo_banners?select=*&order=orden');
  },
  
  getActive: async () => {
    return supabaseFetch<any[]>('promo_banners?activo=eq.true&select=*&order=orden');
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabaseFetch<any[]>(`promo_banners?id=eq.${id}`);
    return { data: data?.[0] || null, error };
  },
  
  create: async (banner: { texto: string; link?: string | null; activo?: boolean; orden?: number }) => {
    return supabaseFetch<any>('promo_banners', { 
      method: 'POST', 
      body: banner,
      headers: { 'Prefer': 'return=representation' }
    });
  },
  
  update: async (id: string, updates: { texto?: string; link?: string | null; activo?: boolean; orden?: number }) => {
    return supabaseFetch<any>(`promo_banners?id=eq.${id}`, { 
      method: 'PATCH', 
      body: { ...updates, updated_at: new Date().toISOString() }
    });
  },
  
  delete: async (id: string) => {
    return supabaseFetch<any>(`promo_banners?id=eq.${id}`, { 
      method: 'DELETE'
    });
  },
};

// ==================== SUSCRIPTORES ====================
export const subscribersDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('newsletter_subscribers?select=*&order=created_at.desc');
  },

  // Obtener suscriptores con información de usuarios si están registrados
  getAllWithUserInfo: async () => {
    const { data: subscribers, error } = await supabaseFetch<any[]>('newsletter_subscribers?select=*&order=created_at.desc');
    if (error || !subscribers) return { data: [], error };

    // Obtener usuarios para enlazar
    const { data: users } = await supabaseFetch<any[]>('users?select=id,email,nombre,apellido,telefono,puntos,created_at');
    
    // Obtener estadísticas de pedidos
    const { data: orders } = await supabaseFetch<any[]>('orders?select=user_id,total,estado');
    
    // Mapear suscriptores con info de usuario
    const enrichedSubscribers = subscribers.map(sub => {
      // Buscar usuario por email o por user_id
      const user = users?.find(u => u.email === sub.email || u.id === sub.user_id);
      
      if (user) {
        // Calcular estadísticas de compras
        const userOrders = orders?.filter(o => o.user_id === user.id && o.estado !== 'cancelado') || [];
        const totalCompras = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        
        return {
          ...sub,
          es_usuario_registrado: true,
          user_id: user.id,
          telefono_usuario: user.telefono,
          nombre_completo: `${user.nombre || ''} ${user.apellido || ''}`.trim(),
          puntos_usuario: user.puntos || 0,
          total_pedidos: userOrders.length,
          total_compras: totalCompras,
          fecha_registro_usuario: user.created_at
        };
      }
      
      return {
        ...sub,
        es_usuario_registrado: false
      };
    });
    
    return { data: enrichedSubscribers, error: null };
  },
  
  create: async (subscriber: { 
    email?: string; 
    nombre?: string; 
  }) => {
    return supabaseFetch<any>('newsletter_subscribers', { 
      method: 'POST', 
      body: {
        email: subscriber.email,
        nombre: subscriber.nombre || '',
        activo: true
      },
      headers: { 'Prefer': 'return=representation' }
    });
  },

  // Suscribir con detección automática de usuario
  subscribe: async (data: { 
    email: string; 
    nombre?: string; 
  }) => {
    // Primero verificar si ya está suscrito
    const { data: existing } = await supabaseFetch<any[]>(
      `newsletter_subscribers?email=eq.${encodeURIComponent(data.email)}&select=id`
    );
    
    if (existing && existing.length > 0) {
      // Ya está suscrito, retornar éxito silencioso
      return { data: existing[0], error: null };
    }

    // Buscar si el email está en la tabla de usuarios para obtener nombre
    const { data: users } = await supabaseFetch<any[]>(`users?email=eq.${encodeURIComponent(data.email)}`);
    const user = users?.[0];

    // Crear suscriptor (solo columnas que existen: email, nombre, activo)
    return supabaseFetch<any>('newsletter_subscribers', { 
      method: 'POST', 
      body: {
        email: data.email,
        nombre: data.nombre || user?.nombre || '',
        activo: true
      },
      headers: { 'Prefer': 'return=representation' }
    });
  },
  
  delete: async (id: string) => {
    return supabaseFetch<any>(`newsletter_subscribers?id=eq.${id}`, { method: 'DELETE' });
  },

  // Exportar como CSV
  exportCSV: async () => {
    const { data } = await subscribersDB.getAll();
    if (!data) return '';
    
    const headers = ['Email', 'Nombre', 'Activo', 'Fecha'];
    const rows = data.map(s => [
      s.email || '',
      s.nombre || '',
      s.activo ? 'Sí' : 'No',
      new Date(s.created_at).toLocaleDateString('es-UY')
    ]);
    
    return [headers, ...rows].map(r => r.join(',')).join('\n');
  }
};

// ==================== PEDIDOS POR MAYOR (WHOLESALE) ====================
export const wholesaleDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('wholesale_requests?select=*&order=created_at.desc');
  },

  getById: async (id: string) => {
    const { data, error } = await supabaseFetch<any[]>(`wholesale_requests?id=eq.${id}`);
    return { data: data?.[0] || null, error };
  },

  create: async (request: {
    nombre: string;
    email: string;
    telefono: string;
    empresa?: string;
    tipo_negocio?: string;
    cantidad_estimada?: string;
    productos_interes?: string;
    mensaje?: string;
    user_id?: string;
  }) => {
    return supabaseFetch<any>('wholesale_requests', { 
      method: 'POST', 
      body: request,
      headers: { 'Prefer': 'return=representation' }
    });
  },

  update: async (id: string, updates: any) => {
    return supabaseFetch<any>(`wholesale_requests?id=eq.${id}`, { 
      method: 'PATCH', 
      body: { ...updates, updated_at: new Date().toISOString() }
    });
  },

  delete: async (id: string) => {
    return supabaseFetch<any>(`wholesale_requests?id=eq.${id}`, { method: 'DELETE' });
  },

  // Stats
  getStats: async () => {
    const { data } = await wholesaleDB.getAll();
    if (!data) return { total: 0, pendientes: 0, contactados: 0, aprobados: 0 };
    
    return {
      total: data.length,
      pendientes: data.filter(r => r.estado === 'pendiente').length,
      contactados: data.filter(r => r.estado === 'contactado').length,
      en_negociacion: data.filter(r => r.estado === 'en_negociacion').length,
      aprobados: data.filter(r => r.estado === 'aprobado').length,
      rechazados: data.filter(r => r.estado === 'rechazado').length
    };
  }
};

// ==================== POP-UPS ====================
export const popupsDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('popups?select=*&order=created_at.desc');
  },
  
  getActive: async (pagina?: string) => {
    // Traemos todos los activos y filtramos en cliente para evitar problemas con OR en REST
    const result = await supabaseFetch<any[]>('popups?select=*&activo=eq.true&order=created_at.desc');
    if (result.data && pagina) {
      result.data = result.data.filter(p => 
        !p.mostrar_en || p.mostrar_en === 'todas' || p.mostrar_en === pagina
      );
    }
    return result;
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabaseFetch<any[]>(`popups?id=eq.${id}`);
    return { data: data?.[0] || null, error };
  },
  
  create: async (popup: any) => {
    return supabaseFetch<any>('popups', { 
      method: 'POST', 
      body: popup,
      headers: { 'Prefer': 'return=representation' }
    });
  },
  
  update: async (id: string, updates: any) => {
    return supabaseFetch<any>(`popups?id=eq.${id}`, { 
      method: 'PATCH', 
      body: { ...updates, updated_at: new Date().toISOString() }
    });
  },
  
  delete: async (id: string) => {
    return supabaseFetch<any>(`popups?id=eq.${id}`, { method: 'DELETE' });
  },
  
  // Generar cupón desde popup
  generateCoupon: async (popupId: string, email: string) => {
    try {
      const { data: { session } } = await import('@/lib/supabase/client').then(m => m.supabase.auth.getSession());
      const accessToken = session?.access_token || getAccessToken();
      
      if (!accessToken) {
        console.error('No hay token de acceso');
        return { data: null, error: { message: 'No hay sesión activa' } };
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/generate_coupon_from_popup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          p_popup_id: popupId,
          p_email: email
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: { message: errorText } };
      }

      const result = await response.json();
      return { data: result, error: null };
    } catch (err: any) {
      console.error('Error generando cupón:', err);
      return { data: null, error: err };
    }
  },
};

// ==================== HISTORIAL DE PUNTOS ====================
export const loyaltyHistoryDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('loyalty_history?select=*&order=created_at.desc');
  },
  
  getByUser: async (userId: string) => {
    return supabaseFetch<any[]>(`loyalty_history?user_id=eq.${userId}&order=created_at.desc`);
  },
  
  create: async (entry: { 
    user_id: string; 
    tipo: 'ganado' | 'canjeado'; 
    puntos: number; 
    concepto: string; 
    order_id?: string 
  }) => {
    return supabaseFetch<any>('loyalty_history', { 
      method: 'POST', 
      body: { ...entry, created_at: new Date().toISOString() },
      headers: { 'Prefer': 'return=representation' }
    });
  },
};

export const authHelpers = {
  getCurrentUserId: authDB.getCurrentUserId,
  getCurrentUser: authDB.getCurrentUserWithProfile,
  isAuthenticated: authDB.isAuthenticated,
  getSession: authDB.getSession,
};

// ==================== BANNERS PROMOCIONALES ====================
// ==================== FEATURED CARDS (HOME) ====================
export const featuredCardsDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('featured_cards?select=*&order=orden.asc');
  },
  
  getActive: async () => {
    return supabaseFetch<any[]>('featured_cards?activo=eq.true&select=*&order=orden.asc');
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabaseFetch<any[]>(`featured_cards?id=eq.${id}`);
    return { data: data?.[0] || null, error };
  },
  
  create: async (card: any) => {
    return supabaseFetch<any>('featured_cards', { 
      method: 'POST', 
      body: card,
      headers: { 'Prefer': 'return=representation' }
    });
  },
  
  update: async (id: string, updates: any) => {
    return supabaseFetch<any>(`featured_cards?id=eq.${id}`, { 
      method: 'PATCH', 
      body: { ...updates, updated_at: new Date().toISOString() }
    });
  },
  
  delete: async (id: string) => {
    return supabaseFetch<any>(`featured_cards?id=eq.${id}`, { method: 'DELETE' });
  },
};

export const bannersDB = {
  getAll: async () => {
    return supabaseFetch<any[]>('promo_banners?select=*&order=orden.asc');
  },
  
  getActive: async () => {
    const now = new Date().toISOString();
    // Traer activos donde fecha_inicio <= ahora y (fecha_fin es null o >= ahora)
    const result = await supabaseFetch<any[]>('promo_banners?select=*&activo=eq.true&order=orden.asc');
    if (result.data) {
      result.data = result.data.filter(b => {
        const inicioOk = !b.fecha_inicio || new Date(b.fecha_inicio) <= new Date();
        const finOk = !b.fecha_fin || new Date(b.fecha_fin) >= new Date();
        return inicioOk && finOk;
      });
    }
    return result;
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabaseFetch<any[]>(`promo_banners?id=eq.${id}`);
    return { data: data?.[0] || null, error };
  },
  
  create: async (banner: any) => {
    return supabaseFetch<any>('promo_banners', { 
      method: 'POST', 
      body: banner,
      headers: { 'Prefer': 'return=representation' }
    });
  },
  
  update: async (id: string, updates: any) => {
    return supabaseFetch<any>(`promo_banners?id=eq.${id}`, { 
      method: 'PATCH', 
      body: { ...updates, updated_at: new Date().toISOString() }
    });
  },
  
  delete: async (id: string) => {
    return supabaseFetch<any>(`promo_banners?id=eq.${id}`, { method: 'DELETE' });
  },
  
  toggleActive: async (id: string, activo: boolean) => {
    return supabaseFetch<any>(`promo_banners?id=eq.${id}`, { 
      method: 'PATCH', 
      body: { activo, updated_at: new Date().toISOString() }
    });
  },
  
  reorder: async (banners: { id: string; orden: number }[]) => {
    // Actualizar orden de múltiples banners
    const promises = banners.map(b => 
      supabaseFetch<any>(`promo_banners?id=eq.${b.id}`, { 
        method: 'PATCH', 
        body: { orden: b.orden }
      })
    );
    return Promise.all(promises);
  }
};

export default {
  products: productsDB,
  zones: zonesDB,
  orders: ordersDB,
  orderItems: orderItemsDB,
  users: usersDB,
  coupons: couponsDB,
  jobApplications: jobApplicationsDB,
  stats: statsDB,
  auth: authDB,
  siteSettings: siteSettingsDB,
  storage: storageDB,
  subscribers: subscribersDB,
  wholesale: wholesaleDB,
  banners: bannersDB,
};
