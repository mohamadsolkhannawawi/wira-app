import { cacheService, TTL } from "../services/cache.service.js";
import type { AnalysisResult } from "@wira-app/shared";

export const getAnalysisCache = async (
  key: string,
): Promise<AnalysisResult | null> => {
  return cacheService.get<AnalysisResult>(`analysis:${key}`);
};

export const setAnalysisCache = async (
  key: string,
  data: AnalysisResult,
): Promise<void> => {
  await cacheService.set(`analysis:${key}`, data, TTL.ANALYSIS);
};
