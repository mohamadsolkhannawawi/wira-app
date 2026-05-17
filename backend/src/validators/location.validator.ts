import { z } from "zod";

export const kecamatanListSchema = z.object({
  query: z
    .object({
      q: z.string().optional(),
    })
    .passthrough(),
});

export const kelurahanListSchema = z.object({
  query: z
    .object({
      q: z.string().optional(),
    })
    .passthrough(),
});

export const streetListSchema = z.object({
  query: z
    .object({
      kelurahan: z.string().min(1, "Kelurahan wajib diisi"),
      q: z.string().optional(),
    })
    .passthrough(),
});

export const streetSearchSchema = z.object({
  query: z
    .object({
      q: z.string().min(2, "Minimal 2 karakter"),
      limit: z.string().optional(),
    })
    .passthrough(),
});

export const nearestLocationSchema = z.object({
  query: z
    .object({
      lat: z.string().min(1, "Latitude wajib diisi"),
      lng: z.string().min(1, "Longitude wajib diisi"),
    })
    .passthrough(),
});
