import "dotenv/config";

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT, 3000),
  appName: process.env.APP_NAME ?? "WIRA API",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
