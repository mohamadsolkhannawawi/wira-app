import { cacheService, TTL } from "../services/cache.service.js";

export const getLocationCache = async <T>(key: string): Promise<T | null> => {
  return cacheService.get<T>(`location:${key}`);
};

export const setLocationCache = async (
  key: string,
  data: unknown,
): Promise<void> => {
  await cacheService.set(`location:${key}`, data, TTL.LOCATION);
};
