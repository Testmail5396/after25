import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import { getSessionUser } from "./_shared/auth";
import { errorResponse, json } from "./_shared/response";

const rawHandler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return errorResponse(405, "Method not allowed");
  }

  const user = getSessionUser(event);
  if (!user) {
    return errorResponse(401, "Not authenticated");
  }

  return json(200, { user });
};

export const handler = withErrorHandling(rawHandler);
