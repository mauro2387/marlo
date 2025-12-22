// API Route para verificar estado de un pago de Mercado Pago

import { NextRequest, NextResponse } from 'next/server';
import MercadoPago, { Payment } from 'mercadopago';

const client = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'payment_id es requerido' },
        { status: 400 }
      );
    }

    // Consultar pago en Mercado Pago
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    return NextResponse.json({
      id: paymentInfo.id,
      status: paymentInfo.status,
      status_detail: paymentInfo.status_detail,
      external_reference: paymentInfo.external_reference,
      transaction_amount: paymentInfo.transaction_amount,
      date_approved: paymentInfo.date_approved,
      payment_method_id: paymentInfo.payment_method_id,
    });
  } catch (error: any) {
    console.error('Error consultando pago MP:', error);
    return NextResponse.json(
      { error: error.message || 'Error consultando pago' },
      { status: 500 }
    );
  }
}
