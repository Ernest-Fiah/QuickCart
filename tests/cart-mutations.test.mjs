import test from "node:test";
import assert from "node:assert/strict";
import { applyCartMutation, clearCartItems } from "../lib/cartMutations.mjs";
import { getAvailableSizes, makeCartKey } from "../lib/sizing.mjs";

const productId = "507f1f77bcf86cd799439011";

test("adding a selected size preserves other sizes", () => {
  const m = makeCartKey(productId, "M");
  const l = makeCartKey(productId, "L");
  const cart = applyCartMutation({ [m]: 1 }, l, "add");
  assert.deepEqual(cart, { [m]: 1, [l]: 1 });
});

test("invalid historic cart item cannot block a newly selected size", () => {
  const legacy = productId;
  const sized = makeCartKey(productId, "46");
  const cart = applyCartMutation({ [legacy]: 2 }, sized, "add");
  assert.deepEqual(cart, { [legacy]: 2, [sized]: 1 });
});

test("remove obsolete size without discarding customer's other cart items", () => {
  const bad = makeCartKey(productId, "old-size");
  const good = makeCartKey(productId, "42");
  const cart = applyCartMutation({ [bad]: 2, [good]: 3 }, bad, "set", 0);
  assert.deepEqual(cart, { [good]: 3 });
});

test("item-level quantity updates enforce limits", () => {
  const key = makeCartKey(productId, "40");
  assert.throws(() => applyCartMutation({ [key]: 25 }, key, "add"), /between 0 and 25/);
  assert.throws(() => applyCartMutation({}, key, "set", -1), /between 0 and 25/);
  assert.throws(() => applyCartMutation({}, key, "set", 2.5), /between 0 and 25/);
});

test("available shoe sizes remain 39 through 48", () => {
  const available = getAvailableSizes({ category: "SHOE" });
  assert.equal(available.at(0), "39");
  assert.equal(available.at(-1), "48");
  assert.deepEqual(getAvailableSizes({ category: "Shoes" }), available);
  assert.deepEqual(getAvailableSizes({ category: "Footwear" }), available);
});

test("clear cart removes every size and old saved item without affecting previous data", () => {
  const oldCart = {
    [productId]: 1,
    [makeCartKey(productId, "M")]: 2,
    [makeCartKey(productId, "L")]: 3,
  };
  const cleared = clearCartItems(oldCart);
  assert.deepEqual(cleared, {});
  assert.equal(Object.keys(oldCart).length, 3);
});

test("clear cart is safe when the cart is already empty or malformed", () => {
  assert.deepEqual(clearCartItems({}), {});
  assert.deepEqual(clearCartItems(null), {});
});
