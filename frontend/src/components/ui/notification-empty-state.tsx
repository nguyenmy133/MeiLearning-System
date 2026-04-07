import { Bell, BookOpen, Check, CreditCard, Inbox, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationEmptyStateProps {
  filter: string;
  className?: string;
}

const EMPTY_CONFIG: Record<
  string,
  { icon: React.ElementType; badge?: React.ElementType; title: string; subtitle: string }
> = {
  unread: {
    icon: Bell,
    badge: Check,
    title: "Không có thông báo chưa đọc",
    subtitle: "Bạn đã đọc hết rồi! 🎉",
  },
  system: {
    icon: Inbox,
    title: "Không có thông báo hệ thống",
    subtitle: "Chưa có thông báo từ hệ thống",
  },
  schedule: {
    icon: Inbox,
    title: "Không có cập nhật lịch học",
    subtitle: "Lịch học chưa có thay đổi nào",
  },
  leave: {
    icon: Users,
    title: "Không có thông báo nghỉ phép",
    subtitle: "Chưa có đơn nghỉ phép nào được xử lý",
  },
  tuition: {
    icon: CreditCard,
    title: "Không có thông báo học phí",
    subtitle: "Chưa có biến động học phí nào",
  },
  payment: {
    icon: CreditCard,
    title: "Không có thông báo học phí",
    subtitle: "Chưa có biến động học phí nào",
  },
  exam: {
    icon: BookOpen,
    title: "Không có thông báo bài thi",
    subtitle: "Chưa có bài thi nào cần chú ý",
  },
  student: {
    icon: Users,
    title: "Không có thông báo từ học sinh",
    subtitle: "Chưa có hoạt động nào từ học sinh",
  },
  announcement: {
    icon: Inbox,
    title: "Không có thông báo chung",
    subtitle: "Chưa có thông báo chung nào",
  },
  all: {
    icon: Bell,
    title: "Chưa có thông báo nào",
    subtitle: "Các thông báo mới sẽ xuất hiện ở đây",
  },
};

export function NotificationEmptyState({
  filter,
  className,
}: NotificationEmptyStateProps) {
  const config = EMPTY_CONFIG[filter] ?? EMPTY_CONFIG.all;
  const Icon = config.icon;
  const BadgeIcon = config.badge;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 gap-4",
        className
      )}
    >
      {/* Icon with badge */}
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted shadow-inner">
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        {BadgeIcon && (
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-success ring-2 ring-background">
            <BadgeIcon className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="font-medium text-foreground">{config.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{config.subtitle}</p>
      </div>
    </div>
  );
}
