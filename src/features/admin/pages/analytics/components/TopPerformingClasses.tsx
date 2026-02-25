import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp } from 'lucide-react';

interface TopPerformingClassesProps {
  data: Array<{
    className: string;
    avgScore: number;
    passRate: number;
    excellentRate: number;
  }>;
}

export function TopPerformingClasses({ data }: TopPerformingClassesProps) {
  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500';
      case 1: return 'text-gray-400';
      case 2: return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top 5 Lớp Xuất Sắc
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Xếp hạng dựa trên điểm trung bình và tỷ lệ đạt loại
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((classData, index) => (
            <div 
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-[1.02] ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-2 border-yellow-500/20' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              {/* Rank */}
              <div className={`text-3xl font-bold ${getMedalColor(index)} min-w-[60px] text-center`}>
                {getMedalEmoji(index)}
              </div>

              {/* Class Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{classData.className}</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Điểm TB:</span>
                    <span className="font-semibold text-primary">{classData.avgScore.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Tỷ lệ đạt:</span>
                    <span className="font-semibold text-success">{classData.passRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Giỏi/Xuất sắc:</span>
                    <span className="font-semibold text-info">{classData.excellentRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="hidden sm:flex flex-col items-center justify-center min-w-[80px]">
                <div className="flex items-center gap-1 text-success">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Xuất sắc</span>
                </div>
                <div className="text-2xl font-bold text-primary mt-1">
                  {classData.avgScore.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
