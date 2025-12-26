import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'MarLo Cookies <noreply@marlocookies.com>';

// Cliente con service role para operaciones administrativas
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Función para generar código de cupón único
function generateCouponCode(prefix: string = 'MARLO'): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let code = prefix;
  
  // 4 letras aleatorias
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // 4 números aleatorios
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return code;
}

// Función para enviar email
async function sendWelcomeEmail(
  email: string, 
  coupon?: { code: string; tipo: string; valor: number; monto_minimo: number; valido_hasta: string }
) {
  if (!RESEND_API_KEY) {
    console.log('📧 Email simulado (sin RESEND_API_KEY):', email);
    return { success: true, simulated: true };
  }

  const couponHtml = coupon ? `
    <div style="background: linear-gradient(135deg, #10B981, #34D399); padding: 25px; margin: 30px 0; border-radius: 12px; text-align: center;">
      <h3 style="color: white; margin: 0 0 15px 0; font-size: 24px;">🎁 ¡Tu Regalo de Bienvenida!</h3>
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
        <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Tu código de descuento:</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; border: 2px dashed #10B981;">
          <span style="font-size: 28px; font-weight: bold; color: #10B981; font-family: monospace; letter-spacing: 2px;">${coupon.code}</span>
        </div>
        <div style="margin-top: 15px; font-size: 14px; color: #666;">
          <p style="margin: 5px 0;"><strong>Descuento:</strong> ${coupon.tipo === 'porcentaje' ? `${coupon.valor}%` : `$${coupon.valor}`}</p>
          ${coupon.monto_minimo > 0 ? `<p style="margin: 5px 0;"><strong>Compra mínima:</strong> $${coupon.monto_minimo}</p>` : ''}
          <p style="margin: 5px 0;"><strong>Válido hasta:</strong> ${new Date(coupon.valido_hasta).toLocaleDateString('es-AR')}</p>
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
        
        ${couponHtml}
        
        <p>Ahora sos parte de nuestra comunidad de amantes de las cookies. Vas a recibir:</p>
        
        <div style="margin: 20px 0;">
          <div style="padding: 15px; background: #FDF2F8; border-radius: 8px; margin: 10px 0;">
            🆕 Novedades y lanzamientos exclusivos
          </div>
          <div style="padding: 15px; background: #FDF2F8; border-radius: 8px; margin: 10px 0;">
            🏷️ Descuentos y promociones especiales
          </div>
          <div style="padding: 15px; background: #FDF2F8; border-radius: 8px; margin: 10px 0;">
            ⭐ Ediciones limitadas antes que nadie
          </div>
          <div style="padding: 15px; background: #FDF2F8; border-radius: 8px; margin: 10px 0;">
            🎁 Beneficios exclusivos para suscriptores
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
        MarLo Cookies - Punta del Este, Uruguay<br>
        <a href="https://wa.me/59897865053" style="color: #EC4899;">WhatsApp: (+598) 97 865 053</a>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: coupon 
          ? `🎁 ¡Tu código de descuento está listo! - MarLo Cookies`
          : '🍪 ¡Bienvenido/a a MarLo Cookies!',
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error de Resend:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, popupId, generateCoupon } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    // 1. Verificar si ya está suscrito
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email')
      .eq('email', email)
      .single();

    // 2. Si no existe, insertar nuevo suscriptor
    if (!existing) {
      const { error: insertError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .insert({ email, activo: true });

      if (insertError) {
        console.error('Error insertando suscriptor:', insertError);
        // Continuar de todos modos
      }
    }

    let couponData = null;

    // 3. Si hay popupId y generateCoupon, generar cupón
    if (popupId && generateCoupon) {
      // Verificar si ya tiene cupón de este popup
      const { data: existingCoupon } = await supabaseAdmin
        .from('popup_coupons')
        .select('*')
        .eq('popup_id', popupId)
        .eq('email', email)
        .single();

      if (existingCoupon) {
        // Devolver cupón existente
        const { data: coupon } = await supabaseAdmin
          .from('coupons')
          .select('*')
          .eq('id', existingCoupon.coupon_id)
          .single();

        couponData = {
          code: existingCoupon.coupon_code,
          tipo: coupon?.tipo || 'porcentaje',
          valor: coupon?.valor || 10,
          monto_minimo: coupon?.minimo || 0,
          valido_hasta: coupon?.valido_hasta || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
      } else {
        // Obtener configuración del popup
        const { data: popup } = await supabaseAdmin
          .from('popups')
          .select('*')
          .eq('id', popupId)
          .single();

        if (popup?.generar_cupon) {
          const couponCode = generateCouponCode(popup.cupon_prefijo || 'MARLO');
          const validUntil = new Date();
          validUntil.setDate(validUntil.getDate() + (popup.cupon_dias_validos || 30));

          // Crear cupón con nombres de columnas correctos
          const { data: newCoupon, error: couponError } = await supabaseAdmin
            .from('coupons')
            .insert({
              code: couponCode,
              tipo: popup.cupon_tipo || 'porcentaje',
              valor: popup.cupon_valor || 10,
              minimo: popup.cupon_monto_minimo || 0,
              valido_desde: new Date().toISOString(),
              valido_hasta: validUntil.toISOString(),
              max_usos: 1,
              activo: true
            })
            .select()
            .single();

          if (!couponError && newCoupon) {
            // Registrar en popup_coupons
            await supabaseAdmin
              .from('popup_coupons')
              .insert({
                popup_id: popupId,
                email,
                coupon_code: couponCode,
                coupon_id: newCoupon.id
              });

            couponData = {
              code: couponCode,
              tipo: popup.cupon_tipo || 'porcentaje',
              valor: popup.cupon_valor || 10,
              monto_minimo: popup.cupon_monto_minimo || 0,
              valido_hasta: validUntil.toISOString()
            };
          }
        }
      }
    }

    // 4. Enviar email de bienvenida
    const emailResult = await sendWelcomeEmail(email, couponData || undefined);

    return NextResponse.json({
      success: true,
      message: existing ? 'Ya estabas suscrito' : '¡Suscripción exitosa!',
      coupon: couponData,
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Error en suscripción:', error);
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    );
  }
}

// Verificar configuración
export async function GET() {
  return NextResponse.json({
    configured: !!RESEND_API_KEY && !!SUPABASE_SERVICE_KEY,
    hasResend: !!RESEND_API_KEY,
    hasSupabase: !!SUPABASE_SERVICE_KEY
  });
}
