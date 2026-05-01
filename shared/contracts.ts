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

// Request dari Frontend ke Backend
export interface AnalysisRequest {
  locationId: string; // Contoh: "Kecamatan Semarang Tengah"
  businessType: string; // Contoh: "cafe", "barbershop", "fashion"
}

// Response dari Backend ke Frontend (Dummy dari AI)
export interface AnalysisResponse {
  success: boolean;
  data: {
    location: string;
    businessType: string;
    metrics: {
      traffic_score: number;
      transit_score: number;
      poi_score: number;
      competitor_count: number;
      comp_ratio: number;
    };
    ai_prediction: {
      final_score: number; // Skala 0 - 100
      cluster: "Ramai" | "Potensial" | "Sepi";
      insight: string; // Narasi buatan AI
    };
  };
}
