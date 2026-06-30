import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  ComplaintStatus,
  ComplaintPriority,
  ComplaintCategory,
} from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, opts?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(dateString);
}

export function formatTimeAgo(dateString: string): string {
  return formatRelativeTime(dateString);
}

export const statusConfig: Record<
  ComplaintStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  open: {
    label: "Open",
    color: "text-primary-700",
    bg: "bg-primary-50 border-primary-200",
    dot: "bg-primary-500",
  },
  in_review: {
    label: "In Review",
    color: "text-warning-700",
    bg: "bg-warning-50 border-warning-200",
    dot: "bg-warning-500",
  },
  assigned: {
    label: "Assigned",
    color: "text-accent-700",
    bg: "bg-accent-50 border-accent-200",
    dot: "bg-accent-500",
  },
  in_progress: {
    label: "In Progress",
    color: "text-primary-700",
    bg: "bg-primary-50 border-primary-200",
    dot: "bg-primary-600",
  },
  resolved: {
    label: "Resolved",
    color: "text-success-700",
    bg: "bg-success-50 border-success-200",
    dot: "bg-success-500",
  },
  closed: {
    label: "Closed",
    color: "text-neutral-600",
    bg: "bg-neutral-100 border-neutral-200",
    dot: "bg-neutral-400",
  },
  rejected: {
    label: "Rejected",
    color: "text-error-700",
    bg: "bg-error-50 border-error-200",
    dot: "bg-error-500",
  },
};

export const priorityConfig: Record<
  ComplaintPriority,
  { label: string; color: string; bg: string; border: string }
> = {
  low: {
    label: "Low",
    color: "text-neutral-600",
    bg: "bg-neutral-50",
    border: "border-neutral-200",
  },
  medium: {
    label: "Medium",
    color: "text-warning-700",
    bg: "bg-warning-50",
    border: "border-warning-200",
  },
  high: {
    label: "High",
    color: "text-error-600",
    bg: "bg-error-50",
    border: "border-error-200",
  },
  critical: {
    label: "Critical",
    color: "text-white",
    bg: "bg-error-600",
    border: "border-error-700",
  },
};

export const categoryConfig: Record<
  ComplaintCategory,
  { label: string; icon: string }
> = {
  academic: { label: "Academic", icon: "GraduationCap" },
  infrastructure: { label: "Infrastructure", icon: "Building2" },
  harassment: { label: "Harassment", icon: "ShieldAlert" },
  financial: { label: "Financial", icon: "DollarSign" },
  wellbeing: { label: "Wellbeing", icon: "HeartPulse" },
  administrative: { label: "Administrative", icon: "FileText" },
  technical: { label: "Technical", icon: "Cpu" },
};

const backendCategoryLabels: Record<string, string> = {
  academic: "Academic",
  infrastructure: "Infrastructure",
  hostel: "Hostel",
  examination: "Examination",
  placement: "Placement",
  transportation: "Transportation",
  safety: "Safety",
};

export function getCategoryLabel(category: string): string {
  const normalized = category.toLowerCase();
  if (backendCategoryLabels[normalized]) {
    return backendCategoryLabels[normalized];
  }
  const config = categoryConfig[normalized as ComplaintCategory];
  return config?.label ?? category.charAt(0).toUpperCase() + category.slice(1);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary-600",
    "bg-accent-600",
    "bg-success-600",
    "bg-warning-600",
    "bg-error-600",
    "bg-primary-800",
  ];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

export function totalPages(totalItems: number, perPage: number): number {
  return Math.ceil(totalItems / perPage);
}
