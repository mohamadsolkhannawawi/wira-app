import type { AnalysisRequest, AnalysisResult } from "@wira-app/shared";
import { analysisRepository } from "../repositories/analysis.repository.js";
import prisma from "../config/database.js";
import { cacheService, TTL } from "./cache.service.js";
import { aiService } from "./ai.service.js";
import { AppError } from "../utils/appError.js";

export const analysisService = {
  async analyze(
    payload: AnalysisRequest,
    userId?: string,
  ): Promise<AnalysisResult> {
    const streetName = payload.streetName?.trim() ?? "";
    if (!streetName) {
      throw new AppError(
        "Nama jalan/lokasi wajib diisi",
        400,
        "STREET_NAME_REQUIRED",
      );
    }

    const kelurahan = payload.kelurahan?.trim() ?? "";
    if (!kelurahan) {
      throw new AppError("Kelurahan wajib diisi", 400, "KELURAHAN_REQUIRED");
    }

    const bizType = payload.bizType?.trim() ?? "";
    if (!bizType) {
      throw new AppError("Jenis usaha wajib diisi", 400, "BIZTYPE_REQUIRED");
    }

    const cacheKey = `analysis:${bizType}:${kelurahan.toLowerCase()}:${streetName.toLowerCase()}`;

    // 1. Check cache
    const cached = await cacheService.get<AnalysisResult>(cacheKey);
    if (cached) {
      // Still save to user history even on cache hit
      if (userId) {
        this._saveToHistory(cached, userId).catch(() => {});
      }
      return cached;
    }

    // 2. Call AI model
    const recommendation = await aiService.getRecommendation(
      streetName,
      bizType,
    );

    const insight =
      await aiService.generateInsightFromRecommendation(recommendation);

    const street = await prisma.streetLocation.findFirst({
      where: { namaJalan: streetName, kelurahan },
      select: { kecamatan: true },
    });

    const result: AnalysisResult = {
      id: crypto.randomUUID(),
      streetName: recommendation.target_jalan,
      kelurahan,
      kecamatan: street?.kecamatan ?? "",
      bizType,
      skorPotensi: recommendation.skor_potensi_persen,
      bobotFitur: recommendation.bobot_fitur,
      nilaiFiturJalan: recommendation.nilai_fitur_jalan,
      rekomendasiAlternatif: recommendation.rekomendasi_alternatif,
      insight,
      createdAt: new Date().toISOString(),
    };

    // 6. Cache result
    await cacheService.set(cacheKey, result, TTL.ANALYSIS);

    // 7. Save to history if authenticated
    if (userId) {
      await this._saveToHistory(result, userId).catch(() => {});
    }

    return result;
  },

  async getById(id: string): Promise<AnalysisResult | null> {
    const record = await analysisRepository.findById(id);
    if (!record) return null;

    return {
      id: record.id,
      streetName: record.streetName,
      kelurahan: record.kelurahan,
      kecamatan: record.kecamatan,
      bizType: record.bizType,
      skorPotensi: record.skorPotensi,
      bobotFitur: {
        traffic_score: record.bobotTraffic,
        transit_score: record.bobotTransit,
        poi_score: record.bobotPoi,
        competitor: record.bobotCompetitor,
        comp_ratio: record.bobotCompRatio,
      },
      nilaiFiturJalan: {
        traffic_score: record.trafficScore,
        transit_score: record.transitScore,
        poi_score: record.poiScore,
        competitor: record.competitor,
        comp_ratio: record.compRatio,
      },
      rekomendasiAlternatif:
        (record.rekomendasiAlternatif as unknown as AnalysisResult["rekomendasiAlternatif"]) ??
        [],
      insight: record.aiInsight ?? "",
      createdAt: record.createdAt.toISOString(),
    };
  },

  async getHistory(
    userId: string,
    filters: Record<string, string | undefined>,
  ) {
    const result = await analysisRepository.findByUserId(userId, filters);
    return {
      total: result.total,
      data: result.data.map((item) => ({
        id: item.id,
        streetName: item.streetName,
        kelurahan: item.kelurahan,
        bizType: item.bizType,
        skorPotensi: item.skorPotensi,
        isSaved: item.isSaved,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  },

  async toggleBookmark(id: string, userId: string) {
    const result = await analysisRepository.toggleBookmark(id, userId);
    if (!result)
      throw new AppError("Riwayat tidak ditemukan", 404, "NOT_FOUND");
    return result;
  },

  async deleteHistory(id: string, userId: string) {
    const deleted = await analysisRepository.deleteByIdAndUser(id, userId);
    if (!deleted)
      throw new AppError("Riwayat tidak ditemukan", 404, "NOT_FOUND");
  },

  async _saveToHistory(result: AnalysisResult, userId: string) {
    await analysisRepository.create({
      userId,
      streetName: result.streetName,
      kelurahan: result.kelurahan,
      kecamatan: result.kecamatan,
      bizType: result.bizType,
      skorPotensi: result.skorPotensi,
      trafficScore: result.nilaiFiturJalan.traffic_score,
      transitScore: result.nilaiFiturJalan.transit_score,
      poiScore: result.nilaiFiturJalan.poi_score,
      competitor: result.nilaiFiturJalan.competitor,
      compRatio: result.nilaiFiturJalan.comp_ratio,
      bobotTraffic: result.bobotFitur.traffic_score,
      bobotTransit: result.bobotFitur.transit_score,
      bobotPoi: result.bobotFitur.poi_score,
      bobotCompetitor: result.bobotFitur.competitor,
      bobotCompRatio: result.bobotFitur.comp_ratio,
      rekomendasiAlternatif: result.rekomendasiAlternatif as unknown as import("@prisma/client").Prisma.JsonValue,
      aiInsight: result.insight,
    });
  },
};
