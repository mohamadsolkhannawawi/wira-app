import prisma from "../config/database.js";
import type { AnalysisHistory, Prisma } from "@prisma/client";

interface HistoryFilters {
  type?: string;
  saved?: string;
  sort?: string;
  order?: string;
  page?: string;
  limit?: string;
}

interface AnalysisCreateData {
  userId?: string;
  streetName: string;
  kelurahan: string;
  kecamatan: string;
  bizType: string;
  skorPotensi: number;
  trafficScore: number;
  transitScore: number;
  poiScore: number;
  competitor: number;
  compRatio: number;
  bobotTraffic: number;
  bobotTransit: number;
  bobotPoi: number;
  bobotCompetitor: number;
  bobotCompRatio: number;
  rekomendasiAlternatif?: Prisma.JsonValue | null;
  aiInsight?: string | null;
}

export const analysisRepository = {
  async create(data: AnalysisCreateData): Promise<AnalysisHistory> {
    return prisma.analysisHistory.create({
      data: data as Prisma.AnalysisHistoryUncheckedCreateInput,
    });
  },

  async findById(id: string): Promise<AnalysisHistory | null> {
    return prisma.analysisHistory.findUnique({ where: { id } });
  },

  async findByUserId(
    userId: string,
    filters: HistoryFilters = {},
  ): Promise<{ data: AnalysisHistory[]; total: number }> {
    const where: Prisma.AnalysisHistoryWhereInput = { userId };

    if (filters.type) {
      where.bizType = filters.type as never;
    }
    if (filters.saved === "true") {
      where.isSaved = true;
    }

    const page = Math.max(1, parseInt(filters.page ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(filters.limit ?? "10", 10)),
    );
    const orderField = filters.sort === "score" ? "skorPotensi" : "createdAt";
    const orderDir =
      filters.order === "asc" ? ("asc" as const) : ("desc" as const);

    const [data, total] = await Promise.all([
      prisma.analysisHistory.findMany({
        where,
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.analysisHistory.count({ where }),
    ]);

    return { data, total };
  },

  async toggleBookmark(
    id: string,
    userId: string,
  ): Promise<AnalysisHistory | null> {
    const record = await prisma.analysisHistory.findFirst({
      where: { id, userId },
    });
    if (!record) return null;

    return prisma.analysisHistory.update({
      where: { id },
      data: { isSaved: !record.isSaved },
    });
  },

  async deleteByIdAndUser(id: string, userId: string): Promise<boolean> {
    const result = await prisma.analysisHistory.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  },
};
