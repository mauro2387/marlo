// API Optimizada con caché para MarLo Cookies
// Versión rápida con fetch directo y caché local

import { setCache, getCache, getCacheWithFallback, invalidateCache, CACHE_CONFIG } from '@/lib/cache';
import { productsDB, zonesDB, ordersDB, orderItemsDB, authDB, usersDB } from '@/lib/supabase-fetch';
import { supabase } from '@/lib/supabase/client';

// Tipos
export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string | null;
  stock: number;
  es_limitado: boolean;
  activo: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  cost: number;
  estimated_time: string;
  available: boolean;
  order_priority: number;
}

// ==================== PRODUCTOS OPTIMIZADOS ====================

export const productsAPI = {
  // Obtener todos los productos con caché
  getAll: async (forceRefresh = false): Promise<Product[]> => {
    // Si no forzamos refresh, buscar en caché
    if (!forceRefresh) {
      const cached = getCache<Product[]>(CACHE_CONFIG.products);
      if (cached) {
        console.log('📦 Productos desde caché');
        return cached;
      }
    }

    // Si hay datos stale, usarlos mientras cargamos nuevos
    const { data: staleData } = getCacheWithFallback<Product[]>(CACHE_CONFIG.products);

    try {
      console.log('🔄 Cargando productos...');
      const { data, error } = await productsDB.getAll(true);

      if (error || !data) {
        console.error('Error cargando productos:', error);
        if (staleData) {
          console.log('⚠️ Usando datos en caché (stale)');
          return staleData;
        }
        return getDefaultProducts();
      }

      const products = data as Product[];
      
      // Guardar en caché
      setCache(CACHE_CONFIG.products, products);
      console.log('✅ Productos cargados:', products.length);
      
      return products;
    } catch (err) {
      console.error('Error de red:', err);
      return staleData || getDefaultProducts();
    }
  },

  // Obtener por categoría (usa caché de todos los productos)
  getByCategory: async (categoria: string): Promise<Product[]> => {
    const all = await productsAPI.getAll();
    if (categoria === 'todas' || !categoria) return all;
    return all.filter(p => p.categoria === categoria);
  },

  // Obtener producto por ID
  getById: async (id: string): Promise<Product | null> => {
    const all = await productsAPI.getAll();
    return all.find(p => p.id === id) || null;
  },

  // Invalidar caché (después de crear/editar producto)
  invalidate: () => {
    invalidateCache(CACHE_CONFIG.products);
    console.log('🗑️ Caché de productos invalidado');
  },
};

// ==================== ZONAS DE DELIVERY OPTIMIZADAS ====================

export const zonesAPI = {
  getAll: async (forceRefresh = false): Promise<DeliveryZone[]> => {
    if (!forceRefresh) {
      const cached = getCache<DeliveryZone[]>(CACHE_CONFIG.zones);
      if (cached) {
        return cached;
      }
    }

    const { data: staleData } = getCacheWithFallback<DeliveryZone[]>(CACHE_CONFIG.zones);

    try {
      const { data, error } = await zonesDB.getAll();

      if (!error && data && data.length > 0) {
        setCache(CACHE_CONFIG.zones, data);
        return data as DeliveryZone[];
      }

      const defaultZones = getDefaultZones();
      setCache(CACHE_CONFIG.zones, defaultZones);
      return defaultZones;
    } catch (err) {
      return staleData || getDefaultZones();
    }
  },

  invalidate: () => invalidateCache(CACHE_CONFIG.zones),
};

// ==================== PEDIDOS OPTIMIZADOS ====================

