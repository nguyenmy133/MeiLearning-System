import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  QrCode, 
  Copy, 
  Check, 
  Download,
  AlertCircle,
  Building2
} from "lucide-react";
import { 
  generateVietQR, 
  formatCurrency, 
  CENTER_BANK_ACCOUNT,
  type PaymentInfo 
} from "@/lib/qr-generator";

interface QRPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentInfo: {
    invoiceId: string;
    studentId: string;
    studentName: string;
    amount: number;
    description: string;
    dueDate?: string;
  };
  onPaid?: () => void;
}

export function QRPaymentModal({ open, onOpenChange, paymentInfo, onPaid }: QRPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate payment description
  const paymentDescription = `HP${paymentInfo.invoiceId} ${paymentInfo.studentId}`;
  
  const payment: PaymentInfo = {
    amount: paymentInfo.amount,
    description: paymentDescription,
    addInfo: paymentInfo.description,
  };

  // Generate QR code URL
  const qrCodeUrl = generateVietQR(CENTER_BANK_ACCOUNT, payment);

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(CENTER_BANK_ACCOUNT.accountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(paymentInfo.amount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(paymentDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR_Payment_${paymentInfo.invoiceId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Thanh toán QR Code
          </DialogTitle>
          <DialogDescription>
            Quét mã QR để thanh toán học phí qua ứng dụng ngân hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code Payment"
                  className="w-64 h-64 object-contain"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={handleDownloadQR}
              >
                <Download className="w-4 h-4" />
                Tải xuống QR
              </Button>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">Ngân hàng</p>
                  <p className="text-sm text-muted-foreground">MB Bank</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Số tài khoản</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-semibold">
                      {CENTER_BANK_ACCOUNT.accountNo}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopyAccountNumber}
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Chủ tài khoản</span>
                  <span className="text-sm font-medium">
                    {CENTER_BANK_ACCOUNT.accountName}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Số tiền</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(paymentInfo.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopyAmount}
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Nội dung CK</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-semibold text-right">
                      {paymentDescription}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={handleCopyDescription}
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Hướng dẫn thanh toán:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                    <li>Chọn chức năng quét QR Code</li>
                    <li>Quét mã QR phía trên</li>
                    <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                  </ol>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    <strong>Lưu ý:</strong> Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động xác nhận thanh toán.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Học viên: <span className="font-medium">{paymentInfo.studentName}</span></p>
            <p>Mã hóa đơn: <span className="font-medium">#{paymentInfo.invoiceId}</span></p>
            {paymentInfo.dueDate && (
              <p>Hạn thanh toán: <span className="font-medium">{paymentInfo.dueDate}</span></p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                toast({
                  title: "Đã gửi yêu cầu xác nhận",
                  description: "Kế toán sẽ kiểm tra sao kê ngân hàng của bạn trong ít phút.",
                });
                onPaid?.();
                onOpenChange(false);
              }}
            >
              Đã chuyển khoản
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
