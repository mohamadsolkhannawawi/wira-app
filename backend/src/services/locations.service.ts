import { locationRepository } from "../repositories/location.repository.js";
import { AppError } from "../utils/appError.js";

export const locationService = {
  async getKecamatanList(query?: string) {
    return locationRepository.listKecamatans(query);
  },

  async getKelurahanList(query?: string) {
    return locationRepository.listKelurahans(query);
  },

  async getStreetList(kelurahan: string, query?: string) {
    if (!kelurahan) {
      throw new AppError("Kelurahan wajib diisi", 400, "KELURAHAN_REQUIRED");
    }

    return locationRepository.listStreetsByKelurahan(kelurahan, query);
  },

  async searchStreets(query: string, limit?: number) {
    if (!query || query.length < 2) return [];
    return locationRepository.searchStreets(query, limit);
  },

  async findNearestLocation(lat: number, lng: number) {
    if (isNaN(lat) || isNaN(lng)) {
      throw new AppError("Koordinat tidak valid", 400, "INVALID_COORDINATES");
    }
    return locationRepository.findNearestLocation(lat, lng);
  },
};
