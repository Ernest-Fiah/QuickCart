import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Payment from '@/models/Payment';
import { fulfillPayment } from '@/lib/fulfillPayment';
export async function POST(request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return new NextResponse('Unavailable', { status: 503 });
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature') || '';
  const expected = createHmac('sha512', secret).update(body).digest('hex');
  if (!/^[a-f0-9]{128}$/i.test(signature) || !timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) return new NextResponse('Invalid signature', { status: 401 });
  let event;
  try { event = JSON.parse(body); } catch { return new NextResponse('Invalid JSON', { status: 400 }); }
  if (event.event !== 'charge.success') return NextResponse.json({ received: true });
  try {
    await connectDB();
    const payment = await Payment.findOne({ reference: event.data?.reference });
    if (payment) await fulfillPayment(payment, event.data);
    return NextResponse.json({ received: true });
  } catch { return new NextResponse('Please retry', { status: 503 }); }
}
