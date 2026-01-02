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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  Clock,
  Filter,
  GraduationCap,
  MapPin,
} from "lucide-react";

// Mock data
const classes = [
  {
    id: 1,
    name: "Toán 10A",
    subject: "Toán",
    teacher: {
      name: "Nguyễn Thị Mai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    students: 18,
    maxStudents: 20,
    schedule: "T2, T4, T6 - 18:00",
    room: "Phòng 101",
    facility: "Cơ sở Quận 1",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    status: "active",
    progress: 65,
  },
  {
    id: 2,
    name: "Anh Văn B1",
    subject: "Tiếng Anh",
    teacher: {
      name: "Trần Văn Hùng",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    },
    students: 15,
    maxStudents: 15,
    schedule: "T3, T5 - 19:00",
    room: "Phòng A1",
    facility: "Cơ sở Quận 3",
    startDate: "2024-02-01",
    endDate: "2024-07-01",
    status: "active",
    progress: 45,
  },
  {
    id: 3,
    name: "Hóa 11",
    subject: "Hóa Học",
    teacher: {
      name: "Lê Thị Hương",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    },
    students: 12,
    maxStudents: 18,
    schedule: "T7, CN - 08:00",
    room: "Phòng Lab 1",
    facility: "Cơ sở Thủ Đức",
    startDate: "2024-03-01",
    endDate: "2024-08-01",
    status: "active",
    progress: 30,
  },
  {
    id: 4,
    name: "Văn 12 - Luyện thi",
    subject: "Văn",
    teacher: {
      name: "Phạm Minh Tuấn",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    },
    students: 22,
    maxStudents: 25,
    schedule: "T2, T4, T6 - 08:00",
    room: "Phòng 201",
    facility: "Cơ sở Quận 1",
    startDate: "2023-09-01",
    endDate: "2024-05-30",
    status: "completed",
    progress: 100,
  },
  {
    id: 5,
    name: "Lý 10A",
    subject: "Vật Lý",
    teacher: {
      name: "Nguyễn Thị Mai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    students: 0,
    maxStudents: 20,
    schedule: "T3, T5, T7 - 18:00",
    room: "Phòng 102",
    facility: "Cơ sở Quận 1",
    startDate: "2024-04-01",
    endDate: "2024-09-01",
    status: "upcoming",
    progress: 0,
  },
];

const subjects = ["Toán", "Vật Lý", "Hóa Học", "Sinh Học", "Tiếng Anh", "Văn", "Tin Học"];
const facilities = ["Cơ sở Quận 1", "Cơ sở Quận 3", "Cơ sở Thủ Đức"];

export function AdminClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFacility, setFilterFacility] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredClasses = classes.filter((cls) => {
    const matchSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = filterSubject === "all" || cls.subject === filterSubject;
    const matchStatus = filterStatus === "all" || cls.status === filterStatus;
    const matchFacility = filterFacility === "all" || cls.facility === filterFacility;
    return matchSearch && matchSubject && matchStatus && matchFacility;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-primary/10 text-primary border-0">Đang học</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground border-0">Đã kết thúc</Badge>;
      case "upcoming":
        return <Badge className="bg-secondary/30 text-secondary-foreground border-0">Sắp mở</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{classes.length}</p>
                <p className="text-sm text-muted-foreground">Tổng lớp học</p>
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
                  {classes.filter((c) => c.status === "active").length}
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
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {classes.reduce((acc, c) => acc + c.students, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Học viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {classes.filter((c) => c.status === "upcoming").length}
                </p>
                <p className="text-sm text-muted-foreground">Sắp mở</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">Danh sách lớp học</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Tạo lớp mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tạo lớp học mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Tên lớp</Label>
                  <Input placeholder="VD: Toán 10A - K2024" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Môn học</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn môn" />
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
                    <Label>Giáo viên</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn GV" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mai">Nguyễn Thị Mai</SelectItem>
                        <SelectItem value="hung">Trần Văn Hùng</SelectItem>
                        <SelectItem value="huong">Lê Thị Hương</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cơ sở</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn cơ sở" />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phòng học</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="101">Phòng 101</SelectItem>
                        <SelectItem value="102">Phòng 102</SelectItem>
                        <SelectItem value="201">Phòng 201</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sĩ số tối đa</Label>
                    <Input type="number" placeholder="20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Lịch học</Label>
                    <Input placeholder="T2, T4, T6 - 18:00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea placeholder="Mô tả về lớp học..." />
                </div>
                <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                  Tạo lớp học
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
                placeholder="Tìm theo tên lớp, giáo viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Môn" />
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
                  <SelectItem value="active">Đang học</SelectItem>
                  <SelectItem value="upcoming">Sắp mở</SelectItem>
                  <SelectItem value="completed">Đã kết thúc</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFacility} onValueChange={setFilterFacility}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cơ sở</SelectItem>
                  {facilities.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lớp học</TableHead>
                <TableHead>Giáo viên</TableHead>
                <TableHead className="hidden md:table-cell">Lịch học</TableHead>
                <TableHead className="hidden lg:table-cell">Địa điểm</TableHead>
                <TableHead className="text-center">Sĩ số</TableHead>
                <TableHead className="hidden sm:table-cell">Tiến độ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="font-medium">{cls.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {cls.subject}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={cls.teacher.avatar} />
                        <AvatarFallback>
                          {cls.teacher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{cls.teacher.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock className="w-3 h-3" />
                      {cls.schedule}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {cls.room}
                      </div>
                      <span className="text-xs text-muted-foreground">{cls.facility}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        cls.students >= cls.maxStudents ? "text-destructive font-medium" : ""
                      }
                    >
                      {cls.students}/{cls.maxStudents}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Progress value={cls.progress} className="w-16 h-2" />
                      <span className="text-xs text-muted-foreground">{cls.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(cls.status)}</TableCell>
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
                          <Users className="w-4 h-4 mr-2" />
                          Danh sách HV
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
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
    </div>
  );
}
