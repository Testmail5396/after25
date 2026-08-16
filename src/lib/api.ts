import type { AuthUser, Backup, OrderInput, OrderRecord, PurchaseInput, PurchaseRecord } from "@shared/types";

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
  try {
    response = await fetch(`/api${path}`, {
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

export async function updateOrder(id: string, input: OrderInput): Promise<OrderRecord> {
  const data = await request<{ order: OrderRecord }>(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.order;
}

export async function dismissOrderReminder(id: string, forYear: number): Promise<OrderRecord> {
  const data = await request<{ order: OrderRecord }>(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ reminderDismissedForYear: forYear }),
  });
  return data.order;
}

export function deleteOrder(id: string): Promise<{ success: boolean }> {
  return request(`/orders/${id}`, { method: "DELETE" });
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

export async function updatePurchase(id: string, input: PurchaseInput): Promise<PurchaseRecord> {
  const data = await request<{ purchase: PurchaseRecord }>(`/purchases/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.purchase;
}

export function deletePurchase(id: string): Promise<{ success: boolean }> {
  return request(`/purchases/${id}`, { method: "DELETE" });
}

// ---- Backup ----

export function exportBackup(): Promise<Backup> {
  return request("/backup-export");
}

export function importBackup(backup: Backup): Promise<{ success: boolean; importedOrders: number; importedPurchases: number }> {
  return request("/backup-import", { method: "POST", body: JSON.stringify(backup) });
}
