import { useMemo, useState } from "react";
import { CheckCheck, ListChecks, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { NotificationItem } from "@/components/ui/notification-item";
import { NotificationFilters } from "@/components/ui/notification-filters";
import { NotificationEmptyState } from "@/components/ui/notification-empty-state";
import { NotificationSkeleton } from "@/components/ui/notification-skeleton";
import { NotificationDeleteDialog } from "@/components/ui/notification-delete-dialog";
import { useToast } from "@/hooks/use-toast";
import { useNotificationFeed } from "../hooks/useNotificationFeed";
import { useNotificationActions } from "../hooks/useNotificationActions";
import type { NotificationFilter } from "@/components/ui/notification-filters";

const LIMIT = 10;

const FILTERS: NotificationFilter[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc", destructiveBadge: true },
  { key: "schedule", label: "Lịch học" },
  { key: "payment", label: "Học phí" },
  { key: "exam", label: "Bài thi" },
  { key: "announcement", label: "Thông báo" },
];

const TYPE_MAP: Record<string, string[]> = {
  schedule: ["schedule", "schedule_change", "leave_approved", "leave_rejected"],
  payment: ["payment", "tuition"],
  exam: ["exam", "exam_submission"],
  announcement: ["announcement", "admin_broadcast"],
};

export function NotificationsPage() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotificationFeed({ page, limit: LIMIT });

  const notifications = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter((n) => !n.read);
    const types = TYPE_MAP[activeFilter] ?? [activeFilter];
    return notifications.filter((n) => types.includes(n.type ?? ""));
  }, [notifications, activeFilter]);

  const filtersWithCounts: NotificationFilter[] = useMemo(() => {
    return FILTERS.map((f) => {
      if (f.key === "all") return { ...f, count: total };
      if (f.key === "unread") return { ...f, count: unreadCount };
      const types = TYPE_MAP[f.key] ?? [f.key];
      return {
        ...f,
        count: notifications.filter((n) => types.includes(n.type ?? "")).length,
      };
    });
  }, [notifications, unreadCount, total]);

  const allFilteredIds = useMemo(() => filtered.map((n) => n.id), [filtered]);

  // ── Actions hook (selection + dialogs + mutations) ────────────────
  const actions = useNotificationActions(allFilteredIds, {
    onSuccess: (deleted) =>
      toast({ title: `Đã xóa ${deleted} thông báo` }),
  });

  const handleFilterChange = (key: string) => {
    setActiveFilter(key);
    setPage(1);
    actions.exitSelectionMode();
  };

  const readCount = total - unreadCount;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground lg:text-3xl">
            Thông báo
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isLoading
              ? "Đang tải..."
              : actions.selectionMode
              ? `Đã chọn ${actions.selectedIds.size} / ${filtered.length}`
              : total > 0
              ? `${total} thông báo`
              : "Không có thông báo mới"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          {actions.selectionMode ? (
            /* ── Selection mode toolbar ── */
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={actions.isAllSelected ? actions.clearSelection : actions.selectAll}
              >
                {actions.isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Button>
              {actions.isSomeSelected && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={actions.openDeleteSelectedDialog}
                  className="gap-2"
                >
                  Xóa đã chọn ({actions.selectedIds.size})
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={actions.exitSelectionMode}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            /* ── Normal mode toolbar ── */
            <>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.markAllMutation.mutate()}
                  disabled={actions.markAllMutation.isPending}
                  className="gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
              {readCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={actions.openDeleteAllReadDialog}
                  className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  Xóa đã đọc ({readCount})
                </Button>
              )}
              {filtered.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={actions.enterSelectionMode}
                  className="gap-2 text-muted-foreground"
                >
                  <ListChecks className="h-4 w-4" />
                  Chọn
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <NotificationFilters
        filters={filtersWithCounts}
        active={activeFilter}
        onChange={handleFilterChange}
      />

      {/* Feed */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <NotificationSkeleton count={LIMIT} />
        ) : filtered.length === 0 ? (
          <NotificationEmptyState filter={activeFilter} />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onMarkRead={(id) => actions.markReadMutation.mutate(id)}
                isMarkingRead={actions.markReadMutation.isPending}
                selectionMode={actions.selectionMode}
                selected={actions.selectedIds.has(item.id)}
                onToggleSelect={actions.toggleItem}
              />
            ))}
          </div>
        )}

        <DataTablePagination
          page={page}
          limit={LIMIT}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={() => {}}
          className="px-4 border-t border-border"
        />
      </div>

      {/* Confirmation dialog */}
      <NotificationDeleteDialog
        open={actions.dialogState.open}
        onOpenChange={(open) => !open && actions.closeDialog()}
        mode={actions.dialogState.open ? actions.dialogState.mode : "all-read"}
        selectedCount={actions.selectedIds.size}
        onConfirm={actions.confirmDelete}
        isPending={actions.isDeletePending}
      />
    </div>
  );
}
