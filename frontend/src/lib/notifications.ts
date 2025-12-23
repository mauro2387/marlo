// Servicio de notificaciones - Email y WhatsApp
// MarLo Cookies - Punta del Este, Uruguay

import { CONTACT_INFO } from '@/config/constants';

const WHATSAPP_NUMBER = CONTACT_INFO.whatsappNumber;
const BUSINESS_EMAIL = CONTACT_INFO.email;

// ==================== TIPOS ====================

export interface ContactNotification {
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}

export interface OrderNotification {
  orderId: string;
  cliente: {
    nombre: string;
    telefono?: string;
    email?: string;
  };
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  subtotal: number;
  envio: number;
  descuento: number;
  total: number;
  metodoPago: string;
  metodoEntrega: 'envio' | 'retiro' | 'puntos';
  direccion?: string;
  zona?: string;
  notas?: string;
  puntosUsados?: number;
  puntosGanados?: number;
}

export interface WholesaleNotification {
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  tipoNegocio: string;
  cantidadEstimada?: string;
  productosInteres?: string;
  mensaje?: string;
}

export interface ProfileUpdateNotification {
  userId: string;
  email: string;
  nombre: string;
  cambios: string[];
}

export interface NewsletterNotification {
  email: string;
  nombre?: string;
  coupon?: {
    code: string;
    tipo: 'porcentaje' | 'fijo';
    valor: number;
    monto_minimo: number;
    valido_hasta: string;
  };
}

// ==================== EMAIL API ====================

