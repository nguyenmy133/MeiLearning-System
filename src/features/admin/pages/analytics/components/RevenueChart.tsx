import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    students: number;
    expenses?: number;
    profit?: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatMonth = (monthString: string) => {
    const [, month] = monthString.split('-');
    return `T${month}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu & Lợi nhuận theo tháng</CardTitle>
        <p className="text-sm text-muted-foreground">
          Theo dõi xu hướng tài chính 12 tháng gần nhất
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tickFormatter={formatMonth}
            />
            <YAxis 
              className="text-xs"
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  revenue: 'Doanh thu',
                  expenses: 'Chi phí',
                  profit: 'Lợi nhuận'
                };
                return [formatCurrency(value), labels[name] || name];
              }}
              labelFormatter={(label) => `Tháng ${formatMonth(label)}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ paddingBottom: '20px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  revenue: 'Doanh thu',
                  expenses: 'Chi phí',
                  profit: 'Lợi nhuận'
                };
                return labels[value] || value;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
            {data[0]?.expenses !== undefined && (
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {data[0]?.profit !== undefined && (
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--success))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

