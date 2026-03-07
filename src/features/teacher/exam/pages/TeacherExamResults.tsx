import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  BarChart3
} from "lucide-react";

import { useExamInfo, useExamStatistics, useStudentResults, useQuestionAnalysis } from "../hooks";

export function TeacherExamResults() {
  const navigate = useNavigate();
  const { id } = useParams();
  const examId = Number(id);

  const { data: examInfo, isLoading: isLoadingInfo } = useExamInfo(examId);
  const { data: statistics, isLoading: isLoadingStats } = useExamStatistics(examId);
  const { data: studentResults = [], isLoading: isLoadingResults } = useStudentResults(examId);
  const { data: questionAnalysis = [], isLoading: isLoadingAnalysis } = useQuestionAnalysis(examId);

  const [filterStatus, setFilterStatus] = useState("all");

  const filteredResults = studentResults.filter(s => {
    if (filterStatus === "all") return true;
    if (filterStatus === "passed") return s.passed;
    if (filterStatus === "failed") return !s.passed;
    return true;
  });

  const isLoading = isLoadingInfo || isLoadingStats || isLoadingResults || isLoadingAnalysis;

  const handleExport = () => {
    alert("Tính năng xuất Excel đang được phát triển");
  };

  if (isLoading || !examInfo || !statistics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/teacher/exams")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{examInfo.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {examInfo.subject} • {examInfo.classes.join(", ")}
            </p>
          </div>
        </div>

        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Xuất Excel
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.completedStudents}/{statistics.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Đã làm bài</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{statistics.averageScore}</p>
                <p className="text-xs text-muted-foreground">Điểm trung bình</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{statistics.passRate}%</p>
                <p className="text-xs text-muted-foreground">Tỷ lệ đạt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cao nhất: <span className="font-bold text-foreground">{statistics.highestScore}</span></p>
                <p className="text-sm text-muted-foreground">Thấp nhất: <span className="font-bold text-foreground">{statistics.lowestScore}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Phân bố điểm số
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">90-100 (Xuất sắc)</span>
                <span className="font-medium">5 học viên (12%)</span>
              </div>
              <Progress value={12} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">80-89 (Giỏi)</span>
                <span className="font-medium">12 học viên (29%)</span>
              </div>
              <Progress value={29} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">70-79 (Khá)</span>
                <span className="font-medium">18 học viên (43%)</span>
              </div>
              <Progress value={43} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dưới 70 (Chưa đạt)</span>
                <span className="font-medium">7 học viên (16%)</span>
              </div>
              <Progress value={16} className="h-2 bg-destructive/20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kết quả học viên</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="passed">Đạt</SelectItem>
                <SelectItem value="failed">Chưa đạt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead className="text-center">Điểm</TableHead>
                  <TableHead className="text-center">Số câu đúng</TableHead>
                  <TableHead className="text-center">Thời gian</TableHead>
                  <TableHead className="text-center">Kết quả</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-bold ${student.passed ? 'text-success' : 'text-destructive'}`}>
                        {student.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {student.correctAnswers}/{examInfo.totalQuestions}
                    </TableCell>
                    <TableCell className="text-center">{student.timeSpent} phút</TableCell>
                    <TableCell className="text-center">
                      <Badge className={student.passed ? 'bg-success' : 'bg-destructive'}>
                        {student.passed ? 'Đạt' : 'Chưa đạt'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/teacher/exams/results/${examInfo.id}/student/${student.studentId}`)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Question Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Phân tích câu hỏi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questionAnalysis.map((q) => (
            <div key={q.questionNumber} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium">Câu {q.questionNumber}: {q.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={q.correctRate >= 70 ? "default" : "destructive"}>
                      {q.correctRate}% trả lời đúng
                    </Badge>
                    {q.correctRate >= 70 ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(q.answerDistribution).map(([option, count]) => (
                  <div key={option} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{option.toUpperCase()}</span>
                      <span className="text-muted-foreground">{count} HV</span>
                    </div>
                    <Progress 
                      value={(count / statistics.completedStudents) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
