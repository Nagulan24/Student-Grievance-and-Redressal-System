import { apiClient } from "../lib/api";
import type {
  CategoryAnalyticsApi,
  DashboardSummaryApi,
  PriorityAnalyticsApi,
  StatusAnalyticsApi,
} from "../types/api";

export async function getDashboardSummary(): Promise<DashboardSummaryApi> {
  const response = await apiClient.get<DashboardSummaryApi>(
    "/dashboard/summary",
  );
  return response.data;
}

export async function getCategoryAnalytics(): Promise<CategoryAnalyticsApi[]> {
  const response = await apiClient.get<CategoryAnalyticsApi[]>(
    "/dashboard/category",
  );
  return response.data;
}

export async function getPriorityAnalytics(): Promise<PriorityAnalyticsApi[]> {
  const response = await apiClient.get<PriorityAnalyticsApi[]>(
    "/dashboard/priority",
  );
  return response.data;
}

export async function getStatusAnalytics(): Promise<StatusAnalyticsApi[]> {
  const response = await apiClient.get<StatusAnalyticsApi[]>(
    "/dashboard/status",
  );
  return response.data;
}
