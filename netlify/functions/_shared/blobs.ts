import { getStore } from "@netlify/blobs";

const STORE_NAME = "after25cakes-data";

/**
 * Some deploy environments don't auto-inject the Blobs context (siteID/token)
 * into the function runtime. When BLOBS_SITE_ID and BLOBS_TOKEN are set, fall
 * back to explicit "manual" configuration as documented by Netlify.
 */
export function dataStore() {
  const siteID = process.env.BLOBS_SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }
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
