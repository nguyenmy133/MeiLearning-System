import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Search, 
  Calendar, 
  MapPin, 
  TrendingUp,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { useClasses } from "@/features/admin/classes/hooks";
import { formatSchedule, CLASS_STATUS_LABELS } from "@/features/admin/classes/types";

// MOCK: current logged-in teacher ID — swap for auth context when BE is ready
const CURRENT_TEACHER_ID = 1;

export function TeacherClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: classPage, isLoading } = useClasses({
    teacherId: CURRENT_TEACHER_ID,
    search: searchTerm || undefined,
    limit: 50,
  });

  const classes = classPage?.data ?? [];
  const totalStudents = classes.reduce((s, c) => s + c.students, 0);

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
                <p className="text-2xl font-bold">{isLoading ? "—" : classes.length}</p>
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
                <p className="text-2xl font-bold">{isLoading ? "—" : totalStudents}</p>
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
                <p className="text-2xl font-bold">—</p>
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
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">Điểm TB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-display">{cls.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{cls.subject}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      cls.status === "active"
                        ? "bg-success/10 text-success"
                        : cls.status === "upcoming"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {CLASS_STATUS_LABELS[cls.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatSchedule(cls.schedule)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{cls.room} • {cls.facility}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{cls.students}/{cls.maxStudents} học viên</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sĩ số</span>
                    <span className="font-medium">
                      {Math.round((cls.students / cls.maxStudents) * 100)}%
                    </span>
                  </div>
                  <Progress value={(cls.students / cls.maxStudents) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}

          {classes.length === 0 && (
            <div className="col-span-3 py-16 text-center text-muted-foreground">
              Không tìm thấy lớp nào
            </div>
          )}
        </div>
      )}
    </div>
  );
}
