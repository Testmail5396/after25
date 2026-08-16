import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import { errorResponse } from "./response";

/** Wraps a handler so unexpected errors return a safe, structured response without leaking stack traces. */
export function withErrorHandling(handler: Handler): Handler {
  return async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
    try {
      const result = await handler(event, context);
      if (!result) {
        return errorResponse(500, "Something went wrong. Please try again.");
      }
      return result;
    } catch (err) {
      const isDev = process.env.CONTEXT === "dev" || process.env.NETLIFY_DEV === "true";
      console.error("Unhandled function error:", err);
      return errorResponse(500, "Something went wrong. Please try again.", isDev && err instanceof Error ? err.message : undefined);
    }
  };
}
