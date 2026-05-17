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

export interface FeatureBlock {
  traffic_score: number;
  transit_score: number;
  poi_score: number;
  competitor: number;
  comp_ratio: number;
}

export interface AlternativeRecommendation {
  peringkat: number;
  nama_jalan: string;
  kecamatan: string;
  skor_potensi_persen: number;
  bobot_fitur: FeatureBlock;
  nilai_fitur_jalan: FeatureBlock;
}

export interface AnalysisRequest {
  bizType: BusinessType;
  kelurahan: string;
  streetName: string;
}

export interface AnalysisResult {
  id: string;
  streetName: string;
  kelurahan: string;
  kecamatan: string;
  bizType: BusinessType;
  skorPotensi: number;
  bobotFitur: FeatureBlock;
  nilaiFiturJalan: FeatureBlock;
  rekomendasiAlternatif: AlternativeRecommendation[];
  insight: string;
  createdAt: string;
}

export interface AnalysisResponse {
  success: true;
  data: AnalysisResult;
}

export interface KelurahanOption {
  kelurahan: string;
}

export interface StreetOption {
  namaJalan: string;
  kelurahan: string;
  kecamatan: string;
  latCentroid: number;
  lngCentroid: number;
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

export interface AnalysisHistorySummary {
  id: string;
  streetName: string;
  kelurahan: string;
  bizType: BusinessType;
  skorPotensi: number;
  isSaved: boolean;
  createdAt: string;
}
