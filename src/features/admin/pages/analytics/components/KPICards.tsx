import { Users, DollarSign, TrendingUp, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KPICardsProps {
  data: {
    totalStudents: number;
    totalRevenue: number;
    attendanceRate: number;
    activeClasses: number;
    trends: {
      students: number;
      revenue: number;
      attendance: number;
      classes: number;
    };
  };
}

export function KPICards({ data }: KPICardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const cards = [
    {
      title: 'Tổng học viên',
      value: data.totalStudents.toString(),
      icon: Users,
      trend: data.trends.students,
      color: 'text-primary'
    },
    {
      title: 'Doanh thu tháng',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      trend: data.trends.revenue,
      color: 'text-success'
    },
    {
      title: 'Tỷ lệ điểm danh',
      value: `${data.attendanceRate.toFixed(1)}%`,
      icon: TrendingUp,
      trend: data.trends.attendance,
      color: 'text-info'
    },
    {
      title: 'Lớp đang hoạt động',
      value: data.activeClasses.toString(),
      icon: BookOpen,
      trend: data.trends.classes,
      color: 'text-warning'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.title} className="glass-card hover:shadow-card-hover transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{card.value}</div>
            <p className={`text-xs flex items-center gap-1 ${
              card.trend >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              <span>{card.trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(card.trend).toFixed(1)}% so với tháng trước</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
