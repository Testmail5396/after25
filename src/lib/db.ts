import Dexie, { type Table } from "dexie";
import type { OrderRecord, PurchaseRecord } from "@shared/types";

export interface MetaRecord {
  key: string;
  value: string;
}

class After25Database extends Dexie {
  orders!: Table<OrderRecord, string>;
  purchases!: Table<PurchaseRecord, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super("after25cakes-cache");
    this.version(1).stores({
      orders: "id, saleDate, phoneNumber, productCategory",
      purchases: "id, purchaseDate",
      meta: "key",
    });
  }
}

export const db = new After25Database();

const LAST_SYNCED_KEY = "lastSyncedAt";

export async function cacheOrders(orders: OrderRecord[]): Promise<void> {
  await db.orders.clear();
  await db.orders.bulkPut(orders);
}

export async function cachePurchases(purchases: PurchaseRecord[]): Promise<void> {
  await db.purchases.clear();
  await db.purchases.bulkPut(purchases);
}

export async function setLastSyncedAt(iso: string): Promise<void> {
  await db.meta.put({ key: LAST_SYNCED_KEY, value: iso });
}

export async function getLastSyncedAt(): Promise<string | null> {
  const record = await db.meta.get(LAST_SYNCED_KEY);
  return record?.value ?? null;
}

export async function getCachedOrders(): Promise<OrderRecord[]> {
  return db.orders.toArray();
}

export async function getCachedPurchases(): Promise<PurchaseRecord[]> {
  return db.purchases.toArray();
}
