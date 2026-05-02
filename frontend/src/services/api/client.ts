import type { ApiResponse, ApiFailure, AppInfoData, HealthData } from "@wira-app/shared";
import { tokenManager } from "../../utils/tokenManager";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:3000/api/v1";

const handleResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!payload.success) {
    throw new Error((payload as ApiFailure).error?.message || "Unknown error occurred");
  }

  return payload.data;
};

export const requestJson = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const token = tokenManager.getAccessToken();
  const headers = new Headers(options?.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  return handleResponse<T>(response);
};

export const getAppInfo = async (): Promise<AppInfoData> => {
  return requestJson<AppInfoData>("");
};

export const getHealth = async (): Promise<HealthData> => {
  return requestJson<HealthData>("/health");
};
