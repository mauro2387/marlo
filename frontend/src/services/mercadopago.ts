// Servicio de Mercado Pago para MarLo Cookies
// SDK de Mercado Pago solo se usa en el servidor (API routes)
// En el frontend solo creamos las preferencias y redirigimos

export interface MercadoPagoItem {
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface MercadoPagoPreferenceData {
  items: MercadoPagoItem[];
  payer?: {
    name?: string;
    email?: string;
    phone?: {
      number: string;
    };
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string; // ID del pedido en nuestra DB
  notification_url?: string; // Webhook para notificaciones IPN
  metadata?: Record<string, any>;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string; // URL para redirigir al usuario
  sandbox_init_point?: string;
}

/**
 * Crear preferencia de pago en Mercado Pago
 * Esta función llama a nuestra API route que usa el SDK de MP en el servidor
 */
export async function createPaymentPreference(
  data: MercadoPagoPreferenceData
): Promise<MercadoPagoPreferenceResponse> {
  try {
    console.log('🚀 Llamando a /api/mercadopago/create-preference...');
    
    const response = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('📡 Respuesta HTTP:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error del API:', error);
      
      // Crear un error más detallado
      const detailedError = new Error(error.error || 'Error creando preferencia de pago');
      (detailedError as any).details = error.details;
      throw detailedError;
    }

    const result = await response.json();
    console.log('✅ Preferencia creada:', result.id);
    
    return result;
  } catch (error: any) {
    console.error('Error en createPaymentPreference:', error);
    throw error;
  }
}

/**
 * Verificar estado de un pago
 */
export async function checkPaymentStatus(paymentId: string) {
  try {
    const response = await fetch(`/api/mercadopago/payment-status?payment_id=${paymentId}`);
    
    if (!response.ok) {
      throw new Error('Error verificando estado del pago');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error en checkPaymentStatus:', error);
    throw error;
  }
}

/**
 * Construir datos de preferencia desde un pedido
 */
export function buildPreferenceFromOrder(order: {
  id: string;
  items: Array<{ nombre: string; cantidad: number; precio: number }>;
  subtotal: number;
  envio: number;
  total: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005';

  const items: MercadoPagoItem[] = [
    ...order.items.map(item => ({
      title: item.nombre,
      quantity: item.cantidad,
      unit_price: item.precio,
      currency_id: 'UYU', // Peso uruguayo
    })),
  ];

  // Si hay costo de envío, agregarlo como item
  if (order.envio > 0) {
    items.push({
      title: 'Envío a domicilio',
      quantity: 1,
      unit_price: order.envio,
      currency_id: 'UYU',
    });
  }

  // Calcular y agregar recargo del 10% de Mercado Pago
  const subtotalConEnvio = order.subtotal + order.envio;
  const recargoMP = Math.round(subtotalConEnvio * 0.10);
  
  items.push({
    title: 'Recargo procesamiento MP (10%)',
    quantity: 1,
    unit_price: recargoMP,
    currency_id: 'UYU',
  });

  const preferenceData: MercadoPagoPreferenceData = {
    items,
    payer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone ? { number: order.customer_phone } : undefined,
    },
    back_urls: {
      success: `${siteUrl}/confirmacion?pedido=${order.id}&payment=success`,
      failure: `${siteUrl}/checkout?payment=failure`,
      pending: `${siteUrl}/confirmacion?pedido=${order.id}&payment=pending`,
    },
    auto_return: 'all', // Cambiar a 'all' para que redirija automáticamente siempre
    external_reference: order.id, // Nuestro order ID
    notification_url: `${siteUrl}/api/mercadopago/webhook`, // IPN webhook
    metadata: {
      order_id: order.id,
      platform: 'marlocookies',
    },
  };

  return preferenceData;
}
