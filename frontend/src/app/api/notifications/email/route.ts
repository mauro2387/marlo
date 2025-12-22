import { NextRequest, NextResponse } from 'next/server';

// API Route para enviar emails
// Usando Resend (alternativa gratuita y simple) o configurar SMTP

// Para producción, configurar variables de entorno:
// RESEND_API_KEY o SMTP_HOST, SMTP_USER, SMTP_PASS

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'MarLo Cookies <noreply@marlocookies.com>';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, replyTo } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: to, subject, html' },
        { status: 400 }
      );
    }

    // Si tenemos API key de Resend, usarla
    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          reply_to: replyTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error de Resend:', error);
        throw new Error('Error enviando email con Resend');
      }

      const data = await response.json();
      return NextResponse.json({ success: true, id: data.id });
    }

    // Si no hay API key configurada, loguear y simular éxito
    // En desarrollo esto permite testear el flujo
    console.log('📧 Email simulado (configurar RESEND_API_KEY para producción):');
    console.log('   To:', to);
    console.log('   Subject:', subject);
    console.log('   ReplyTo:', replyTo);
    console.log('---');
    
    // En producción sin API key, guardar en base de datos para envío posterior
    // o usar servicio alternativo

    return NextResponse.json({ 
      success: true, 
      simulated: true,
      message: 'Email registrado (configurar RESEND_API_KEY para envío real)' 
    });

  } catch (error) {
    console.error('Error en API de email:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud de email' },
      { status: 500 }
    );
  }
}

// Endpoint para verificar configuración
export async function GET() {
  return NextResponse.json({
    configured: !!RESEND_API_KEY,
    from: FROM_EMAIL,
    message: RESEND_API_KEY 
      ? 'API de email configurada correctamente' 
      : 'Configurar RESEND_API_KEY para habilitar envío de emails',
  });
}
