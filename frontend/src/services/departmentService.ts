import { apiClient } from "../lib/api";
import type { DepartmentApi } from "../types/api";

export async function getDepartments(): Promise<DepartmentApi[]> {
  const response = await apiClient.get<DepartmentApi[]>("/departments");
  return response.data;
}
