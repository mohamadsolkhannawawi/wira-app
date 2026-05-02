import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";
import { ok } from "../utils/response.js";

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const profile = await userService.getProfile(userId);
    res.status(200).json(ok(profile));
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const body = req.body as { name?: string; email?: string };
    const updateData: { name?: string; email?: string } = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    const updated = await userService.updateProfile(userId, updateData);
    res.status(200).json(ok(updated));
  } catch (err) {
    next(err);
  }
};
