import { Router } from "express";
import type { AppInfoData, HealthData } from "@wira-app/shared";
import { API_PREFIX } from "@wira-app/shared";
import { env } from "../config/env.js";
import { ok } from "../utils/response.js";

const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const payload: HealthData = {
    service: env.appName,
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  };

  res.status(200).json(ok(payload));
});

healthRouter.get("/", (_req, res) => {
  const payload: AppInfoData = {
    name: env.appName,
    version: "1.0.0",
    apiPrefix: API_PREFIX,
  };

  res.status(200).json(ok(payload));
});

export { healthRouter };
