// This file is kept for backwards compatibility.
// The main analysis logic has been moved to analysis.service.ts
// which uses the database and AI service.

import type { AnalysisRequest, AnalysisResult } from "@wira-app/shared";
import { analysisService } from "./analysis.service.js";

export const analyzeLocationDummy = async (
  reqData: AnalysisRequest,
): Promise<AnalysisResult> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return analysisService.analyze(reqData);
};
