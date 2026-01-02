import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CheckCircle, Target, Heart, Lightbulb } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Chất lượng hàng đầu",
    description: "Cam kết mang đến chất lượng giảng dạy tốt nhất, đội ngũ giáo viên được tuyển chọn kỹ lưỡng."
  },
  {
    icon: Heart,
    title: "Tâm huyết với nghề",
    description: "Mỗi giáo viên đều có niềm đam mê giảng dạy và tình yêu thương dành cho học viên."
  },
  {
    icon: Lightbulb,
    title: "Đổi mới sáng tạo",
    description: "Liên tục cập nhật phương pháp giảng dạy hiện đại, phù hợp với xu hướng giáo dục mới."
  }
];

export function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding bg-accent/30">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-primary font-medium text-sm uppercase tracking-wider mb-4 block">
                Về chúng tôi
              </span>
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                Nơi khơi nguồn tri thức, xây dựng tương lai
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                EduCenter được thành lập từ năm 2014 với sứ mệnh mang đến môi trường 
                học tập chất lượng cao cho học sinh tại Việt Nam. Chúng tôi tin rằng 
                mỗi học viên đều có tiềm năng riêng và xứng đáng được phát triển.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold mb-6">Câu chuyện của chúng tôi</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Khởi đầu từ một lớp học nhỏ với 5 học viên, EduCenter ngày nay đã phát triển 
                    thành trung tâm giáo dục uy tín với hơn 5000 học viên đã và đang theo học.
                  </p>
                  <p>
                    Chúng tôi luôn kiên định với phương châm "Học chắc – Tiến bộ rõ", 
                    tập trung vào chất lượng thay vì số lượng. Mỗi lớp học được giới hạn 
                    tối đa 10 học viên để đảm bảo sự quan tâm đến từng em.
                  </p>
                  <p>
                    Đội ngũ giáo viên của chúng tôi đều là những người có chuyên môn cao, 
                    giàu kinh nghiệm và đặc biệt là có tâm huyết với nghề giáo.
                  </p>
                </div>
              </div>
              <div className="bg-primary/10 rounded-2xl p-8">
                <h3 className="text-xl font-display font-semibold mb-4">Thành tựu nổi bật</h3>
                <div className="space-y-3">
                  {[
                    "10+ năm hoạt động trong lĩnh vực giáo dục",
                    "5000+ học viên đã theo học",
                    "98% phụ huynh hài lòng",
                    "100+ học sinh đỗ trường chuyên mỗi năm",
                    "Đối tác của nhiều trường học uy tín"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-accent/30">
          <div className="container-custom">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">Giá trị cốt lõi</h2>
              <p className="text-muted-foreground">
                Những giá trị định hình nên EduCenter của ngày hôm nay
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
