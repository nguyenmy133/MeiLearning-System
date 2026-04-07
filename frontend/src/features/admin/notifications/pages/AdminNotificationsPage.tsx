import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, ListChecks, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { NotificationItem } from "@/components/ui/notification-item";
import { NotificationFilters } from "@/components/ui/notification-filters";
import { NotificationEmptyState } from "@/components/ui/notification-empty-state";
import { NotificationSkeleton } from "@/components/ui/notification-skeleton";
import { NotificationDeleteDialog } from "@/components/ui/notification-delete-dialog";
import { toast } from "sonner";
import { useNotificationFeed } from "@/features/user/notifications/hooks/useNotificationFeed";
import { useNotificationActions } from "@/features/user/notifications/hooks/useNotificationActions";
import {
  notificationService,
  type SendNotificationPayload,
} from "@/features/user/notifications/services/notificationService";
import type { NotificationFilter } from "@/components/ui/notification-filters";

const LIMIT = 10;

const FILTERS: NotificationFilter[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc", destructiveBadge: true },
  { key: "system", label: "Hệ thống" },
  { key: "leave", label: "Nghỉ phép GV" },
  { key: "tuition", label: "Học phí" },
  { key: "schedule", label: "Lịch học" },
];

const TYPE_MAP: Record<string, string[]> = {
  system: ["admin_broadcast", "system"],
  leave: ["leave_approved", "leave_rejected"],
  tuition: ["tuition", "payment"],
  schedule: ["schedule_change"],
};

const DEFAULT_FORM: SendNotificationPayload = {
  title: "",
  content: "",
  severity: "LOW",
  role: null,
  userId: null,
};

export function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SendNotificationPayload>(DEFAULT_FORM);

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

  // ── Selection + dialog + delete actions ──────────────────────────
  const actions = useNotificationActions(allFilteredIds, {
    onSuccess: (deleted) => toast.success(`Đã xóa ${deleted} thông báo`),
  });

  const handleFilterChange = (key: string) => {
    setActiveFilter(key);
    setPage(1);
    actions.exitSelectionMode();
  };

  // ── Send notification mutation ────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: (payload: SendNotificationPayload) =>
      notificationService.sendNotification(payload),
    onSuccess: () => {
      toast.success("Thông báo đã được gửi thành công!");
      setSendDialogOpen(false);
      setFormData(DEFAULT_FORM);
      queryClient.invalidateQueries({ queryKey: ["notifications", "feed"] });
    },
    onError: () => toast.error("Gửi thông báo thất bại. Vui lòng thử lại."),
  });

  const handleSend = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }
    sendMutation.mutate(formData);
  };

  const readCount = total - unreadCount;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Thông báo quản trị
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

        <div className="flex gap-2 self-start sm:self-auto flex-wrap">
          {actions.selectionMode ? (
            /* ── Selection toolbar ── */
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
                >
                  Xóa đã chọn ({actions.selectedIds.size})
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={actions.exitSelectionMode}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            /* ── Normal toolbar ── */
            <>
              {/* Send notification */}
              <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Send className="h-4 w-4" />
                    Gửi thông báo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Gửi thông báo</DialogTitle>
                    <DialogDescription>
                      Gửi thông báo đến người dùng trong hệ thống
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="target">Đối tượng nhận</Label>
                      <Select
                        value={formData.role ?? "all"}
                        onValueChange={(v) =>
                          setFormData((p) => ({
                            ...p,
                            role: v === "all" ? null : v,
                            userId: null,
                          }))
                        }
                      >
                        <SelectTrigger id="target">
                          <SelectValue placeholder="Chọn đối tượng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả người dùng</SelectItem>
                          <SelectItem value="student">Học viên</SelectItem>
                          <SelectItem value="teacher">Giáo viên</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="title">Tiêu đề</Label>
                      <Input
                        id="title"
                        placeholder="Nhập tiêu đề thông báo..."
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, title: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="content">Nội dung</Label>
                      <Textarea
                        id="content"
                        placeholder="Nhập nội dung thông báo..."
                        rows={4}
                        value={formData.content}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, content: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="severity">Mức độ</Label>
                      <Select
                        value={formData.severity ?? "LOW"}
                        onValueChange={(v) =>
                          setFormData((p) => ({ ...p, severity: v }))
                        }
                      >
                        <SelectTrigger id="severity">
                          <SelectValue placeholder="Chọn mức độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">🔵 Thấp — Chỉ In-App</SelectItem>
                          <SelectItem value="MEDIUM">🟡 Trung bình — In-App + Email</SelectItem>
                          <SelectItem value="HIGH">🔴 Cao — In-App + Email + SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleSend} disabled={sendMutation.isPending} className="gap-2">
                      {sendMutation.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Gửi
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

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
