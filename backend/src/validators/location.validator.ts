import { z } from "zod";
import { BusinessTypeEnum } from "./analysis.validator.js";

export const getLocationsSchema = z.object({
  query: z.object({
    type: BusinessTypeEnum.optional(),
    kecamatan: z.string().optional(),
    cluster: z.enum(["RAMAI", "POTENSIAL", "SEPI"]).optional(),
    sort: z.enum(["score", "name"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }).passthrough(),
});

export const compareLocationsSchema = z.object({
  query: z.object({
    kelurahan: z.union([z.string(), z.array(z.string())]),
    type: BusinessTypeEnum,
  }).passthrough(),
});

export const exploreLocationsSchema = z.object({
  query: z.object({
    type: BusinessTypeEnum,
    limit: z.string().optional(),
  }).passthrough(),
});
