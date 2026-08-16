import { getStore } from "@netlify/blobs";

const STORE_NAME = "after25cakes-data";

export function dataStore() {
  return getStore(STORE_NAME);
}

export async function listRecords<T>(prefix: string): Promise<T[]> {
  const store = dataStore();
  const { blobs } = await store.list({ prefix });
  const records: (T | null)[] = await Promise.all(
    blobs.map(async (blob) => {
      const value = await store.get(blob.key, { type: "json" });
      return (value as T | null) ?? null;
    }),
  );
  return records.filter((r): r is T => r !== null);
}

export async function getRecord<T>(key: string): Promise<T | null> {
  const store = dataStore();
  const value = await store.get(key, { type: "json" });
  return (value as T | null) ?? null;
}

export async function putRecord(key: string, value: unknown): Promise<void> {
  const store = dataStore();
  await store.setJSON(key, value);
}

export async function deleteRecord(key: string): Promise<void> {
  const store = dataStore();
  await store.delete(key);
}
