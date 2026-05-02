import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const bcryptUtil = {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};
