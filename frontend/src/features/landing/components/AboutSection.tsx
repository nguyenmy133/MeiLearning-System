import { Users, Target, FileText, Headphones, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Lớp tối đa 10 học viên",
    description: "Đảm bảo sự quan tâm tới từng học viên"
  },
  {
    icon: Target,
    title: "Lộ trình cá nhân hóa",
    description: "Thiết kế riêng theo năng lực và mục tiêu"
  },
  {
    icon: FileText,
    title: "Báo cáo chuyên cần hàng tuần",
    description: "Phụ huynh nắm bắt tiến độ liên tục"
  },
  {
    icon: Headphones,
    title: "Hỗ trợ giáo vụ nhanh",
    description: "Giải đáp thắc mắc trong vòng 24h"
  }
];

export function AboutSection() {
  return (
    <section id="about" className="section-padding">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="animate-fade-in-up">
            <span className="text-primary font-medium text-sm uppercase tracking-wider mb-4 block">
              Về chúng tôi
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Xây dựng nền tảng vững chắc cho tương lai
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              EduCenter được thành lập với sứ mệnh mang đến môi trường học tập 
              chất lượng cao, nơi mỗi học viên được quan tâm và phát triển 
              theo đúng tiềm năng của mình. Chúng tôi tin rằng giáo dục không 
              chỉ là truyền đạt kiến thức mà còn là khơi dậy đam mê học tập.
            </p>

            <div className="space-y-4">
              {["Phương pháp giảng dạy hiện đại", "Giáo viên được tuyển chọn kỹ lưỡng", "Cơ sở vật chất đầy đủ, tiện nghi"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
