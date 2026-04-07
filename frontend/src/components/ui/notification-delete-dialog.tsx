import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface NotificationDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "all-read" | "selected";
  selectedCount?: number;
  onConfirm: () => void;
  isPending?: boolean;
}

export function NotificationDeleteDialog({
  open,
  onOpenChange,
  mode,
  selectedCount = 0,
  onConfirm,
  isPending,
}: NotificationDeleteDialogProps) {
  const isSelected = mode === "selected";

  const title = isSelected
    ? `Xóa ${selectedCount} thông báo đã chọn?`
    : "Xóa tất cả thông báo đã đọc?";

  const description = isSelected
    ? `Bạn sắp xóa vĩnh viễn ${selectedCount} thông báo đã chọn. Hành động này không thể hoàn tác.`
    : "Tất cả thông báo đã đọc sẽ bị xóa vĩnh viễn. Thông báo chưa đọc sẽ được giữ lại. Hành động này không thể hoàn tác.";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
