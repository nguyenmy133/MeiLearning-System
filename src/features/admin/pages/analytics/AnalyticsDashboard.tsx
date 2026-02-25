import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPICards } from './components/KPICards';
import { RevenueChart } from './components/RevenueChart';
import { AttendanceChart } from './components/AttendanceChart';
import { StudentDistributionChart } from './components/StudentDistributionChart';
import { TeacherPerformanceTable } from './components/TeacherPerformanceTable';
import { CoursePopularityChart } from './components/CoursePopularityChart';
import { PaymentStatusChart } from './components/PaymentStatusChart';
import { RetentionChart } from './components/RetentionChart';
import { WeeklyActivityChart } from './components/WeeklyActivityChart';
import { TopPerformingClasses } from './components/TopPerformingClasses';
import { 
  mockOverviewData, 
  mockRevenueData, 
  mockAttendanceData, 
  mockStudentDistribution,
  mockTeacherPerformance,
  mockCoursePopularity,
  mockPaymentStatus,
  mockRetentionData,
  mockWeeklyActivity,
  mockTopPerformingClasses
} from './mockData';

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Tổng quan hoạt động và hiệu suất của trung tâm
        </p>
      </div>

      {/* KPI Cards */}
      <KPICards data={mockOverviewData} />

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-1 bg-muted/50">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Doanh thu
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Điểm danh
          </TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Phân bố
          </TabsTrigger>
          <TabsTrigger value="teachers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Giảng viên
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Khóa học
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <RevenueChart data={mockRevenueData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PaymentStatusChart data={mockPaymentStatus} />
              <WeeklyActivityChart data={mockWeeklyActivity} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <AttendanceChart data={mockAttendanceData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RetentionChart data={mockRetentionData} />
              <TopPerformingClasses data={mockTopPerformingClasses} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentDistributionChart data={mockStudentDistribution} />
            <WeeklyActivityChart data={mockWeeklyActivity} />
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-6">
          <TeacherPerformanceTable data={mockTeacherPerformance} />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <CoursePopularityChart data={mockCoursePopularity} />
        </TabsContent>
      </Tabs>

      {/* Additional Insights Section */}
      <div className="mt-8 p-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          Insights & Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-background rounded-lg shadow-sm">
            <h3 className="font-medium text-success mb-2">📈 Tăng trưởng tốt</h3>
            <p className="text-sm text-muted-foreground">
              Doanh thu tăng 8.3% so với tháng trước. Khóa học Tiếng Anh Giao Tiếp có xu hướng tăng mạnh (+18.5%).
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg shadow-sm">
            <h3 className="font-medium text-warning mb-2">⚠️ Cần chú ý</h3>
            <p className="text-sm text-muted-foreground">
              18 học viên thanh toán quá hạn. Lớp Văn 10D có tỷ lệ điểm danh thấp (83.4%).
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg shadow-sm">
            <h3 className="font-medium text-primary mb-2">💡 Đề xuất</h3>
            <p className="text-sm text-muted-foreground">
              Mở thêm lớp Toán 12 do nhu cầu cao. Tăng cường marketing cho môn Lý (tăng trưởng âm -2.1%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

