import type {
  AuthUser,
  Backup,
  OrderInput,
  OrderRecord,
  ProductRateInput,
  ProductRateRecord,
  PurchaseInput,
  PurchaseRecord,
} from "@shared/types";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const url = path.startsWith("/.netlify/") ? path : `/api${path}`;
  try {
    response = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(0, "Network unavailable");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let details: unknown;
    try {
      const body = await response.json();
      message = body?.error?.message ?? message;
      details = body?.error?.details;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(response.status, message, details);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// ---- Auth ----

export function login(username: string, password: string): Promise<{ user: AuthUser }> {
  return request("/auth-login", { method: "POST", body: JSON.stringify({ username, password }) });
}

export function logout(): Promise<{ success: boolean }> {
  return request("/auth-logout", { method: "POST" });
}

export function fetchSession(): Promise<{ user: AuthUser }> {
  return request("/auth-session");
}

// ---- Orders ----

export async function fetchOrders(): Promise<OrderRecord[]> {
  const data = await request<{ orders: OrderRecord[] }>("/orders");
  return data.orders;
}

export async function createOrder(input: OrderInput): Promise<OrderRecord> {
  const data = await request<{ order: OrderRecord }>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.order;
}

// Item-level order routes call the function directly (bypassing the
// /api/orders/* redirect) because Netlify's splat-to-query rewrite for this
// route does not reliably populate the id query parameter in production.
function orderItemUrl(id: string): string {
  return `/.netlify/functions/orders-item?id=${encodeURIComponent(id)}`;
}

export async function updateOrder(id: string, input: OrderInput): Promise<OrderRecord> {
  const data = await request<{ order: OrderRecord }>(orderItemUrl(id), {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.order;
}

export async function dismissOrderReminder(id: string, forYear: number): Promise<OrderRecord> {
  const data = await request<{ order: OrderRecord }>(orderItemUrl(id), {
    method: "PATCH",
    body: JSON.stringify({ reminderDismissedForYear: forYear }),
  });
  return data.order;
}

export function deleteOrder(id: string): Promise<{ success: boolean }> {
  return request(orderItemUrl(id), { method: "DELETE" });
}

// ---- Purchases ----

export async function fetchPurchases(): Promise<PurchaseRecord[]> {
  const data = await request<{ purchases: PurchaseRecord[] }>("/purchases");
  return data.purchases;
}

export async function createPurchase(input: PurchaseInput): Promise<PurchaseRecord> {
  const data = await request<{ purchase: PurchaseRecord }>("/purchases", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.purchase;
}

function purchaseItemUrl(id: string): string {
  return `/.netlify/functions/purchases-item?id=${encodeURIComponent(id)}`;
}

export async function updatePurchase(id: string, input: PurchaseInput): Promise<PurchaseRecord> {
  const data = await request<{ purchase: PurchaseRecord }>(purchaseItemUrl(id), {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.purchase;
}

export function deletePurchase(id: string): Promise<{ success: boolean }> {
  return request(purchaseItemUrl(id), { method: "DELETE" });
}

// ---- Product rates ----

export async function fetchProductRates(): Promise<ProductRateRecord[]> {
  const data = await request<{ products: ProductRateRecord[] }>("/products");
  return data.products;
}

export async function createProductRate(input: ProductRateInput): Promise<ProductRateRecord> {
  const data = await request<{ product: ProductRateRecord }>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.product;
}

function productItemUrl(id: string): string {
  return `/.netlify/functions/products-item?id=${encodeURIComponent(id)}`;
}

export async function updateProductRate(id: string, input: ProductRateInput): Promise<ProductRateRecord> {
  const data = await request<{ product: ProductRateRecord }>(productItemUrl(id), {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.product;
}

export function deleteProductRate(id: string): Promise<{ success: boolean }> {
  return request(productItemUrl(id), { method: "DELETE" });
}

// ---- Backup ----

export function exportBackup(): Promise<Backup> {
  return request("/backup-export");
}

export function importBackup(backup: Backup): Promise<{ success: boolean; importedOrders: number; importedPurchases: number }> {
  return request("/backup-import", { method: "POST", body: JSON.stringify(backup) });
}
