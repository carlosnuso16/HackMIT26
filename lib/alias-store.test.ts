import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createMemoryAliasStore,
  nextAlias,
  resolveInitialAlias,
} from "../lib/alias-store";

describe("alias-store", () => {
  const pool = ["A", "B", "C"] as const;

  it("cycles aliases in the pool", () => {
    assert.equal(nextAlias("A", pool), "B");
    assert.equal(nextAlias("C", pool), "A");
    assert.equal(nextAlias("missing", pool), "A");
  });

  it("reads saved alias when present in pool", () => {
    const store = createMemoryAliasStore("B");
    assert.equal(resolveInitialAlias(store, pool), "B");
  });

  it("falls back when saved alias is stale", () => {
    const store = createMemoryAliasStore("Z");
    assert.equal(resolveInitialAlias(store, pool), "A");
  });

  it("persists write and clear through the interface", () => {
    const store = createMemoryAliasStore();
    store.write("C");
    assert.equal(store.read(), "C");
    store.clear();
    assert.equal(store.read(), null);
  });
});
