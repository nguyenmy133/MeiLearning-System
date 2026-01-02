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
  Calendar,
  User,
  Flag,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

// Mock data
const tickets = [
  {
    id: "TK-1001",
    title: "Không đăng nhập được sau khi đổi mật khẩu",
    requester: "Nguyễn Minh Anh",
    channel: "Email",
    priority: "high",
    status: "open",
    createdAt: "20/12/2024 09:12",
    assignee: "Trần Quang",
  },
  {
    id: "TK-1002",
    title: "Yêu cầu xuất hóa đơn học phí tháng 12",
    requester: "Phạm Đức Duy",
    channel: "Hotline",
    priority: "medium",
    status: "in_progress",
    createdAt: "19/12/2024 15:30",
    assignee: "Lê Thảo",
  },
  {
    id: "TK-1003",
    title: "Sai thông tin lớp trong lịch học",
    requester: "Hoàng Thị Em",
    channel: "Zalo",
    priority: "low",
    status: "resolved",
    createdAt: "18/12/2024 10:05",
    assignee: "Nguyễn Khoa",
  },
  {
    id: "TK-1004",
    title: "Không nhận được thông báo điểm danh",
    requester: "Vũ Văn Phong",
    channel: "Email",
    priority: "high",
    status: "overdue",
    createdAt: "17/12/2024 08:40",
    assignee: "Trần Quang",
  },
  {
    id: "TK-1005",
    title: "Cập nhật số điện thoại phụ huynh",
    requester: "Đặng Thị Giang",
    channel: "Web",
    priority: "medium",
    status: "open",
    createdAt: "16/12/2024 13:20",
    assignee: "Lê Thảo",
  },
];

const statusConfig = {
  open: { label: "Mở", color: "bg-primary/10 text-primary", icon: Ticket },
  in_progress: { label: "Đang xử lý", color: "bg-secondary/30 text-secondary-foreground", icon: Clock },
  resolved: { label: "Đã xử lý", color: "bg-success/10 text-success", icon: CheckCircle2 },
  overdue: { label: "Quá hạn", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

const priorityConfig = {
  low: { label: "Thấp", color: "bg-muted text-muted-foreground" },
  medium: { label: "Trung bình", color: "bg-accent text-accent-foreground" },
  high: { label: "Cao", color: "bg-destructive/10 text-destructive" },
};

export function AdminTicketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchPriority = filterPriority === "all" || ticket.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: keyof typeof priorityConfig) => {
    const config = priorityConfig[priority];
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <config.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {tickets.filter((t) => t.status === key).length}
                  </p>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">Danh sách Ticket</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Tạo ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo ticket mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tiêu đề</Label>
                  <Input placeholder="Nhập tiêu đề" />
                </div>
                <div className="space-y-2">
                  <Label>Người yêu cầu</Label>
                  <Input placeholder="Nhập họ và tên" />
                </div>
                <div className="space-y-2">
                  <Label>Độ ưu tiên</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea placeholder="Mô tả chi tiết vấn đề..." />
                </div>
                <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                  Tạo ticket
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
            <div className="flex flex-wrap gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="open">Mở</SelectItem>
                  <SelectItem value="in_progress">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã xử lý</SelectItem>
                  <SelectItem value="overdue">Quá hạn</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-36">
                  <Flag className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead className="hidden md:table-cell">Người yêu cầu</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden lg:table-cell">Tạo lúc</TableHead>
                <TableHead className="hidden sm:table-cell">Phụ trách</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">{ticket.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-3.5 h-3.5" />
                      <span className="text-sm">{ticket.requester}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority as keyof typeof priorityConfig)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status as keyof typeof statusConfig)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-sm">{ticket.createdAt}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{ticket.assignee}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Gán người xử lý</DropdownMenuItem>
                        <DropdownMenuItem>Thay đổi trạng thái</DropdownMenuItem>
                        <DropdownMenuItem>Ghi chú nội bộ</DropdownMenuItem>
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
