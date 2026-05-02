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

export type BusinessType = string;

export type ClusterLabel = "RAMAI" | "POTENSIAL" | "SEPI";

export type ConfidenceLevel = "TINGGI" | "SEDANG" | "RENDAH";

export interface LocationMetrics {
  trafficScore: number;
  transitScore: number;
  poiScore: number;
  competitorScore: number;
  compRatio: number;
}

export interface AnalysisRequest {
  businessType: BusinessType;
  latitude: number;
  longitude: number;
  kelurahan?: string;
}

export interface AnalysisResult {
  id: string;
  locationName: string;
  kecamatan: string;
  businessType: BusinessType;
  finalScore: number;
  clusterLabel: ClusterLabel;
  confidenceLevel: ConfidenceLevel;
  metrics: LocationMetrics;
  insight: string;
  createdAt: string;
}

export interface AnalysisResponse {
  success: true;
  data: AnalysisResult;
}

export interface LocationSummary {
  id: string;
  kelurahan: string;
  kecamatan: string;
  latitude: number;
  longitude: number;
  finalScore: number;
  clusterLabel: ClusterLabel;
}

export interface LocationDetail extends LocationSummary {
  businessType: BusinessType;
  confidenceLevel: ConfidenceLevel;
  metrics: LocationMetrics;
}

export interface LocationsResponse {
  locations: LocationSummary[];
}

export interface CompareLocationsResponse {
  businessType: BusinessType;
  locations: LocationDetail[];
  recommended: string;
  narrative: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
}

export interface SearchHistorySummary {
  id: string;
  locationName: string;
  businessType: BusinessType;
  finalScore: number;
  clusterLabel: ClusterLabel;
  isSaved: boolean;
  createdAt: string;
}
