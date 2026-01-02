import { Calendar, Users, GraduationCap, Star } from "lucide-react";

const stats = [
  {
    icon: Calendar,
    value: "10+",
    label: "Năm hoạt động",
    description: "Kinh nghiệm giảng dạy"
  },
  {
    icon: Users,
    value: "5000+",
    label: "Học viên",
    description: "Đã theo học"
  },
  {
    icon: GraduationCap,
    value: "50+",
    label: "Giáo viên",
    description: "Chuyên môn cao"
  },
  {
    icon: Star,
    value: "98%",
    label: "Hài lòng",
    description: "Phụ huynh đánh giá"
  }
];

export function StatsSection() {
  return (
    <section className="section-padding bg-card border-y border-border">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-background hover:bg-accent/50 transition-colors group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <p className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-1">
                {stat.value}
              </p>
              <p className="font-medium text-foreground mb-1">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
