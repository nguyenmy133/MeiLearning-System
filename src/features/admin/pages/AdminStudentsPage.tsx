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
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
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
  CreditCard,
  UserCheck,
  UserX,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  UserMinus,
} from "lucide-react";

// Mock data
const students = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100",
    email: "an.nguyen@gmail.com",
    phone: "0901234567",
    parentPhone: "0911234567",
    classes: ["Toán 10A", "Lý 10A"],
    status: "active",
    tuitionStatus: "paid",
    enrollDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Trần Thị Bích",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
    email: "bich.tran@gmail.com",
    phone: "0912345678",
    parentPhone: "0922345678",
    classes: ["Anh Văn B1", "Anh Văn Speaking"],
    status: "active",
    tuitionStatus: "pending",
    enrollDate: "2024-02-20",
  },
  {
    id: 3,
    name: "Lê Minh Cường",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100",
    email: "cuong.le@gmail.com",
    phone: "0923456789",
    parentPhone: "0933456789",
    classes: ["Hóa 11"],
    status: "active",
    tuitionStatus: "paid",
    enrollDate: "2023-09-01",
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    email: "dung.pham@gmail.com",
    phone: "0934567890",
    parentPhone: "0944567890",
    classes: ["Văn 12", "Toán 12"],
    status: "inactive",
    tuitionStatus: "overdue",
    enrollDate: "2023-06-15",
    dropDate: "2025-01-10",
    dropReason: "Chuyển trường",
  },
  {
    id: 5,
    name: "Hoàng Văn Em",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    email: "em.hoang@gmail.com",
    phone: "0945678901",
    parentPhone: "0955678901",
    classes: ["Tin Học Cơ Bản"],
    status: "active",
    tuitionStatus: "paid",
    enrollDate: "2024-03-01",
  },
];

const classList = ["Toán 10A", "Lý 10A", "Anh Văn B1", "Anh Văn Speaking", "Hóa 11", "Văn 12", "Toán 12", "Tin Học Cơ Bản"];

