import type { UserRole } from "../types";
import {
  LayoutDashboard,
  FilePlus,
  Inbox,
  Bell,
  User,
  Users,
  BarChart3,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

export const navConfig: Record<UserRole, NavItem[]> = {
  student: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Create Complaint", icon: FilePlus, path: "/complaints/new" },
    { label: "My Complaints", icon: Inbox, path: "/complaints" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Profile", icon: User, path: "/profile" },
  ],
  staff: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Assigned Complaints", icon: ClipboardList, path: "/complaints" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Profile", icon: User, path: "/profile" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Analytics", icon: BarChart3, path: "/analytics" },
    { label: "Complaint Management", icon: ClipboardList, path: "/complaints" },
    { label: "User Management", icon: Users, path: "/users" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
  ],
};

export const roleLabels: Record<UserRole, string> = {
  student: "Student",
  staff: "Staff Member",
  admin: "Administrator",
};

export const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  student: User,
  staff: ShieldCheck,
  admin: ShieldCheck,
};
