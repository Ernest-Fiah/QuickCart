// Pure cart mutation rules shared by the API and regression tests.
// Mutating one item must not revalidate unrelated legacy cart entries.
export function applyCartMutation(savedItems, key, action, requestedQuantity) {
  const cart = savedItems && typeof savedItems === "object" && !Array.isArray(savedItems)
    ? { ...savedItems }
    : {};
  if (!key || typeof key !== "string" || key.length > 120) {
    throw new Error("Invalid cart item.");
  }
  if (action !== "add" && action !== "set") {
    throw new Error("Invalid cart action.");
  }
  const current = cart[key] ?? 0;
  if (action === "add" && (!Number.isSafeInteger(current) || current < 0)) {
    throw new Error("This cart item needs to be removed and added again.");
  }
  const quantity = action === "add" ? current + 1 : requestedQuantity;
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 25) {
    throw new Error("Choose a quantity between 0 and 25.");
  }
  if (quantity === 0) {
    delete cart[key];
  } else {
    if (!(key in cart) && Object.keys(cart).length >= 60) {
      throw new Error("A cart can contain at most 60 different items.");
    }
    cart[key] = quantity;
  }
  return cart;
}
