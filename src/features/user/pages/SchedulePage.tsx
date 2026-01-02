import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const fullWeekDays = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

const scheduleData = [
  { day: 1, classes: [
    { id: 1, name: "Tiếng Anh Giao tiếp", time: "08:00 - 09:30", room: "Phòng 101", teacher: "Cô Lan" },
    { id: 2, name: "IELTS Speaking", time: "10:00 - 11:30", room: "Phòng 203", teacher: "Thầy Minh" },
  ]},
  { day: 2, classes: [
    { id: 3, name: "Business English", time: "14:00 - 15:30", room: "Phòng 105", teacher: "Cô Hương" },
  ]},
  { day: 3, classes: [
    { id: 4, name: "Tiếng Anh Giao tiếp", time: "08:00 - 09:30", room: "Phòng 101", teacher: "Cô Lan" },
    { id: 5, name: "IELTS Writing", time: "10:00 - 11:30", room: "Phòng 202", teacher: "Thầy Đức" },
  ]},
  { day: 4, classes: [
    { id: 6, name: "IELTS Speaking", time: "10:00 - 11:30", room: "Phòng 203", teacher: "Thầy Minh" },
  ]},
  { day: 5, classes: [
    { id: 7, name: "Business English", time: "14:00 - 15:30", room: "Phòng 105", teacher: "Cô Hương" },
    { id: 8, name: "Tiếng Anh Giao tiếp", time: "16:00 - 17:30", room: "Phòng 101", teacher: "Cô Lan" },
  ]},
  { day: 6, classes: [
    { id: 9, name: "IELTS Practice", time: "09:00 - 11:00", room: "Phòng 301", teacher: "Thầy Minh" },
  ]},
  { day: 0, classes: [] },
];

const getWeekDates = (offset: number) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
};

export function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Thời khóa biểu
        </h1>
        <p className="text-muted-foreground mt-1">
          Xem lịch học của bạn theo tuần
        </p>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset(prev => prev - 1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="font-medium text-foreground">{formatDateRange()}</p>
              <p className="text-sm text-muted-foreground">
                {weekOffset === 0 ? "Tuần này" : weekOffset > 0 ? `${weekOffset} tuần sau` : `${Math.abs(weekOffset)} tuần trước`}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset(prev => prev + 1)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2 mt-4">
            {weekDates.map((date, index) => {
              const dayIndex = (index + 1) % 7; // Convert to match scheduleData (0 = Sunday)
              const hasClasses = scheduleData.find(d => d.day === dayIndex)?.classes.length > 0;
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(dayIndex)}
                  className={`p-2 rounded-lg text-center transition-colors ${
                    selectedDay === dayIndex
                      ? "bg-primary text-primary-foreground"
                      : isToday(date)
                      ? "bg-accent/20 text-accent"
                      : "hover:bg-secondary"
                  }`}
                >
                  <p className="text-xs font-medium">{weekDays[(index + 1) % 7]}</p>
                  <p className={`text-lg font-bold ${selectedDay === dayIndex ? "" : "text-foreground"}`}>
                    {date.getDate()}
                  </p>
                  {hasClasses && selectedDay !== dayIndex && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Schedule for Selected Day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {fullWeekDays[selectedDay]}, {weekDates[selectedDay === 0 ? 6 : selectedDay - 1]?.toLocaleDateString('vi-VN')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleData.find(d => d.day === selectedDay)?.classes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Không có lớp học trong ngày này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduleData.find(d => d.day === selectedDay)?.classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 bg-secondary/50 rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{cls.name}</h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{cls.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{cls.room}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{cls.teacher}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{cls.time.split(" - ")[0]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-sm text-muted-foreground">Khóa học</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg text-center">
              <p className="text-2xl font-bold text-accent">12</p>
              <p className="text-sm text-muted-foreground">Buổi/tuần</p>
            </div>
            <div className="p-4 bg-info/5 rounded-lg text-center">
              <p className="text-2xl font-bold text-info">18</p>
              <p className="text-sm text-muted-foreground">Giờ/tuần</p>
            </div>
            <div className="p-4 bg-success/5 rounded-lg text-center">
              <p className="text-2xl font-bold text-success">8</p>
              <p className="text-sm text-muted-foreground">Tuần còn lại</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
