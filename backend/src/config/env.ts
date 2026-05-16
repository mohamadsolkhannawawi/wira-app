import "dotenv/config";

const requireEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    console.warn(`[ENV] Warning: ${key} is not set`);
    return "";
  }
  return value;
};

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  // Server
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT, 3000),
  appName: process.env.APP_NAME ?? "WIRA API",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",

  // Database
  databaseUrl: requireEnv("DATABASE_URL"),

  // JWT 
  jwtSecret: requireEnv("JWT_SECRET", "wira-dev-jwt-secret-key-32chars!"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET", "wira-dev-refresh-secret-32chars!"),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  jwtRefreshExpiresInDays: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS ?? "30", 10),

  // Redis
  redisUrl: process.env.REDIS_URL ?? "",

  // RabbitMQ
  rabbitmqUrl: process.env.RABBITMQ_URL ?? "",

  // AI Service
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "",
  aiApiKey: process.env.AI_API_KEY ?? "",
} as const;
