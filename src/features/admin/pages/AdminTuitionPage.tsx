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
} from "lucide-react";

// Mock data
const payments = [
  {
    id: 1,
    student: { name: "Nguyễn Văn An", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100" },
    class: "Toán 10A",
    amount: 2500000,
    dueDate: "20/12/2024",
    status: "paid",
    paidDate: "15/12/2024",
    method: "Chuyển khoản",
  },
  {
    id: 2,
    student: { name: "Trần Thị Bích", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" },
    class: "Anh Văn B1",
    amount: 3000000,
    dueDate: "25/12/2024",
    status: "pending",
    paidDate: null,
    method: null,
  },
  {
    id: 3,
    student: { name: "Lê Minh Cường", avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100" },
    class: "Hóa 11",
    amount: 2000000,
    dueDate: "15/12/2024",
    status: "overdue",
    paidDate: null,
    method: null,
  },
  {
    id: 4,
    student: { name: "Phạm Thị Dung", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
    class: "Văn 12",
    amount: 2500000,
    dueDate: "10/12/2024",
    status: "overdue",
    paidDate: null,
    method: null,
  },
  {
    id: 5,
    student: { name: "Hoàng Văn Em", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    class: "Tin Học Cơ Bản",
    amount: 1500000,
    dueDate: "28/12/2024",
    status: "paid",
    paidDate: "18/12/2024",
    method: "Tiền mặt",
  },
];

const stats = {
  totalRevenue: 450000000,
  monthRevenue: 85000000,
  pending: 12500000,
  overdue: 4500000,
};

export function AdminTuitionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-primary/10 text-primary border-0">Đã thanh toán</Badge>;
      case "pending":
        return <Badge className="bg-secondary/30 text-secondary-foreground border-0">Chờ thanh toán</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/10 text-destructive border-0">Quá hạn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchSearch =
      p.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
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
          <CardTitle className="text-lg font-display">Quản lý học phí</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Xuất báo cáo
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Tạo phiếu thu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo phiếu thu mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Học viên</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn học viên" />
                      </SelectTrigger>
                      <SelectContent>
                        {payments.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lớp học</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toan10a">Toán 10A</SelectItem>
                        <SelectItem value="anhvanb1">Anh Văn B1</SelectItem>
                        <SelectItem value="hoa11">Hóa 11</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Số tiền</Label>
                      <Input type="number" placeholder="2500000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Hạn thanh toán</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phương thức</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phương thức" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transfer">Chuyển khoản</SelectItem>
                        <SelectItem value="cash">Tiền mặt</SelectItem>
                        <SelectItem value="card">Thẻ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                    Tạo phiếu thu
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, lớp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="pending">Chờ thanh toán</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead className="hidden sm:table-cell">Lớp</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
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
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{payment.class}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {payment.dueDate}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {payment.status !== "paid" && (
                          <>
                            <DropdownMenuItem>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Xác nhận đã thanh toán
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="w-4 h-4 mr-2" />
                              Gửi nhắc nhở
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Xuất biên lai
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
