import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import { randomUUID } from "node:crypto";
import { purchaseInputSchema } from "../../shared/schemas";
import type { PurchaseRecord } from "@shared/types";
import { getSessionUser } from "./_shared/auth";
import { listRecords, putRecord } from "./_shared/blobs";
import { errorResponse, json } from "./_shared/response";

const rawHandler: Handler = async (event) => {
  const user = getSessionUser(event);
  if (!user) {
    return errorResponse(401, "Not authenticated");
  }

  if (event.httpMethod === "GET") {
    const purchases = await listRecords<PurchaseRecord>("purchases/");
    purchases.sort((a, b) => (a.purchaseDate < b.purchaseDate ? 1 : a.purchaseDate > b.purchaseDate ? -1 : (a.createdAt < b.createdAt ? 1 : -1)));
    return json(200, { purchases });
  }

  if (event.httpMethod === "POST") {
    let body: unknown;
    try {
      body = JSON.parse(event.body ?? "{}");
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const parsed = purchaseInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, "Invalid purchase data", parsed.error.flatten());
    }

    const now = new Date().toISOString();
    const id = randomUUID();
    const record: PurchaseRecord = {
      ...parsed.data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await putRecord(`purchases/${id}`, record);
    return json(201, { purchase: record });
  }

  return errorResponse(405, "Method not allowed");
};

export const handler = withErrorHandling(rawHandler);
