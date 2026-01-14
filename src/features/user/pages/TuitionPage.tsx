import { useState } from "react";
import { CreditCard, Receipt, Clock, CheckCircle, AlertCircle, ChevronRight, Download, Copy, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { QRPaymentModal } from "@/components/QRPaymentModal";

const tuitionInfo = {
  totalAmount: 15000000,
  paidAmount: 12500000,
  remainingAmount: 2500000,
  dueDate: "20/12/2024",
  courses: [
    { name: "Tiếng Anh Giao tiếp", amount: 5000000, status: "paid" },
    { name: "IELTS Speaking", amount: 5000000, status: "paid" },
    { name: "Business English", amount: 5000000, status: "partial", paid: 2500000 },
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
  const paymentProgress = (tuitionInfo.paidAmount / tuitionInfo.totalAmount) * 100;

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
          Học phí
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin học phí và thanh toán
        </p>
      </div>

      {/* Payment Summary */}
      <Card className="border-warning/30 bg-gradient-to-r from-warning/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-warning/20 rounded-xl">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Còn học phí chưa thanh toán</p>
                <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(tuitionInfo.remainingAmount)}</p>
                <p className="text-sm text-muted-foreground">Hạn thanh toán: {tuitionInfo.dueDate}</p>
              </div>
            </div>
            <Button 
              className="bg-warning text-warning-foreground hover:bg-warning/90 gap-2"
              onClick={() => setQrPaymentOpen(true)}
            >
              <QrCode className="h-4 w-4" />
              Thanh toán QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Payment Modal */}
      <QRPaymentModal
        open={qrPaymentOpen}
        onOpenChange={setQrPaymentOpen}
        paymentInfo={{
          invoiceId: "HP202401",
          studentId: "HV001",
          studentName: "Nguyễn Văn A",
          amount: tuitionInfo.remainingAmount,
          description: "Học phí tháng 12/2024",
          dueDate: tuitionInfo.dueDate,
        }}
      />

      {/* Payment Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Tiến độ thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Đã thanh toán: {formatCurrency(tuitionInfo.paidAmount)} / {formatCurrency(tuitionInfo.totalAmount)}
              </span>
              <span className="text-lg font-bold text-primary">{Math.round(paymentProgress)}%</span>
            </div>
            <Progress value={paymentProgress} className="h-3" />
          </div>

          {/* Course breakdown */}
          <div className="mt-6 space-y-3">
            {tuitionInfo.courses.map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{course.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(course.amount)}</p>
                </div>
                <Badge
                  variant={course.status === "paid" ? "default" : "secondary"}
                  className={course.status === "paid" ? "bg-success text-success-foreground" : ""}
                >
                  {course.status === "paid" ? "Đã thanh toán" : `Còn ${formatCurrency(course.amount - (course.paid || 0))}`}
                </Badge>
              </div>
            ))}
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
