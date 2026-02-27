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
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  GraduationCap,
  Users,
  LayoutGrid,
  MapPin,
} from "lucide-react";

// Mock data
const ALL_FACILITIES = ["Cơ sở Quận 1", "Cơ sở Quận 3", "Cơ sở Thủ Đức"];

type Subject = {
  id: number;
  name: string;
  code: string;
  description: string;
  category: string;
  teachers: number;
  classes: number;
  status: string;
  facilities: string[];
};

const subjects: Subject[] = [
  {
    id: 1,
    name: "Toán",
    code: "MATH",
    description: "Toán học đại cương và nâng cao",
    category: "Tự nhiên",
    teachers: 3,
    classes: 6,
    status: "active",
    facilities: ["Cơ sở Quận 1", "Cơ sở Quận 3"],
  },
  {
    id: 2,
    name: "Vật Lý",
    code: "PHYS",
    description: "Vật lý cơ bản và nâng cao",
    category: "Tự nhiên",
    teachers: 2,
    classes: 4,
    status: "active",
    facilities: ["Cơ sở Quận 1"],
  },
  {
    id: 3,
    name: "Hóa Học",
    code: "CHEM",
    description: "Hóa học vô cơ và hữu cơ",
    category: "Tự nhiên",
    teachers: 2,
    classes: 3,
    status: "active",
    facilities: ["Cơ sở Quận 1", "Cơ sở Thủ Đức"],
  },
  {
    id: 4,
    name: "Sinh Học",
    code: "BIO",
    description: "Sinh học tế bào và sinh thái",
    category: "Tự nhiên",
    teachers: 1,
    classes: 2,
    status: "active",
    facilities: ["Cơ sở Quận 3"],
  },
  {
    id: 5,
    name: "Tiếng Anh",
    code: "ENG",
    description: "Tiếng Anh giao tiếp và học thuật",
    category: "Ngoại ngữ",
    teachers: 4,
    classes: 8,
    status: "active",
    facilities: ["Cơ sở Quận 1", "Cơ sở Quận 3", "Cơ sở Thủ Đức"],
  },
  {
    id: 6,
    name: "Văn",
    code: "LIT",
    description: "Ngữ văn và văn học",
    category: "Xã hội",
    teachers: 2,
    classes: 4,
    status: "active",
    facilities: ["Cơ sở Quận 1", "Cơ sở Quận 3"],
  },
  {
    id: 7,
    name: "Tin Học",
    code: "IT",
    description: "Tin học cơ bản và lập trình",
    category: "Công nghệ",
    teachers: 2,
    classes: 4,
    status: "active",
    facilities: ["Cơ sở Thủ Đức"],
  },
  {
    id: 8,
    name: "Lịch Sử",
    code: "HIST",
    description: "Lịch sử Việt Nam và thế giới",
    category: "Xã hội",
    teachers: 1,
    classes: 2,
    status: "inactive",
    facilities: ["Cơ sở Quận 1"],
  },
];

const categories = ["Tự nhiên", "Xã hội", "Ngoại ngữ", "Công nghệ"];

export function AdminSubjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<(typeof subjects)[0] | null>(null);

  const filteredSubjects = subjects.filter((subject) => {
    const matchSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      filterCategory === "all" || subject.category === filterCategory;
    const matchStatus =
      filterStatus === "all" || subject.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const stats = [
    {
      label: "Tổng môn học",
      value: subjects.length,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Đang hoạt động",
      value: subjects.filter((s) => s.status === "active").length,
      icon: LayoutGrid,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Tổng giáo viên",
      value: subjects.reduce((a, s) => a + s.teachers, 0),
      icon: GraduationCap,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Tổng lớp học",
      value: subjects.reduce((a, s) => a + s.classes, 0),
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  const SubjectForm = ({
    onClose,
    initial,
  }: {
    onClose: () => void;
    initial?: Subject | null;
  }) => {
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
      initial?.facilities || []
    );

    const toggleFacility = (facility: string) => {
      setSelectedFacilities((prev) =>
        prev.includes(facility)
          ? prev.filter((f) => f !== facility)
          : [...prev, facility]
      );
    };

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Tên môn học <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="VD: Toán" defaultValue={initial?.name} />
          </div>
          <div className="space-y-2">
            <Label>
              Mã môn <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="VD: MATH" defaultValue={initial?.code} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phân loại</Label>
            <Select defaultValue={initial?.category ?? "Tự nhiên"}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phân loại" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {initial && (
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select defaultValue={initial.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm ngừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Cơ sở giảng dạy</Label>
          <div className="flex flex-wrap gap-2">
            {ALL_FACILITIES.map((facility) => (
              <Badge
                key={facility}
                variant={selectedFacilities.includes(facility) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleFacility(facility)}
              >
                {facility}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mô tả</Label>
          <Textarea
            placeholder="Mô tả ngắn về môn học..."
            defaultValue={initial?.description}
            rows={3}
          />
        </div>
        <Button className="w-full" onClick={onClose}>
          {initial ? "Cập nhật môn học" : "Thêm môn học"}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">
            Danh sách môn học
          </CardTitle>

          {/* Add dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Thêm môn học
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Thêm môn học mới</DialogTitle>
              </DialogHeader>
              <SubjectForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, mã môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Phân loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
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
                  <SelectItem value="inactive">Tạm ngừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Môn học</TableHead>
                <TableHead className="hidden sm:table-cell">Mã môn</TableHead>
                <TableHead className="hidden md:table-cell">Phân loại</TableHead>
                <TableHead className="hidden lg:table-cell">Cơ sở giảng dạy</TableHead>
                <TableHead className="text-center hidden sm:table-cell">
                  Giáo viên
                </TableHead>
                <TableHead className="text-center hidden sm:table-cell">
                  Lớp học
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {subject.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {subject.code}
                    </code>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {subject.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {subject.facilities.map((f) => (
                        <Badge key={f} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span className="text-sm">{subject.teachers}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-sm">{subject.classes}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        subject.status === "active"
                          ? "bg-primary/10 text-primary border-0"
                          : "bg-muted text-muted-foreground border-0"
                      }
                    >
                      {subject.status === "active" ? "Hoạt động" : "Tạm ngừng"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Edit dialog */}
                    <Dialog
                      open={editSubject?.id === subject.id}
                      onOpenChange={(open) =>
                        !open && setEditSubject(null)
                      }
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditSubject(subject)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Chỉnh sửa môn học</DialogTitle>
                        </DialogHeader>
                        <SubjectForm
                          onClose={() => setEditSubject(null)}
                          initial={editSubject}
                        />
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
