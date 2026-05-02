import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Parse duration string like "7d", "30d", "24h" to seconds.
 * Used because jwt.sign() expects expiresIn as number (seconds)
 * when the value comes from an environment variable (plain string).
 */
function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 604800; // fallback: 7 days
  const value = parseInt(match[1]!, 10);
  const unit = match[2]!;
  switch (unit) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 3600;
    case "d": return value * 86400;
    default: return 604800;
  }
}

export const tokenManager = {
  generateAccessToken(userId: string, role: string): string {
    const options: SignOptions = {
      expiresIn: parseDurationToSeconds(env.jwtExpiresIn),
    };
    return jwt.sign({ userId, role }, env.jwtSecret, options);
  },

  generateRefreshToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: parseDurationToSeconds(env.jwtRefreshExpiresIn),
    };
    return jwt.sign({ userId }, env.jwtRefreshSecret, options);
  },

  verifyAccessToken(token: string): { userId: string; role: string } {
    return jwt.verify(token, env.jwtSecret) as {
      userId: string;
      role: string;
    };
  },

  verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, env.jwtRefreshSecret) as { userId: string };
  },
};
