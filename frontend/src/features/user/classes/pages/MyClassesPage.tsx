import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  ClipboardCheck,
  FileText,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyClasses } from "@/features/user/schedule/hooks";
import type { ClassInfo, ClassStatus } from "@/features/user/schedule/types";

// ── Helpers ──────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(-2)
    .join("")
    .toUpperCase();

const getStatusBadge = (status: ClassStatus) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
          Đang học
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0">
          Đã hoàn thành
        </Badge>
      );
    case "upcoming":
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0">
          Sắp khai giảng
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-0">
          {status}
        </Badge>
      );
  }
};

const formatExpiryDate = (isoDate?: string) => {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

// ── Component ───────────────────────────────────────────────────────────

export function MyClassesPage() {
  const { data: classes = [], isLoading } = useMyClasses();

  // Auto-group: active classes first, completed/closed after
  const { activeClasses, completedClasses } = useMemo(() => {
    const active: ClassInfo[] = [];
    const completed: ClassInfo[] = [];
    for (const cls of classes) {
      if (cls.status === "active" || cls.status === "upcoming") {
        active.push(cls);
      } else {
        completed.push(cls);
      }
    }
    return { activeClasses: active, completedClasses: completed };
  }, [classes]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Lớp học của tôi
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi các lớp học của bạn
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Lớp học của tôi
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và theo dõi các lớp học của bạn
        </p>
      </div>

      {/* Empty state */}
      {classes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Không có lớp học nào.</p>
        </div>
      )}

      {/* Active classes section */}
      {activeClasses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-foreground">
              Đang học
            </h2>
            <Badge variant="secondary" className="ml-1">
              {activeClasses.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        </section>
      )}

      {/* Completed / Closed classes section */}
      {completedClasses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-foreground">
              Đã hoàn thành
            </h2>
            <Badge variant="secondary" className="ml-1">
              {completedClasses.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Class Card ──────────────────────────────────────────────────────────

function ClassCard({ cls }: { cls: ClassInfo }) {
  const isActive = cls.status === "active" || cls.status === "upcoming";
  const expiryDate = formatExpiryDate(cls.accessExpiresAt);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      {/* Colored top bar */}
      <div
        className={`h-1.5 ${
          isActive
            ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
            : "bg-gradient-to-r from-blue-400 to-blue-600"
        }`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{cls.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-0.5">
              <span>{cls.subject}</span>
            </CardDescription>
          </div>
          {getStatusBadge(cls.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teacher */}
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {getInitials(cls.teacherName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {cls.teacherName}
            </p>
            <p className="text-[11px] text-muted-foreground">Giáo viên</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{cls.schedule}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{cls.sessionTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{cls.room}</span>
          </div>
        </div>

        {/* Access expiry for completed classes */}
        {!isActive && expiryDate && (
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/40 rounded-lg">
            <div className="flex items-start gap-2 text-xs">
              <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-blue-700 dark:text-blue-300">
                Tài liệu lớp còn truy cập được đến{" "}
                <span className="font-medium">{expiryDate}</span>
              </p>
            </div>
          </div>
        )}

        {/* Quick action buttons */}
        <div className="flex gap-2 pt-1">
          {isActive && (
            <>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" asChild>
                <Link to="/user/schedule">
                  <Calendar className="w-3.5 h-3.5" />
                  Xem lịch
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" asChild>
                <Link to="/user/attendance">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Điểm danh
                </Link>
              </Button>
            </>
          )}
          {!isActive && (
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" asChild>
              <Link to="/user/documents">
                <FileText className="w-3.5 h-3.5" />
                Xem tài liệu
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
