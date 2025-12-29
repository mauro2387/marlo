// Servicio API usando Supabase directamente
// Sistema completo para MarLo Cookies - Maldonado, Uruguay
import { createClient } from '@supabase/supabase-js';
import type {
  User,
  Product,
  Order,
  CheckoutForm,
  ContactForm,
  LoyaltyHistory,
  CartItem,
} from '@/types';

// Cliente sin tipos estrictos para flexibilidad
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type CheckoutFormData = CheckoutForm;
type ContactFormData = ContactForm;

// Configuración para WhatsApp
const WHATSAPP_NUMBER = '59897865053'; // Número de WhatsApp del negocio

// ==================== AUTH ====================

export const authService = {
  // Registro con Supabase Auth
  register: async (data: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    telefono?: string;
  }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono,
        },
      },
    });

    if (authError) throw authError;

    // El trigger handle_new_user creará automáticamente el registro en public.users
    return authData;
  },

  // Login con Supabase Auth
  login: async (email: string, password: string) => {
    // Log removido por seguridad
    
    try {
      // Timeout de 10 segundos para evitar que se quede colgado
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La conexión tardó demasiado')), 10000);
      });
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Error en supabase.auth.signInWithPassword:', error);
        throw error;
      }
      
      // Auth exitoso

      // Obtener datos adicionales del usuario desde public.users
      if (data?.user) {
        console.log('🔍 Buscando usuario en public.users...');
        
        let { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // Búsqueda completada

        // Si no existe el usuario en public.users, crearlo
        if (userError && userError.code === 'PGRST116') {
          console.log('⚠️ Usuario no existe en public.users, creando...');
          const userMeta = data.user.user_metadata;
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              nombre: userMeta?.nombre || data.user.email?.split('@')[0] || 'Usuario',
              apellido: userMeta?.apellido || '',
              telefono: userMeta?.telefono || '',
              puntos: 0,
              rol: 'cliente',
            })
            .select()
            .single();

          if (insertError) {
            console.error('❌ Error creando usuario en public.users:', insertError);
            // Continuar con datos básicos
            userData = {
              id: data.user.id,
              email: data.user.email,
              nombre: userMeta?.nombre || 'Usuario',
              apellido: userMeta?.apellido || '',
              puntos: 0,
              rol: 'cliente',
            } as any;
          } else {
            // Usuario creado
            userData = newUser;
          }
        } else if (userError) {
          console.error('❌ Error buscando usuario:', userError);
          // No lanzar error, usar datos básicos
          userData = {
            id: data.user.id,
            email: data.user.email,
            nombre: data.user.email?.split('@')[0] || 'Usuario',
            apellido: '',
            puntos: 0,
            rol: 'cliente',
          } as any;
        }

        // Retornando datos de usuario
        return { ...data, userData };
      }

      return data;
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      throw err;
    }
  },

  // Logout
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener sesión actual
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    if (!user) return null;

    // Obtener datos completos desde public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;
    return userData;
  },
};

// ==================== PRODUCTS ====================

export const productsService = {
  // Obtener todos los productos
  getAll: async (filters?: {
    categoria?: string;
    enStock?: boolean;
    limitados?: boolean;
  }) => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('activo', true);

    if (filters?.categoria) {
      query = query.eq('categoria', filters.categoria);
    }

    if (filters?.enStock) {
      query = query.gt('stock', 0);
    }

    if (filters?.limitados !== undefined) {
      query = query.eq('es_limitado', filters.limitados);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Ordenar por categoría: cookies primero, luego bebidas, luego otros
    const categoryOrder: { [key: string]: number } = {
      'cookies': 1,
      'bebidas': 2,
      'boxes': 3,
      'otros': 4
    };
    
    return data?.sort((a, b) => {
      const orderA = categoryOrder[a.categoria] || 999;
      const orderB = categoryOrder[b.categoria] || 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.nombre.localeCompare(b.nombre); // Alfabético dentro de categoría
    }) || [];
  },

  // Obtener producto por ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar productos
  search: async (query: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('activo', true)
      .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .order('nombre');

    if (error) throw error;
    return data;
  },

  // Obtener productos por categoría
  getByCategory: async (categoria: string) => {
    const { data, error } = await supabase
      .rpc('get_products_by_category', { category_name: categoria });

    if (error) throw error;
    return data;
  },
};

