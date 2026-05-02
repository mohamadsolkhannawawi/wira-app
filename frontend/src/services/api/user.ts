import type { AuthUser } from "@wira-app/shared";
import { requestJson } from "./client";

export const getProfile = async (): Promise<AuthUser> => {
  return requestJson<AuthUser>("/users/me");
};

export const updateProfile = async (data: { name?: string; email?: string }): Promise<AuthUser> => {
  return requestJson<AuthUser>("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};
