import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  QrCode,
  BookOpen,
  Loader2,
  FileText,
  Bell,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/dateUtils";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { QRPaymentModal } from "@/components/QRPaymentModal";
import { toast } from "sonner";
import {
  useInvoices,
  useTuitionStats,
  useApproveInvoice,
  useConfirmCashPayment,
  useGenerateMonthlyInvoices,
  useRemindAll,
  useRemindOne,
} from "../hooks";
import type { TuitionInvoice, TuitionQueryParams } from "../types";
import { INVOICE_STATUS_LABELS } from "../types";
import { useActiveClassOptions, useMonthOptions } from "@/hooks/useClassOptions";
import { exportInvoiceListPdf, exportReceiptPdf } from "@/lib/pdf-generator";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";

// ── Status badge ──────────────────────────────────────────────────────────────
function InvoiceStatusBadge({ status }: { status: TuitionInvoice["status"] }) {
  switch (status) {
    case "paid":
      return <Badge className="bg-primary/10 text-primary border-0">Đã thu</Badge>;
    case "reviewing":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-0 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Chờ đối soát
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-secondary/30 text-secondary-foreground border-0">
          Chưa thu
        </Badge>
      );
    case "overdue":
      return (
        <Badge className="bg-destructive/10 text-destructive border-0">Quá hạn</Badge>
      );
  }
}

