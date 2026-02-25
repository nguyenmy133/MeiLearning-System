import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, TrendingUp, Users, DollarSign } from 'lucide-react';

interface TeacherPerformanceProps {
  data: Array<{
    teacherName: string;
    subject: string;
    totalClasses: number;
    totalStudents: number;
    avgAttendance: number;
    avgRating: number;
    revenue: number;
  }>;
}

export function TeacherPerformanceTable({ data }: TeacherPerformanceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return 'text-success';
    if (rating >= 4.5) return 'text-primary';
    if (rating >= 4.0) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          Hiệu suất giảng viên
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Đánh giá tổng quan về hiệu suất giảng dạy
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Giảng viên</TableHead>
                <TableHead>Môn học</TableHead>
                <TableHead className="text-center">Số lớp</TableHead>
                <TableHead className="text-center">Học viên</TableHead>
                <TableHead className="text-center">Điểm danh</TableHead>
                <TableHead className="text-center">Đánh giá</TableHead>
                <TableHead className="text-right">Doanh thu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((teacher, index) => (
                <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{teacher.teacherName}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {teacher.subject}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      {teacher.totalClasses}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {teacher.totalStudents}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${
                      teacher.avgAttendance >= 90 ? 'text-success' : 
                      teacher.avgAttendance >= 85 ? 'text-primary' : 'text-warning'
                    }`}>
                      {teacher.avgAttendance.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={`flex items-center justify-center gap-1 font-medium ${getRatingColor(teacher.avgRating)}`}>
                      <Star className="w-4 h-4 fill-current" />
                      {teacher.avgRating.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 font-medium text-success">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(teacher.revenue)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
