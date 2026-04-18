export const API_PREFIX = "/api/v1";

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface HealthData {
  service: string;
  status: "ok";
  timestamp: string;
  uptimeSeconds: number;
}

export interface AppInfoData {
  name: string;
  version: string;
  apiPrefix: string;
}

export interface LocationFeature {
  kelurahan: string;
  competitorCount: number;
  competitionRatio: number;
  poiScore: number;
  residentialDensity: number;
  transitCount: number;
}

export interface AreaScore {
  kelurahan: string;
  clusterLabel: "ramai" | "potensial" | "sepi";
  score: number;
  confidence: "tinggi" | "sedang" | "rendah";
}

export interface InsightRequest {
  businessType: "coffeeshop" | "laundry" | "other";
  kelurahan: string;
}

export interface InsightResponse {
  title: string;
  summary: string;
  recommendations: string[];
}
