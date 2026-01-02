import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Thị Lan",
    role: "Phụ huynh học sinh lớp 9",
    content: "Con tôi từ trung bình khá lên xuất sắc sau 6 tháng học ở đây. Giáo viên rất tâm huyết và phương pháp giảng dạy hiệu quả.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
  },
  {
    id: 2,
    name: "Trần Văn Minh",
    role: "Học sinh lớp 12",
    content: "Thầy cô ở đây không chỉ dạy kiến thức mà còn truyền cảm hứng học tập. Em đã đỗ Đại học Bách khoa nhờ sự hỗ trợ của trung tâm.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    id: 3,
    name: "Lê Thị Hương",
    role: "Phụ huynh học sinh lớp 5",
    content: "Lớp học nhỏ, con được quan tâm từng chút. Báo cáo hàng tuần giúp tôi nắm bắt tiến độ học tập của con rất tốt.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop"
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="section-padding bg-accent/30">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider mb-4 block">
            Cảm nhận học viên
          </span>
          <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
            Học viên nói gì về chúng tôi
          </h2>
          <p className="text-muted-foreground text-lg">
            Hơn 5000 học viên và phụ huynh tin tưởng lựa chọn EduCenter
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-card-hover transition-all relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
