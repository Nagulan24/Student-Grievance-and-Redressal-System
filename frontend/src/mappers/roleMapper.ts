import type { UserRole } from "../types";

export const ADMIN_BACKEND_ROLES = [
  "GRIEVANCE_ADMIN",
  "PRINCIPAL",
  "DEAN",
  "STUDENT_AFFAIRS",
] as const;

export const STAFF_BACKEND_ROLES = [
  "DEPARTMENT_OFFICER",
  "INFRASTRUCTURE_OFFICER",
  "HOSTEL_WARDEN",
  "EXAMINATION_OFFICER",
  "PLACEMENT_OFFICER",
  "PLACEMENT_HEAD",
  "TRANSPORT_OFFICER",
  "TRANSPORT_HEAD",
  "HOD",
  "DEAN",
  "STUDENT_AFFAIRS",
  "PRINCIPAL",
  "GRIEVANCE_ADMIN",
] as const;

export const ALL_ASSIGNABLE_ROLES = [
  "STUDENT",
  ...STAFF_BACKEND_ROLES,
] as const;

export function mapBackendRoleToFrontend(role: string): UserRole {
  if (role === "STUDENT") {
    return "student";
  }

  if (ADMIN_BACKEND_ROLES.includes(role as (typeof ADMIN_BACKEND_ROLES)[number])) {
    return "admin";
  }

  return "staff";
}

export function formatBackendRole(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
