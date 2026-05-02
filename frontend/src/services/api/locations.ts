import type {
    BusinessType,
    CompareLocationsResponse,
    LocationDetail,
    LocationSummary,
} from "@wira-app/shared";
import { requestJson } from "./client";

export const getLocations = async (
    businessType: BusinessType,
    limit: number = 200, // Fetch all for the map
): Promise<LocationSummary[]> => {
    const payload = await requestJson<{ data: LocationSummary[] }>(
        `/locations?type=${businessType}&limit=${limit}`,
    );
    return payload.data;
};

export const getLocationDetail = async (
    businessType: BusinessType,
    kelurahan: string,
): Promise<LocationDetail> => {
    return requestJson<LocationDetail>(
        `/locations/${encodeURIComponent(kelurahan)}?type=${businessType}`,
    );
};

export const compareLocations = async (
    businessType: BusinessType,
    kelurahanList: string[],
): Promise<CompareLocationsResponse> => {
    const params = new URLSearchParams();
    params.set("type", businessType);
    kelurahanList.forEach((value) => params.append("kelurahan", value));

    return requestJson<CompareLocationsResponse>(
        `/locations/compare?${params.toString()}`,
    );
};

export const getLocationSuggestions = async (
    query?: string,
): Promise<string[]> => {
    const url = query
        ? `/locations/suggestions?q=${encodeURIComponent(query)}`
        : "/locations/suggestions";
    return requestJson<string[]>(url);
};
