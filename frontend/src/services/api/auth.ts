import type { AuthResponse } from "@wira-app/shared";
import { requestJson } from "./client";

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  return requestJson<AuthResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (
  name: string,
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  return requestJson<AuthResponse>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, email, password }),
  });
};

export const refresh = async (refreshToken: string): Promise<AuthResponse> => {
  return requestJson<AuthResponse>("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
};

export const logout = async (): Promise<{ success: boolean }> => {
  return requestJson<{ success: boolean }>("/auth/logout", {
    method: "POST",
  });
};
