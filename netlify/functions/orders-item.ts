import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import { z } from "zod";
import { orderInputSchema } from "../../shared/schemas";
import type { OrderRecord } from "@shared/types";
import { getSessionUser } from "./_shared/auth";
import { deleteRecord, getRecord, putRecord } from "./_shared/blobs";
import { errorResponse, json } from "./_shared/response";
import { sanitizeText } from "./_shared/sanitize";

const dismissSchema = z.object({ reminderDismissedForYear: z.number().int() });

const rawHandler: Handler = async (event) => {
  const user = getSessionUser(event);
  if (!user) {
    return errorResponse(401, "Not authenticated");
  }

  const id = event.queryStringParameters?.id;
  if (!id) {
    return errorResponse(400, "Missing order id");
  }
  const key = `orders/${id}`;

  const existing = await getRecord<OrderRecord>(key);
  if (!existing) {
    return errorResponse(404, "Order not found");
  }

  if (event.httpMethod === "PUT") {
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

    const updated: OrderRecord = {
      ...existing,
      ...parsed.data,
      customerName: sanitizeText(parsed.data.customerName, 120),
      productName: sanitizeText(parsed.data.productName, 160),
      id,
      updatedAt: new Date().toISOString(),
    };

    await putRecord(key, updated);
    return json(200, { order: updated });
  }

  if (event.httpMethod === "PATCH") {
    let body: unknown;
    try {
      body = JSON.parse(event.body ?? "{}");
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const parsed = dismissSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, "Invalid patch data", parsed.error.flatten());
    }

    const updated: OrderRecord = {
      ...existing,
      reminderDismissedForYear: parsed.data.reminderDismissedForYear,
      updatedAt: new Date().toISOString(),
    };

    await putRecord(key, updated);
    return json(200, { order: updated });
  }

  if (event.httpMethod === "DELETE") {
    await deleteRecord(key);
    return json(200, { success: true });
  }

  return errorResponse(405, "Method not allowed");
};

export const handler = withErrorHandling(rawHandler);
