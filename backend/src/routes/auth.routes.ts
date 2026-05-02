import { Router } from "express";
import { register, login, refresh, logout } from "../controllers/authController.js";
import { validate } from "../middleware/validation.middleware.js";
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from "../validators/auth.validator.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rateLimit.middleware.js";

const authRouter = Router();

authRouter.post("/auth/register", rateLimit(10, 60000), validate(registerSchema), register);
authRouter.post("/auth/login", rateLimit(20, 60000), validate(loginSchema), login);
authRouter.post("/auth/refresh", validate(refreshSchema), refresh);
authRouter.post("/auth/logout", authenticate, validate(logoutSchema), logout);

export { authRouter };