// ==================== ORDERS ====================

export const ordersService = {
  // Crear orden
  create: async (orderData: any) => {
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    
    // Crear la orden con nombres de columnas del esquema español
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id || user?.id,
        subtotal: orderData.subtotal,
        envio: orderData.shipping_cost || orderData.envio || 0,
        descuento: (orderData.discount_coupon || 0) + (orderData.discount_points || 0),
        total: orderData.total,
        estado: 'preparando',
        metodo_pago: orderData.payment_method || orderData.metodo_pago || 'efectivo',
        direccion: orderData.address || orderData.direccion || 'Retiro en local',
        comuna: orderData.zone || orderData.comuna || 'Maldonado',
        region: orderData.department || orderData.region || 'Maldonado',
        notas: orderData.notes || orderData.notas || null,
        puntos_ganados: orderData.points_earned || orderData.puntos_ganados || 0,
        puntos_usados: orderData.points_used || orderData.puntos_usados || 0,
      } as any)
      .select()
      .single();

    if (orderError) throw orderError;

    // Crear los items de la orden
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map((item: any) => ({
        order_id: (order as any).id,
        product_id: item.product_id || item.id,
        nombre: item.name || item.nombre,
        precio: item.unit_price || item.precio,
        cantidad: item.quantity || item.cantidad,
        subtotal: item.subtotal || ((item.unit_price || item.precio) * (item.quantity || item.cantidad)),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems as any);

      if (itemsError) console.error('Error inserting order items:', itemsError);
    }

    return order;
  },

  // Obtener órdenes del usuario
  getUserOrders: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener orden por ID
  getById: async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  },

  // Cancelar orden (solo si está en estado 'preparando')
  cancel: async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ estado: 'cancelado' })
      .eq('id', orderId)
      .eq('estado', 'preparando')
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ==================== LOYALTY ====================

export const loyaltyService = {
  // Obtener puntos del usuario autenticado
  getPoints: async (userId?: string) => {
    if (userId) {
      // Si se pasa userId, buscar directamente
      const { data, error } = await supabase
        .from('users')
        .select('puntos')
        .eq('id', userId)
        .single();

      if (error) return 0;
      return (data as any)?.puntos || 0;
    }
    
    // Si no se pasa userId, usar usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('users')
      .select('puntos')
      .eq('id', user.id)
      .single();

    if (error) return 0;
    return (data as any)?.puntos || 0;
  },

  // Obtener historial de puntos
  getHistory: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('loyalty_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Canjear recompensa (resta puntos, registra en historial y crea pedido)
  redeemReward: async (rewardId: string | number, points: number, concepto: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Verificar que el usuario tiene suficientes puntos
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('puntos, nombre, apellido, telefono, direccion')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;
    if (userData.puntos < points) {
      throw new Error('Puntos insuficientes');
    }

    // Restar puntos
    const { error: updateError } = await supabase
      .from('users')
      .update({ puntos: userData.puntos - points })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Registrar en historial de lealtad
    const { data: historyData, error: historyError } = await supabase
      .from('loyalty_history')
      .insert({
        user_id: user.id,
        tipo: 'canjeado',
        puntos: points,
        concepto: concepto,
      })
      .select()
      .single();

    if (historyError) throw historyError;

    // Crear pedido para el canje de puntos
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total: 0,
        subtotal: 0,
        descuento: 0,
        envio: 0,
        metodo_pago: 'Puntos',
        metodo_entrega: 'Retiro en local',
        estado: 'Pendiente',
        telefono_contacto: userData.telefono || '',
        notas: `🎁 CANJE DE PUNTOS: ${concepto} (${points} puntos)`,
        puntos_usados: points,
        puntos_ganados: 0,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creando pedido de canje:', orderError);
      // No lanzamos error para no bloquear el canje, ya se restaron los puntos
    }

    // Registrar el canje en reward_redemptions si existe la tabla
    try {
      await supabase
        .from('reward_redemptions')
        .insert({
          user_id: user.id,
          reward_id: String(rewardId),
          puntos_usados: points,
          estado: 'pendiente',
          order_id: orderData?.id || null,
        });
    } catch (e) {
      console.log('Tabla reward_redemptions no disponible');
    }

    return { ...historyData, order_id: orderData?.id };
  },

  // Obtener estadísticas del usuario
  getUserStats: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .rpc('get_user_total_orders', { user_uuid: user.id });

    if (error) throw error;
    return data[0];
  },
};

