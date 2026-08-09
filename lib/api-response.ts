/**
 * lib/api-response.ts
 *
 * Centralized API Response & Error Handling Utilities.
 * Standardizes success/error JSON formatting and wraps Next.js API route handlers
 * to prevent unhandled promise rejections.
 *
 * Owner: Member 2 (Backend / Architecture)
 */

import { NextResponse } from "next/server";
import { logger } from "./logger";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
}

/**
 * Higher-order function wrapping API Route Handlers in a safe try/catch block.
 *
 * @param handler - Next.js route handler function
 */
export function withErrorHandler<T extends Array<unknown>>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Internal server error";
      logger.error("Unhandled API Route Error:", error);

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  };
}
