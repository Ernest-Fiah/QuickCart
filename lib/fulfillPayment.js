import Order from '@/models/Order';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { assertTransaction } from '@/lib/commerce.mjs';

export async function fulfillPayment(payment, transaction) {
  assertTransaction(transaction, payment);
  // Legacy successful payments already emitted an order event; never duplicate them.
  if (payment.status === 'success') return;
  // Payment's MongoDB id is also the order id: its built-in unique index makes
  // webhook/callback races and crash retries safe without a new index migration.
  try {
    await Order.updateOne({ _id: payment._id }, { $setOnInsert: {
      userId: payment.userId, items: payment.items, amount: payment.amount,
      address: payment.address, date: payment.date, status: 'Order Placed',
      paymentReference: payment.reference, paymentStatus: 'paid',
    } }, { upsert: true });
  } catch (error) { if (error.code !== 11000) throw error; }
  // Clear only the exact purchased basket; preserve edits made during payment.
  const basket = Object.fromEntries(payment.items.map(item => [item.size ? `${item.product}:${encodeURIComponent(item.size)}` : item.product, item.quantity]));
  await User.updateOne({ _id: payment.userId, cartItems: basket }, { $set: { cartItems: {} } });
  await Payment.updateOne({ _id: payment._id }, { $set: { status: 'success' } });
}