export const ordersAPI = {
  create: async (orderData: any) => {
    const userId = authDB.getCurrentUserId();
    
    if (!userId) {
      throw new Error('Debes iniciar sesión para realizar un pedido');
    }

    console.log('🛒 Iniciando creación de pedido para usuario:', userId);

    // Verificar/crear usuario en public.users si no existe
    const { data: existingUser, error: userCheckError } = await usersDB.getById(userId);
    if (!existingUser && !userCheckError) {
      console.log('📝 Usuario no existe en public.users, creando...');
      const { data: sessionData } = authDB.getSession();
      const user = sessionData?.session?.user;
      if (user) {
        await usersDB.create({
          id: userId,
          email: user.email || '',
          nombre: user.user_metadata?.nombre || orderData.customer_name || 'Cliente',
          apellido: user.user_metadata?.apellido || '',
          telefono: orderData.customer_phone || '',
          puntos: 0,
        });
      }
    }

    // Preparar datos con nombres de columnas correctos según esquema DB
    const orderPayload = {
      user_id: userId,
      customer_name: orderData.customer_name || 'Cliente',
      customer_email: orderData.customer_email || '',
      customer_phone: orderData.customer_phone || '',
      subtotal: orderData.subtotal,
      envio: orderData.shipping_cost || 0,
      descuento: (orderData.discount_coupon || 0) + (orderData.discount_points || 0),
      total: orderData.total,
      estado: orderData.estado || 'preparando', // Usar estado pasado o 'preparando' por defecto
      metodo_pago: orderData.payment_method || 'efectivo',
      direccion: orderData.address || 'Retiro en local',
      comuna: orderData.zone || 'Maldonado',
      region: orderData.department || 'Maldonado',
      notas: orderData.notes || null,
      puntos_ganados: orderData.points_earned || 0,
      puntos_usados: orderData.points_used || 0,
      tipo_entrega: orderData.delivery_type || 'delivery', // retiro o delivery
      transfer_alias: orderData.transfer_alias || null, // Alias de transferencia para confirmar pago
    };

    console.log('📦 Creando orden con payload:', orderPayload);
    
    const { data: orderResult, error: orderError } = await ordersDB.create(orderPayload);

    console.log('📦 Resultado de crear orden:', { orderResult, orderError });

    if (orderError) {
      console.error('❌ Error creando orden:', orderError);
      throw new Error(orderError?.message || 'Error creando orden');
    }

    // Extraer el pedido del resultado (puede venir como array o como objeto)
    const order = Array.isArray(orderResult) ? orderResult[0] : orderResult;
    
    if (!order || !order.id) {
      console.error('❌ No se obtuvo ID de orden:', order);
      throw new Error('No se pudo crear el pedido');
    }
    
    const orderId = order.id;
    console.log('✅ Orden creada con ID:', orderId);
    
    // Crear items usando el mismo método de auth que la orden
    if (orderData.items?.length > 0) {
      // Función para validar si es un UUID válido
      const isValidUUID = (str: string) => {
        if (!str) return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };
      
      // Columnas reales: order_id, product_id, nombre, precio, cantidad, subtotal, cookies_incluidas
      const orderItems = orderData.items.map((item: any) => {
        const nombre = item.nombre || item.name || 'Producto';
        const cantidad = item.cantidad || item.quantity || 1;
        const precio = item.precio || item.unit_price || 0;
        const productId = item.product_id || item.id;
        
        return {
          order_id: orderId,
          product_id: isValidUUID(productId) ? productId : null, // Solo UUID válidos
          nombre: nombre,
          cantidad: cantidad,
          precio: precio,
          subtotal: precio * cantidad,
          cookies_incluidas: item.cookies_incluidas || null,
        };
      });

      console.log('📝 Creando items para orden:', orderId, orderItems);
      
      const { data: result, error } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();
      
      if (error) {
        console.error('❌ Error creando items:', error);
      } else {
        console.log('✅ Items creados:', result?.length);
      }
      
      // ===== DESCONTAR STOCK (siempre, incluso si hay error en items) =====
      console.log('📉 Descontando stock de productos...');
      
      // Preparar items para descontar stock
      const stockUpdates: { productId: string; quantity: number }[] = [];
      
      for (const item of orderData.items) {
        const productId = item.product_id || item.id;
        const cantidad = item.cantidad || item.quantity || 1;
        
        console.log('📦 Procesando item:', { productId, cantidad, item });
        
        // Si es un producto normal con UUID válido
        if (isValidUUID(productId)) {
          stockUpdates.push({ productId, quantity: cantidad });
          console.log('✅ Agregado a stock updates:', productId, cantidad);
        } else {
          console.log('⚠️ UUID no válido:', productId);
        }
        
        // Si es un box con cookies incluidas, descontar stock de cada cookie
        let cookiesIncluidas = item.cookiesIncluidas || item.cookies_incluidas;
        
        // Si es string, parsear a JSON
        if (typeof cookiesIncluidas === 'string') {
          try {
            cookiesIncluidas = JSON.parse(cookiesIncluidas);
          } catch (e) {
            console.error('Error parseando cookies_incluidas:', e);
            cookiesIncluidas = null;
          }
        }
        
        if (cookiesIncluidas && Array.isArray(cookiesIncluidas)) {
          console.log('🍪 Box con cookies:', cookiesIncluidas);
          for (const cookie of cookiesIncluidas) {
            if (isValidUUID(cookie.id)) {
              // Multiplicar por cantidad de boxes
              const totalCookies = cookie.cantidad * cantidad;
              stockUpdates.push({ productId: cookie.id, quantity: totalCookies });
              console.log('✅ Cookie agregada:', cookie.id, totalCookies);
            }
          }
        }
      }
      
      // Ejecutar actualizaciones de stock
      console.log('📉 Stock updates a ejecutar:', stockUpdates);
      if (stockUpdates.length > 0) {
        const stockResults = await productsDB.decrementStockBulk(stockUpdates);
        console.log('📉 Resultados de stock:', stockResults);
        
        // Invalidar caché de productos para que se recarguen con stock actualizado
        invalidateCache(CACHE_CONFIG.products);
        console.log('🗑️ Caché de productos invalidado');
      } else {
        console.warn('⚠️ No hay stock updates para ejecutar');
      }
    } else {
      console.warn('⚠️ No hay items para crear');
    }

    return order;
  },

  getUserOrders: async () => {
    const userId = authDB.getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await ordersDB.getUserOrders(userId);
    if (error) {
      console.error('Error obteniendo pedidos:', error);
      return [];
    }
    return data || [];
  },
};

