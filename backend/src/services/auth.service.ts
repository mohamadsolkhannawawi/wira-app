import { userRepository } from "../repositories/user.repository.js";
import { bcryptUtil } from "../utils/bcrypt.util.js";
import { tokenManager } from "../utils/tokenManager.js";
import { AppError } from "../utils/appError.js";
import { env } from "../config/env.js";
import type { AuthResponse } from "@wira-app/shared";

function createRefreshTokenExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.jwtRefreshExpiresInDays);
  return expiresAt;
}

export const authService = {
  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResponse> {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError("Email sudah terdaftar", 409, "EMAIL_EXISTS");

    const hashedPassword = await bcryptUtil.hashPassword(password);
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name: name ?? null,
    });

    const accessToken = tokenManager.generateAccessToken(user.id, user.role);
    const refreshToken = tokenManager.generateRefreshToken(user.id);

    await userRepository.saveRefreshToken(user.id, refreshToken, createRefreshTokenExpiry());

    return {
      user: { id: user.id, name: user.name ?? "", email: user.email, role: user.role },
      tokens: { accessToken, refreshToken },
    };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError("Email atau password salah", 401, "INVALID_CREDENTIALS");

    const isMatch = await bcryptUtil.comparePassword(password, user.password);
    if (!isMatch) throw new AppError("Email atau password salah", 401, "INVALID_CREDENTIALS");

    const accessToken = tokenManager.generateAccessToken(user.id, user.role);
    const refreshToken = tokenManager.generateRefreshToken(user.id);

    await userRepository.saveRefreshToken(user.id, refreshToken, createRefreshTokenExpiry());

    return {
      user: { id: user.id, name: user.name ?? "", email: user.email, role: user.role },
      tokens: { accessToken, refreshToken },
    };
  },

  async refresh(refreshTokenValue: string): Promise<AuthResponse> {
    const dbToken = await userRepository.findRefreshToken(refreshTokenValue);
    if (!dbToken || dbToken.expiresAt < new Date()) {
      throw new AppError("Refresh token tidak valid atau kedaluwarsa", 401, "TOKEN_EXPIRED");
    }

    // Verify signature
    tokenManager.verifyRefreshToken(refreshTokenValue);

    const user = dbToken.user;

    // Rotate token
    const newAccessToken = tokenManager.generateAccessToken(user.id, user.role);
    const newRefreshToken = tokenManager.generateRefreshToken(user.id);

    await userRepository.deleteRefreshToken(refreshTokenValue);
    await userRepository.saveRefreshToken(user.id, newRefreshToken, createRefreshTokenExpiry());

    return {
      user: { id: user.id, name: user.name ?? "", email: user.email, role: user.role },
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    };
  },

  async logout(refreshTokenValue: string): Promise<void> {
    await userRepository.deleteRefreshToken(refreshTokenValue);
  },
};
