/**
 * API Error Handling Layer
 * Standardized error handling for all API routes
 */

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Common API error codes
 */
export const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Database
  DB_ERROR: 'DB_ERROR',
  DB_CONSTRAINT_ERROR: 'DB_CONSTRAINT_ERROR',

  // External services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  N8N_API_ERROR: 'N8N_API_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Generic
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

/**
 * Handle API errors and return appropriate Response
 */
export function handleAPIError(error: unknown): Response {
  // ponytail: stdlib first
  console.error('[API Error]', error);

  if (error instanceof APIError) {
    return new Response(JSON.stringify(error.toJSON()), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as { code: string; message: string; details?: string };

    // Check for common Postgres error codes
    if (pgError.code === '23505') {
      return new Response(
        JSON.stringify({
          error: {
            code: ErrorCodes.ALREADY_EXISTS,
            message: 'Resource already exists',
            details: pgError.details,
          },
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (pgError.code === '23503') {
      return new Response(
        JSON.stringify({
          error: {
            code: ErrorCodes.DB_CONSTRAINT_ERROR,
            message: 'Foreign key constraint violation',
            details: pgError.details,
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          code: ErrorCodes.DB_ERROR,
          message: pgError.message,
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Generic error
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';

  return new Response(
    JSON.stringify({
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message,
      },
    }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Validate required environment variables
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new APIError(
      500,
      ErrorCodes.INTERNAL_ERROR,
      `Missing required environment variable: ${key}`
    );
  }
  return value;
}

/**
 * Create error response helpers
 */
export const createError = {
  unauthorized: (message = 'Unauthorized') =>
    new APIError(401, ErrorCodes.UNAUTHORIZED, message),

  forbidden: (message = 'Forbidden') =>
    new APIError(403, ErrorCodes.FORBIDDEN, message),

  notFound: (resource = 'Resource') =>
    new APIError(404, ErrorCodes.NOT_FOUND, `${resource} not found`),

  badRequest: (message = 'Bad request') =>
    new APIError(400, ErrorCodes.BAD_REQUEST, message),

  validation: (details: unknown) =>
    new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Validation failed', details),

  rateLimit: () =>
    new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded'),

  internal: (message = 'Internal server error') =>
    new APIError(500, ErrorCodes.INTERNAL_ERROR, message),
};
