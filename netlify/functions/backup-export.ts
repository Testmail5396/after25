import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import type { Backup, OrderRecord, ProductRateRecord, PurchaseRecord } from "@shared/types";
import { getSessionUser } from "./_shared/auth";
import { listRecords } from "./_shared/blobs";
import { errorResponse, json } from "./_shared/response";

const rawHandler: Handler = async (event) => {
  const user = getSessionUser(event);
  if (!user) {
    return errorResponse(401, "Not authenticated");
  }
  if (event.httpMethod !== "GET") {
    return errorResponse(405, "Method not allowed");
  }

  const [orders, purchases, products] = await Promise.all([
    listRecords<OrderRecord>("orders/"),
    listRecords<PurchaseRecord>("purchases/"),
    listRecords<ProductRateRecord>("products/"),
  ]);

  const backup: Backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    orders,
    purchases,
    products,
  };

  return json(200, backup);
};

export const handler = withErrorHandling(rawHandler);
