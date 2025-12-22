// API Route para crear preferencias de pago en Mercado Pago
// Este endpoint corre en el servidor y usa el Access Token secreto

import { NextRequest, NextResponse } from 'next/server';
import MercadoPago, { Preference } from 'mercadopago';

// Inicializar cliente de Mercado Pago
const client = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📥 Solicitud de preferencia MP recibida');
    console.log('Items:', body.items?.length || 0);

    // Validar que tengamos el access token
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error('❌ MP_ACCESS_TOKEN no configurado');
      return NextResponse.json(
        { error: 'Mercado Pago no configurado. Contacta al administrador.' },
        { status: 500 }
      );
    }

    console.log('✅ MP_ACCESS_TOKEN encontrado');

    // Crear preferencia
    const preference = new Preference(client);
    
    console.log('🔄 Creando preferencia en MP...');
    console.log('📦 Datos enviados:', JSON.stringify({
      items: body.items,
      payer: body.payer,
      back_urls: body.back_urls,
    }, null, 2));
    
    const result = await preference.create({
      body: {
        items: body.items,
        payer: body.payer,
        back_urls: body.back_urls,
        auto_return: body.auto_return,
        external_reference: body.external_reference,
        notification_url: body.notification_url,
        metadata: body.metadata,
        statement_descriptor: 'MARLOCOOKIES',
        payment_methods: {
          excluded_payment_types: [],
          installments: 12,
        },
      },
    });

    console.log('✅ Preferencia creada:', result.id);

    return NextResponse.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('❌ Error creando preferencia MP:', error);
    console.error('Error message:', error.message);
    console.error('Error cause:', error.cause);
    console.error('Error response:', error.response);
    console.error('Error status:', error.status);
    console.error('Error apiResponse:', error.apiResponse);
    
    // Extraer el mensaje de error real de MP
    let mpErrorMessage = 'Error desconocido de Mercado Pago';
    let mpErrorDetails = null;
    
    if (error.cause) {
      mpErrorMessage = JSON.stringify(error.cause);
      mpErrorDetails = error.cause;
    } else if (error.apiResponse) {
      mpErrorMessage = JSON.stringify(error.apiResponse);
      mpErrorDetails = error.apiResponse;
    } else if (error.message) {
      mpErrorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: 'Error al comunicarse con Mercado Pago',
        message: mpErrorMessage,
        details: mpErrorDetails
      },
      { status: 500 }
    );
  }
}
