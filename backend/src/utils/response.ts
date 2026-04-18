import type { ApiFailure, ApiSuccess } from "@wira-app/shared";

export const ok = <T>(
  data: T,
  meta?: Record<string, unknown>,
): ApiSuccess<T> => ({
  success: true,
  data,
  ...(meta ? { meta } : {}),
});

export const fail = (
  code: string,
  message: string,
  details?: unknown,
): ApiFailure => ({
  success: false,
  error: { code, message, details },
});
