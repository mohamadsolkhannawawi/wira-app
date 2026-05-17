import type { Request, Response, NextFunction } from "express";
import type { AnalysisRequest } from "@wira-app/shared";
import { analysisService } from "../services/analysis.service.js";
import { aiService } from "../services/ai.service.js";
import { ok } from "../utils/response.js";

export const submitAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.body as AnalysisRequest;
    const userId = req.user?.userId;
    const result = await analysisService.analyze(payload, userId);
    res.status(200).json(ok(result));
  } catch (err) {
    next(err);
  }
};

export const getAnalysisById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await analysisService.getById(id);
    if (!result) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Analisis tidak ditemukan" } });
      return;
    }
    res.status(200).json(ok(result));
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await analysisService.getHistory(userId, req.query as Record<string, string>);
    res.status(200).json(ok(result));
  } catch (err) {
    next(err);
  }
};

export const toggleBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const result = await analysisService.toggleBookmark(id, userId);
    res.status(200).json(ok(result));
  } catch (err) {
    next(err);
  }
};

export const deleteAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    await analysisService.deleteHistory(id, userId);
    res.status(200).json(ok({ message: "Riwayat berhasil dihapus" }));
  } catch (err) {
    next(err);
  }
};

export const compareInsight = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { businessType, locations } = req.body as {
      businessType: string;
      locations: Array<{
        namaJalan: string;
        kelurahan: string;
        finalScore: number;
        trafficScore: number;
        transitScore: number;
        poiScore: number;
        competitorCount: number;
        compRatio: number;
      }>;
    };

    const narrative = await aiService.generateComparisonNarrative(
      businessType,
      locations,
    );

    res.status(200).json(ok({ narrative }));
  } catch (err) {
    next(err);
  }
};

