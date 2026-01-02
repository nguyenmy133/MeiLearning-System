import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  TrendingUp,
  BookOpen,
  UserCheck,
  Eye,
  Phone,
  Mail
} from "lucide-react";

const classes = [
  {
    id: 1,
    name: "Toán 10A",
    subject: "Toán",
    level: "Lớp 10",
    schedule: "Thứ 2, 4 | 14:00 - 16:00",
    room: "P.101",
    totalStudents: 8,
    avgAttendance: 95,
    avgScore: 7.8,
    progress: 65,
    status: "active",
    students: [
      { id: 1, name: "Nguyễn Minh Anh", avatar: "", phone: "0901234567", email: "minhanh@email.com", attendance: 100, avgScore: 8.5 },
      { id: 2, name: "Trần Văn Bình", avatar: "", phone: "0912345678", email: "vanbinh@email.com", attendance: 95, avgScore: 7.2 },
      { id: 3, name: "Lê Thị Chi", avatar: "", phone: "0923456789", email: "thichi@email.com", attendance: 90, avgScore: 8.0 },
      { id: 4, name: "Phạm Đức Duy", avatar: "", phone: "0934567890", email: "ducduy@email.com", attendance: 100, avgScore: 7.5 },
      { id: 5, name: "Hoàng Thị Em", avatar: "", phone: "0945678901", email: "thiem@email.com", attendance: 85, avgScore: 6.8 },
      { id: 6, name: "Vũ Văn Phong", avatar: "", phone: "0956789012", email: "vanphong@email.com", attendance: 100, avgScore: 9.0 },
      { id: 7, name: "Đặng Thị Giang", avatar: "", phone: "0967890123", email: "thigiang@email.com", attendance: 95, avgScore: 7.8 },
      { id: 8, name: "Bùi Minh Hoàng", avatar: "", phone: "0978901234", email: "minhhoang@email.com", attendance: 90, avgScore: 8.2 },
    ]
  },
  {
    id: 2,
    name: "Toán 11A",
    subject: "Toán",
    level: "Lớp 11",
    schedule: "Thứ 3, 5 | 14:00 - 16:00",
    room: "P.103",
    totalStudents: 12,
    avgAttendance: 92,
    avgScore: 7.5,
    progress: 55,
    status: "active",
    students: []
  },
  {
    id: 3,
    name: "Toán 12B",
    subject: "Toán",
    level: "Lớp 12",
    schedule: "Thứ 2, 5 | 16:30 - 18:30",
    room: "P.102",
    totalStudents: 10,
    avgAttendance: 98,
    avgScore: 8.2,
    progress: 70,
    status: "active",
    students: []
  },
  {
    id: 4,
    name: "Toán 10B",
    subject: "Toán",
    level: "Lớp 10",
    schedule: "Thứ 4, 6 | 18:00 - 20:00",
    room: "P.104",
    totalStudents: 9,
    avgAttendance: 88,
    avgScore: 7.0,
    progress: 60,
    status: "active",
    students: []
  },
  {
    id: 5,
    name: "Ôn thi THPT",
    subject: "Toán",
    level: "Lớp 12",
    schedule: "Thứ 7 | 08:00 - 11:00",
    room: "P.201",
    totalStudents: 15,
    avgAttendance: 96,
    avgScore: 7.8,
    progress: 45,
    status: "active",
    students: []
  }
];

export function TeacherClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState(classes[0]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Lớp của tôi</h1>
          <p className="text-muted-foreground">Quản lý các lớp bạn đang phụ trách</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-xs text-muted-foreground">Lớp phụ trách</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">54</p>
                <p className="text-xs text-muted-foreground">Tổng học viên</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-muted-foreground">Chuyên cần TB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">7.7</p>
                <p className="text-xs text-muted-foreground">Điểm TB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => (
          <Card key={cls.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-display">{cls.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{cls.level} • {cls.subject}</p>
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Đang học
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{cls.room}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{cls.totalStudents} học viên</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tiến độ khóa học</span>
                  <span className="font-medium">{cls.progress}%</span>
                </div>
                <Progress value={cls.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-center p-2 bg-accent rounded-lg">
                  <p className="text-lg font-bold text-success">{cls.avgAttendance}%</p>
                  <p className="text-xs text-muted-foreground">Chuyên cần</p>
                </div>
                <div className="text-center p-2 bg-accent rounded-lg">
                  <p className="text-lg font-bold text-info">{cls.avgScore}</p>
                  <p className="text-xs text-muted-foreground">Điểm TB</p>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedClass(cls)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem danh sách lớp
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display">{selectedClass.name} - Danh sách học viên</DialogTitle>
                  </DialogHeader>
                  
                  {selectedClass.students.length > 0 ? (
                    <div className="space-y-3 mt-4">
                      {selectedClass.students.map((student, index) => (
                        <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
                          <span className="w-6 text-sm text-muted-foreground">{index + 1}</span>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>{student.name.split(' ').pop()?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {student.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {student.email}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              <span className="text-success font-medium">{student.attendance}%</span>
                              <span className="text-muted-foreground"> CC</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-info font-medium">{student.avgScore}</span>
                              <span className="text-muted-foreground"> điểm</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      Dữ liệu chi tiết chưa được tải
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
