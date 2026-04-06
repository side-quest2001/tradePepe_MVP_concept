export interface ErrorResponsePayload {
  error: {
    message: string;
    details?: unknown;
    requestId?: string | null;
  };
}

export interface SuccessResponsePayload<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export function buildErrorResponse(message: string, details?: unknown, requestId?: string | null): ErrorResponsePayload {
  return {
    error: {
      message,
      details,
      requestId
    }
  };
}

export function buildSuccessResponse<T>(data: T, meta?: Record<string, unknown>): SuccessResponsePayload<T> {
  return {
    data,
    ...(meta ? { meta } : {})
  };
}
