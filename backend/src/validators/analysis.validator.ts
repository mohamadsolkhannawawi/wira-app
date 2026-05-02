import { z } from "zod";

export const BusinessTypeEnum = z.enum([
  "CAFE", "LAUNDRY", "FNB", "BARBERSHOP", "SALON",
  "GYM", "BENGKEL", "CARWASH", "FASHION",
  "ELEKTRONIK", "PHOTOSTUDIO", "STATIONERY",
]);

export const createAnalysisSchema = z.object({
  body: z.object({
    businessType: BusinessTypeEnum,
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    kelurahan: z.string().optional(),
  }),
});

export const getHistorySchema = z.object({
  query: z.object({
    type: BusinessTypeEnum.optional(),
    saved: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.enum(["date", "score"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }).passthrough(),
});

export const analysisIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID analisis tidak valid"),
  }),
});
