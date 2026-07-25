import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "table" | "list" | "page";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  variant = "card",
  count = 3,
  className,
}: LoadingSkeletonProps) {
  if (variant === "page") {
    return (
      <div className={cn("space-y-6", className)} aria-busy="true" aria-label="Loading">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-3", className)} aria-busy="true" aria-label="Loading">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)} aria-busy="true" aria-label="Loading">
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-48 rounded-xl" />
      ))}
    </div>
  );
}
