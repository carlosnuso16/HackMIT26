/**
 * Pseudonymous alias persistence adapter.
 * Two adapters (browser localStorage + memory) justify the seam.
 */

export const ALIAS_STORAGE_KEY = "cg-safe-alias";

export type AliasStore = {
  read(): string | null;
  write(alias: string): void;
  clear(): void;
};

export function createMemoryAliasStore(
  initial: string | null = null,
): AliasStore {
  let value = initial;
  return {
    read: () => value,
    write: (alias) => {
      value = alias;
    },
    clear: () => {
      value = null;
    },
  };
}

export function createLocalStorageAliasStore(
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">,
): AliasStore {
  const resolved =
    storage ??
    (typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage
      : null);

  if (!resolved) {
    return createMemoryAliasStore();
  }

  return {
    read: () => resolved.getItem(ALIAS_STORAGE_KEY),
    write: (alias) => resolved.setItem(ALIAS_STORAGE_KEY, alias),
    clear: () => resolved.removeItem(ALIAS_STORAGE_KEY),
  };
}

export function nextAlias(current: string, pool: readonly string[]): string {
  if (pool.length === 0) return current;
  const index = pool.indexOf(current);
  const nextIndex = index < 0 ? 0 : (index + 1) % pool.length;
  return pool[nextIndex]!;
}

export function resolveInitialAlias(
  store: AliasStore,
  pool: readonly string[],
): string {
  const saved = store.read();
  if (saved && pool.includes(saved)) return saved;
  return pool[0] ?? "Anonymous";
}
