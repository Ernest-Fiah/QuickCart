export const MAX_QUANTITY = 99;
export const requiresSize = (product) => product.category?.toUpperCase() !== 'ACCESSORY';
export function parseSizes(value) {
  if (!Array.isArray(value) || value.length > 40 || value.some(s => typeof s !== 'string' || !/^[A-Za-z0-9 ./-]{1,24}$/.test(s.trim()))) throw new Error('Enter valid size labels (up to 24 characters each)');
  return [...new Set(value.map(s => s.trim()).filter(Boolean))];
}
export function cartKey(product, size = '') { return size ? `${product}:${encodeURIComponent(size)}` : product; }
export function parseCartKey(key) {
  const [product, encoded = '', ...rest] = key.split(':');
  if (rest.length || !/^[a-f0-9]{24}$/i.test(product)) throw new Error('Invalid cart product');
  const size = decodeURIComponent(encoded);
  if (size.length > 24) throw new Error('Invalid size');
  return { product, size };
}
export function cleanCart(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, quantity]) => {
    try { parseCartKey(key); return Number.isSafeInteger(quantity) && quantity > 0 && quantity <= MAX_QUANTITY; } catch { return false; }
  }));
}
export function validateItem(item, product) {
  if (!product || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) throw new Error('Invalid product or quantity (1–99 allowed)');
  const size = item.size || '';
  if (typeof size !== 'string' || (requiresSize(product) && !size) || (size && !product.sizes?.includes(size))) throw new Error(`Choose an available size for ${product.name}`);
  if (!Number.isFinite(product.offerPrice) || product.offerPrice <= 0) throw new Error('Product price is unavailable');
  return { product: String(product._id), size, quantity: item.quantity, name: product.name, unitPrice: product.offerPrice };
}
// Preserve the existing store's 2% charge; business must confirm its tax policy before launch.
export function totals(subtotal) {
  const subtotalMinor = Math.round(subtotal * 100);
  const taxMinor = Math.round(subtotalMinor * 0.02);
  return { subtotal: subtotalMinor / 100, tax: taxMinor / 100, amount: (subtotalMinor + taxMinor) / 100, amountMinor: subtotalMinor + taxMinor };
}
export function assertTransaction(transaction, payment) {
  if (transaction?.status !== 'success' || transaction.reference !== payment.reference || transaction.currency !== 'GHS' || transaction.amount !== Math.round(payment.amount * 100)) throw new Error('Payment does not match this order');
}
