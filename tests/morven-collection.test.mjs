import test from "node:test";
import assert from "node:assert/strict";
import { MORVEN_NEW_COLLECTION, MORVEN_COLLECTION_KEYS } from "../lib/morvenNewCollection.mjs";
import { getCategorySizeOptions } from "../lib/sizing.mjs";

test("all 20 supplied photos have distinct product keys", () => {
  assert.equal(MORVEN_NEW_COLLECTION.length, 20);
  assert.equal(MORVEN_COLLECTION_KEYS.length, 20);
  assert.equal(new Set(MORVEN_COLLECTION_KEYS).size, 20);
});
test("every new item has a descriptive name, category and detail", () => {
  for (const item of MORVEN_NEW_COLLECTION) {
    assert.ok(item.name.length >= 3);
    assert.ok(item.description.length >= 20);
    assert.ok(item.category);
    assert.ok(item.image.startsWith("/morven-showcase/"));
    assert.ok(item.image.endsWith(".webp"));
    assert.ok(getCategorySizeOptions(item.category).length > 0, item.name);
  }
});
test("owner-requested prices exist and remain within the approved ranges", () => {
  assert.equal(MORVEN_NEW_COLLECTION.length, 20);
  for (const item of MORVEN_NEW_COLLECTION) {
    assert.equal(item.price, item.offerPrice);
    assert.ok(item.price > 0 && Number.isFinite(item.price), item.name);
    if (item.category === "SUIT") assert.ok(item.price >= 3500 && item.price <= 7000, item.name);
    if (item.category === "SHIRT") assert.equal(item.price, 760, item.name);
    if (["KNITWEAR", "SWEATSHIRT", "T-SHIRT"].includes(item.category))
      assert.ok([384, 400, 480, 800].includes(item.price), item.name);
    assert.equal("stock" in item, false);
  }
});
