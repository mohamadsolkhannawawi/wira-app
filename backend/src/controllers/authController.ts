import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { ok } from "../utils/response.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name?: string;
    };
    const result = await authService.register(email, password, name);
    res.status(201).json(ok(result));
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login(email, password);
    res.status(200).json(ok(result));
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await authService.refresh(refreshToken);
    res.status(200).json(ok(result));
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    await authService.logout(refreshToken);
    res.status(200).json(ok({ message: "Logged out successfully" }));
  } catch (err) {
    next(err);
  }
};
