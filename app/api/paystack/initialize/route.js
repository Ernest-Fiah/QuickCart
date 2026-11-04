import { randomUUID } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Product from '@/models/Product';
import User from '@/models/User';
import Address from '@/models/Address';
import Payment from '@/models/Payment';
import { validateItem, totals } from '@/lib/commerce.mjs';
const fail = (message, status) => NextResponse.json({ success: false, message }, { status });
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return fail('Please sign in before checkout', 401);
    let body;
    try { body = await request.json(); } catch { return fail('Invalid checkout data', 400); }
    const { address, items } = body || {};
    if (typeof address !== 'string' || !/^[a-f0-9]{24}$/i.test(address) || !Array.isArray(items) || !items.length || items.length > 100) return fail('Invalid basket or address', 400);
    if (!process.env.PAYSTACK_SECRET_KEY || !process.env.NEXT_PUBLIC_APP_URL) return fail('Checkout is temporarily unavailable', 503);
    const callback = new URL('/payment/callback', process.env.NEXT_PUBLIC_APP_URL);
    if (callback.protocol !== 'https:' && callback.hostname !== 'localhost') return fail('Checkout configuration requires HTTPS', 503);
    await connectDB();
    const user = await User.findById(userId);
    if (!user?.email) return fail('Your account is still syncing. Please retry shortly.', 409);
    if (!await Address.exists({ _id: address, userId })) return fail('Please select your own delivery address', 400);
    const checked = [], seen = new Set();
    try {
      for (const item of items) {
        if (!item || typeof item.product !== 'string' || !/^[a-f0-9]{24}$/i.test(item.product)) throw new Error('Invalid product');
        const product = await Product.findById(item.product);
        const line = validateItem(item, product);
        const key = `${line.product}:${line.size}`;
        if (seen.has(key)) throw new Error('Duplicate basket item');
        seen.add(key); checked.push(line);
      }
    } catch (error) { return fail(error.message, 400); }
    const total = totals(checked.reduce((sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity / 100, 0));
    if (!Number.isSafeInteger(total.amountMinor) || total.amountMinor <= 0) return fail('Invalid order total', 400);
    const reference = `morven-${randomUUID()}`;
    await Payment.create({ reference, userId, address, items: checked, amount: total.amount, date: Date.now() });
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, email: user.email, amount: total.amountMinor, currency: 'GHS', callback_url: callback.href }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || !result.status || !result.data?.authorization_url) return fail('Unable to start payment. Please retry.', 502);
    return NextResponse.json({ success: true, authorization_url: result.data.authorization_url, reference });
  } catch { return fail('Checkout is temporarily unavailable. Please retry.', 503); }
}
