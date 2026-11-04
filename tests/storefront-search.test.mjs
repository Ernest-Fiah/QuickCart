import test from "node:test";
import assert from "node:assert/strict";
import { matchesProductSearch, normalizeSearch, suggestProducts, sortProducts } from "../lib/storefrontSearch.mjs";

const products = [
  { _id: "a", name: "Navy Blue Suit", category: "SUIT", description: "Formal double breasted", offerPrice: 4200, date: 3 },
  { _id: "b", name: "White Dress Shirt", category: "SHIRT", description: "Long-sleeve cotton shirt", offerPrice: 700, date: 2 },
  { _id: "c", name: "Blue Knit Polo", category: "T-SHIRT", description: "Smart casual knit", offerPrice: 450, date: 1 },
];
test("normalizes casing and accents", () => assert.equal(normalizeSearch("  NÁVY-BLUE  "), "navy blue"));
test("matches words across name, category and description", () => {
  assert.equal(matchesProductSearch(products[0], "NAVY formal"), true);
  assert.equal(matchesProductSearch(products[1], "navy formal"), false);
});
test("does not invent results and waits for meaningful input", () => {
  assert.deepEqual(suggestProducts(products, "n"), []);
  assert.deepEqual(suggestProducts(products, "no matching garment"), []);
  assert.deepEqual(suggestProducts(products, "blue").map(x => x._id), ["a", "c"]);
});
test("handles price and newest sorting deterministically", () => {
  assert.deepEqual(sortProducts(products, "price-low").map(x => x._id), ["c", "b", "a"]);
  assert.deepEqual(sortProducts(products, "price-high").map(x => x._id), ["a", "b", "c"]);
  assert.deepEqual(sortProducts(products).map(x => x._id), ["a", "b", "c"]);
});
