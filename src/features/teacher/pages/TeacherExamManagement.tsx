import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Copy,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";

// Mock data
const exams = [
  {
    id: 1,
    title: "Kiểm tra giữa kỳ - Toán 12",
    subject: "Toán học",
    classes: ["Toán 12A", "Toán 12B"],
    duration: 60,
    totalQuestions: 20,
    startTime: "2024-01-20 14:00",
    endTime: "2024-01-20 16:00",
    status: "ended",
    totalStudents: 45,
    completedStudents: 42,
    averageScore: 76,
    passRate: 85,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "Bài tập tuần 3 - Đạo hàm",
    subject: "Toán học",
    classes: ["Toán 12A"],
    duration: 30,
    totalQuestions: 15,
    startTime: "2024-01-22 10:00",
    endTime: "2024-01-29 23:59",
    status: "ongoing",
    totalStudents: 25,
    completedStudents: 18,
    averageScore: 82,
    passRate: 90,
    createdAt: "2024-01-18",
  },
  {
    id: 3,
    title: "Ôn tập chương 1",
    subject: "Toán học",
    classes: ["Toán 12B"],
    duration: 45,
    totalQuestions: 25,
    startTime: "2024-01-25 08:00",
    endTime: "2024-01-25 23:59",
    status: "published",
    totalStudents: 20,
    completedStudents: 0,
    averageScore: 0,
    passRate: 0,
    createdAt: "2024-01-20",
  },
  {
    id: 4,
    title: "Kiểm tra cuối kỳ",
    subject: "Toán học",
    classes: ["Toán 12A", "Toán 12B"],
    duration: 90,
    totalQuestions: 30,
    startTime: "",
    endTime: "",
    status: "draft",
    totalStudents: 0,
    completedStudents: 0,
    averageScore: 0,
    passRate: 0,
    createdAt: "2024-01-21",
  },
];

export function TeacherExamManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<number | null>(null);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: exams.length,
    ongoing: exams.filter(e => e.status === "ongoing").length,
    ended: exams.filter(e => e.status === "ended").length,
    averagePassRate: Math.round(exams.reduce((acc, e) => acc + e.passRate, 0) / exams.length),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Nháp</Badge>;
      case "published":
        return <Badge className="bg-primary">Đã xuất bản</Badge>;
      case "ongoing":
        return <Badge className="bg-warning">Đang diễn ra</Badge>;
      case "ended":
        return <Badge className="bg-muted text-muted-foreground">Đã kết thúc</Badge>;
      default:
        return null;
    }
  };

  const handleDelete = (id: number) => {
    setExamToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // Mock delete
    console.log("Delete exam:", examToDelete);
    setDeleteDialogOpen(false);
    setExamToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Quản lý bài thi
          </h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý bài kiểm tra cho học viên
          </p>
        </div>
        <Button onClick={() => navigate("/teacher/exams/create")} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo bài thi mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Tổng bài thi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ongoing}</p>
                <p className="text-xs text-muted-foreground">Đang diễn ra</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ended}</p>
                <p className="text-xs text-muted-foreground">Đã kết thúc</p>
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
                <p className="text-2xl font-bold">{stats.averagePassRate}%</p>
                <p className="text-xs text-muted-foreground">Tỷ lệ đạt TB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                <SelectItem value="ended">Đã kết thúc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exam List */}
      <div className="space-y-4">
        {filteredExams.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không tìm thấy bài thi nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{exam.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary">{exam.subject}</Badge>
                          {exam.classes.map((cls, idx) => (
                            <Badge key={idx} variant="outline">{cls}</Badge>
                          ))}
                          {getStatusBadge(exam.status)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Số câu hỏi</p>
                        <p className="font-semibold text-foreground">{exam.totalQuestions} câu</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Thời gian</p>
                        <p className="font-semibold text-foreground">{exam.duration} phút</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Học viên</p>
                        <p className="font-semibold text-foreground">
                          {exam.completedStudents}/{exam.totalStudents}
                        </p>
                      </div>
                      {exam.status !== "draft" && exam.completedStudents > 0 && (
                        <div>
                          <p className="text-muted-foreground">Điểm TB</p>
                          <p className="font-semibold text-primary">{exam.averageScore}/100</p>
                        </div>
                      )}
                    </div>

                    {exam.startTime && (
                      <p className="text-xs text-muted-foreground">
                        Thời gian: {exam.startTime} - {exam.endTime}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {exam.status !== "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/teacher/exams/results/${exam.id}`)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Xem kết quả
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/teacher/exams/edit/${exam.id}`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/teacher/exams/create?duplicate=${exam.id}`)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Nhân bản
                        </DropdownMenuItem>
                        {exam.status === "draft" && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(exam.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài thi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
