import { apiClient } from "../lib/api";
import type {
  CreateUserRequest,
  StaffOfficerApi,
  UpdateUserRequest,
  UserListItemApi,
  UserStatsApi,
} from "../types/api";

export async function getStaffOfficers(): Promise<StaffOfficerApi[]> {
  const response = await apiClient.get<StaffOfficerApi[]>("/users/officers");
  return response.data;
}

export async function getUserStats(): Promise<UserStatsApi> {
  const response = await apiClient.get<UserStatsApi>("/users/stats");
  return response.data;
}

export async function listUsers(params?: {
  search?: string;
  role?: string;
}): Promise<UserListItemApi[]> {
  const response = await apiClient.get<UserListItemApi[]>("/users", {
    params,
  });
  return response.data;
}

export async function createUser(
  data: CreateUserRequest,
): Promise<UserListItemApi> {
  const response = await apiClient.post<UserListItemApi>("/users", data);
  return response.data;
}

export async function updateUser(
  userId: number,
  data: UpdateUserRequest,
): Promise<UserListItemApi> {
  const response = await apiClient.patch<UserListItemApi>(
    `/users/${userId}`,
    data,
  );
  return response.data;
}
