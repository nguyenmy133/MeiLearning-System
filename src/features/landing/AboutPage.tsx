import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CheckCircle, Target, Heart, Lightbulb } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";

const TiltCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const [isHovered, setIsHovered] = useState(false);

  // Glare effect
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);

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
    setIsHovered(false);
  };

  return (
    <div style={{ perspective: "1000px" }} className={className}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full rounded-2xl bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xl border border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-300 ease-out"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 25%, transparent 30%)",
            backgroundSize: "200% 200%",
            backgroundPositionX: glareX,
            backgroundPositionY: glareY,
            opacity: isHovered ? 1 : 0,
          }}
        />
        <div style={{ transform: "translateZ(30px)" }} className="relative z-20 h-full w-full p-8 md:p-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

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
                EduCenter được thành lập từ năm 2026 với sứ mệnh mang đến môi trường 
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
              <TiltCard>
                <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                  <span className="bg-primary/20 p-2.5 rounded-xl"><Target className="w-6 h-6 text-primary" /></span>
                  Thành tựu nổi bật
                </h3>
                <div className="space-y-4">
                  {[
                    "10+ năm hoạt động trong lĩnh vực giáo dục",
                    "5000+ học viên đã theo học",
                    "98% phụ huynh hài lòng",
                    "100+ học sinh đỗ trường chuyên mỗi năm",
                    "Đối tác của nhiều trường học uy tín"
                  ].map((item) => (
                    <motion.div 
                      key={item} 
                      className="flex items-center gap-4 bg-background/60 p-4 rounded-xl border border-primary/10 shadow-sm"
                      whileHover={{ x: 10, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 drop-shadow-sm" />
                      <span className="text-foreground font-medium text-lg">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </TiltCard>
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
              {values.map((value, idx) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="text-center bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-300 group"
                >
                  <motion.div 
                    className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6 relative"
                    style={{ perspective: 1000 }}
                  >
                    <motion.div
                      whileHover={{ rotateY: 180, scale: 1.2 }}
                      transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
                      className="w-full h-full flex items-center justify-center absolute"
                    >
                      <value.icon className="w-10 h-10 text-primary drop-shadow-md" />
                    </motion.div>
                  </motion.div>
                  <h3 className="text-xl font-display font-semibold mb-3 group-hover:text-primary transition-colors">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