// ==================== USERS ====================

export const usersService = {
  // Obtener perfil
  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar perfil
  updateProfile: async (userData: Partial<User>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Cambiar contraseña
  changePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },
};

// ==================== CONTACT ====================

export const contactService = {
  // Enviar mensaje de contacto
  sendMessage: async (formData: ContactFormData) => {
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        asunto: formData.asunto,
        mensaje: formData.mensaje,
      });

    if (error) throw error;
  },
};

// ==================== NEWSLETTER ====================

export const newsletterService = {
  // Suscribirse al newsletter
  subscribe: async (email: string, nombre?: string) => {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        nombre,
      });

    if (error) {
      // Si el email ya existe, actualizar a activo
      if (error.code === '23505') {
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ activo: true })
          .eq('email', email);

        if (updateError) throw updateError;
        return;
      }
      throw error;
    }
  },
};

// ==================== CUPONES ====================

export const couponsService = {
  // Validar cupón
  validate: async (code: string, total?: number) => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('activo', true)
      .single();

    if (error || !data) {
      return { valid: false, message: 'Cupón no válido' };
    }
    
    const coupon = data as any;
    
    // Verificar fecha de expiración
    if (coupon.valido_hasta && new Date(coupon.valido_hasta) < new Date()) {
      return { valid: false, message: 'Cupón expirado' };
    }
    
    // Verificar usos restantes
    if (coupon.max_usos && coupon.usos_actuales >= coupon.max_usos) {
      return { valid: false, message: 'Cupón agotado' };
    }
    
    // Verificar monto mínimo
    if (total && coupon.minimo && total < coupon.minimo) {
      return { valid: false, message: `Monto mínimo: $${coupon.minimo}` };
    }
    
    return { valid: true, coupon };
  },

  // Calcular descuento
  apply: async (code: string, subtotal: number) => {
    const result = await couponsService.validate(code, subtotal);
    if (!result.valid || !result.coupon) return 0;
    
    const coupon = result.coupon;
    if (coupon.tipo === 'porcentaje') {
      return Math.round(subtotal * coupon.valor / 100);
    }
    return coupon.valor;
  },

  // Marcar cupón como usado
  use: async (code: string, orderId: string) => {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('id, usos_actuales')
      .eq('code', code.toUpperCase())
      .single();
    
    if (coupon) {
      await supabase
        .from('coupons')
        .update({ usos_actuales: ((coupon as any).usos_actuales || 0) + 1 })
        .eq('id', (coupon as any).id);
    }
  },
};

// ==================== WHATSAPP ====================

