import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { UserCheck } from 'lucide-react';

interface RetentionChartProps {
  data: Array<{
    month: string;
    newStudents: number;
    retained: number;
    churned: number;
    retentionRate: number;
  }>;
}

export function RetentionChart({ data }: RetentionChartProps) {
  const formatMonth = (monthString: string) => {
    const [, month] = monthString.split('-');
    return `T${month}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          Tỷ lệ giữ chân học viên
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Theo dõi xu hướng học viên mới, giữ chân và rời đi
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
              yAxisId="left"
              className="text-xs"
              label={{ value: 'Số học viên', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              className="text-xs"
              domain={[90, 100]}
              tickFormatter={(value) => `${value}%`}
              label={{ value: 'Tỷ lệ giữ chân', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'Tỷ lệ giữ chân') {
                  return [`${value.toFixed(1)}%`, name];
                }
                return [value, name];
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
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="newStudents" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
              name="Học viên mới"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="retained" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--success))', r: 4 }}
              activeDot={{ r: 6 }}
              name="Giữ chân"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="churned" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
              activeDot={{ r: 6 }}
              name="Rời đi"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="retentionRate" 
              stroke="hsl(var(--info))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--info))', r: 4 }}
              activeDot={{ r: 6 }}
              name="Tỷ lệ giữ chân"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
