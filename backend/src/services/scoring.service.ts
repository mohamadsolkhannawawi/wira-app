import prisma from "../config/database.js";
import type { LocationData } from "@prisma/client";

interface ScoringWeights {
  weightTraffic: number;
  weightTransit: number;
  weightPoi: number;
  weightCompetitor: number;
  weightCompRatio: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  weightTraffic: 0.25,
  weightTransit: 0.15,
  weightPoi: 0.30,
  weightCompetitor: 0.15,
  weightCompRatio: 0.15,
};

const weightsCache = new Map<string, ScoringWeights>();

async function getWeights(businessType: string): Promise<ScoringWeights> {
  const cached = weightsCache.get(businessType);
  if (cached) return cached;

  try {
    const master = await prisma.businessTypeMaster.findFirst({
      where: { code: businessType as never },
    });

    if (master) {
      const weights: ScoringWeights = {
        weightTraffic: master.weightTraffic,
        weightTransit: master.weightTransit,
        weightPoi: master.weightPoi,
        weightCompetitor: master.weightCompetitor,
        weightCompRatio: master.weightCompRatio,
      };
      weightsCache.set(businessType, weights);
      return weights;
    }
  } catch {
    /* fallback to defaults */
  }

  return DEFAULT_WEIGHTS;
}

export const scoringService = {
  async calculateWeightedScore(location: LocationData): Promise<number> {
    const w = await getWeights(location.businessType);

    const raw =
      location.trafficScore * w.weightTraffic +
      location.transitScore * w.weightTransit +
      location.poiScore * w.weightPoi +
      (1 - location.competitorCount) * w.weightCompetitor +
      location.compRatio * w.weightCompRatio;

    return Math.round(raw * 1000) / 10; // 0–100 scale, 1 decimal
  },

  determineConfidence(location: LocationData): "TINGGI" | "SEDANG" | "RENDAH" {
    const avgDataDensity =
      (location.trafficScore +
        location.transitScore +
        location.poiScore +
        location.competitorCount +
        location.compRatio) /
      5;

    if (avgDataDensity >= 0.4) return "TINGGI";
    if (avgDataDensity >= 0.2) return "SEDANG";
    return "RENDAH";
  },
};
