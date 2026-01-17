import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AttendanceChartProps {
  data: Array<{
    className: string;
    attendanceRate: number;
    totalSessions: number;
  }>;
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const getColor = (rate: number) => {
    if (rate >= 90) return 'hsl(var(--success))';
    if (rate >= 80) return 'hsl(var(--primary))';
    if (rate >= 70) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tỷ lệ điểm danh theo lớp</CardTitle>
        <p className="text-sm text-muted-foreground">
          Màu xanh lá: ≥90%, Xanh dương: 80-89%, Vàng: 70-79%, Đỏ: &lt;70%
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
            <XAxis 
              dataKey="className" 
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              className="text-xs"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Tỷ lệ điểm danh']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="attendanceRate" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.attendanceRate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
