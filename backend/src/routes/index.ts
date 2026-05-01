import { Router } from "express";
import { getAnalysis } from "../controllers/analysisController";

const router = Router();

// Endpoint yang akan ditembak oleh frontend
router.post("/api/analyze", getAnalysis);

export default router;
