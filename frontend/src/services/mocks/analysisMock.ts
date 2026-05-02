import type {
  AnalysisRequest,
  AnalysisResult,
  BusinessType,
  ClusterLabel,
  ConfidenceLevel,
  LocationMetrics,
} from "@wira-app/shared";

const buildMetrics = (seed: number): LocationMetrics => {
  const normalize = (value: number) => Math.min(Math.max(value, 0.2), 0.95);
  return {
    trafficScore: normalize(0.55 + (seed % 20) / 100),
    transitScore: normalize(0.45 + ((seed + 11) % 20) / 100),
    poiScore: normalize(0.6 + ((seed + 27) % 20) / 100),
    competitorScore: normalize(0.35 + ((seed + 41) % 20) / 100),
    compRatio: normalize(0.4 + ((seed + 59) % 20) / 100),
  };
};

const resolveCluster = (score: number): ClusterLabel => {
  if (score >= 72) return "POTENSIAL";
  if (score >= 55) return "RAMAI";
  return "SEPI";
};

const resolveConfidence = (score: number): ConfidenceLevel => {
  if (score >= 75) return "TINGGI";
  if (score >= 60) return "SEDANG";
  return "RENDAH";
};

export const buildAnalysisMock = (payload: AnalysisRequest): AnalysisResult => {
  const businessType = payload.businessType as BusinessType;
  const seed = Math.floor((payload.latitude + payload.longitude) * 1000);
  const score = 62 + (seed % 28);
  const finalScore = Math.round(score * 10) / 10;
  const metrics = buildMetrics(seed);
  const kelurahan = payload.kelurahan ?? "Tembalang";

  return {
    id: `mock-${Date.now()}`,
    locationName: kelurahan,
    kecamatan: "Semarang",
    businessType,
    finalScore,
    clusterLabel: resolveCluster(finalScore),
    confidenceLevel: resolveConfidence(finalScore),
    metrics,
    insight: `Kelurahan ${kelurahan} menunjukkan dinamika pasar yang solid untuk ${businessType}. Lalu lintas dan kepadatan POI masih menjadi pendorong utama, sementara kompetisi berada pada level yang dapat dikelola.`,
    createdAt: new Date().toISOString(),
  };
};
