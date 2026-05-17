import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/appError.js";

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User tidak ditemukan", 404, "USER_NOT_FOUND");

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  },

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User tidak ditemukan", 404, "USER_NOT_FOUND");

    if (data.email && data.email !== user.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing) throw new AppError("Email sudah digunakan", 409, "EMAIL_EXISTS");
    }

    const updated = await userRepository.update(userId, data);
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      createdAt: updated.createdAt.toISOString(),
    };
  },
};