export const whatsappService = {
  // Generar link de WhatsApp para pedido
  generateOrderLink: (order: {
    id: string;
    items: any[];
    total: number;
    direccion: string;
    metodoPago: string;
    cliente: string;
  }) => {
    const itemsList = order.items
      .map(item => `• ${item.cantidad}x ${item.nombre} - $${item.precio * item.cantidad}`)
      .join('%0A');
    
    const message = `🍪 *Nuevo Pedido MarLo Cookies*%0A%0A` +
      `📋 *Pedido #${order.id.slice(-8).toUpperCase()}*%0A%0A` +
      `👤 Cliente: ${order.cliente}%0A%0A` +
      `*Productos:*%0A${itemsList}%0A%0A` +
      `💰 *Total: $${order.total}*%0A%0A` +
      `📍 Dirección: ${order.direccion}%0A` +
      `💳 Pago: ${order.metodoPago}%0A%0A` +
      `¡Gracias por tu pedido! 🍪`;
    
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  },

  // Enviar notificación al negocio (abre WhatsApp)
  notifyBusiness: (orderData: any) => {
    const link = whatsappService.generateOrderLink(orderData);
    if (typeof window !== 'undefined') {
      window.open(link, '_blank');
    }
    return link;
  },

  // Enviar confirmación de pedido al cliente
  sendOrderConfirmation: async (orderId: string, customerPhone: string) => {
    // En una implementación real, esto enviaría un mensaje via API de WhatsApp Business
    // Por ahora, solo logueamos y retornamos success
    console.log(`WhatsApp notification for order ${orderId} to ${customerPhone}`);
    
    // Generar link para el negocio notificarse
    const message = `🍪 MarLo Cookies%0A%0A` +
      `¡Gracias por tu pedido!%0A%0A` +
      `Tu pedido #${orderId.slice(-8).toUpperCase()} ha sido recibido.%0A%0A` +
      `Te contactaremos pronto para confirmar los detalles.%0A%0A` +
      `¿Dudas? Escríbenos aquí mismo 😊`;
    
    // En producción, usar WhatsApp Business API
    // Por ahora retornamos el link que podría abrirse
    return {
      success: true,
      link: `https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${message}`
    };
  },
};

// ==================== TRABAJO ====================

export const jobsService = {
  // Enviar postulación
  apply: async (data: {
    position?: string;
    name?: string;
    email?: string;
    phone?: string;
    age?: number | null;
    experience?: string;
    availability?: string;
    motivation?: string;
    cv_url?: string | null;
    // Campos legacy
    nombre?: string;
    telefono?: string;
    puesto?: string;
    mensaje?: string;
    experiencia?: string;
  }) => {
    const insertData = {
      position: data.position || data.puesto,
      name: data.name || data.nombre,
      email: data.email,
      phone: data.phone || data.telefono,
      age: data.age,
      experience: data.experience || data.experiencia,
      availability: data.availability,
      motivation: data.motivation || data.mensaje,
      cv_url: data.cv_url,
    };
    
    const { error } = await supabase
      .from('job_applications')
      .insert(insertData as any);

    if (error) throw error;
  },

  // Obtener puestos disponibles
  getPositions: async () => {
    const { data, error } = await supabase
      .from('job_positions')
      .select('*')
      .eq('activo', true);

    if (error) throw error;
    return data || [];
  },
};

// ==================== ENVÍOS ====================