// ── Stats skeleton ────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div>
        <Skeleton className="h-5 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// ── Table skeleton ────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-4 w-24 ml-auto" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-4 w-20 ml-auto" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function AdminTuitionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const { data: classOptions } = useActiveClassOptions();
  const monthOptions = useMonthOptions();
  const [selectedPaymentForQR, setSelectedPaymentForQR] =
    useState<TuitionInvoice | null>(null);
  const [confirmCashTarget, setConfirmCashTarget] =
    useState<TuitionInvoice | null>(null);

  // ── Pagination ──
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterMonth, filterStatus, filterClass]);

  // ── New UI states ──────────────────────────────────────────────────────────
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);
  const [remindAllConfirmOpen, setRemindAllConfirmOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<TuitionInvoice | null>(null);

  // Debounce search 300ms
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const queryParams: TuitionQueryParams = {
    search: debouncedSearch || undefined,
    month: filterMonth !== "all" ? filterMonth : undefined,
    status:
      filterStatus !== "all"
        ? (filterStatus as TuitionInvoice["status"])
        : undefined,
    className: filterClass !== "all" ? filterClass : undefined,
    page,
    limit,
  };

  const { data: invoicesResponse, isLoading: loadingInvoices } = useInvoices(queryParams);
  const invoicesData = (invoicesResponse as any) ?? { data: [], total: 0, totalPages: 1 };
  const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : (invoicesData.data ?? []);
  const total = invoicesData.total ?? 0;
  const totalPages = invoicesData.totalPages ?? 1;

  const { data: stats, isLoading: loadingStats } = useTuitionStats();

  // ── Mutations ─────────────────────────────────────────────────────────────
  const approveMutation = useApproveInvoice();
  const cashMutation = useConfirmCashPayment();
  const generateMutation = useGenerateMonthlyInvoices();
  const remindAllMutation = useRemindAll();
  const remindOneMutation = useRemindOne();

  const handleConfirmCash = () => {
    if (!confirmCashTarget) return;
    cashMutation.mutate(confirmCashTarget.id, {
      onSuccess: () => setConfirmCashTarget(null),
    });
  };

  const currentMonthStr = `${String(new Date().getMonth() + 1).padStart(2, "0")}/${new Date().getFullYear()}`;
  const generateTargetMonth = filterMonth !== "all" ? filterMonth : currentMonthStr;

  // Count unpaid for remind button
  const unpaidCount = invoices.filter(
    (p) => p.status === "pending" || p.status === "overdue"
  ).length;

  // ── Stats cards ───────────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Tổng doanh thu",
      value: stats ? formatCurrency(stats.totalRevenue ?? 0) : null,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Tháng này",
      value: stats ? formatCurrency(stats.monthRevenue ?? 0) : null,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Chờ thanh toán",
      value: stats ? `${stats.pendingCount ?? 0} hóa đơn` : null,
      icon: Clock,
      color: "text-secondary-foreground",
      bg: "bg-secondary/20",
    },
    {
      label: "Quá hạn",
      value: stats ? `${stats.overdueCount ?? 0} hóa đơn` : null,
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}
                >
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                {loadingStats ? (
                  <StatSkeleton />
                ) : (
                  <div>
                    <p className="text-lg font-bold text-foreground leading-tight">
                      {s.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoices table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">
            Quản lý hóa đơn học phí
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {/* PDF Export */}
            <Button
              variant="outline"
              size="sm"
              disabled={invoices.length === 0}
              onClick={() => {
                exportInvoiceListPdf(invoices);
                toast.success("Đã xuất PDF tổng hợp thành công");
              }}
            >
              <FileText className="w-4 h-4 mr-1" />
              Xuất PDF tổng hợp
            </Button>

            {/* Remind All */}
            <Button
              variant="outline"
              size="sm"
              className="border-orange-500/40 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
              disabled={unpaidCount === 0 || remindAllMutation.isPending}
              onClick={() => setRemindAllConfirmOpen(true)}
            >
              {remindAllMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Bell className="w-4 h-4 mr-1" />
              )}
              Gửi nhắc nợ ({unpaidCount})
            </Button>

            {/* Generate Invoices */}
            <Button
              size="sm"
              disabled={generateMutation.isPending}
              onClick={() => {
                const [m, y] = generateTargetMonth.split("/").map(Number);
                const currM = new Date().getMonth() + 1;
                const currY = new Date().getFullYear();
                if (y > currY || (y === currY && m >= currM)) {
                  toast.error(`Không thể chốt công cho tháng ${generateTargetMonth} vì tháng chưa kết thúc. Hệ thống sẽ tự động chạy vào mùng 1 tháng sau.`);
                  return;
                }
                setGenerateConfirmOpen(true);
              }}
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-1" />
              )}
              Chốt công &amp; Tạo Bill
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên học sinh, mã bill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-40 bg-background">
                <BookOpen className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Lớp học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                {(classOptions ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-40 bg-background">
                <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tháng</SelectItem>
                {monthOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    Tháng {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 bg-background">
                <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {(Object.keys(INVOICE_STATUS_LABELS) as TuitionInvoice["status"][]).map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {INVOICE_STATUS_LABELS[s]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead className="hidden sm:table-cell">Mã Bill</TableHead>
                <TableHead className="text-right">Chi tiết số buổi</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="hidden md:table-cell">Hạn TT</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInvoices ? (
                <TableSkeleton />
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-8 h-8 opacity-30" />
                      <p>Không tìm thấy hóa đơn nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={payment.studentAvatar} />
                          <AvatarFallback>
                            {(payment.studentName ?? "?")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{payment.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                      {payment.id}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-muted-foreground">
                          {payment.className}:{" "}
                          <span className="font-medium text-foreground">
                            {payment.billableSessions} buổi
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatCurrency(payment.totalAmount)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDate(payment.dueDate)}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        {payment.status === "reviewing" && (
                          <Button
                            size="sm"
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={approveMutation.isPending}
                            onClick={() => approveMutation.mutate(payment.id)}
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            )}
                            Duyệt
                          </Button>
                        )}
                        {(payment.status === "pending" ||
                          payment.status === "overdue") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-primary border-primary/20 hover:bg-primary/10"
                            onClick={() => setSelectedPaymentForQR(payment)}
                          >
                            <QrCode className="w-3.5 h-3.5 mr-1" /> Mã QR
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            {/* Xem phiếu thu — opens detail dialog */}
                            <DropdownMenuItem
                              onClick={() => setDetailInvoice(payment)}
                            >
                              <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                              Xem phiếu thu
                            </DropdownMenuItem>

                            {(payment.status === "pending" ||
                              payment.status === "overdue") && (
                              <>
                                <DropdownMenuItem
                                  className="text-primary focus:text-primary"
                                  onClick={() => setConfirmCashTarget(payment)}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Xác nhận thu tiền mặt
                                </DropdownMenuItem>

                                {/* Gửi nhắc nợ */}
                                <DropdownMenuItem
                                  disabled={remindOneMutation.isPending}
                                  onClick={() => remindOneMutation.mutate(payment.id)}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {remindOneMutation.isPending
                                    ? "Đang gửi..."
                                    : "Gửi nhắc nợ"}
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* Tải biên lai PDF */}
                            {payment.status === "paid" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  exportReceiptPdf(payment);
                                  toast.success("Đã tải biên lai PDF");
                                }}
                              >
                                <Download className="w-4 h-4 mr-2 text-muted-foreground" />
                                Tải biên lai PDF
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Component */}
          <div className="mt-4 border-t pt-2">
            <DataTablePagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </div>
          </>
        </CardContent>
      </Card>

      {/* QR Payment Modal */}
      {selectedPaymentForQR && (
        <QRPaymentModal
          open={!!selectedPaymentForQR}
          onOpenChange={(open) => !open && setSelectedPaymentForQR(null)}
          paymentInfo={{
            invoiceId: String(selectedPaymentForQR.id),
            studentId: String(selectedPaymentForQR.studentId),
            studentName: selectedPaymentForQR.studentName,
            amount: selectedPaymentForQR.totalAmount,
            description: `Học phí tháng ${selectedPaymentForQR.month} — ${selectedPaymentForQR.className}`,
            dueDate: selectedPaymentForQR.dueDate,
          }}
        />
      )}

      {/* ── Confirm Cash Payment Dialog ─────────────────────────────────────── */}
      <AlertDialog
        open={!!confirmCashTarget}
        onOpenChange={(open) => !open && setConfirmCashTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thu tiền mặt</AlertDialogTitle>
            <AlertDialogDescription>
              Xác nhận đã thu{" "}
              <span className="font-semibold text-foreground">
                {confirmCashTarget
                  ? formatCurrency(confirmCashTarget.totalAmount)
                  : ""}
              </span>{" "}
              tiền mặt từ học viên{" "}
              <span className="font-semibold text-foreground">
                {confirmCashTarget?.studentName}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCash}
              disabled={cashMutation.isPending}
            >
              {cashMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Generate Invoices Confirm Dialog ─────────────────────────────────── */}
      <AlertDialog
        open={generateConfirmOpen}
        onOpenChange={setGenerateConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chốt công &amp; Tạo Bill</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Bạn sắp tạo hóa đơn học phí cho tháng{" "}
                  <span className="font-semibold text-foreground">
                    {generateTargetMonth}
                  </span>
                  .
                </p>
                <p className="text-sm">
                  Hệ thống sẽ tính toán số buổi học và tạo hóa đơn cho tất cả học viên.
                  Những học viên đã có bill tháng này sẽ được bỏ qua.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={generateMutation.isPending}
              onClick={() => {
                generateMutation.mutate(generateTargetMonth);
                setGenerateConfirmOpen(false);
              }}
            >
              {generateMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Xác nhận tạo bill
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Remind All Confirm Dialog ──────────────────────────────────────── */}
      <AlertDialog
        open={remindAllConfirmOpen}
        onOpenChange={setRemindAllConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gửi nhắc nợ hàng loạt</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Sẽ gửi thông báo nhắc nợ tới{" "}
                  <span className="font-semibold text-foreground">
                    {unpaidCount} phụ huynh
                  </span>{" "}
                  qua các kênh:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>📩 Email</li>
                  <li>📱 SMS (số điện thoại phụ huynh)</li>

                  <li>🔔 Thông báo trong hệ thống</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={remindAllMutation.isPending}
              onClick={() => {
                remindAllMutation.mutate();
                setRemindAllConfirmOpen(false);
              }}
            >
              {remindAllMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Gửi nhắc nợ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Invoice Detail Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={!!detailInvoice}
        onOpenChange={(open) => !open && setDetailInvoice(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu thu #{detailInvoice?.id}</DialogTitle>
          </DialogHeader>
          {detailInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Học viên</p>
                  <p className="font-medium">{detailInvoice.studentName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lớp</p>
                  <p className="font-medium">{detailInvoice.className}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tháng</p>
                  <p className="font-medium">{detailInvoice.month}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Trạng thái</p>
                  <InvoiceStatusBadge status={detailInvoice.status} />
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <h4 className="font-semibold text-foreground">Chi tiết buổi học</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Có mặt:</span>
                    <span className="font-medium">{detailInvoice.presentSessions ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Đi muộn:</span>
                    <span className="font-medium">{detailInvoice.lateSessions ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vắng không phép:</span>
                    <span className="font-medium">{detailInvoice.absentUnexcusedSessions ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-blue-600">Vắng có phép:</span>
                    <span className="font-medium text-blue-600">{detailInvoice.absentExcusedSessions ?? 0}</span>
                  </div>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Buổi tính phí:</span>
                  <span>{detailInvoice.billableSessions ?? 0} buổi</span>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đơn giá / buổi:</span>
                  <span>{formatCurrency(detailInvoice.pricePerSession ?? 0)}</span>
                </div>
                {detailInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Giảm giá{detailInvoice.discountReason ? ` (${detailInvoice.discountReason})` : ""}:</span>
                    <span>-{formatCurrency(detailInvoice.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng tiền:</span>
                  <span className="text-primary">{formatCurrency(detailInvoice.totalAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div>
                  <span>Hạn TT: {detailInvoice.dueDate ? formatDate(detailInvoice.dueDate) : "N/A"}</span>
                </div>
                <div>
                  <span>Ngày tạo: {detailInvoice.createdAt ? formatDateTime(detailInvoice.createdAt) : "N/A"}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    exportReceiptPdf(detailInvoice);
                    toast.success("Đã tải biên lai PDF");
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Tải biên lai PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
