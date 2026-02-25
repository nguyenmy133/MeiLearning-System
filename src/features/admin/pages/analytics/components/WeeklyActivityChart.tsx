import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar } from 'lucide-react';

interface WeeklyActivityProps {
  data: Array<{
    day: string;
    classes: number;
    students: number;
    attendance: number;
  }>;
}

export function WeeklyActivityChart({ data }: WeeklyActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Hoạt động theo tuần
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Phân bố lớp học và học viên theo ngày trong tuần
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              className="text-xs"
            />
            <YAxis 
              className="text-xs"
            />
            <Tooltip 
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
            <Bar 
              dataKey="classes" 
              fill="hsl(var(--primary))" 
              name="Số lớp"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="students" 
              fill="hsl(var(--info))" 
              name="Học viên đăng ký"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="attendance" 
              fill="hsl(var(--success))" 
              name="Điểm danh"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
