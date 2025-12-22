// Webhook para recibir notificaciones IPN de Mercado Pago
// Este endpoint se llama automáticamente cuando cambia el estado de un pago

import { NextRequest, NextResponse } from 'next/server';
import MercadoPago, { Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase con service role para operaciones de servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente de Mercado Pago
const client = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Webhook MP recibido:', body);

    // Mercado Pago envía notificaciones de tipo "payment"
    if (body.type !== 'payment' && body.action !== 'payment.created' && body.action !== 'payment.updated') {
      return NextResponse.json({ message: 'Notification type not handled' });
    }

    // Obtener el ID del pago
    const paymentId = body.data?.id;
    
    if (!paymentId) {
      console.error('❌ No payment ID en webhook');
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
    }

    // Consultar información del pago en Mercado Pago
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    console.log('💳 Info del pago:', {
      id: paymentInfo.id,
      status: paymentInfo.status,
      external_reference: paymentInfo.external_reference,
    });

    // Obtener el order_id desde external_reference
    const orderId = paymentInfo.external_reference;

    if (!orderId) {
      console.error('❌ No external_reference en el pago');
      return NextResponse.json({ error: 'No order reference' }, { status: 400 });
    }

    // Actualizar estado del pedido según el estado del pago
    let nuevoEstado = '';
    let metodoPago = 'mercadopago';

    switch (paymentInfo.status) {
      case 'approved':
        nuevoEstado = 'preparando'; // Pago aprobado, listo para preparar
        break;
      case 'pending':
      case 'in_process':
        nuevoEstado = 'pendiente_pago'; // Esperando confirmación
        break;
      case 'rejected':
      case 'cancelled':
        nuevoEstado = 'cancelado'; // Pago rechazado/cancelado
        break;
      default:
        console.log('⚠️ Estado de pago no manejado:', paymentInfo.status);
        return NextResponse.json({ message: 'Status not handled' });
    }

    // Actualizar pedido en Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        estado: nuevoEstado,
        metodo_pago: metodoPago,
        mp_payment_id: paymentId,
        mp_payment_status: paymentInfo.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Error actualizando pedido:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('✅ Pedido actualizado:', orderId, nuevoEstado);

    // Enviar notificación al cliente
    if (nuevoEstado === 'preparando') {
      // Pago confirmado - pedido en preparación
      console.log('📧 TODO: Enviar confirmación de pago al cliente');
    }

    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      order_id: orderId,
      new_status: nuevoEstado,
    });

  } catch (error: any) {
    console.error('❌ Error procesando webhook MP:', error);
    return NextResponse.json(
      { error: error.message || 'Error procesando webhook' },
      { status: 500 }
    );
  }
}

// Mercado Pago puede enviar también GET para verificar el endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Mercado Pago webhook endpoint active' });
}
