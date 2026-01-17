import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-classroom.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg-hero" />
      
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="animate-fade-in-up">
            <Badge className="mb-4 md:mb-6 bg-primary/10 text-primary hover:bg-primary/20 px-3 md:px-4 py-1.5 md:py-2 border border-primary/20 text-xs md:text-sm">
              <Users className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              Offline – Lớp nhỏ – Theo sát từng học viên
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-4 md:mb-6">
              Trung tâm dạy học trực tiếp – 
              <span className="gradient-text-emerald"> học chắc, tiến bộ rõ</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-xl leading-relaxed">
              Môi trường học tập chuyên nghiệp với lớp học nhỏ, 
              lộ trình cá nhân hóa và đội ngũ giáo viên giàu kinh nghiệm. 
              Cam kết chất lượng đầu ra cho mọi học viên.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mb-6 md:mb-8">
              <Button size="lg" asChild className="btn-primary text-sm md:text-base px-6 md:px-8 h-11 md:h-12 w-full sm:w-auto">
                <Link to="/#contact">
                  Nhận tư vấn miễn phí
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="btn-secondary text-sm md:text-base px-6 md:px-8 h-11 md:h-12 w-full sm:w-auto">
                <Link to="/teachers">Xem đội ngũ giáo viên</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6">
              {["Cam kết đầu ra", "Hoàn phí nếu không hài lòng", "Hỗ trợ 24/7"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-slide-in-right mt-8 lg:mt-0">
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Lớp học tại EduTrack"
                className="w-full h-auto object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-card rounded-lg md:rounded-xl p-3 md:p-4 shadow-card-hover animate-float">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-bg-primary flex items-center justify-center">
                  <span className="text-xl md:text-2xl">🎓</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground text-sm md:text-base">1000+</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Học viên thành công</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
