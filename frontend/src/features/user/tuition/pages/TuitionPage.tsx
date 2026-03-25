import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/dateUtils";
import { CreditCard, Receipt, CheckCircle, AlertCircle, QrCode, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QRPaymentModal } from "@/components/QRPaymentModal";
import { useMyInvoices, useInitiatePayment } from "@/features/user/tuition/hooks";
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/features/user/tuition/types";
import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case "pending": return "bg-warning/10 text-warning border-warning/30";
    case "overdue": return "bg-destructive/10 text-destructive border-destructive/30";
    case "reviewing": return "bg-blue-100 text-blue-600 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300";
    case "paid": return "bg-success/10 text-success border-success/30";
  }
};

export function TuitionPage() {
  const [qrPaymentOpen, setQrPaymentOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  const { data: invoices = [], isLoading } = useMyInvoices();
  const initPayment = useInitiatePayment();
  const { data: profile } = useQuery<{ id: number; name: string }>({
    queryKey: ["profile", "me"],
    queryFn: async () => { const { data } = await apiClient.get(API.PROFILE.ME); return data; },
    staleTime: 5 * 60 * 1000,
  });

  const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "overdue");
  const reviewingInvoices = invoices.filter((i) => i.status === "reviewing");
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  const handlePayClick = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setQrPaymentOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Học phí
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và thanh toán học phí của bạn
        </p>
      </div>

      {/* Billing rule info banner */}
      <Card className="border-blue-200/50 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-sm">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-blue-700 dark:text-blue-300">
              <span className="font-medium">Cách tính học phí:</span>{" "}
              Học phí chỉ tính cho các buổi{" "}
              <span className="font-semibold">có mặt</span>,{" "}
              <span className="font-semibold">đi muộn</span> và{" "}
              <span className="font-semibold">vắng không phép</span>.
              Buổi vắng <span className="font-semibold text-blue-800 dark:text-blue-200">có phép được giáo viên duyệt</span>{" "}
              sẽ không tính vào học phí.
            </p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Pending / Overdue invoices */}
          {pendingInvoices.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Cần thanh toán ({pendingInvoices.length})
              </h2>
              {pendingInvoices.map((invoice) => (
                <Card key={invoice.id} className="border-warning/30 bg-gradient-to-r from-warning/5 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-foreground text-lg">{invoice.className}</p>
                            <p className="text-sm text-muted-foreground">
                              Tháng {invoice.month}
                            </p>
                          </div>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(invoice.status)}`}>
                            {INVOICE_STATUS_LABELS[invoice.status]}
                          </Badge>
                        </div>

                        {/* Breakdown */}
                        <div className="p-3 bg-muted/30 rounded-lg space-y-1 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Có mặt / Đi muộn / Vắng không phép</span>
                            <span className="font-medium text-foreground">
                              {(invoice.presentSessions ?? 0) + (invoice.lateSessions ?? 0) + (invoice.absentUnexcusedSessions ?? 0)} buổi
                            </span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Vắng có phép (miễn phí)</span>
                            <span className="font-medium text-blue-600">
                              {invoice.absentExcusedSessions ?? 0} buổi
                            </span>
                          </div>
                          <div className="flex justify-between text-muted-foreground border-t pt-1 mt-1">
                            <span>Buổi tính phí × {formatCurrency(invoice.pricePerSession)}</span>
                            <span className="font-medium text-foreground">
                              {invoice.billableSessions} buổi
                            </span>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-warning">
                            {formatCurrency(invoice.totalAmount)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Hạn thanh toán: {formatDateTime(invoice.dueDate)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          className="bg-warning text-warning-foreground hover:bg-warning/90 gap-2"
                          onClick={() => handlePayClick(invoice.id)}
                        >
                          <QrCode className="h-4 w-4" />
                          Thanh toán QR
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Reviewing invoices */}
          {reviewingInvoices.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-500" />
                Đang đối soát ({reviewingInvoices.length})
              </h2>
              {reviewingInvoices.map((invoice) => (
                <Card key={invoice.id} className="border-blue-200/30 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-foreground text-lg">{invoice.className}</p>
                            <p className="text-sm text-muted-foreground">Tháng {invoice.month}</p>
                          </div>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(invoice.status)}`}>
                            {INVOICE_STATUS_LABELS[invoice.status]}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(invoice.totalAmount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.billableSessions} buổi × {formatCurrency(invoice.pricePerSession)}
                        </p>
                      </div>
                      <Button disabled className="bg-blue-600 text-white gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Chờ đối soát
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Paid invoices */}
          {paidInvoices.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Đã thanh toán
              </h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {paidInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-success/10 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{invoice.className}</p>
                            <p className="text-xs text-muted-foreground">
                              Tháng {invoice.month}
                              {invoice.paidAt && ` • Thanh toán ${formatDateTime(invoice.paidAt)}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{formatCurrency(invoice.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.billableSessions} buổi × {formatCurrency(invoice.pricePerSession)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {invoices.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Chưa có hóa đơn nào.</p>
            </div>
          )}
        </>
      )}

      {/* QR Payment Modal */}
      {selectedInvoice && (
        <QRPaymentModal
          open={qrPaymentOpen}
          onOpenChange={setQrPaymentOpen}
          paymentInfo={{
            invoiceId: String(selectedInvoice.id),
            studentId: String(profile?.id ?? ""),
            studentName: profile?.name ?? "Học viên",
            amount: selectedInvoice.totalAmount,
            description: `Học phí tháng ${selectedInvoice.month} — ${selectedInvoice.className}`,
            dueDate: selectedInvoice.dueDate,
          }}
          onPaid={() => {
            initPayment.mutate({
              invoiceId: selectedInvoice.id,
              amount: selectedInvoice.totalAmount,
            });
            setQrPaymentOpen(false);
          }}
        />
      )}
    </div>
  );
}
