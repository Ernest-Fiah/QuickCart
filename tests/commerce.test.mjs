import test from 'node:test';
import assert from 'node:assert/strict';
import { cartKey, parseCartKey, validateItem, parseSizes, totals, assertTransaction } from '../lib/commerce.mjs';
const product = { _id: 'a'.repeat(24), name: 'Shirt', category: 'SHIRT', offerPrice: 199.99, sizes: ['M', '15.5 in'] };
test('separate sizes survive basket serialization', () => {
  assert.notEqual(cartKey(product._id, 'M'), cartKey(product._id, '15.5 in'));
  assert.deepEqual(parseCartKey(cartKey(product._id, '15.5 in')), { product: product._id, size: '15.5 in' });
});
test('reject missing/unavailable sizes and unsafe quantities', () => {
  for (const quantity of [-1, 0, 1.5, 100, '2', Infinity]) assert.throws(() => validateItem({ size: 'M', quantity }, product));
  for (const size of ['', 'XL', {}]) assert.throws(() => validateItem({ size, quantity: 1 }, product));
  assert.equal(validateItem({ size: 'M', quantity: 2 }, product).unitPrice, 199.99);
});
test('only accessories may omit size', () => {
  assert.doesNotThrow(() => validateItem({ quantity: 1 }, { ...product, category: 'ACCESSORY' }));
  assert.throws(() => validateItem({ quantity: 1 }, { ...product, sizes: [] }));
});
test('integer minor units preserve displayed and charged totals', () => {
  assert.deepEqual(totals(199.99), { subtotal: 199.99, tax: 4, amount: 203.99, amountMinor: 20399 });
  assert.equal(totals(0.1 + 0.2).amountMinor, 31);
});
test('wrong reference, amount, currency and failed payments are rejected', () => {
  const payment = { reference: 'morven-test', amount: 203.99 };
  const transaction = { reference: payment.reference, amount: 20399, currency: 'GHS', status: 'success' };
  assert.doesNotThrow(() => assertTransaction(transaction, payment));
  for (const change of [{ reference: 'other' }, { amount: 1 }, { currency: 'NGN' }, { status: 'failed' }]) assert.throws(() => assertTransaction({ ...transaction, ...change }, payment));
});
test('size list labels are bounded and deduplicated', () => {
  assert.deepEqual(parseSizes([' M ', 'M', '15.5 in']), ['M', '15.5 in']);
  for (const sizes of [null, 'M', ['<script>'], ['a'.repeat(25)]]) assert.throws(() => parseSizes(sizes));
});
