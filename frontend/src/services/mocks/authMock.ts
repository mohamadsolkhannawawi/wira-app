import type { AuthResponse } from "@wira-app/shared";

export const buildAuthMock = (
  email: string,
  name = "WIRA User",
): AuthResponse => ({
  user: {
    id: `user-${email.replace(/[^a-zA-Z0-9]/g, "")}`,
    name,
    email,
    role: "USER",
  },
  tokens: {
    accessToken: `mock-access-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
  },
});
