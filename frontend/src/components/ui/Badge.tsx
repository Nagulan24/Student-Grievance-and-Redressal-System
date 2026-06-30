import { type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import {
  statusConfig,
  priorityConfig,
} from "../../lib/utils";
import type { ComplaintStatus, ComplaintPriority } from "../../types";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "neutral";
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-primary-50 text-primary-700 border-primary-200",
  success: "bg-success-50 text-success-700 border-success-200",
  warning: "bg-warning-50 text-warning-700 border-warning-200",
  error: "bg-error-50 text-error-700 border-error-200",
  info: "bg-accent-50 text-accent-700 border-accent-200",
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
        config.bg,
        config.color,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  const config = priorityConfig[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border",
        config.bg,
        config.color,
        config.border,
      )}
    >
      {config.label}
    </span>
  );
}
