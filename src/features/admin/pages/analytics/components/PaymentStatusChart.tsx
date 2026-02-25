import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentStatusProps {
  data: {
    paid: number;
    pending: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
  };
}

export function PaymentStatusChart({ data }: PaymentStatusProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const chartData = [
    { name: 'Đã thanh toán', value: data.paid, amount: data.paidAmount, color: 'hsl(var(--success))' },
    { name: 'Chờ thanh toán', value: data.pending, amount: data.pendingAmount, color: 'hsl(var(--warning))' },
    { name: 'Quá hạn', value: data.overdue, amount: data.overdueAmount, color: 'hsl(var(--destructive))' }
  ];

  const stats = [
    {
      icon: CheckCircle,
      label: 'Đã thanh toán',
      count: data.paid,
      amount: data.paidAmount,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      icon: Clock,
      label: 'Chờ thanh toán',
      count: data.pending,
      amount: data.pendingAmount,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      icon: AlertCircle,
      label: 'Quá hạn',
      count: data.overdue,
      amount: data.overdueAmount,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Tình trạng thanh toán
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tổng: {formatCurrency(data.totalAmount)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value} học viên (${formatCurrency(props.payload.amount)})`,
                  props.payload.name
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Stats */}
          <div className="flex flex-col justify-center gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg ${stat.bgColor} transition-all hover:scale-105`}
              >
                <div className={`p-3 rounded-full bg-background ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className={`text-sm font-medium ${stat.color}`}>
                    {formatCurrency(stat.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
