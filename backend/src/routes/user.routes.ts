import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { validate } from "../middleware/validation.middleware.js";
import { updateProfileSchema } from "../validators/user.validator.js";
import { authenticate } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.get("/users/me", authenticate, getProfile);
userRouter.put("/users/me", authenticate, validate(updateProfileSchema), updateProfile);

export { userRouter };
