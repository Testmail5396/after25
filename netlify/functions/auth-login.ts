import type { Handler } from "@netlify/functions";
import { withErrorHandling } from "./_shared/withErrorHandling";
import { loginInputSchema } from "../../shared/schemas";
import { buildSessionCookie, createSessionToken, findMatchingUser } from "./_shared/auth";
import { errorResponse, json } from "./_shared/response";

const rawHandler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return errorResponse(405, "Method not allowed");
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return errorResponse(400, "Invalid JSON body");
  }

  const parsed = loginInputSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "Invalid credentials payload", parsed.error.flatten());
  }

  const { username, password } = parsed.data;

  if (!findMatchingUser(username, password)) {
    return errorResponse(401, "Invalid username or password");
  }

  const token = createSessionToken(username);

  return json(
    200,
    { user: { username } },
    { "Set-Cookie": buildSessionCookie(token) },
  );
};

export const handler = withErrorHandling(rawHandler);