const DROP_REASONS = [
  "Chuyển trường / chuyển nơi ở",
  "Bận việc cá nhân / gia đình",
  "Không phù hợp chương trình",
  "Lý do tài chính",
  "Học xong / tốt nghiệp",
  "Khác",
];

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTuition, setFilterTuition] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDropDialogOpen, setIsDropDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: number; name: string; tuitionStatus: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [autoPassword, setAutoPassword] = useState(() => generatePassword());
  const [copied, setCopied] = useState(false);
  const [dropReason, setDropReason] = useState("");
  const [dropReasonOther, setDropReasonOther] = useState("");
  const [dropDate, setDropDate] = useState(new Date().toISOString().split("T")[0]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenReset = (student: { id: number; name: string; tuitionStatus: string }) => {
    setSelectedStudent(student);
    setNewPassword(generatePassword());
    setIsResetDialogOpen(true);
  };

  const handleOpenDrop = (student: { id: number; name: string; tuitionStatus: string }) => {
    setSelectedStudent(student);
    setDropReason("");
    setDropReasonOther("");
    setDropDate(new Date().toISOString().split("T")[0]);
    setIsDropDialogOpen(true);
  };

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const filteredStudents = students.filter((student) => {
    const matchSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm);
    const matchClass = filterClass === "all" || student.classes.includes(filterClass);
    const matchStatus = filterStatus === "all" || student.status === filterStatus;
    const matchTuition = filterTuition === "all" || student.tuitionStatus === filterTuition;
    return matchSearch && matchClass && matchStatus && matchTuition;
  });

  const getTuitionBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-primary/10 text-primary border-0">Đã đóng</Badge>;
      case "pending":
        return <Badge className="bg-secondary/30 text-secondary-foreground border-0">Chờ đóng</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/10 text-destructive border-0">Quá hạn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const hasDebt = selectedStudent?.tuitionStatus === "overdue" || selectedStudent?.tuitionStatus === "pending";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{students.length}</p>
                <p className="text-sm text-muted-foreground">Tổng học viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {students.filter((s) => s.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Đang học</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {students.filter((s) => s.tuitionStatus === "paid").length}
                </p>
                <p className="text-sm text-muted-foreground">Đã đóng phí</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Stat 4: đổi sang "Đã nghỉ học" thay vì "Quá hạn phí" vì overdue đã hiện trong cột Học phí */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <UserMinus className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {students.filter((s) => s.status === "inactive").length}
                </p>
                <p className="text-sm text-muted-foreground">Đã nghỉ học</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">Danh sách học viên</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setSelectedClasses([]); setAutoPassword(generatePassword()); } }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Thêm học viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm học viên mới</DialogTitle>
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
                    <Input type="email" placeholder="email@gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input placeholder="0901234567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>SĐT Phụ huynh</Label>
                  <Input placeholder="0911234567" />
                </div>

                {/* Lớp học */}
                <Separator />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lớp đăng ký</p>
                <div className="flex flex-wrap gap-2">
                  {classList.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleClass(cls)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        selectedClasses.includes(cls)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
                {selectedClasses.length > 0 && (
                  <p className="text-xs text-muted-foreground">Đã chọn: {selectedClasses.join(", ")}</p>
                )}

                {/* Tài khoản hệ thống */}
                <Separator />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tài khoản hệ thống</p>
                <div className="space-y-2">
                  <Label>Tên đăng nhập <span className="text-destructive">*</span></Label>
                  <Input placeholder="VD: nguyenvana hoặc dùng email" />
                  <p className="text-xs text-muted-foreground">Học viên sẽ dùng tên này để đăng nhập.</p>
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
                  <p className="text-xs text-muted-foreground">Học viên nên đổi mật khẩu sau khi đăng nhập lần đầu.</p>
                </div>

                <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                  Thêm học viên
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả lớp</SelectItem>
                  {classList.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang học</SelectItem>
                  <SelectItem value="inactive">Nghỉ học</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTuition} onValueChange={setFilterTuition}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Học phí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="paid">Đã đóng</SelectItem>
                  <SelectItem value="pending">Chờ đóng</SelectItem>
                  <SelectItem value="overdue">Quá hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">SĐT</TableHead>
                <TableHead className="hidden sm:table-cell">Lớp</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Học phí</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className={student.status === "inactive" ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium block">{student.name}</span>
                        {"dropDate" in student && student.dropDate && (
                          <span className="text-xs text-muted-foreground">Nghỉ từ {student.dropDate}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="text-sm">{student.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span className="text-sm">{student.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {student.classes.slice(0, 2).map((cls) => (
                        <Badge key={cls} variant="secondary" className="text-xs">{cls}</Badge>
                      ))}
                      {student.classes.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{student.classes.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        student.status === "active"
                          ? "bg-primary/10 text-primary border-0"
                          : "bg-muted text-muted-foreground border-0"
                      }
                    >
                      {student.status === "active" ? "Đang học" : "Nghỉ học"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getTuitionBadge(student.tuitionStatus)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenReset({ id: student.id, name: student.name, tuitionStatus: student.tuitionStatus })}>
                          <KeyRound className="w-4 h-4 mr-2" />
                          Đặt lại mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {/* ── Nghiệp vụ nghỉ học / kích hoạt lại ── */}
                        {student.status === "active" ? (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleOpenDrop({ id: student.id, name: student.name, tuitionStatus: student.tuitionStatus })}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Ghi nhận nghỉ học
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-primary focus:text-primary">
                            <UserCheck className="w-4 h-4 mr-2" />
                            Mở khóa & Kích hoạt lại
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa vĩnh viễn
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

      {/* ── Dialog: Ghi nhận nghỉ học ── */}
      <Dialog open={isDropDialogOpen} onOpenChange={setIsDropDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-destructive" />
              Ghi nhận nghỉ học & Khóa tài khoản
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <p className="text-sm text-muted-foreground">
              Học viên:{" "}
              <span className="font-semibold text-foreground">{selectedStudent?.name}</span>
            </p>

            {/* Thông báo rõ hệ quả: khóa tài khoản */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border border-border">
              <UserX className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">
                Tài khoản của học viên sẽ bị{" "}
                <span className="font-semibold text-destructive">khóa ngay lập tức</span>.
                Học viên sẽ không thể đăng nhập cho đến khi được kích hoạt lại.
              </p>
            </div>

            {/* Cảnh báo nếu còn nợ học phí */}
            {hasDebt && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-destructive">Học viên còn nợ học phí</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Vui lòng xử lý học phí còn tồn đọng trước hoặc ghi chú để theo dõi sau.
                  </p>
                </div>
              </div>
            )}

            {/* Ngày nghỉ */}
            <div className="space-y-2">
              <Label>Ngày nghỉ học hiệu lực <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={dropDate}
                onChange={(e) => setDropDate(e.target.value)}
              />
            </div>

            {/* Lý do nghỉ */}
            <div className="space-y-2">
              <Label>Lý do nghỉ học <span className="text-destructive">*</span></Label>
              <Select value={dropReason} onValueChange={setDropReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do..." />
                </SelectTrigger>
                <SelectContent>
                  {DROP_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ghi chú thêm nếu chọn "Khác" hoặc muốn bổ sung */}
            {(dropReason === "Khác" || dropReason !== "") && (
              <div className="space-y-2">
                <Label>Ghi chú thêm</Label>
                <Textarea
                  placeholder="Nhập ghi chú nếu cần..."
                  value={dropReasonOther}
                  onChange={(e) => setDropReasonOther(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDropDialogOpen(false)}>Hủy</Button>
            <Button
              variant="destructive"
              disabled={!dropReason || !dropDate}
              onClick={() => setIsDropDialogOpen(false)}
            >
              <UserX className="w-4 h-4 mr-1" />
              Nghỉ học & Khóa tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Reset Password ── */}
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
              Đặt lại mật khẩu cho học viên{" "}
              <span className="font-semibold text-foreground">{selectedStudent?.name}</span>
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
              <p className="text-xs text-muted-foreground">Nhớ gửi mật khẩu này cho học viên.</p>
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
