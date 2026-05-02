import { locationRepository } from "../repositories/location.repository.js";
import { cacheService, TTL } from "./cache.service.js";
import { aiService } from "./ai.service.js";
import { AppError } from "../utils/appError.js";

export const locationService = {
  async getAll(filters: Record<string, string | undefined>) {
    const cacheKey = `locations:${JSON.stringify(filters)}`;
    const cached = await cacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const [data, total] = await Promise.all([
      locationRepository.findAll(filters),
      locationRepository.countByFilters(filters),
    ]);

    const result = { 
      data: data.map(loc => ({
        id: loc.id,
        kelurahan: loc.kelurahan,
        kecamatan: loc.kecamatan,
        latitude: loc.latCentroid,
        longitude: loc.lngCentroid,
        finalScore: loc.finalScore,
        clusterLabel: loc.clusterLabel,
      })), 
      total, 
      page: parseInt(filters.page ?? "1", 10) 
    };
    await cacheService.set(cacheKey, result, TTL.LOCATION_LIST);
    return result;
  },

  async getByKelurahan(kelurahan: string, businessType?: string) {
    const cacheKey = `location:${kelurahan}:${businessType ?? "all"}`;
    const cached = await cacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const data = await locationRepository.findByKelurahan(kelurahan, businessType);
    if (data.length === 0) {
      throw new AppError(
        `Kelurahan "${kelurahan}" tidak ditemukan`,
        404,
        "KELURAHAN_NOT_FOUND",
      );
    }

    const mappedData = data.map(loc => ({
      id: loc.id,
      kelurahan: loc.kelurahan,
      kecamatan: loc.kecamatan,
      latitude: loc.latCentroid,
      longitude: loc.lngCentroid,
      finalScore: loc.finalScore,
      clusterLabel: loc.clusterLabel,
      businessType: loc.businessType,
      metrics: {
        trafficScore: loc.trafficScore,
        transitScore: loc.transitScore,
        poiScore: loc.poiScore,
        competitorScore: loc.competitorCount,
        compRatio: loc.compRatio
      }
    }));

    await cacheService.set(cacheKey, mappedData, TTL.LOCATION);
    return mappedData;
  },

  async compare(kelurahans: string[], businessType: string) {
    if (kelurahans.length < 2 || kelurahans.length > 3) {
      throw new AppError(
        "Komparasi membutuhkan 2-3 kelurahan",
        400,
        "INVALID_COMPARE_COUNT",
      );
    }

    const locations = await locationRepository.compareLocations(
      kelurahans,
      businessType,
    );

    if (locations.length === 0) {
      throw new AppError(
        "Data lokasi tidak ditemukan untuk kelurahan yang diminta",
        404,
        "LOCATIONS_NOT_FOUND",
      );
    }

    const aiNarrative = await aiService.generateComparisonNarrative(
      businessType,
      locations,
    );

    const recommended = locations[0];

    return {
      businessType,
      locations: locations.map((loc) => ({
        kelurahan: loc.kelurahan,
        kecamatan: loc.kecamatan,
        finalScore: loc.finalScore,
        clusterLabel: loc.clusterLabel,
        metrics: {
          trafficScore: loc.trafficScore,
          transitScore: loc.transitScore,
          poiScore: loc.poiScore,
          competitorScore: loc.competitorCount,
          compRatio: loc.compRatio,
        },
      })),
      comparison: {
        recommended: recommended?.kelurahan ?? null,
        aiNarrative,
      },
    };
  },

  async explore(businessType: string, limit: number = 10) {
    const topLocations = await locationRepository.findTopLocations(
      businessType,
      limit,
    );

    return topLocations.map((loc) => ({
      kelurahan: loc.kelurahan,
      kecamatan: loc.kecamatan,
      finalScore: loc.finalScore,
      clusterLabel: loc.clusterLabel,
      latitude: loc.latCentroid,
      longitude: loc.lngCentroid,
      metrics: {
        trafficScore: loc.trafficScore,
        transitScore: loc.transitScore,
        poiScore: loc.poiScore,
        competitorScore: loc.competitorCount,
        compRatio: loc.compRatio,
      },
    }));
  },

  async getSuggestions(query?: string) {
    return locationRepository.findUniqueKelurahans(query);
  },
};
