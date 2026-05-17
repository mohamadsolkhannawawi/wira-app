import type { Request, Response, NextFunction } from "express";
import { locationService } from "../services/locations.service.js";
import { ok } from "../utils/response.js";

export const getKecamatanList = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query.q as string | undefined;
    const data = await locationService.getKecamatanList(query);
    res.status(200).json(ok(data));
  } catch (err) {
    next(err);
  }
};

export const getKelurahanList = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query.q as string | undefined;
    const data = await locationService.getKelurahanList(query);
    res.status(200).json(ok(data));
  } catch (err) {
    next(err);
  }
};

export const getStreetList = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const kelurahan = String(req.query.kelurahan ?? "");
    const query = req.query.q as string | undefined;
    const data = await locationService.getStreetList(kelurahan, query);
    res.status(200).json(ok(data));
  } catch (err) {
    next(err);
  }
};

export const searchStreets = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = String(req.query.q ?? "");
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const data = await locationService.searchStreets(query, limit);
    res.status(200).json(ok(data));
  } catch (err) {
    next(err);
  }
};

export const findNearestLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const data = await locationService.findNearestLocation(lat, lng);
    res.status(200).json(ok(data));
  } catch (err) {
    next(err);
  }
};
