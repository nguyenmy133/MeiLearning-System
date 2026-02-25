import { useState } from "react";
import { CreditCard, Receipt, Clock, CheckCircle, AlertCircle, ChevronRight, Download, Copy, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { QRPaymentModal } from "@/components/QRPaymentModal";

const currentInvoice = {
  id: "INV_092024_001",
  month: "09/2024",
  totalAmount: 2500000,
  dueDate: "05/10/2024",
  status: "pending",
  details: [
    { className: "Toán 10A", billableSessions: 10, pricePerSession: 150000, subTotal: 1500000 },
    { className: "Lý 10 Cơ bản", billableSessions: 10, pricePerSession: 100000, subTotal: 1000000 }
  ]
};

const paymentHistory = [
  { id: 1, date: "15/11/2024", amount: 5000000, method: "Chuyển khoản", status: "completed", receipt: "INV-2024-001" },
  { id: 2, date: "01/11/2024", amount: 5000000, method: "Tiền mặt", status: "completed", receipt: "INV-2024-002" },
  { id: 3, date: "15/10/2024", amount: 2500000, method: "Chuyển khoản", status: "completed", receipt: "INV-2024-003" },
];

export function TuitionPage() {
  const { toast } = useToast();
  const [qrPaymentOpen, setQrPaymentOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "reviewing" | "paid">("pending");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: `${label} đã được sao chép vào clipboard`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Thanh toán Học phí
        </h1>
        <p className="text-muted-foreground mt-1">
          Kỳ cước Tháng {currentInvoice.month}
        </p>
      </div>

      {/* Payment Summary */}
      <Card className="border-warning/30 bg-gradient-to-r from-warning/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${paymentStatus === 'reviewing' ? 'bg-blue-500/20' : 'bg-warning/20'}`}>
                {paymentStatus === 'reviewing' ? (
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-warning" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {paymentStatus === 'reviewing' ? 'Đang chờ Admin xác nhận' : 'Phí học tháng trước (Dự kiến)'}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-warning">{formatCurrency(currentInvoice.totalAmount)}</p>
                </div>
                <p className="text-sm text-muted-foreground">Hạn thanh toán: {currentInvoice.dueDate}</p>
              </div>
            </div>
            {paymentStatus === 'pending' ? (
              <Button 
                className="bg-warning text-warning-foreground hover:bg-warning/90 gap-2"
                onClick={() => setQrPaymentOpen(true)}
              >
                <QrCode className="h-4 w-4" />
                Thanh toán QR
              </Button>
            ) : paymentStatus === 'reviewing' ? (
              <Button disabled className="bg-blue-600 text-white gap-2">
                <CheckCircle className="h-4 w-4" />
                Chờ đối soát
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* QR Payment Modal */}
      <QRPaymentModal
        open={qrPaymentOpen}
        onOpenChange={setQrPaymentOpen}
        paymentInfo={{
          invoiceId: currentInvoice.id,
          studentId: "001", // Ví dụ mã HS
          studentName: "Nguyễn Văn An", // Có thể truyền từ Store/Session
          amount: currentInvoice.totalAmount,
          description: `Học phí tháng ${currentInvoice.month}`,
          dueDate: currentInvoice.dueDate,
        }}
        onPaid={() => setPaymentStatus("reviewing")}
      />

      {/* Bill Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Chi tiết Bảng tính Học phí (Dựa trên số buổi học điểm danh)
          </CardTitle>
          <CardDescription>Mã hóa đơn: {currentInvoice.id}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Course breakdown */}
          <div className="space-y-3">
            {currentInvoice.details.map((course, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/20 rounded-lg gap-2 border border-border/50">
                <div>
                  <p className="font-semibold text-foreground text-base">{course.className}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Số buổi tính phí: <span className="font-medium text-foreground">{course.billableSessions}</span> x {formatCurrency(course.pricePerSession)}/buổi
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">{formatCurrency(course.subTotal)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t flex justify-between items-center px-2">
            <p className="font-medium text-muted-foreground">Tổng cộng (Tháng {currentInvoice.month})</p>
            <p className="text-xl font-bold text-warning">{formatCurrency(currentInvoice.totalAmount)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Lịch sử thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">{payment.date} • {payment.method}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