// ==================== ADMIN API OPTIMIZADA ====================

export const adminAPI = {
  products: productsDB,
  orders: ordersDB,
  stats: {
    get: async () => {
      const cached = getCache<any>(CACHE_CONFIG.stats);
      if (cached) return cached;

      // Usar stats de supabase-fetch
      const { data } = await import('@/lib/supabase-fetch').then(m => m.statsDB.get());
      
      if (data) {
        setCache(CACHE_CONFIG.stats, data);
      }
      return data;
    },
  },
};

// ==================== DATOS POR DEFECTO ====================

function getDefaultProducts(): Product[] {
  return [
    { id: '1', nombre: 'Cookie Choco Chip', descripcion: 'Clásica con chips de chocolate', precio: 120, categoria: 'cookies', imagen: '🍪', stock: 50, es_limitado: false, activo: true },
    { id: '2', nombre: 'Cookie Red Velvet', descripcion: 'Suave sabor a terciopelo rojo', precio: 140, categoria: 'cookies', imagen: '❤️', stock: 30, es_limitado: false, activo: true },
    { id: '3', nombre: 'Cookie Oreo', descripcion: 'Con trozos de Oreo', precio: 150, categoria: 'cookies', imagen: '⚫', stock: 25, es_limitado: false, activo: true },
    { id: '4', nombre: 'Box 6 Cookies', descripcion: 'Caja de 6 cookies a elección', precio: 650, categoria: 'boxes', imagen: '📦', stock: 20, es_limitado: false, activo: true },
    { id: '5', nombre: 'Box 12 Cookies', descripcion: 'Caja de 12 cookies a elección', precio: 1200, categoria: 'boxes', imagen: '📦', stock: 15, es_limitado: false, activo: true },
    { id: '6', nombre: 'Coca Cola 500ml', descripcion: 'Bebida refrescante', precio: 80, categoria: 'bebidas', imagen: '🥤', stock: 100, es_limitado: false, activo: true },
    { id: '7', nombre: 'Agua Mineral 500ml', descripcion: 'Agua pura', precio: 50, categoria: 'bebidas', imagen: '💧', stock: 100, es_limitado: false, activo: true },
  ];
}

function getDefaultZones(): DeliveryZone[] {
  return [
    { id: '1', name: 'Centro Maldonado', cost: 80, estimated_time: '30-45 min', available: true, order_priority: 1 },
    { id: '2', name: 'Punta del Este', cost: 120, estimated_time: '45-60 min', available: true, order_priority: 2 },
    { id: '3', name: 'La Barra', cost: 150, estimated_time: '60-75 min', available: true, order_priority: 3 },
    { id: '4', name: 'San Carlos', cost: 100, estimated_time: '40-55 min', available: true, order_priority: 4 },
    { id: '5', name: 'Retiro en Local', cost: 0, estimated_time: 'Inmediato', available: true, order_priority: 0 },
  ];
}

export default {
  products: productsAPI,
  zones: zonesAPI,
  orders: ordersAPI,
  admin: adminAPI,
};
