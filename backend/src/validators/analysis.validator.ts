import { z } from "zod";

export const BusinessTypeEnum = z.enum([
  "CAFE",
  "LAUNDRY",
  "FNB",
  "BARBERSHOP",
  "SALON",
  "GYM",
  "BENGKEL",
  "CARWASH",
  "FASHION",
  "ELEKTRONIK",
  "PHOTOSTUDIO",
  "STATIONERY",
]);

export const createAnalysisSchema = z.object({
  body: z.object({
    bizType: BusinessTypeEnum,
    kelurahan: z.string().min(2, "Kelurahan wajib diisi"),
    streetName: z.string().min(2, "Nama jalan wajib diisi"),
  }),
});

export const getHistorySchema = z.object({
  query: z
    .object({
      type: BusinessTypeEnum.optional(),
      saved: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sort: z.enum(["date", "score"]).optional(),
      order: z.enum(["asc", "desc"]).optional(),
    })
    .passthrough(),
});

export const analysisIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID analisis tidak valid"),
  }),
});