export const emailService = {
  // Enviar email genérico via API Route
  send: async (data: {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
  }) => {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar email');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error enviando email:', error);
      return { success: false, error };
    }
  },

  // Email de nuevo mensaje de contacto
  sendContactNotification: async (data: ContactNotification) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #EC4899, #F472B6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🍪 MarLo Cookies</h1>
          <p style="color: white; margin: 5px 0;">Nuevo mensaje de contacto</p>
        </div>
        
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #EC4899; border-bottom: 2px solid #F9A8D4; padding-bottom: 10px;">
            📩 Mensaje de ${data.nombre}
          </h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Nombre:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.nombre}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                <a href="mailto:${data.email}">${data.email}</a>
              </td>
            </tr>
            ${data.telefono ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Teléfono:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                <a href="tel:${data.telefono}">${data.telefono}</a>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Asunto:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.asunto}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 20px; background: #FDF2F8; border-radius: 10px;">
            <h3 style="margin-top: 0; color: #BE185D;">Mensaje:</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${data.mensaje}</p>
          </div>
          
          ${data.telefono ? `
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://wa.me/${data.telefono.replace(/\D/g, '')}" 
               style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              💬 Responder por WhatsApp
            </a>
          </div>
          ` : ''}
        </div>
        
        <div style="background: #FDF2F8; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          Este mensaje fue enviado desde el formulario de contacto de MarLo Cookies
        </div>
      </div>
    `;

    return emailService.send({
      to: BUSINESS_EMAIL,
      subject: `📩 Nuevo contacto: ${data.asunto} - ${data.nombre}`,
      html,
      replyTo: data.email,
    });
  },

  // Email de cambio de perfil
  sendProfileUpdateNotification: async (data: ProfileUpdateNotification) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #EC4899, #F472B6); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🍪 MarLo Cookies</h1>
          <p style="color: white; margin: 5px 0;">Actualización de perfil</p>
        </div>
        
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #EC4899;">¡Hola ${data.nombre}! 👋</h2>
          
          <p>Te confirmamos que tu perfil ha sido actualizado correctamente.</p>
          
          <div style="margin: 20px 0; padding: 20px; background: #F0FDF4; border-radius: 10px; border-left: 4px solid #22C55E;">
            <h3 style="margin-top: 0; color: #166534;">✅ Cambios realizados:</h3>
            <ul style="color: #166534;">
              ${data.cambios.map(cambio => `<li>${cambio}</li>`).join('')}
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Si no realizaste estos cambios, por favor contáctanos inmediatamente.
          </p>
        </div>
        
        <div style="background: #FDF2F8; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          MarLo Cookies - Av. Juan Gorlero, Punta del Este<br>
          <a href="https://wa.me/${WHATSAPP_NUMBER}" style="color: #EC4899;">WhatsApp: (+598) 97 865 053</a>
        </div>
      </div>
    `;

    return emailService.send({
      to: data.email,
      subject: '✅ Tu perfil ha sido actualizado - MarLo Cookies',
      html,
    });
  },

  // Email de confirmación de newsletter
  sendNewsletterWelcome: async (data: NewsletterNotification) => {
    const couponHtml = data.coupon ? `
      <div style="background: linear-gradient(135deg, #10B981, #34D399); padding: 25px; margin: 30px 0; border-radius: 12px; text-align: center;">
        <h3 style="color: white; margin: 0 0 15px 0; font-size: 24px;">🎁 ¡Tu Regalo de Bienvenida!</h3>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Tu código de descuento:</p>
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; border: 2px dashed #10B981;">
            <span style="font-size: 28px; font-weight: bold; color: #10B981; font-family: monospace; letter-spacing: 2px;">${data.coupon.code}</span>
          </div>
          <div style="margin-top: 15px; font-size: 14px; color: #666;">
            <p style="margin: 5px 0;"><strong>Descuento:</strong> ${data.coupon.tipo === 'porcentaje' ? `${data.coupon.valor}%` : `$${data.coupon.valor}`}</p>
            ${data.coupon.monto_minimo > 0 ? `<p style="margin: 5px 0;"><strong>Compra mínima:</strong> $${data.coupon.monto_minimo}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Válido hasta:</strong> ${new Date(data.coupon.valido_hasta).toLocaleDateString('es-AR')}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #999;">Un solo uso por cliente</p>
          </div>
        </div>
        <p style="color: white; margin: 10px 0; font-size: 14px;">Aplicá este código al finalizar tu compra</p>
      </div>
    ` : '';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #EC4899, #F472B6); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🍪 MarLo Cookies</h1>
          <p style="color: white; margin: 10px 0; font-size: 18px;">¡Bienvenido/a a nuestra familia!</p>
        </div>
        
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #EC4899;">¡Gracias por suscribirte! 🎉</h2>
          
          <p>Hola${data.nombre ? ` ${data.nombre}` : ''},</p>
          
          ${couponHtml}
          
          <p>Ahora sos parte de nuestra comunidad de amantes de las cookies. Vas a recibir:</p>
          
          <div style="margin: 20px 0;">
            <div style="display: flex; align-items: center; margin: 10px 0; padding: 15px; background: #FDF2F8; border-radius: 8px;">
              <span style="font-size: 24px; margin-right: 15px;">🆕</span>
              <span>Novedades y lanzamientos exclusivos</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0; padding: 15px; background: #FDF2F8; border-radius: 8px;">
              <span style="font-size: 24px; margin-right: 15px;">🏷️</span>
              <span>Descuentos y promociones especiales</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0; padding: 15px; background: #FDF2F8; border-radius: 8px;">
              <span style="font-size: 24px; margin-right: 15px;">⭐</span>
              <span>Ediciones limitadas antes que nadie</span>
            </div>
            <div style="display: flex; align-items: center; margin: 10px 0; padding: 15px; background: #FDF2F8; border-radius: 8px;">
              <span style="font-size: 24px; margin-right: 15px;">🎁</span>
              <span>Beneficios exclusivos para suscriptores</span>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://marlocookies.com/productos" 
               style="display: inline-block; background: linear-gradient(135deg, #EC4899, #F472B6); 
                      color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; 
                      font-weight: bold; font-size: 16px;">
              🍪 Ver Nuestras Cookies
            </a>
          </div>
        </div>
        
        <div style="background: #FDF2F8; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          MarLo Cookies - Av. Juan Gorlero, Punta del Este<br>
          <a href="https://wa.me/${WHATSAPP_NUMBER}" style="color: #EC4899;">WhatsApp: (+598) 97 865 053</a><br><br>
          <a href="#" style="color: #999; text-decoration: underline;">Cancelar suscripción</a>
        </div>
      </div>
    `;

    return emailService.send({
      to: data.email,
      subject: '🍪 ¡Bienvenido/a a MarLo Cookies! Ya sos parte de la familia',
      html,
    });
  },

  // Email de solicitud mayorista
  sendWholesaleNotification: async (data: WholesaleNotification) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F59E0B, #F97316); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🍪 MarLo Cookies</h1>
          <p style="color: white; margin: 5px 0;">Nueva solicitud MAYORISTA</p>
        </div>
        
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #F59E0B; border-bottom: 2px solid #FCD34D; padding-bottom: 10px;">
            🏪 Solicitud de ${data.nombre}
          </h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Nombre:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.nombre}</td>
            </tr>
            ${data.empresa ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Empresa:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.empresa}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                <a href="mailto:${data.email}">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Teléfono:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                <a href="tel:${data.telefono}">${data.telefono}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Tipo de Negocio:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.tipoNegocio}</td>
            </tr>
            ${data.cantidadEstimada ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Cantidad Estimada:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.cantidadEstimada} /mes</td>
            </tr>
            ` : ''}
            ${data.productosInteres ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Productos de Interés:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.productosInteres}</td>
            </tr>
            ` : ''}
          </table>
          
          ${data.mensaje ? `
          <div style="margin-top: 20px; padding: 20px; background: #FFFBEB; border-radius: 10px;">
            <h3 style="margin-top: 0; color: #B45309;">Mensaje adicional:</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${data.mensaje}</p>
          </div>
          ` : ''}
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://wa.me/${data.telefono.replace(/\D/g, '')}" 
               style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
              💬 WhatsApp
            </a>
            <a href="mailto:${data.email}" 
               style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
              ✉️ Email
            </a>
          </div>
        </div>
        
        <div style="background: #FFFBEB; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          ⚠️ SOLICITUD MAYORISTA - Requiere respuesta prioritaria
        </div>
      </div>
    `;

    return emailService.send({
      to: BUSINESS_EMAIL,
      subject: `🏪 MAYORISTA: Nueva solicitud de ${data.empresa || data.nombre} - ${data.tipoNegocio}`,
      html,
      replyTo: data.email,
    });
  },

  // Email de confirmación de pedido
  sendOrderConfirmation: async (data: OrderNotification) => {
    const tipoEntrega = {
      envio: '🚚 Envío a domicilio',
      retiro: '🏪 Retiro en local',
      puntos: '🎁 Canje de puntos',
    };

    const itemsHtml = data.items
      .map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.nombre}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.precio * item.cantidad}</td>
        </tr>
      `)
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #EC4899, #F472B6); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🍪 MarLo Cookies</h1>
          <p style="color: white; margin: 10px 0;">¡Gracias por tu pedido!</p>
        </div>
        
        <div style="padding: 30px; background: #fff;">
          <div style="background: #F0FDF4; border: 2px solid #22C55E; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 48px;">✅</span>
            <h2 style="color: #166534; margin: 10px 0;">Pedido Confirmado</h2>
            <p style="color: #166534; font-size: 18px; font-weight: bold;">#${data.orderId.slice(-8).toUpperCase()}</p>
          </div>
          
          <h3 style="color: #EC4899; border-bottom: 2px solid #F9A8D4; padding-bottom: 10px;">
            ${tipoEntrega[data.metodoEntrega]}
          </h3>
          
          ${data.direccion ? `
          <p style="margin: 10px 0;"><strong>📍 Dirección:</strong> ${data.direccion}${data.zona ? ` (${data.zona})` : ''}</p>
          ` : ''}
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #FDF2F8;">
                <th style="padding: 12px; text-align: left;">Producto</th>
                <th style="padding: 12px; text-align: center;">Cant.</th>
                <th style="padding: 12px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="background: #F9FAFB; padding: 15px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Subtotal:</span>
              <span>$${data.subtotal}</span>
            </div>
            ${data.envio > 0 ? `
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Envío:</span>
              <span>$${data.envio}</span>
            </div>
            ` : ''}
            ${data.descuento > 0 ? `
            <div style="display: flex; justify-content: space-between; margin: 5px 0; color: #22C55E;">
              <span>Descuento:</span>
              <span>-$${data.descuento}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding-top: 10px; border-top: 2px solid #E5E7EB; font-size: 20px; font-weight: bold; color: #EC4899;">
              <span>Total:</span>
              <span>$${data.total}</span>
            </div>
          </div>
          
          <p style="margin-top: 15px;"><strong>💳 Método de pago:</strong> ${data.metodoPago}</p>
          
          ${data.puntosGanados && data.puntosGanados > 0 ? `
          <div style="margin-top: 15px; padding: 15px; background: #FEF3C7; border-radius: 8px; text-align: center;">
            <span style="font-size: 24px;">⭐</span>
            <p style="margin: 5px 0; color: #92400E; font-weight: bold;">¡Ganaste ${data.puntosGanados} puntos con esta compra!</p>
          </div>
          ` : ''}
          
          ${data.notas ? `
          <div style="margin-top: 15px; padding: 15px; background: #F3F4F6; border-radius: 8px;">
            <strong>📝 Notas:</strong> ${data.notas}
          </div>
          ` : ''}
          
          <div style="margin-top: 25px; text-align: center;">
            <a href="https://wa.me/${WHATSAPP_NUMBER}" 
               style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              💬 ¿Dudas? Escribinos
            </a>
          </div>
        </div>
        
        <div style="background: #FDF2F8; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          MarLo Cookies - Av. Juan Gorlero, Punta del Este<br>
          Miércoles a Lunes 15:00 - 20:00<br>
          <a href="https://wa.me/${WHATSAPP_NUMBER}" style="color: #EC4899;">(+598) 97 865 053</a>
        </div>
      </div>
    `;

    // Enviar al cliente si tiene email
    if (data.cliente.email) {
      await emailService.send({
        to: data.cliente.email,
        subject: `🍪 ¡Pedido confirmado! #${data.orderId.slice(-8).toUpperCase()} - MarLo Cookies`,
        html,
      });
    }

    return { success: true };
  },
};

