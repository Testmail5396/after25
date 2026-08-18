import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Local-dev-only fallback store, used when `netlify dev` is running without
 * Blobs credentials configured (no site linked). Persists each record as a
 * JSON file on disk under .local-blobs-data/, completely separate from the
 * real Netlify Blobs store — so local testing never touches production data.
 * Never used in production (only active when NETLIFY_DEV=true and no
 * BLOBS_SITE_ID/BLOBS_TOKEN are set).
 */
const DATA_DIR = path.join(process.cwd(), ".local-blobs-data");

function keyToFilePath(key: string): string {
  return path.join(DATA_DIR, `${key}.json`);
}

async function ensureDir(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function localList<T>(prefix: string): Promise<T[]> {
  const dir = path.join(DATA_DIR, prefix);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const records: (T | null)[] = await Promise.all(
    entries
      .filter((name) => name.endsWith(".json"))
      .map(async (name) => {
        try {
          const content = await fs.readFile(path.join(dir, name), "utf-8");
          return JSON.parse(content) as T;
        } catch {
          return null;
        }
      }),
  );
  return records.filter((r): r is T => r !== null);
}

export async function localGet<T>(key: string): Promise<T | null> {
  try {
    const content = await fs.readFile(keyToFilePath(key), "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function localPut(key: string, value: unknown): Promise<void> {
  const filePath = keyToFilePath(key);
  await ensureDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf-8");
}

export async function localDelete(key: string): Promise<void> {
  try {
    await fs.unlink(keyToFilePath(key));
  } catch {
    // already gone, nothing to do
  }
}

export function shouldUseLocalStore(): boolean {
  const isLocalDev = process.env.NETLIFY_DEV === "true" || process.env.CONTEXT === "dev";
  const hasManualBlobsConfig = Boolean(process.env.BLOBS_SITE_ID && process.env.BLOBS_TOKEN);
  return isLocalDev && !hasManualBlobsConfig;
}
