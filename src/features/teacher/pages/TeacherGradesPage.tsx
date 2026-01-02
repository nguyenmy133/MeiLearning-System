import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Plus,
  Edit,
  Save,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { toast } from "sonner";

const classes = [
  { id: 1, name: "Toán 10A" },
  { id: 2, name: "Toán 11A" },
  { id: 3, name: "Toán 12B" },
  { id: 4, name: "Toán 10B" },
  { id: 5, name: "Ôn thi THPT" },
];

const studentsData = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    avatar: "",
    scores: [8.5, 7.0, 9.0, 8.0],
    avgScore: 8.1,
    trend: "up",
    comment: "Học tập chăm chỉ, tiến bộ tốt trong các bài kiểm tra."
  },
  {
    id: 2,
    name: "Trần Văn Bình",
    avatar: "",
    scores: [7.0, 7.5, 6.5, 7.0],
    avgScore: 7.0,
    trend: "stable",
    comment: "Cần chú ý hơn trong phần hình học."
  },
  {
    id: 3,
    name: "Lê Thị Chi",
    avatar: "",
    scores: [8.0, 8.5, 8.0, 9.0],
    avgScore: 8.4,
    trend: "up",
    comment: "Xuất sắc! Có khả năng tư duy logic tốt."
  },
  {
    id: 4,
    name: "Phạm Đức Duy",
    avatar: "",
    scores: [7.5, 7.0, 7.5, 7.0],
    avgScore: 7.3,
    trend: "stable",
    comment: "Ổn định, cần luyện tập thêm."
  },
  {
    id: 5,
    name: "Hoàng Thị Em",
    avatar: "",
    scores: [6.5, 6.0, 6.5, 6.0],
    avgScore: 6.3,
    trend: "down",
    comment: "Cần hỗ trợ thêm, nên đăng ký học phụ đạo."
  },
  {
    id: 6,
    name: "Vũ Văn Phong",
    avatar: "",
    scores: [9.5, 9.0, 9.5, 10],
    avgScore: 9.5,
    trend: "up",
    comment: "Học sinh xuất sắc, có thể tham gia đội tuyển."
  },
  {
    id: 7,
    name: "Đặng Thị Giang",
    avatar: "",
    scores: [7.5, 8.0, 7.5, 8.5],
    avgScore: 7.9,
    trend: "up",
    comment: "Tiến bộ đều đặn, rất tích cực trong lớp."
  },
  {
    id: 8,
    name: "Bùi Minh Hoàng",
    avatar: "",
    scores: [8.0, 7.5, 8.5, 8.0],
    avgScore: 8.0,
    trend: "stable",
    comment: "Khá tốt, cần cải thiện kỹ năng giải bài tập nhanh."
  },
];

const examTypes = ["KT 15p #1", "KT 45p #1", "KT 15p #2", "Giữa kỳ"];

export function TeacherGradesPage() {
  const [selectedClass, setSelectedClass] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<typeof studentsData[0] | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newScore, setNewScore] = useState("");
  const [scoreType, setScoreType] = useState("");

  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-success";
    if (score >= 6.5) return "text-info";
    if (score >= 5) return "text-warning";
    return "text-destructive";
  };

  const handleSaveComment = () => {
    toast.success("Đã lưu nhận xét thành công!");
    setEditingStudent(null);
    setNewComment("");
  };

  const handleAddScore = () => {
    if (!newScore || !scoreType) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    toast.success("Đã thêm điểm thành công!");
    setNewScore("");
    setScoreType("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Điểm số & Nhận xét</h1>
          <p className="text-muted-foreground">Quản lý điểm và nhận xét học viên</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chọn lớp" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">7.8</p>
            <p className="text-sm text-muted-foreground">Điểm TB lớp</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">3</p>
            <p className="text-sm text-muted-foreground">Giỏi (≥8.0)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-info">4</p>
            <p className="text-sm text-muted-foreground">Khá (6.5-8.0)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">1</p>
            <p className="text-sm text-muted-foreground">TB (5.0-6.5)</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm học viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm điểm mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm điểm mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại bài kiểm tra</label>
                <Select value={scoreType} onValueChange={setScoreType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại bài kiểm tra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kt15">Kiểm tra 15 phút</SelectItem>
                    <SelectItem value="kt45">Kiểm tra 45 phút</SelectItem>
                    <SelectItem value="giuaky">Giữa kỳ</SelectItem>
                    <SelectItem value="cuoiky">Cuối kỳ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Điểm</label>
                <Input
                  type="number"
                  placeholder="Nhập điểm (0-10)"
                  min="0"
                  max="10"
                  step="0.1"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddScore}>
                <Save className="w-4 h-4 mr-2" />
                Lưu điểm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grades Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Học viên</TableHead>
                {examTypes.map((type) => (
                  <TableHead key={type} className="text-center">{type}</TableHead>
                ))}
                <TableHead className="text-center">TB</TableHead>
                <TableHead className="text-center">Xu hướng</TableHead>
                <TableHead>Nhận xét</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name.split(' ').pop()?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  {student.scores.map((score, i) => (
                    <TableCell key={i} className={`text-center font-medium ${getScoreColor(score)}`}>
                      {score}
                    </TableCell>
                  ))}
                  <TableCell className={`text-center font-bold ${getScoreColor(student.avgScore)}`}>
                    {student.avgScore}
                  </TableCell>
                  <TableCell className="text-center">
                    {getTrendIcon(student.trend)}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-sm text-muted-foreground truncate">
                      {student.comment}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingStudent(student);
                            setNewComment(student.comment);
                          }}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nhận xét - {student.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Textarea
                            placeholder="Nhập nhận xét cho học viên..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleSaveComment}>
                            <Save className="w-4 h-4 mr-2" />
                            Lưu nhận xét
                          </Button>
                        </DialogFooter>
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
