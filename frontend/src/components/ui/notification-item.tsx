import {
  Bell,
  CalendarClock,
  CreditCard,
  FileText,
  Megaphone,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/relativeTime";
import { Checkbox } from "@/components/ui/checkbox";
import type { NotificationItem as NotificationItemType } from "@/features/user/notifications/types";

// ── Icon / Color / Label maps ────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  announcement: Megaphone,
  admin_broadcast: Megaphone,
  payment: CreditCard,
  tuition: CreditCard,
  schedule: CalendarClock,
  schedule_change: CalendarClock,
  leave_approved: Users,
  leave_rejected: Users,
  document: FileText,
  system: Wrench,
  exam: ShieldAlert,
  exam_submission: ShieldAlert,
};

const COLOR_MAP: Record<string, string> = {
  announcement: "bg-info/15 text-info",
  admin_broadcast: "bg-info/15 text-info",
  payment: "bg-warning/15 text-warning",
  tuition: "bg-warning/15 text-warning",
  schedule: "bg-primary/15 text-primary",
  schedule_change: "bg-primary/15 text-primary",
  leave_approved: "bg-success/15 text-success",
  leave_rejected: "bg-destructive/15 text-destructive",
  document: "bg-accent/15 text-accent-foreground",
  system: "bg-muted text-muted-foreground",
  exam: "bg-success/15 text-success",
  exam_submission: "bg-success/15 text-success",
};

const LABEL_MAP: Record<string, string> = {
  announcement: "Thông báo",
  admin_broadcast: "Hệ thống",
  payment: "Học phí",
  tuition: "Học phí",
  schedule: "Lịch học",
  schedule_change: "Lịch học",
  leave_approved: "Duyệt nghỉ",
  leave_rejected: "Từ chối nghỉ",
  document: "Tài liệu",
  system: "Hệ thống",
  exam: "Bài thi",
  exam_submission: "Bài thi",
};

// ── Component ────────────────────────────────────────────────────────────────

interface NotificationItemProps {
  item: NotificationItemType;
  onMarkRead: (id: number) => void;
  isMarkingRead?: boolean;
  /** Selection mode — shows checkbox on the left */
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: number) => void;
}

export function NotificationItem({
  item,
  onMarkRead,
  isMarkingRead,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: NotificationItemProps) {
  const Icon = ICON_MAP[item.type] ?? Bell;
  const colorClass = COLOR_MAP[item.type] ?? "bg-muted text-muted-foreground";
  const label = LABEL_MAP[item.type] ?? "Thông báo";

  const fallbackTime = item.date && item.time ? `${item.date} ${item.time}` : "";
  const relativeTime = formatRelativeTime(item.createdAt, fallbackTime);

  const handleClick = () => {
    if (selectionMode) {
      onToggleSelect?.(item.id);
    } else if (!item.read && !isMarkingRead) {
      onMarkRead(item.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={cn(
        "group relative flex gap-3 px-4 py-4 transition-all duration-150",
        "cursor-pointer select-none",
        "hover:bg-accent/50",
        // Selected highlight in selection mode
        selectionMode && selected && "bg-primary/[0.06] hover:bg-primary/[0.09]",
        // Unread border
        !item.read && !selected && "border-l-2 border-primary bg-primary/[0.04] pl-[14px]",
        item.read && !selected && "border-l-2 border-transparent",
        // Selected border overrides unread border
        selected && "border-l-2 border-primary pl-[14px]"
      )}
      aria-label={`${item.read ? "Đã đọc" : "Chưa đọc"}: ${item.title}`}
      aria-checked={selectionMode ? selected : undefined}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="flex items-center shrink-0 mt-0.5">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect?.(item.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Chọn: ${item.title}`}
            className="h-4 w-4"
          />
        </div>
      )}

      {/* Icon Avatar */}
      <div className="relative mt-0.5 shrink-0">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-150",
            "group-hover:scale-105",
            colorClass
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {!item.read && !selectionMode && (
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm font-medium leading-snug",
              item.read ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {item.title}
          </p>
          <time className="shrink-0 text-xs text-muted-foreground">
            {relativeTime}
          </time>
        </div>

        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {item.content}
        </p>

        <span
          className={cn(
            "mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
            colorClass
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
