import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedClasses = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", roundedClasses[rounded], className)}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          rounded="sm"
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-5 border border-neutral-200 rounded-xl bg-white">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10" rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/2" rounded="sm" />
          <Skeleton className="h-2.5 w-1/3" rounded="sm" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols: _cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, r) => (
        <Skeleton key={r} className="h-14 w-full" />
      ))}
    </div>
  );
}