// ==================== WHATSAPP SERVICE ====================

export const whatsappNotifications = {
  // Generar mensaje de WhatsApp para pedido
  generateOrderMessage: (data: OrderNotification): string => {
    const tipoEntrega = {
      envio: '🚚 ENVÍO',
      retiro: '🏪 RETIRO',
      puntos: '🎁 CANJE DE PUNTOS',
    };

    const itemsList = data.items
      .map(item => `• ${item.cantidad}x ${item.nombre} - $${item.precio * item.cantidad}`)
      .join('\n');

    let message = `🍪 *NUEVO PEDIDO - MarLo Cookies*\n\n`;
    message += `📋 *Pedido #${data.orderId.slice(-8).toUpperCase()}*\n`;
    message += `📦 *Tipo: ${tipoEntrega[data.metodoEntrega]}*\n\n`;
    
    message += `👤 *Cliente:* ${data.cliente.nombre}\n`;
    if (data.cliente.telefono) {
      message += `📱 *Tel:* ${data.cliente.telefono}\n`;
    }
    if (data.cliente.email) {
      message += `📧 *Email:* ${data.cliente.email}\n`;
    }
    message += `\n`;
    
    message += `*🛒 Productos:*\n${itemsList}\n\n`;
    
    message += `💰 *Subtotal:* $${data.subtotal}\n`;
    if (data.envio > 0) {
      message += `🚚 *Envío:* $${data.envio}\n`;
    }
    if (data.descuento > 0) {
      message += `🏷️ *Descuento:* -$${data.descuento}\n`;
    }
    message += `✨ *TOTAL: $${data.total}*\n\n`;
    
    message += `💳 *Pago:* ${data.metodoPago}\n`;
    
    if (data.metodoEntrega === 'envio' && data.direccion) {
      message += `📍 *Dirección:* ${data.direccion}`;
      if (data.zona) message += ` (${data.zona})`;
      message += `\n`;
    } else if (data.metodoEntrega === 'retiro') {
      message += `📍 *Retiro en:* Av. Juan Gorlero, Punta del Este\n`;
    }
    
    if (data.puntosUsados && data.puntosUsados > 0) {
      message += `\n⭐ *Puntos usados:* ${data.puntosUsados}\n`;
    }
    if (data.puntosGanados && data.puntosGanados > 0) {
      message += `⭐ *Puntos ganados:* ${data.puntosGanados}\n`;
    }
    
    if (data.notas) {
      message += `\n📝 *Notas:* ${data.notas}\n`;
    }

    return message;
  },

  // Abrir WhatsApp con mensaje de pedido
  openOrderWhatsApp: (data: OrderNotification) => {
    const message = whatsappNotifications.generateOrderMessage(data);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
    
    return url;
  },

  // Generar mensaje de WhatsApp para solicitud mayorista
  generateWholesaleMessage: (data: WholesaleNotification): string => {
    let message = `🏪 *SOLICITUD MAYORISTA - MarLo Cookies*\n\n`;
    message += `👤 *Nombre:* ${data.nombre}\n`;
    if (data.empresa) {
      message += `🏢 *Empresa:* ${data.empresa}\n`;
    }
    message += `📱 *Teléfono:* ${data.telefono}\n`;
    message += `📧 *Email:* ${data.email}\n`;
    message += `🏷️ *Tipo de negocio:* ${data.tipoNegocio}\n`;
    
    if (data.cantidadEstimada) {
      message += `📦 *Cantidad estimada:* ${data.cantidadEstimada} /mes\n`;
    }
    if (data.productosInteres) {
      message += `🍪 *Productos de interés:* ${data.productosInteres}\n`;
    }
    if (data.mensaje) {
      message += `\n📝 *Mensaje:*\n${data.mensaje}\n`;
    }
    
    return message;
  },

  // Abrir WhatsApp con mensaje mayorista
  openWholesaleWhatsApp: (data: WholesaleNotification) => {
    const message = whatsappNotifications.generateWholesaleMessage(data);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
    
    return url;
  },
};

