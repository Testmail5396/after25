import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import { orderInputSchema } from "../../shared/schemas";
import type { OrderRecord } from "@shared/types";
import { getSessionUser } from "./_shared/auth";
import { listRecords, putRecord } from "./_shared/blobs";
import { errorResponse, json } from "./_shared/response";
import { sanitizeText } from "./_shared/sanitize";
import { randomUUID } from "node:crypto";

const rawHandler: Handler = async (event) => {
  const user = getSessionUser(event);
  if (!user) {
    return errorResponse(401, "Not authenticated");
  }

  if (event.httpMethod === "GET") {
    const orders = await listRecords<OrderRecord>("orders/");
    orders.sort((a, b) => (a.saleDate < b.saleDate ? 1 : a.saleDate > b.saleDate ? -1 : (a.createdAt < b.createdAt ? 1 : -1)));
    return json(200, { orders });
  }

  if (event.httpMethod === "POST") {
    let body: unknown;
    try {
      body = JSON.parse(event.body ?? "{}");
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const parsed = orderInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, "Invalid order data", parsed.error.flatten());
    }

    const now = new Date().toISOString();
    const id = randomUUID();
    const record: OrderRecord = {
      ...parsed.data,
      customerName: sanitizeText(parsed.data.customerName, 120),
      productName: sanitizeText(parsed.data.productName, 160),
      id,
      reminderDismissedForYear: null,
      createdAt: now,
      updatedAt: now,
    };

    await putRecord(`orders/${id}`, record);
    return json(201, { order: record });
  }

  return errorResponse(405, "Method not allowed");
};

export const handler = withErrorHandling(rawHandler);
