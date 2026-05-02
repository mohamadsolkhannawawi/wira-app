import type { NextFunction, Request, Response } from "express";
import { fail } from "../utils/response.js";
import { AppError } from "../utils/appError.js";
import { env } from "../config/env.js";

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json(fail("NOT_FOUND", "Route not found"));
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isAppError = err instanceof AppError;

  if (isAppError) {
    res.status(err.statusCode).json(fail(err.code, err.message, err.details));
    return;
  }

  const message =
    err instanceof Error ? err.message : "Unexpected server error";
  const details =
    env.nodeEnv === "development" && err instanceof Error
      ? { stack: err.stack }
      : undefined;

  res.status(500).json(fail("INTERNAL_ERROR", message, details));
};
