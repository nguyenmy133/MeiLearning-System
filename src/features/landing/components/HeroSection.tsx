import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-classroom.jpg";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center pt-28 pb-20 lg:pt-32 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg-hero" />
      
      {/* Decorative elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" 
      />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px]" />

      <div className="container-custom relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Badge className="mb-4 md:mb-6 bg-primary/10 text-primary hover:bg-primary/20 px-3 md:px-4 py-1.5 md:py-2 border border-primary/20 text-xs md:text-sm backdrop-blur-sm">
                <Users className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Offline – Lớp nhỏ – Theo sát từng học viên
              </Badge>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6 tracking-tight"
            >
              Trung tâm dạy học trực tiếp – 
              <span className="gradient-text-emerald block mt-2 drop-shadow-sm"> học chắc, tiến bộ rõ</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-xl leading-relaxed"
            >
              Môi trường học tập chuyên nghiệp với lớp học nhỏ, 
              lộ trình cá nhân hóa và đội ngũ giáo viên giàu kinh nghiệm. 
              Cam kết chất lượng đầu ra cho mọi học viên.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 mb-6 md:mb-8"
            >
              <Button size="lg" asChild className="btn-primary text-sm md:text-base px-6 md:px-8 h-11 md:h-12 w-full sm:w-auto overflow-hidden group relative border-0 shadow-lg shadow-primary/20">
                <Link to="/#contact">
                  <span className="relative z-10 flex items-center">
                    Nhận tư vấn miễn phí
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="btn-secondary text-sm md:text-base px-6 md:px-8 h-11 md:h-12 w-full sm:w-auto backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all shadow-sm">
                <Link to="/teachers">Xem đội ngũ giáo viên</Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6"
            >
              {["Cam kết đầu ra", "Hoàn phí nếu không hài lòng", "Hỗ trợ 24/7"].map((item, i) => (
                <motion.div 
                  key={item} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-medium"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image */}
          {/* Image */}
          <div className="relative mt-12 lg:mt-0 flex items-center justify-center perspective-[2000px]">
            <motion.div 
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.4 }}
              className="relative w-full max-w-[450px] lg:max-w-[500px] xl:max-w-[550px] aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.15)] ring-1 ring-border/50"
            >
              <div style={{ transform: "translateZ(30px) scale(1.05)" }} className="absolute inset-0 w-full h-full transition-transform duration-300">
                <img
                  src={heroImage}
                  alt="Lớp học tại EduTrack"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent pointer-events-none" style={{ transform: "translateZ(31px)" }} />
            </motion.div>

            {/* Floating card 1 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              style={{ x: useTransform(mouseXSpring, [-0.5, 0.5], [-20, 20]), y: useTransform(mouseYSpring, [-0.5, 0.5], [-20, 20]) }}
              className="absolute -bottom-6 left-0 md:-bottom-8 md:-left-8 bg-background/90 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-2xl border border-border/50 z-20"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30"
                >
                  <span className="text-2xl md:text-3xl drop-shadow-md">🎓</span>
                </motion.div>
                <div>
                  <p className="font-display font-bold text-foreground text-lg md:text-xl tracking-tight">1000+</p>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium whitespace-nowrap">Học viên thành công</p>
                </div>
              </div>
            </motion.div>
            
            {/* Secondary Floating Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
              style={{ x: useTransform(mouseXSpring, [-0.5, 0.5], [15, -15]), y: useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]) }}
              className="absolute top-10 right-0 lg:-right-8 bg-background/90 backdrop-blur-xl rounded-2xl p-3 md:p-4 shadow-2xl border border-border/50 z-20 hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-accent flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Student" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-amber-500 text-xs">★★★★★</div>
                  <p className="text-xs font-semibold">98% Review tốt</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
