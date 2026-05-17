/* eslint-disable @typescript-eslint/no-unused-vars */
import { requestJson } from "./client";

export const getKelurahanList = async (query?: string): Promise<string[]> => {
  const url = query
    ? `/locations/kelurahan?q=${encodeURIComponent(query)}`
    : "/locations/kelurahan";
  return requestJson<string[]>(url);
};

export const getStreetList = async (
  kelurahan: string,
  query?: string,
): Promise<string[]> => {
  const params = new URLSearchParams();
  params.set("kelurahan", kelurahan);
  if (query) params.set("q", query);
  return requestJson<string[]>(`/locations/streets?${params.toString()}`);
};

export const searchStreets = async (
  query: string,
  limit: number = 10,
): Promise<
  Array<{ namaJalan: string; kelurahan: string; kecamatan: string }>
> => {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("limit", limit.toString());
  return requestJson<
    Array<{ namaJalan: string; kelurahan: string; kecamatan: string }>
  >(`/locations/search?${params.toString()}`);
};

export const findNearestLocation = async (
  lat: number,
  lng: number,
): Promise<{
  nearest: { kelurahan: string; kecamatan: string; latCentroid: number; lngCentroid: number };
  distanceKm: number;
}> => {
  const params = new URLSearchParams();
  params.set("lat", lat.toString());
  params.set("lng", lng.toString());
  return requestJson(`/locations/nearest?${params.toString()}`);
};

/**
 * Alias for getKelurahanList — used by ComparePage for the search modal.
 */
export const getLocationSuggestions = getKelurahanList;

/**
 * Stub: compare endpoint is not yet implemented on the backend.
 * The ComparePage uses this to compare multiple locations.
 */
export interface CompareLocationsResponse {
  businessType: string;
  locations: LocationDetail[];
  recommended: string;
  narrative: string;
}

export interface LocationDetail {
  kelurahan: string;
  kecamatan: string;
  finalScore: number;
  clusterLabel: string;
  metrics: {
    trafficScore: number;
    transitScore: number;
    poiScore: number;
    competitorScore: number;
    compRatio: number;
  };
}

export const compareLocations = async (
  _businessType: string,
  _kelurahans: string[],
): Promise<CompareLocationsResponse> => {
  throw new Error(
    "Fitur komparasi belum tersedia. Silakan gunakan Analisis satu per satu.",
  );
};

export const getLocationDetail = async (
  _businessType: string,
  _kelurahan: string,
): Promise<LocationDetail[]> => {
  throw new Error(
    "Fitur detail lokasi belum tersedia.",
  );
};

