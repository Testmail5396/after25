import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import { backupSchema } from "../../shared/schemas";
import { getSessionUser } from "./_shared/auth";
import { putRecord } from "./_shared/blobs";
import { errorResponse, json } from "./_shared/response";

const rawHandler: Handler = async (event) => {
  const user = getSessionUser(event);
  if (!user) {
    return errorResponse(401, "Not authenticated");
  }
  if (event.httpMethod !== "POST") {
    return errorResponse(405, "Method not allowed");
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return errorResponse(400, "Invalid JSON body");
  }

  const parsed = backupSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "Backup file is not in the expected format", parsed.error.flatten());
  }

  const { orders, purchases } = parsed.data;

  await Promise.all([
    ...orders.map((order) => putRecord(`orders/${order.id}`, order)),
    ...purchases.map((purchase) => putRecord(`purchases/${purchase.id}`, purchase)),
  ]);

  return json(200, {
    success: true,
    importedOrders: orders.length,
    importedPurchases: purchases.length,
  });
};

export const handler = withErrorHandling(rawHandler);
