import { mapPriority, mapStatus } from "./enumMapper";
import type {
  CategoryAnalyticsApi,
  DashboardSummaryApi,
  PriorityAnalyticsApi,
  StatusAnalyticsApi,
} from "../types/api";
import type { ChartDataPoint } from "../types/api";
import type { ComplaintListItemApi } from "../types/api";
import type { DashboardStats } from "../types";
import { getCategoryLabel } from "../lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  academic: "#1e2a6b",
  infrastructure: "#0d9488",
  hostel: "#6171f1",
  examination: "#f59e0b",
  placement: "#16a34a",
  transportation: "#0f766e",
  safety: "#dc2626",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#dc2626",
  high: "#f59e0b",
  medium: "#6171f1",
  low: "#a1a1aa",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#1e2a6b",
  in_review: "#f59e0b",
  assigned: "#0d9488",
  in_progress: "#6171f1",
  resolved: "#16a34a",
  closed: "#71717a",
  rejected: "#dc2626",
};

export function mapDashboardSummary(
  data: DashboardSummaryApi,
): DashboardStats {
  return {
    total: data.total_complaints,
    pending: data.pending_complaints,
    assigned: data.escalated_complaints,
    resolved: data.resolved_complaints,
    closed: data.closed_complaints,
    critical: data.critical_complaints,
    overdueSla: data.overdue_complaints,
  };
}

export function computeStatsFromComplaints(
  complaints: ComplaintListItemApi[],
): DashboardStats {
  return {
    total: complaints.length,
    pending: complaints.filter(
      (c) =>
        c.status === "open" ||
        c.status === "assigned" ||
        c.status === "in_review" ||
        c.status === "in_progress",
    ).length,
    assigned: complaints.filter((c) => c.status === "assigned").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    closed: complaints.filter((c) => c.status === "closed").length,
    critical: complaints.filter((c) => c.priority === "critical").length,
    overdueSla: 0,
  };
}

export function mapCategoryAnalytics(
  data: CategoryAnalyticsApi[],
): ChartDataPoint[] {
  return data.map((item) => ({
    label: getCategoryLabel(item.category.toLowerCase()),
    value: item.total,
    color: CATEGORY_COLORS[item.category.toLowerCase()] ?? "#71717a",
  }));
}

export function mapPriorityAnalytics(
  data: PriorityAnalyticsApi[],
): ChartDataPoint[] {
  return data.map((item) => {
    const priority = mapPriority(item.priority);
    return {
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: item.total,
      color: PRIORITY_COLORS[priority] ?? "#a1a1aa",
    };
  });
}

export function mapStatusAnalytics(
  data: StatusAnalyticsApi[],
): ChartDataPoint[] {
  return data.map((item) => {
    const status = mapStatus(item.status);
    const labels: Record<string, string> = {
      open: "Open",
      in_review: "In Review",
      assigned: "Assigned",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
      rejected: "Rejected",
    };
    return {
      label: labels[status] ?? status,
      value: item.total,
      color: STATUS_COLORS[status] ?? "#71717a",
    };
  });
}

export function buildCategoryChartFromComplaints(
  complaints: ComplaintListItemApi[],
): ChartDataPoint[] {
  const counts = new Map<string, number>();
  for (const c of complaints) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([category, value]) => ({
    label: getCategoryLabel(category),
    value,
    color: CATEGORY_COLORS[category] ?? "#71717a",
  }));
}

export function buildPriorityChartFromComplaints(
  complaints: ComplaintListItemApi[],
): ChartDataPoint[] {
  const counts = new Map<string, number>();
  for (const c of complaints) {
    counts.set(c.priority, (counts.get(c.priority) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([priority, value]) => ({
    label: priority.charAt(0).toUpperCase() + priority.slice(1),
    value,
    color: PRIORITY_COLORS[priority] ?? "#a1a1aa",
  }));
}

export function buildStatusChartFromComplaints(
  complaints: ComplaintListItemApi[],
): ChartDataPoint[] {
  const labels: Record<string, string> = {
    open: "Open",
    in_review: "In Review",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    rejected: "Rejected",
  };
  const counts = new Map<string, number>();
  for (const c of complaints) {
    counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([status, value]) => ({
    label: labels[status] ?? status,
    value,
    color: STATUS_COLORS[status] ?? "#71717a",
  }));
}

export function buildMonthlyChartFromComplaints(
  complaints: ComplaintListItemApi[],
): ChartDataPoint[] {
  const now = new Date();
  const months: ChartDataPoint[] = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    const month = date.getMonth();

    const count = complaints.filter((c) => {
      const created = new Date(c.createdAt);
      return (
        created.getFullYear() === year && created.getMonth() === month
      );
    }).length;

    months.push({ label, value: count });
  }

  return months;
}
