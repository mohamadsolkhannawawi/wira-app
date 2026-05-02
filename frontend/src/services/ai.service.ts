export interface AiInsightPayload {
  businessType: string;
  kelurahan: string;
  metrics: Record<string, number>;
  score: number;
}

export const requestAiInsight = async (
  _payload: AiInsightPayload,
): Promise<string> => {
  return "AI service belum aktif. Menggunakan mock insight pada MVP.";
};
