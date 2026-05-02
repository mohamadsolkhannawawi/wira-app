import type { AnalysisRequest, AnalysisResult } from "@wira-app/shared";
import { requestJson } from "./client";

export const submitAnalysis = async (
  payload: AnalysisRequest,
): Promise<AnalysisResult> => {
  return requestJson<AnalysisResult>("/analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};
