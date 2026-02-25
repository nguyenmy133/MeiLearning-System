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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  BookOpen,
  Filter,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

// Mock data
const teachers = [
  {
    id: 1,
    name: "Nguyễn Thị Mai",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    email: "mai.nguyen@edu.vn",
    phone: "0901234567",
    subjects: ["Toán", "Vật Lý"],
    classes: 4,
    status: "active",
    joinDate: "2022-01-15",
  },
  {
    id: 2,
    name: "Trần Văn Hùng",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    email: "hung.tran@edu.vn",
    phone: "0912345678",
    subjects: ["Tiếng Anh"],
    classes: 6,
    status: "active",
    joinDate: "2021-08-20",
  },
  {
    id: 3,
    name: "Lê Thị Hương",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    email: "huong.le@edu.vn",
    phone: "0923456789",
    subjects: ["Hóa Học", "Sinh Học"],
    classes: 3,
    status: "active",
    joinDate: "2023-02-10",
  },
  {
    id: 4,
    name: "Phạm Minh Tuấn",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    email: "tuan.pham@edu.vn",
    phone: "0934567890",
    subjects: ["Văn"],
    classes: 5,
    status: "inactive",
    joinDate: "2020-05-05",
  },
  {
    id: 5,
    name: "Hoàng Thị Lan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    email: "lan.hoang@edu.vn",
    phone: "0945678901",
    subjects: ["Tin Học"],
    classes: 4,
    status: "active",
    joinDate: "2022-09-01",
  },
];

const subjects = ["Toán", "Vật Lý", "Hóa Học", "Sinh Học", "Tiếng Anh", "Văn", "Tin Học", "Lịch Sử", "Địa Lý"];

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function AdminTeachersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<{ id: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [autoPassword, setAutoPassword] = useState(() => generatePassword());
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenReset = (teacher: { id: number; name: string }) => {
    setSelectedTeacher(teacher);
    setNewPassword(generatePassword());
    setIsResetDialogOpen(true);
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = filterSubject === "all" || teacher.subjects.includes(filterSubject);
    const matchStatus = filterStatus === "all" || teacher.status === filterStatus;
    return matchSearch && matchSubject && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{teachers.length}</p>
                <p className="text-sm text-muted-foreground">Tổng giáo viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {teachers.filter((t) => t.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {teachers.reduce((acc, t) => acc + t.classes, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Lớp đang dạy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
                <p className="text-sm text-muted-foreground">Môn học</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">Danh sách giáo viên</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setAutoPassword(generatePassword()); }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Thêm giáo viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm giáo viên mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Thông tin cá nhân */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin cá nhân</p>
                <div className="space-y-2">
                  <Label>Họ và tên <span className="text-destructive">*</span></Label>
                  <Input placeholder="Nhập họ và tên" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@edu.vn" />
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input placeholder="0901234567" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Môn giảng dạy</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn môn học" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <Select defaultValue="active">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tài khoản hệ thống */}
                <Separator />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tài khoản hệ thống</p>
                <div className="space-y-2">
                  <Label>Tên đăng nhập <span className="text-destructive">*</span></Label>
                  <Input placeholder="VD: mai.nguyen hoặc dùng email" />
                  <p className="text-xs text-muted-foreground">Giáo viên sẽ dùng tên này để đăng nhập.</p>
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu tạm thời <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input value={autoPassword} onChange={(e) => setAutoPassword(e.target.value)} className="font-mono text-sm" />
                    <Button type="button" variant="outline" size="icon" title="Tạo lại mật khẩu" onClick={() => setAutoPassword(generatePassword())}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" title="Sao chép" onClick={() => handleCopy(autoPassword)}>
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Giáo viên nên đổi mật khẩu sau khi đăng nhập lần đầu.</p>
                </div>

                <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                  Thêm giáo viên
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Giáo viên</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">SĐT</TableHead>
                <TableHead>Môn học</TableHead>
                <TableHead className="text-center">Lớp</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={teacher.avatar} />
                        <AvatarFallback>
                          {teacher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{teacher.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="text-sm">{teacher.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span className="text-sm">{teacher.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{teacher.classes}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        teacher.status === "active"
                          ? "bg-primary/10 text-primary border-0"
                          : "bg-muted text-muted-foreground border-0"
                      }
                    >
                      {teacher.status === "active" ? "Hoạt động" : "Tạm nghỉ"}
                    </Badge>
                  </TableCell>
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
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenReset({ id: teacher.id, name: teacher.name })}>
                          <KeyRound className="w-4 h-4 mr-2" />
                          Đặt lại mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa
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

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Đặt lại mật khẩu
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Đặt lại mật khẩu cho giáo viên <span className="font-semibold text-foreground">{selectedTeacher?.name}</span>
            </p>
            <div className="space-y-2">
              <Label>Mật khẩu mới</Label>
              <div className="flex gap-2">
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setNewPassword(generatePassword())} title="Tạo lại">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => handleCopy(newPassword)} title="Sao chép">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Nhớ gửi mật khẩu này cho giáo viên.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => setIsResetDialogOpen(false)}>Xác nhận đặt lại</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
