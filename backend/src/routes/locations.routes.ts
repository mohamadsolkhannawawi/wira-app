import { Router } from "express";
import {
  getKecamatanList,
  getKelurahanList,
  getStreetList,
  searchStreets,
} from "../controllers/locationsController.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  kecamatanListSchema,
  kelurahanListSchema,
  streetListSchema,
  streetSearchSchema,
} from "../validators/location.validator.js";

const locationsRouter = Router();

/**
 * GET /api/v1/locations/kecamatan
 * Response: { success: true, data: ["Tembalang", "Banyumanik", ...] }
 * Kegunaan: isi dropdown Kecamatan (filter opsional)
 */
locationsRouter.get(
  "/kecamatan",
  validate(kecamatanListSchema),
  getKecamatanList,
);

/**
 * GET /api/v1/locations/kelurahan
 * Response: { success: true, data: ["Bulusan", "Tembalang", ...] }
 * Kegunaan: isi dropdown Kelurahan di frontend
 */
locationsRouter.get(
  "/kelurahan",
  validate(kelurahanListSchema),
  getKelurahanList,
);

/**
 * GET /api/v1/locations/streets?kelurahan=Tembalang
 * Response: { success: true, data: [{ namaJalan, latCentroid, lngCentroid }, ...] }
 * Kegunaan: isi dropdown Nama Jalan setelah kelurahan dipilih
 */
locationsRouter.get("/streets", validate(streetListSchema), getStreetList);

/**
 * GET /api/v1/locations/search?q=Gondang
 * Response: { success: true, data: [{ namaJalan, kelurahan, kecamatan, ... }, ...] }
 * Kegunaan: autocomplete pencarian jalan
 */
locationsRouter.get("/search", validate(streetSearchSchema), searchStreets);

export { locationsRouter };
