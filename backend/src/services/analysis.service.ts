import type { AnalysisRequest, AnalysisResult } from "@wira-app/shared";
import { locationRepository } from "../repositories/location.repository.js";
import { analysisRepository } from "../repositories/analysis.repository.js";
import { cacheService, TTL } from "./cache.service.js";
import { aiService } from "./ai.service.js";
import { scoringService } from "./scoring.service.js";
import { AppError } from "../utils/appError.js";

export const analysisService = {
  async analyze(
    payload: AnalysisRequest,
    userId?: string,
  ): Promise<AnalysisResult> {
    const kelurahan = payload.kelurahan ?? "";
    const cacheKey = `analysis:${payload.businessType}:${kelurahan.toLowerCase()}`;

    // 1. Check cache
    const cached = await cacheService.get<AnalysisResult>(cacheKey);
    if (cached) {
      // Still save to user history even on cache hit
      if (userId) {
        this._saveToHistory(cached, payload, userId).catch(() => {});
      }
      return cached;
    }

    // 2. Query DB
    const locationData = await locationRepository.findByKelurahanAndType(
      kelurahan,
      payload.businessType,
    );

    if (!locationData) {
      throw new AppError(
        `Data lokasi tidak ditemukan untuk kelurahan "${kelurahan}" dengan jenis usaha "${payload.businessType}"`,
        404,
        "LOCATION_NOT_FOUND",
      );
    }

    // 3. Calculate score & confidence
    const finalScore = await scoringService.calculateWeightedScore(locationData);
    const confidenceLevel = scoringService.determineConfidence(locationData);

    // 4. Generate AI insight
    const insight = await aiService.generateInsight(
      payload.businessType,
      locationData,
    );

    // 5. Build result
    const result: AnalysisResult = {
      id: crypto.randomUUID(),
      locationName: locationData.kelurahan,
      kecamatan: locationData.kecamatan,
      businessType: payload.businessType,
      finalScore,
      clusterLabel: locationData.clusterLabel,
      confidenceLevel,
      metrics: {
        trafficScore: locationData.trafficScore,
        transitScore: locationData.transitScore,
        poiScore: locationData.poiScore,
        competitorScore: locationData.competitorCount,
        compRatio: locationData.compRatio,
      },
      insight,
      createdAt: new Date().toISOString(),
    };

    // 6. Cache result
    await cacheService.set(cacheKey, result, TTL.ANALYSIS);

    // 7. Save to history if authenticated
    if (userId) {
      await this._saveToHistory(result, payload, userId).catch(() => {});
    }

    return result;
  },

  async getById(id: string): Promise<AnalysisResult | null> {
    const record = await analysisRepository.findById(id);
    if (!record) return null;

    return {
      id: record.id,
      locationName: record.locationName,
      kecamatan: record.kecamatan,
      businessType: record.businessType,
      finalScore: record.resultScore,
      clusterLabel: record.clusterLabel,
      confidenceLevel: record.confidenceLevel,
      metrics: {
        trafficScore: record.trafficScore,
        transitScore: record.transitScore,
        poiScore: record.poiScore,
        competitorScore: record.competitorScore,
        compRatio: record.compRatio,
      },
      insight: record.insight,
      createdAt: record.createdAt.toISOString(),
    };
  },

  async getHistory(userId: string, filters: Record<string, string | undefined>) {
    const result = await analysisRepository.findByUserId(userId, filters);
    return {
      total: result.total,
      data: result.data.map((item) => ({
        id: item.id,
        locationName: item.locationName,
        businessType: item.businessType,
        finalScore: item.resultScore,
        clusterLabel: item.clusterLabel,
        isSaved: item.isSaved,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  },

  async toggleBookmark(id: string, userId: string) {
    const result = await analysisRepository.toggleBookmark(id, userId);
    if (!result) throw new AppError("Riwayat tidak ditemukan", 404, "NOT_FOUND");
    return result;
  },

  async deleteHistory(id: string, userId: string) {
    const deleted = await analysisRepository.deleteByIdAndUser(id, userId);
    if (!deleted) throw new AppError("Riwayat tidak ditemukan", 404, "NOT_FOUND");
  },

  async _saveToHistory(
    result: AnalysisResult,
    payload: AnalysisRequest,
    userId: string,
  ) {
    await analysisRepository.create({
      userId,
      businessType: result.businessType,
      resultScore: result.finalScore,
      clusterLabel: result.clusterLabel,
      insight: result.insight,
      confidenceLevel: result.confidenceLevel,
      locationName: result.locationName,
      kecamatan: result.kecamatan,
      latitude: payload.latitude,
      longitude: payload.longitude,
      trafficScore: result.metrics.trafficScore,
      transitScore: result.metrics.transitScore,
      poiScore: result.metrics.poiScore,
      competitorScore: result.metrics.competitorScore,
      compRatio: result.metrics.compRatio,
    });
  },
};
