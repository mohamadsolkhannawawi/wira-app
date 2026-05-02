import { Router } from "express";
import {
  submitAnalysis,
  getAnalysisById,
  getHistory,
  toggleBookmark,
  deleteAnalysis,
} from "../controllers/analysisController.js";
import { validate } from "../middleware/validation.middleware.js";
import { createAnalysisSchema, getHistorySchema, analysisIdSchema } from "../validators/analysis.validator.js";
import { authenticate, optionalAuth } from "../middleware/auth.middleware.js";

const analysisRouter = Router();

// MVP: Submit analysis (guest or authenticated)
analysisRouter.post("/analysis", optionalAuth, validate(createAnalysisSchema), submitAnalysis);

// Pasca-MVP: History (authenticated only)
analysisRouter.get("/analysis/history", authenticate, validate(getHistorySchema), getHistory);

// Get single analysis by ID
analysisRouter.get("/analysis/:id", optionalAuth, validate(analysisIdSchema), getAnalysisById);

// Pasca-MVP: Bookmark toggle
analysisRouter.patch("/analysis/:id/bookmark", authenticate, validate(analysisIdSchema), toggleBookmark);

// Pasca-MVP: Delete from history
analysisRouter.delete("/analysis/:id", authenticate, validate(analysisIdSchema), deleteAnalysis);

export { analysisRouter };
