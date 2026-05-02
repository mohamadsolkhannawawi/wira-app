import prisma from "../config/database.js";
import type { SearchHistory, Prisma } from "@prisma/client";

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
  businessType: string;
  resultScore: number;
  clusterLabel: string;
  insight: string;
  confidenceLevel: string;
  locationName: string;
  kecamatan: string;
  latitude: number;
  longitude: number;
  trafficScore: number;
  transitScore: number;
  poiScore: number;
  competitorScore: number;
  compRatio: number;
}

export const analysisRepository = {
  async create(data: AnalysisCreateData): Promise<SearchHistory> {
    return prisma.searchHistory.create({
      data: data as unknown as Prisma.SearchHistoryUncheckedCreateInput,
    });
  },

  async findById(id: string): Promise<SearchHistory | null> {
    return prisma.searchHistory.findUnique({ where: { id } });
  },

  async findByUserId(
    userId: string,
    filters: HistoryFilters = {},
  ): Promise<{ data: SearchHistory[]; total: number }> {
    const where: Prisma.SearchHistoryWhereInput = { userId };

    if (filters.type) {
      where.businessType = filters.type as never;
    }
    if (filters.saved === "true") {
      where.isSaved = true;
    }

    const page = Math.max(1, parseInt(filters.page ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(filters.limit ?? "10", 10)));
    const orderField = filters.sort === "score" ? "resultScore" : "createdAt";
    const orderDir = filters.order === "asc" ? "asc" as const : "desc" as const;

    const [data, total] = await Promise.all([
      prisma.searchHistory.findMany({
        where,
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.searchHistory.count({ where }),
    ]);

    return { data, total };
  },

  async toggleBookmark(id: string, userId: string): Promise<SearchHistory | null> {
    const record = await prisma.searchHistory.findFirst({
      where: { id, userId },
    });
    if (!record) return null;

    return prisma.searchHistory.update({
      where: { id },
      data: { isSaved: !record.isSaved },
    });
  },

  async deleteByIdAndUser(id: string, userId: string): Promise<boolean> {
    const result = await prisma.searchHistory.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  },
};
