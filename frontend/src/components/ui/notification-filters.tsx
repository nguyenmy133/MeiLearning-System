import { cn } from "@/lib/utils";

export interface NotificationFilter {
  key: string;
  label: string;
  count?: number;
  /** If true, badge renders in destructive color (e.g. "Chưa đọc") */
  destructiveBadge?: boolean;
}

interface NotificationFiltersProps {
  filters: NotificationFilter[];
  active: string;
  onChange: (key: string) => void;
}

export function NotificationFilters({
  filters,
  active,
  onChange,
}: NotificationFiltersProps) {
  return (
    /* scrollable container — hides scrollbar on all browsers */
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      )}
      role="tablist"
      aria-label="Lọc thông báo"
    >
      {filters.map((f) => {
        const isActive = f.key === active;
        const hasBadge = typeof f.count === "number" && f.count > 0;

        return (
          <button
            key={f.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(f.key)}
            className={cn(
              // Layout
              "flex shrink-0 items-center gap-1.5",
              "rounded-full px-3.5 py-1.5",
              "text-sm font-medium whitespace-nowrap",
              // Transition
              "transition-all duration-150",
              // Active state
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {f.label}

            {hasBadge && (
              <span
                className={cn(
                  "flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1",
                  "text-[10px] font-bold leading-none",
                  isActive
                    ? f.destructiveBadge
                      ? "bg-red-400 text-white"
                      : "bg-white/25 text-white"
                    : f.destructiveBadge
                    ? "bg-destructive/80 text-destructive-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
                )}
              >
                {f.count! > 99 ? "99+" : f.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
