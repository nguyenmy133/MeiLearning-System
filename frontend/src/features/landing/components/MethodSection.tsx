import { ClipboardCheck, Users, BarChart3, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Test đầu vào",
    description: "Đánh giá năng lực ban đầu để xếp lớp phù hợp và xây dựng lộ trình cá nhân"
  },
  {
    icon: Users,
    title: "Xếp lớp phù hợp",
    description: "Học viên được xếp vào lớp có trình độ tương đương, đảm bảo tiến bộ đồng đều"
  },
  {
    icon: BarChart3,
    title: "Theo dõi chuyên cần",
    description: "Hệ thống điểm danh QR, báo cáo đến phụ huynh hàng tuần qua app"
  },
  {
    icon: TrendingUp,
    title: "Đánh giá tiến bộ",
    description: "Kiểm tra định kỳ, phân tích điểm yếu và điều chỉnh lộ trình kịp thời"
  }
];

export function MethodSection() {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-secondary font-medium text-sm uppercase tracking-wider mb-4 block">
            Phương pháp giảng dạy
          </span>
          <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
            Quy trình học tập khoa học
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            4 bước để đảm bảo chất lượng đầu ra cho mỗi học viên
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-secondary/30 -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative text-center"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step number */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 sm:mb-6 relative z-10 shadow-lg">
                  <step.icon className="w-7 h-7 text-secondary-foreground" />
                </div>

                {/* Step label */}
                <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 -translate-y-full">
                  <span className="text-xs font-bold text-secondary">
                    BƯỚC {index + 1}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-primary-foreground/80 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
