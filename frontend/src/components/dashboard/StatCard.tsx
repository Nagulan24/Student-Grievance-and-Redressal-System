import { type ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/Skeleton";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: { value: number; isPositive: boolean };
  accentColor?: "primary" | "success" | "warning" | "error" | "accent" | "neutral";
  loading?: boolean;
}

const accentStyles = {
  primary: { bg: "bg-primary-50", text: "text-primary-700", ring: "ring-primary-100" },
  success: { bg: "bg-success-50", text: "text-success-700", ring: "ring-success-100" },
  warning: { bg: "bg-warning-50", text: "text-warning-700", ring: "ring-warning-100" },
  error: { bg: "bg-error-50", text: "text-error-700", ring: "ring-error-100" },
  accent: { bg: "bg-accent-50", text: "text-accent-700", ring: "ring-accent-100" },
  neutral: { bg: "bg-neutral-100", text: "text-neutral-600", ring: "ring-neutral-200" },
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  accentColor = "primary",
  loading,
}: StatCardProps) {
  const styles = accentStyles[accentColor];

  if (loading) {
    return (
      <div className="p-5 bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-20" rounded="sm" />
          <Skeleton className="w-10 h-10" rounded="lg" />
        </div>
        <Skeleton className="h-8 w-16" rounded="sm" />
        <Skeleton className="h-3 w-24 mt-2" rounded="sm" />
      </div>
    );
  }

  return (
    <div className="p-5 bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center ring-1",
            styles.bg,
            styles.text,
            styles.ring,
          )}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-neutral-900 tabular-nums">
          {value}
        </p>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-success-600" : "text-error-600",
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
}
