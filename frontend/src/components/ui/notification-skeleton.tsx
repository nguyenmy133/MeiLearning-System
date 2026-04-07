import { cn } from "@/lib/utils";

interface NotificationSkeletonProps {
  count?: number;
  className?: string;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted animate-pulse",
        className
      )}
    />
  );
}

function SingleSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-4">
      {/* Avatar */}
      <div className="mt-0.5 h-9 w-9 shrink-0 rounded-xl bg-muted animate-pulse" />
      {/* Lines */}
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="flex justify-between gap-4">
          <SkeletonLine className="h-4 w-1/2" />
          <SkeletonLine className="h-3 w-16" />
        </div>
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-3/4" />
        <SkeletonLine className="h-4 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function NotificationSkeleton({
  count = 5,
  className,
}: NotificationSkeletonProps) {
  return (
    <div className={cn("divide-y divide-border", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeleton key={i} />
      ))}
    </div>
  );
}
