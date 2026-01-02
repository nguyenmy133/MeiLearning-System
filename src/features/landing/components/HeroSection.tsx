import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-classroom.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-background to-secondary/20" />
      
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="animate-fade-in-up">
            <Badge className="mb-6 bg-secondary/30 text-primary hover:bg-secondary/40 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Offline – Lớp nhỏ – Theo sát từng học viên
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              Trung tâm dạy học trực tiếp – 
              <span className="text-primary"> học chắc, tiến bộ rõ</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Môi trường học tập chuyên nghiệp với lớp học nhỏ, 
              lộ trình cá nhân hóa và đội ngũ giáo viên giàu kinh nghiệm. 
              Cam kết chất lượng đầu ra cho mọi học viên.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button size="lg" asChild className="btn-primary text-base px-8 h-12">
                <Link to="/#contact">
                  Nhận tư vấn miễn phí
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="btn-secondary text-base px-8 h-12">
                <Link to="/teachers">Xem đội ngũ giáo viên</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6">
              {["Cam kết đầu ra", "Hoàn phí nếu không hài lòng", "Hỗ trợ 24/7"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-slide-in-right">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Lớp học tại EduCenter"
                className="w-full h-auto object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-card animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">1000+</p>
                  <p className="text-sm text-muted-foreground">Học viên thành công</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
