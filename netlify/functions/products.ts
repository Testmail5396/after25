import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import { randomUUID } from "node:crypto";
import { productRateInputSchema } from "../../shared/schemas";
import type { ProductRateRecord } from "@shared/types";
import { getSessionUser } from "./_shared/auth";
import { listRecords, putRecord } from "./_shared/blobs";
import { errorResponse, json } from "./_shared/response";
import { sanitizeText } from "./_shared/sanitize";

const rawHandler: Handler = async (event) => {
  const user = getSessionUser(event);
  if (!user) {
    return errorResponse(401, "Not authenticated");
  }

  if (event.httpMethod === "GET") {
    const products = await listRecords<ProductRateRecord>("products/");
    products.sort((a, b) => a.productName.localeCompare(b.productName));
    return json(200, { products });
  }

  if (event.httpMethod === "POST") {
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

    const now = new Date().toISOString();
    const id = randomUUID();
    const record: ProductRateRecord = {
      ...parsed.data,
      productName: sanitizeText(parsed.data.productName, 160),
      id,
      createdAt: now,
      updatedAt: now,
    };

    await putRecord(`products/${id}`, record);
    return json(201, { product: record });
  }

  return errorResponse(405, "Method not allowed");
};

export const handler = withErrorHandling(rawHandler);
