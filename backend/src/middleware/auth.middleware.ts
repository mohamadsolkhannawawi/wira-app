import type { Request, Response, NextFunction } from "express";
import { tokenManager } from "../utils/tokenManager.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Token required" } });
    return;
  }

  try {
    req.user = tokenManager.verifyAccessToken(header.split(" ")[1]!);
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: "TOKEN_INVALID", message: "Invalid or expired token" } });
  }
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.user = tokenManager.verifyAccessToken(header.split(" ")[1]!);
    } catch {
      /* guest mode — ignore invalid token */
    }
  }
  next();
};
