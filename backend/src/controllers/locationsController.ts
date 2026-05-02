import type { Request, Response, NextFunction } from "express";
import { locationService } from "../services/locations.service.js";
import { ok } from "../utils/response.js";

export const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await locationService.getAll(req.query as Record<string, string>);
    res.status(200).json(ok(result));
  } catch (err) {
    next(err);
  }
};

export const getByKelurahan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const kelurahan = req.params.kelurahan as string;
    const businessType = req.query.type as string | undefined;
    const data = await locationService.getByKelurahan(kelurahan, businessType);
    res.status(200).json(ok(data));
  } catch (err) {
    next(err);
  }
};

export const compare = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rawKelurahan = req.query.kelurahan;
    const kelurahanArray: string[] = Array.isArray(rawKelurahan)
      ? rawKelurahan.map(String)
      : [String(rawKelurahan)];
    const businessType = String(req.query.type);
    const data = await locationService.compare(kelurahanArray, businessType);
    res.status(200).json(ok(data));
  } catch (err) {
    next(err);
  }
};

export const explore = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const limit = parseInt(String(req.query.limit ?? "10"), 10);
    const businessType = String(req.query.type);
    const data = await locationService.explore(businessType, limit);
    res.status(200).json(ok(data));
  } catch (err) {
    next(err);
  }
};

export const getSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query.q as string | undefined;
    const data = await locationService.getSuggestions(query);
    res.status(200).json(ok(data));
  } catch (err) {
    next(err);
  }
};