// ==================== UNIFIED NOTIFICATION SERVICE ====================

export const notificationService = {
  // Notificar nuevo mensaje de contacto
  notifyContact: async (data: ContactNotification) => {
    // Solo enviar email al negocio
    return emailService.sendContactNotification(data);
  },

  // Notificar cambio de perfil
  notifyProfileUpdate: async (data: ProfileUpdateNotification) => {
    return emailService.sendProfileUpdateNotification(data);
  },

  // Notificar suscripción a newsletter
  notifyNewsletterSubscription: async (data: NewsletterNotification) => {
    return emailService.sendNewsletterWelcome(data);
  },

  // Notificar nuevo pedido (EMAIL al cliente + abrir WHATSAPP para el negocio)
  notifyNewOrder: async (data: OrderNotification) => {
    // 1. Enviar email de confirmación al cliente
    await emailService.sendOrderConfirmation(data);
    
    // 2. Abrir WhatsApp para notificar al negocio
    whatsappNotifications.openOrderWhatsApp(data);
    
    return { success: true };
  },

  // Notificar solicitud mayorista (EMAIL + WHATSAPP)
  notifyWholesale: async (data: WholesaleNotification) => {
    // 1. Enviar email al negocio
    await emailService.sendWholesaleNotification(data);
    
    // 2. Abrir WhatsApp
    whatsappNotifications.openWholesaleWhatsApp(data);
    
    return { success: true };
  },
};

export default notificationService;
