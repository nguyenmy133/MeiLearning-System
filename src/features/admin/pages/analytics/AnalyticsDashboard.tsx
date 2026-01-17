import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPICards } from './components/KPICards';
import { RevenueChart } from './components/RevenueChart';
import { AttendanceChart } from './components/AttendanceChart';
import { StudentDistributionChart } from './components/StudentDistributionChart';
import { 
  mockOverviewData, 
  mockRevenueData, 
  mockAttendanceData, 
  mockStudentDistribution 
} from './mockData';

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan hoạt động và hiệu suất của trung tâm
        </p>
      </div>

      {/* KPI Cards */}
      <KPICards data={mockOverviewData} />

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="attendance">Điểm danh</TabsTrigger>
          <TabsTrigger value="distribution">Phân bố học viên</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueChart data={mockRevenueData} />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceChart data={mockAttendanceData} />
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <StudentDistributionChart data={mockStudentDistribution} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
