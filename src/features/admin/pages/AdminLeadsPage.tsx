import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  UserPlus,
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  UserCheck,
  Clock,
  XCircle,
  ChevronRight,
  Filter,
} from "lucide-react";

// Mock data
const leads = [
  {
    id: 1,
    name: "Nguyễn Thị E",
    phone: "0901234567",
    email: "e.nguyen@gmail.com",
    need: "Luyện thi lớp 10",
    source: "Facebook",
    status: "new",
    createdAt: "20/12/2024",
    notes: "Quan tâm đến lớp Toán, Văn",
  },
  {
    id: 2,
    name: "Trần Văn F",
    phone: "0912345678",
    email: "f.tran@gmail.com",
    need: "Tiếng Anh giao tiếp",
    source: "Website",
    status: "contacted",
    createdAt: "19/12/2024",
    notes: "Đã gọi điện, hẹn tư vấn 21/12",
  },
  {
    id: 3,
    name: "Lê Thị G",
    phone: "0923456789",
    email: "g.le@gmail.com",
    need: "Bổ trợ Toán 12",
    source: "Giới thiệu",
    status: "consulting",
    createdAt: "18/12/2024",
    notes: "Đang tư vấn lớp Toán 12 Luyện thi",
  },
  {
    id: 4,
    name: "Phạm Văn H",
    phone: "0934567890",
    email: "h.pham@gmail.com",
    need: "Hóa 11",
    source: "Zalo",
    status: "converted",
    createdAt: "15/12/2024",
    notes: "Đã đăng ký lớp Hóa 11",
  },
  {
    id: 5,
    name: "Hoàng Thị I",
    phone: "0945678901",
    email: "i.hoang@gmail.com",
    need: "Tin học văn phòng",
    source: "Facebook",
    status: "lost",
    createdAt: "10/12/2024",
    notes: "Không liên lạc được",
  },
];

const statusConfig = {
  new: { label: "Mới", color: "bg-primary/10 text-primary", icon: UserPlus },
  contacted: { label: "Đã liên hệ", color: "bg-secondary/30 text-secondary-foreground", icon: Phone },
  consulting: { label: "Đang tư vấn", color: "bg-accent text-accent-foreground", icon: MessageSquare },
  converted: { label: "Đã chuyển đổi", color: "bg-primary/10 text-primary", icon: UserCheck },
  lost: { label: "Mất lead", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const sources = ["Tất cả nguồn", "Facebook", "Website", "Zalo", "Giới thiệu", "Google Ads"];

export function AdminLeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("Tất cả nguồn");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.need.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || lead.status === filterStatus;
    const matchSource = filterSource === "Tất cả nguồn" || lead.source === filterSource;
    return matchSearch && matchStatus && matchSource;
  });

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
  };

  const pipelineStages = [
    { key: "new", label: "Mới", count: leads.filter((l) => l.status === "new").length },
    { key: "contacted", label: "Đã liên hệ", count: leads.filter((l) => l.status === "contacted").length },
    { key: "consulting", label: "Đang tư vấn", count: leads.filter((l) => l.status === "consulting").length },
    { key: "converted", label: "Chuyển đổi", count: leads.filter((l) => l.status === "converted").length },
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pipelineStages.map((stage) => (
          <Card key={stage.key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{stage.count}</p>
                  <p className="text-sm text-muted-foreground">{stage.label}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">Danh sách Lead</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Thêm Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm Lead mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input placeholder="Nhập họ và tên" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input placeholder="0901234567" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@gmail.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nhu cầu</Label>
                  <Input placeholder="VD: Luyện thi lớp 10" />
                </div>
                <div className="space-y-2">
                  <Label>Nguồn</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nguồn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="zalo">Zalo</SelectItem>
                      <SelectItem value="referral">Giới thiệu</SelectItem>
                      <SelectItem value="google">Google Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea placeholder="Ghi chú thêm về lead..." />
                </div>
                <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                  Thêm Lead
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
                placeholder="Tìm theo tên, SĐT, nhu cầu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="contacted">Đã liên hệ</SelectItem>
                  <SelectItem value="consulting">Đang tư vấn</SelectItem>
                  <SelectItem value="converted">Đã chuyển đổi</SelectItem>
                  <SelectItem value="lost">Mất lead</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lead Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {lead.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.need}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Phone className="w-4 h-4 mr-2" />
                          Gọi điện
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Gửi email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Thêm ghi chú
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Chuyển đổi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{lead.createdAt}</span>
                    </div>
                  </div>

                  {lead.notes && (
                    <p className="text-xs text-muted-foreground bg-accent/50 p-2 rounded-lg">
                      {lead.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    {getStatusBadge(lead.status as keyof typeof statusConfig)}
                    <Badge variant="outline" className="text-xs">
                      {lead.source}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
