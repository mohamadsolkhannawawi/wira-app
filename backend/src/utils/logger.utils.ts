import { env } from "../config/env.js";

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
const currentLevel = env.nodeEnv === "production" ? LOG_LEVELS.info : LOG_LEVELS.debug;

const timestamp = (): string => new Date().toISOString();

export const logger = {
  debug(message: string, meta?: unknown): void {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.log(`[${timestamp()}] DEBUG: ${message}`, meta ?? "");
    }
  },
  info(message: string, meta?: unknown): void {
    if (currentLevel <= LOG_LEVELS.info) {
      console.log(`[${timestamp()}] INFO: ${message}`, meta ?? "");
    }
  },
  warn(message: string, meta?: unknown): void {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(`[${timestamp()}] WARN: ${message}`, meta ?? "");
    }
  },
  error(message: string, meta?: unknown): void {
    console.error(`[${timestamp()}] ERROR: ${message}`, meta ?? "");
  },
};
