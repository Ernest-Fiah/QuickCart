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
test("new catalog has no invented default price or stock", () => {
  for (const item of MORVEN_NEW_COLLECTION) {
    assert.equal("price" in item, false);
    assert.equal("offerPrice" in item, false);
    assert.equal("stock" in item, false);
  }
});
