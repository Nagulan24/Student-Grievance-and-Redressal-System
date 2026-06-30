import { mapBackendRoleToFrontend } from "./roleMapper";
import type { UserListItemApi } from "../types/api";
import type { User } from "../types";

export function mapUserListItemToUser(item: UserListItemApi): User {
  return {
    id: item.user_id.toString(),
    name: item.name,
    email: item.email,
    role: mapBackendRoleToFrontend(item.role),
    studentId: item.register_no ?? undefined,
    phone: item.phone ?? undefined,
    department: item.department_name ?? undefined,
    joinedAt: item.created_at ?? "",
    lastActive: item.is_active ? "Active" : "Inactive",
  };
}

export function mapUserListItemStatus(item: UserListItemApi): boolean {
  return item.is_active;
}
