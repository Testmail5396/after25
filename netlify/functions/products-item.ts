import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import { productRateInputSchema } from "../../shared/schemas";
import type { ProductRateRecord } from "@shared/types";
import { getSessionUser } from "./_shared/auth";
import { deleteRecord, getRecord, putRecord } from "./_shared/blobs";
import { errorResponse, json } from "./_shared/response";
import { sanitizeText } from "./_shared/sanitize";

const rawHandler: Handler = async (event) => {
  const user = getSessionUser(event);
  if (!user) {
    return errorResponse(401, "Not authenticated");
  }

  const id = event.queryStringParameters?.id;
  if (!id) {
    return errorResponse(400, "Missing product id");
  }
  const key = `products/${id}`;

  const existing = await getRecord<ProductRateRecord>(key);
  if (!existing) {
    return errorResponse(404, "Product not found");
  }

  if (event.httpMethod === "PUT") {
    let body: unknown;
    try {
      body = JSON.parse(event.body ?? "{}");
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const parsed = productRateInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, "Invalid product data", parsed.error.flatten());
    }

    const updated: ProductRateRecord = {
      ...existing,
      ...parsed.data,
      productName: sanitizeText(parsed.data.productName, 160),
      id,
      updatedAt: new Date().toISOString(),
    };

    await putRecord(key, updated);
    return json(200, { product: updated });
  }

  if (event.httpMethod === "DELETE") {
    await deleteRecord(key);
    return json(200, { success: true });
  }

  return errorResponse(405, "Method not allowed");
};

export const handler = withErrorHandling(rawHandler);