export const shippingService = {
  // Obtener zonas de envío desde delivery_zones
  getZones: async () => {
    // Intentar primero delivery_zones (tabla principal)
    const { data: zones, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('order_priority');

    if (error || !zones || zones.length === 0) {
      // Si no hay zonas en delivery_zones, intentar shipping_zones
      const { data: shipping, error: shippingError } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      
      if (shippingError || !shipping || shipping.length === 0) {
        // Retornar zonas por defecto
        return [
          { id: '1', name: 'Centro Maldonado', cost: 80, estimated_time: '30-45 min', available: true, order_priority: 1 },
          { id: '2', name: 'Punta del Este', cost: 120, estimated_time: '45-60 min', available: true, order_priority: 2 },
          { id: '3', name: 'San Carlos', cost: 150, estimated_time: '60-90 min', available: true, order_priority: 3 },
          { id: '4', name: 'La Barra', cost: 100, estimated_time: '40-50 min', available: true, order_priority: 4 },
          { id: '5', name: 'Retiro en Local', cost: 0, estimated_time: 'Inmediato', available: true, order_priority: 5 },
        ];
      }
      
      // Mapear shipping_zones a formato de delivery_zones
      return shipping.map((z: any) => ({
        id: z.id,
        name: z.nombre,
        cost: z.precio,
        estimated_time: z.tiempo || '45-60 min',
        available: z.activo !== false,
        order_priority: 0
      }));
    }

    return zones;
  },

  // Calcular costo de envío
  calculateCost: async (zona: string, subtotal: number) => {
    const zones = await shippingService.getZones();
    const zone = zones.find((z: any) => z.name === zona || z.nombre === zona);
    
    return {
      costo: zone?.cost || zone?.precio || 100,
      tiempo: zone?.estimated_time || zone?.tiempo || '45-60 min',
      mensaje: zone ? `Envío a ${zone.name || zone.nombre}` : 'Zona no encontrada',
    };
  },
};

// ==================== ADMIN / CRM ====================

export const adminService = {
  // Verificar si es admin
  isAdmin: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (error) return false;
    return (data as any)?.rol === 'admin' || (data as any)?.rol === 'staff';
  },

  // STATS
  stats: {
    get: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Pedidos de hoy
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total, estado')
        .gte('created_at', today);

      // Total ventas del mes
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);
      const { data: monthOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', firstOfMonth.toISOString())
        .eq('estado', 'entregado');

      // Total productos
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Productos con bajo stock
      const { count: lowStock } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 10);

      // Total clientes
      const { count: totalCustomers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const orders = (todayOrders as any[]) || [];
      const monthOrd = (monthOrders as any[]) || [];
      
      return {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.estado === 'preparando').length,
        todayOrders: orders.length,
        totalRevenue: monthOrd.reduce((sum, o) => sum + (o.total || 0), 0),
        todayRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        totalProducts: totalProducts || 0,
        lowStockProducts: lowStock || 0,
        totalCustomers: totalCustomers || 0,
        newCustomersToday: 0,
      };
    },
  },

  // PRODUCTOS
  products: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (product: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, product: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ activo: false })
        .eq('id', id);
      if (error) throw error;
    },

    updateStock: async (id: string, stock: number) => {
      const { error } = await supabase
        .from('products')
        .update({ stock })
        .eq('id', id);
      if (error) throw error;
    },
  },

  // PEDIDOS
  orders: {
    getAll: async (filters?: { estado?: string; fecha?: string }) => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          users (nombre, apellido, email, telefono),
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.estado && filters.estado !== 'todos') {
        query = query.eq('estado', filters.estado);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    updateStatus: async (id: string, estado: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ estado })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    getStats: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Pedidos de hoy
      const { data: todayOrders, error: e1 } = await supabase
        .from('orders')
        .select('total, estado')
        .gte('created_at', today);

      // Total ventas del mes
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);
      const { data: monthOrders, error: e2 } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', firstOfMonth.toISOString())
        .eq('estado', 'entregado');

      return {
        pedidosHoy: todayOrders?.length || 0,
        ventasHoy: todayOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
        pendientes: todayOrders?.filter(o => o.estado === 'preparando').length || 0,
        ventasMes: monthOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
      };
    },
  },

  // USUARIOS
  users: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    updateRole: async (id: string, rol: string) => {
      const { error } = await supabase
        .from('users')
        .update({ rol })
        .eq('id', id);
      if (error) throw error;
    },
  },

  // CUPONES
  coupons: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    create: async (coupon: any) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert(coupon)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, coupon: any) => {
      const { data, error } = await supabase
        .from('coupons')
        .update(coupon)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },
};

// Exportar todo como objeto api (compatible con código anterior)
export const api = {
  auth: authService,
  products: productsService,
  orders: ordersService,
  loyalty: loyaltyService,
  users: usersService,
  contact: contactService,
  newsletter: newsletterService,
  coupons: couponsService,
  whatsapp: whatsappService,
  jobs: jobsService,
  shipping: shippingService,
  admin: adminService,
};

// Alias para deliveryService
export const deliveryService = {
  getZones: shippingService.getZones,
  calculate: shippingService.calculateCost,
};

export default api;
