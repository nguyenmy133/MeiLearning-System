import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Plus,
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
} from "lucide-react";
import { QRPaymentModal } from "@/components/QRPaymentModal";

const payments = [
  {
    id: "INV_092024_001",
    student: { name: "Nguyễn Văn An", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100" },
    month: "09/2024",
    totalAmount: 2500000,
    dueDate: "05/10/2024",
    status: "paid",
    paidDate: "02/10/2024",
    method: "Chuyển khoản",
    details: [
      { className: "Toán 10A", billableSessions: 10, pricePerSession: 150000, subTotal: 1500000 },
      { className: "Lý 10 Cơ bản", billableSessions: 10, pricePerSession: 100000, subTotal: 1000000 }
    ]
  },
  {
    id: "INV_092024_002",
    student: { name: "Trần Thị Bích", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" },
    month: "09/2024",
    totalAmount: 1600000,
    dueDate: "05/10/2024",
    status: "pending",
    paidDate: null,
    method: null,
    details: [
      { className: "Anh Văn B1", billableSessions: 8, pricePerSession: 200000, subTotal: 1600000 }
    ]
  },
  {
    id: "INV_092024_003",
    student: { name: "Lê Minh Cường", avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100" },
    month: "09/2024",
    totalAmount: 1800000,
    dueDate: "05/10/2024",
    status: "reviewing",
    paidDate: null,
    method: "Chuyển khoản",
    details: [
      { className: "Hóa 11", billableSessions: 9, pricePerSession: 200000, subTotal: 1800000 }
    ]
  },
  {
    id: "INV_092024_004",
    student: { name: "Phạm Thị Dung", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
    month: "09/2024",
    totalAmount: 1400000,
    dueDate: "05/10/2024",
    status: "overdue",
    paidDate: null,
    method: null,
    details: [
      { className: "Văn 12", billableSessions: 7, pricePerSession: 200000, subTotal: 1400000 }
    ]
  },
];

const stats = {
  totalRevenue: 450000000,
  monthRevenue: 85000000,
  pending: 12500000,
  overdue: 4500000,
};

const classList = ["Toán 10A", "Lý 10 Cơ bản", "Anh Văn B1", "Hóa 11", "Văn 12"];

export function AdminTuitionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("09/2024");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [selectedPaymentForQR, setSelectedPaymentForQR] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-primary/10 text-primary border-0">Đã thu</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-500/10 text-blue-600 border-0 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Chờ đối soát</Badge>;
      case "pending":
        return <Badge className="bg-secondary/30 text-secondary-foreground border-0">Chưa thu</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/10 text-destructive border-0">Quá hạn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchSearch =
      p.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchMonth = filterMonth === "all" || p.month === filterMonth;
    const matchClass = filterClass === "all" || p.details.some((d: any) => d.className === filterClass);
    return matchSearch && matchStatus && matchMonth && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(stats.monthRevenue)}</p>
                <p className="text-sm text-muted-foreground">Tháng này</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(stats.pending)}</p>
                <p className="text-sm text-muted-foreground">Chờ thanh toán</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(stats.overdue)}</p>
                <p className="text-sm text-muted-foreground">Quá hạn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">Quản lý hóa đơn Học phí</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Xuất PDF / Zalo
            </Button>
            <Button 
              size="sm" 
              className="bg-primary text-white"
              onClick={() => alert("Đang tự động đếm số buổi học hợp lệ trong tháng và tạo Hóa đơn...")}
            >
               <TrendingUp className="w-4 h-4 mr-1" />
               Chốt công & Tạo Bill Hàng Loạt
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
                {classList.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
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
                <SelectItem value="09/2024">Tháng 09/2024</SelectItem>
                <SelectItem value="08/2024">Tháng 08/2024</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 bg-background">
                <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="paid">Đã thu</SelectItem>
                <SelectItem value="reviewing">Chờ đối soát</SelectItem>
                <SelectItem value="pending">Chưa thu</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead className="hidden sm:table-cell">Mã Bill</TableHead>
                <TableHead className="text-right">Chi tiết số buổi</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="hidden md:table-cell">Hạn thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={payment.student.avatar} />
                        <AvatarFallback>
                          {payment.student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{payment.student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                    {payment.id}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      {payment.details.map((d: any, idx: number) => (
                        <div key={idx} className="text-xs text-muted-foreground">
                          {d.className}: <span className="font-medium text-foreground">{d.billableSessions} buổi</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatCurrency(payment.totalAmount)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {payment.dueDate}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      {payment.status === "reviewing" && (
                        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => alert("Đã đối soát xong!")}>
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Duyệt nhanh
                        </Button>
                      )}
                      
                      {(payment.status === "pending" || payment.status === "overdue") && (
                        <Button variant="outline" size="sm" className="h-8 text-primary border-primary/20 hover:bg-primary/10" onClick={() => setSelectedPaymentForQR(payment)}>
                          <QrCode className="w-4 h-4 mr-1.5" /> Mã QR
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                            Xem phiếu thu
                          </DropdownMenuItem>
                          
                          {(payment.status === "pending" || payment.status === "overdue") && (
                            <>
                              <DropdownMenuItem className="text-primary focus:text-primary">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Xác nhận thu tiền mặt
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-secondary focus:text-secondary-foreground">
                                <Send className="w-4 h-4 mr-2" />
                                Gửi Zalo nhắc nợ
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {payment.status === "paid" && (
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2 text-muted-foreground" />
                              Tải biên lai PDF
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* QR Payment Modal for Admin */}
      {selectedPaymentForQR && (
        <QRPaymentModal
          open={!!selectedPaymentForQR}
          onOpenChange={(open) => !open && setSelectedPaymentForQR(null)}
          paymentInfo={{
            invoiceId: selectedPaymentForQR.id,
            studentId: selectedPaymentForQR.id.substring(11), // extract somewhat unique string
            studentName: selectedPaymentForQR.student.name,
            amount: selectedPaymentForQR.totalAmount,
            description: `Học phí tháng ${selectedPaymentForQR.month}`,
            dueDate: selectedPaymentForQR.dueDate,
          }}
        />
      )}
    </div>
  );
}
