import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import { purchaseInputSchema } from "../../shared/schemas";
import type { PurchaseRecord } from "@shared/types";
import { getSessionUser } from "./_shared/auth";
import { deleteRecord, getRecord, putRecord } from "./_shared/blobs";
import { errorResponse, json } from "./_shared/response";

const rawHandler: Handler = async (event) => {
  const user = getSessionUser(event);
  if (!user) {
    return errorResponse(401, "Not authenticated");
  }

  const id = event.queryStringParameters?.id;
  if (!id) {
    return errorResponse(400, "Missing purchase id");
  }
  const key = `purchases/${id}`;

  const existing = await getRecord<PurchaseRecord>(key);
  if (!existing) {
    return errorResponse(404, "Purchase not found");
  }

  if (event.httpMethod === "PUT") {
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

    const updated: PurchaseRecord = {
      ...existing,
      ...parsed.data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await putRecord(key, updated);
    return json(200, { purchase: updated });
  }

  if (event.httpMethod === "DELETE") {
    await deleteRecord(key);
    return json(200, { success: true });
  }

  return errorResponse(405, "Method not allowed");
};

export const handler = withErrorHandling(rawHandler);
