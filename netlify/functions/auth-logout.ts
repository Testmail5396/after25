import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import { buildLogoutCookie } from "./_shared/auth";
import { errorResponse, json } from "./_shared/response";

const rawHandler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return errorResponse(405, "Method not allowed");
  }

  return json(200, { success: true }, { "Set-Cookie": buildLogoutCookie() });
};

export const handler = withErrorHandling(rawHandler);
