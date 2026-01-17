import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StudentDistributionChartProps {
  data: Array<{
    className: string;
    studentCount: number;
    percentage: number;
  }>;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--info))',
  'hsl(var(--accent))',
  '#8b5cf6',
  '#ec4899'
];

export function StudentDistributionChart({ data }: StudentDistributionChartProps) {
  const totalStudents = data.reduce((sum, item) => sum + item.studentCount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bố học viên theo lớp</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tổng: {totalStudents} học viên
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ className, percentage }) => `${className}: ${percentage.toFixed(1)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="studentCount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                `${value} học viên (${props.payload.percentage.toFixed(1)}%)`,
                props.payload.className
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => `${entry.payload.className} (${entry.payload.studentCount})`}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
