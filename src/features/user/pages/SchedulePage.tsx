import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const fullWeekDays = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

const scheduleData = [
  { day: 1, classes: [
    { id: 1, name: "Toán 10A", time: "08:00 - 09:30", room: "Phòng 101", teacher: "Nguyễn Văn Toán" },
    { id: 2, name: "Lý 10-B", time: "10:00 - 11:30", room: "Phòng 203", teacher: "Nguyễn Văn Toán" },
  ]},
  { day: 2, classes: [
    { id: 3, name: "IELTS-01", time: "14:00 - 15:30", room: "Phòng 105", teacher: "Trần Thị Anh" },
  ]},
  { day: 3, classes: [
    { id: 4, name: "Toán 10A", time: "08:00 - 09:30", room: "Phòng 101", teacher: "Nguyễn Văn Toán" },
    { id: 5, name: "Hóa 11-A", time: "10:00 - 11:30", room: "Phòng 202", teacher: "Lê Văn Hóa" },
  ]},
  { day: 4, classes: [
    { id: 6, name: "Lý 10-B", time: "10:00 - 11:30", room: "Phòng 203", teacher: "Nguyễn Văn Toán" },
  ]},
  { day: 5, classes: [
    { id: 7, name: "IELTS-01", time: "14:00 - 15:30", room: "Phòng 105", teacher: "Trần Thị Anh" },
    { id: 8, name: "Toán 10A", time: "16:00 - 17:30", room: "Phòng 101", teacher: "Nguyễn Văn Toán" },
  ]},
  { day: 6, classes: [
    { id: 9, name: "Hóa 11-A", time: "09:00 - 11:00", room: "Phòng 301", teacher: "Lê Văn Hóa" },
  ]},
  { day: 0, classes: [] },
];

const getWeekDates = (offset: number) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  // Get Monday
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff + offset * 7);
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
};

export function SchedulePage({ onCheckIn }: { onCheckIn?: (subject: string) => void }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = getWeekDates(weekOffset);
  const today = new Date();

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">


        {/* Week Paginator */}
        <div className="flex items-center gap-4 bg-background border border-border rounded-lg p-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(prev => prev - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[140px]">
            <p className="text-sm font-medium text-foreground">{formatDateRange()}</p>
            <p className="text-xs text-muted-foreground">
              {weekOffset === 0 ? "Tuần này" : weekOffset > 0 ? `${weekOffset} tuần sau` : `${Math.abs(weekOffset)} tuần trước`}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(prev => prev + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 pb-4">
          {weekDates.map((date, index) => {
            const dayIndex = date.getDay(); // 0 is Sunday
            const hasClasses = scheduleData.find(d => d.day === dayIndex)?.classes || [];
            const currentDay = isToday(date);

            return (
              <div
                key={index}
                className={`min-w-0 border rounded-2xl p-4 flex flex-col gap-4 bg-card ${
                  currentDay ? "border-primary shadow-sm" : "border-border"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`font-semibold ${currentDay ? "text-primary" : "text-foreground"}`}>
                    {dayIndex === 0 ? "CN" : `Thứ ${dayIndex + 1}`}
                  </span>
                  {currentDay && (
                    <Badge variant="default" className="bg-primary text-primary-foreground hover:bg-primary border-none whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider">
                      Hôm nay
                    </Badge>
                  )}
                </div>

                {/* Column Classes */}
                <div className="flex-1 flex flex-col gap-3">
                  {hasClasses.length > 0 ? (
                    hasClasses.map(cls => (
                      <div
                        key={cls.id}
                        className="p-3 rounded-xl bg-primary/10 border-l-[3px] border-primary flex flex-col gap-2"
                      >
                        <h4 className="font-semibold text-foreground text-sm">{cls.name}</h4>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{cls.time}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{cls.room}</span>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full mt-1.5 h-8 text-xs font-medium"
                          onClick={() => onCheckIn?.(cls.name)}
                        >
                          Điểm danh
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-6 text-center">
                      Không có lớp
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
}
