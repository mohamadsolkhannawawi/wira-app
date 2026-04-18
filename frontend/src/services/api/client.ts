import type { ApiResponse, AppInfoData, HealthData } from "@wira-app/shared";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

const handleResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!payload.success) {
    throw new Error(payload.error.message);
  }

  return payload.data;
};

export const getAppInfo = async (): Promise<AppInfoData> => {
  const response = await fetch(`${API_BASE_URL}`);
  return handleResponse<AppInfoData>(response);
};

export const getHealth = async (): Promise<HealthData> => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<HealthData>(response);
};
