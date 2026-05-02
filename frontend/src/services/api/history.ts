import type { PaginatedResponse, SearchHistorySummary } from "@wira-app/shared";
import { requestJson } from "./client";

export const getHistory = async (
  page: number = 1,
  limit: number = 10,
  type?: string,
  saved?: boolean,
  sort?: string,
  order?: string
): Promise<PaginatedResponse<SearchHistorySummary>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (type) params.append("type", type);
  if (saved !== undefined) params.append("saved", saved.toString());
  if (sort) params.append("sort", sort);
  if (order) params.append("order", order);

  return requestJson<PaginatedResponse<SearchHistorySummary>>(`/analysis/history?${params.toString()}`);
};

export const deleteHistory = async (id: string): Promise<void> => {
  await requestJson(`/analysis/${id}`, { method: "DELETE" });
};

export const toggleBookmark = async (id: string): Promise<{ isSaved: boolean }> => {
  return requestJson<{ isSaved: boolean }>(`/analysis/${id}/bookmark`, { method: "PATCH" });
};
