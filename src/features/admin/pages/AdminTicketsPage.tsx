import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Ticket,
  Plus,
  Search,
  MoreHorizontal,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";

// Mock data
const tickets = [
  {
    id: "TK-1001",
    title: "Không đăng nhập được sau khi đổi mật khẩu",
    requester: "Nguyễn Minh Anh",
    type: "technical",
    status: "open",
    createdAt: "20/12/2024",
    note: "",
  },
  {
    id: "TK-1002",
    title: "Yêu cầu xuất hóa đơn học phí tháng 12",
    requester: "Phạm Đức Duy",
    type: "billing",
    status: "in_progress",
    createdAt: "19/12/2024",
    note: "Đã liên hệ qua điện thoại",
  },
  {
    id: "TK-1003",
    title: "Sai thông tin lớp trong lịch học",
    requester: "Hoàng Thị Em",
    type: "info",
    status: "resolved",
    createdAt: "18/12/2024",
    note: "Đã cập nhật lịch học",
  },
  {
    id: "TK-1004",
    title: "Không nhận được thông báo điểm danh",
    requester: "Vũ Văn Phong",
    type: "technical",
    status: "overdue",
    createdAt: "17/12/2024",
    note: "",
  },
  {
    id: "TK-1005",
    title: "Cập nhật số điện thoại phụ huynh",
    requester: "Đặng Thị Giang",
    type: "info",
    status: "open",
    createdAt: "16/12/2024",
    note: "",
  },
];

const statusConfig = {
  open: {
    label: "Mới",
    color: "bg-primary/10 text-primary",
    icon: Ticket,
  },
  in_progress: {
    label: "Đang xử lý",
    color: "bg-secondary/30 text-secondary-foreground",
    icon: Clock,
  },
  resolved: {
    label: "Đã xử lý",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Quá hạn",
    color: "bg-destructive/10 text-destructive",
    icon: AlertTriangle,
  },
};

const typeConfig: Record<string, { label: string }> = {
  technical: { label: "Kỹ thuật" },
  billing: { label: "Học phí" },
  info: { label: "Thông tin" },
  other: { label: "Khác" },
};

export function AdminTicketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<
    (typeof tickets)[0] | null
  >(null);

  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    const matchType = filterType === "all" || ticket.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const cfg = statusConfig[status];
    return (
      <Badge className={`${cfg.color} border-0`}>
        {cfg.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(statusConfig) as [keyof typeof statusConfig, (typeof statusConfig)[keyof typeof statusConfig]][]).map(([key, cfg]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <cfg.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {tickets.filter((t) => t.status === key).length}
                  </p>
                  <p className="text-sm text-muted-foreground">{cfg.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">
            Yêu cầu hỗ trợ
          </CardTitle>

          {/* Tạo ticket mới */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Tạo yêu cầu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo yêu cầu hỗ trợ mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>
                    Tiêu đề <span className="text-destructive">*</span>
                  </Label>
                  <Input placeholder="Mô tả ngắn vấn đề cần hỗ trợ" />
                </div>
                <div className="space-y-2">
                  <Label>
                    Người yêu cầu <span className="text-destructive">*</span>
                  </Label>
                  <Input placeholder="Họ và tên học viên / phụ huynh" />
                </div>
                <div className="space-y-2">
                  <Label>Loại yêu cầu</Label>
                  <Select defaultValue="technical">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Kỹ thuật</SelectItem>
                      <SelectItem value="billing">Học phí</SelectItem>
                      <SelectItem value="info">Thông tin</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mô tả chi tiết</Label>
                  <Textarea
                    placeholder="Mô tả chi tiết vấn đề..."
                    rows={3}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Tạo yêu cầu
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã, tiêu đề, người yêu cầu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="open">Mới</SelectItem>
                  <SelectItem value="in_progress">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã xử lý</SelectItem>
                  <SelectItem value="overdue">Quá hạn</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="technical">Kỹ thuật</SelectItem>
                  <SelectItem value="billing">Học phí</SelectItem>
                  <SelectItem value="info">Thông tin</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Yêu cầu</TableHead>
                <TableHead className="hidden md:table-cell">
                  Người yêu cầu
                </TableHead>
                <TableHead className="hidden sm:table-cell">Loại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-medium leading-snug">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.id}
                      </p>
                      {ticket.note && (
                        <p className="text-xs text-muted-foreground italic">
                          💬 {ticket.note}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-3.5 h-3.5" />
                      <span className="text-sm">{ticket.requester}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {typeConfig[ticket.type]?.label ?? ticket.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(
                      ticket.status as keyof typeof statusConfig
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {ticket.createdAt}
                  </TableCell>
                  <TableCell>
                    <Dialog
                      open={selectedTicket?.id === ticket.id}
                      onOpenChange={(open) => !open && setSelectedTicket(null)}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Ghi chú / Xử lý
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Đánh dấu đã xử lý
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Ghi chú dialog */}
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Ghi chú xử lý</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="rounded-lg bg-muted p-3 space-y-1">
                            <p className="text-sm font-medium">
                              {ticket.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ticket.requester} · {ticket.id}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Cập nhật trạng thái</Label>
                            <Select defaultValue={ticket.status}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Mới</SelectItem>
                                <SelectItem value="in_progress">
                                  Đang xử lý
                                </SelectItem>
                                <SelectItem value="resolved">
                                  Đã xử lý
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Ghi chú nội bộ</Label>
                            <Textarea
                              placeholder="Nhập ghi chú về cách xử lý..."
                              defaultValue={ticket.note}
                              rows={3}
                            />
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => setSelectedTicket(null)}
                          >
                            Lưu
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
