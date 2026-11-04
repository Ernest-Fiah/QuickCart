import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import { createHmac } from 'node:crypto';
import { assertTransaction } from '../lib/commerce.mjs';
async function load(path, mocks, globals = {}) {
  const context = vm.createContext({ console, URL, Buffer, AbortSignal, process: { env: { PAYSTACK_SECRET_KEY: 'test-secret' } }, ...globals });
  const module = new vm.SourceTextModule(await fs.readFile(new URL(path, import.meta.url), 'utf8'), { context });
  await module.link(name => {
    const exports = mocks[name];
    if (!exports) throw new Error(`Missing mock ${name}`);
    return new vm.SyntheticModule(Object.keys(exports), function () { for (const [key, value] of Object.entries(exports)) this.setExport(key, value); }, { context });
  });
  await module.evaluate(); return module.namespace;
}
class Response { constructor(body, options = {}) { this.body = body; this.status = options.status || 200; } static json(body, options) { return new Response(body, options); } }
test('seller authorization fails closed when Clerk errors', async () => {
  const api = await load('../lib/authSeller.js', { '@clerk/nextjs/server': { clerkClient: async () => { throw new Error('offline'); } } });
  assert.equal(await api.default('user'), false);
});
test('verification rejects anonymous and other-owner payment references before contacting Paystack', async () => {
  let userId = null, fetches = 0;
  const api = await load('../app/api/paystack/verify/route.js', {
    '@clerk/nextjs/server': { auth: async () => ({ userId }) }, 'next/server': { NextResponse: Response },
    '@/config/db': { default: async () => {} }, '@/models/Payment': { default: { findOne: async filter => { assert.equal(filter.userId, 'other-user'); return null; } } },
    '@/lib/fulfillPayment': { fulfillPayment: async () => assert.fail('must not fulfill') },
  }, { fetch: async () => { fetches++; } });
  const request = { url: 'https://shop.test/api/paystack/verify?reference=owned-by-someone-else' };
  assert.equal((await api.GET(request)).status, 401);
  userId = 'other-user'; assert.equal((await api.GET(request)).status, 404); assert.equal(fetches, 0);
});
test('webhook rejects forged signatures and accepts signed charge events', async () => {
  let writes = 0;
  const api = await load('../app/api/paystack/webhook/route.js', {
    'node:crypto': await import('node:crypto'), 'next/server': { NextResponse: Response }, '@/config/db': { default: async () => {} },
    '@/models/Payment': { default: { findOne: async () => ({ reference: 'ref' }) } },
    '@/lib/fulfillPayment': { fulfillPayment: async () => { writes++; } },
  });
  const body = JSON.stringify({ event: 'charge.success', data: { reference: 'ref' } });
  const req = signature => ({ text: async () => body, headers: { get: () => signature } });
  assert.equal((await api.POST(req('bad'))).status, 401); assert.equal(writes, 0);
  assert.equal((await api.POST(req(createHmac('sha512', 'test-secret').update(body).digest('hex')))).status, 200); assert.equal(writes, 1);
});
test('concurrent fulfillment and retries target one deterministic order id', async () => {
  const orders = new Map(); let attempts = 0;
  const api = await load('../lib/fulfillPayment.js', {
    '@/models/Order': { default: { updateOne: async (filter, update) => { attempts++; orders.set(String(filter._id), update.$setOnInsert); } } },
    '@/models/Payment': { default: { updateOne: async () => {} } }, '@/models/User': { default: { updateOne: async () => {} } },
    '@/lib/commerce.mjs': { assertTransaction },
  });
  const payment = { _id: 'unique-payment-id', reference: 'ref', amount: 10, userId: 'user', items: [], status: 'pending' };
  const tx = { reference: 'ref', amount: 1000, currency: 'GHS', status: 'success' };
  await Promise.all([api.fulfillPayment(payment, tx), api.fulfillPayment(payment, tx)]);
  assert.equal(attempts, 2); assert.equal(orders.size, 1);
  await api.fulfillPayment({ ...payment, status: 'success' }, tx); assert.equal(attempts, 2);
});
