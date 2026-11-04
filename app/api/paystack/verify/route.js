import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Payment from '@/models/Payment';
import { fulfillPayment } from '@/lib/fulfillPayment';
export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, message: 'Please sign in to verify your payment' }, { status: 401 });
  const reference = new URL(request.url).searchParams.get('reference');
  if (!reference || !/^[A-Za-z0-9._-]{1,150}$/.test(reference)) return NextResponse.json({ success: false, message: 'Invalid payment reference' }, { status: 400 });
  try {
    await connectDB();
    const payment = await Payment.findOne({ reference, userId });
    if (!payment) return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
    if (payment.status !== 'success') {
      if (!process.env.PAYSTACK_SECRET_KEY) throw new Error('Payment service unavailable');
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }, cache: 'no-store', signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error('Verification unavailable');
      if (result.data.status !== 'success') return NextResponse.json({ success: false, message: 'Payment is not confirmed yet. Check again shortly; do not pay again.' }, { status: 409 });
      await fulfillPayment(payment, result.data);
    }
    return NextResponse.json({ success: true, message: 'Payment confirmed' });
  } catch {
    return NextResponse.json({ success: false, message: 'Unable to confirm payment yet. Please retry or contact the shop with your reference.' }, { status: 503 });
  }
}
