import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const programs = [
  {
    id: 1,
    title: "Lớp Tiểu học",
    level: "Lớp 1-5",
    description: "Củng cố kiến thức nền tảng, phát triển tư duy logic",
    duration: "3 tháng/khóa",
    schedule: "2-3 buổi/tuần",
    maxStudents: 8,
    tags: ["Toán", "Tiếng Việt", "Tiếng Anh"]
  },
  {
    id: 2,
    title: "Lớp THCS",
    level: "Lớp 6-9",
    description: "Luyện thi chuyển cấp, nâng cao năng lực toàn diện",
    duration: "4 tháng/khóa",
    schedule: "3 buổi/tuần",
    maxStudents: 10,
    tags: ["Toán", "Văn", "Anh", "Lý", "Hóa"]
  },
  {
    id: 3,
    title: "Lớp THPT",
    level: "Lớp 10-12",
    description: "Luyện thi THPT Quốc gia, định hướng đại học",
    duration: "6 tháng/khóa",
    schedule: "4 buổi/tuần",
    maxStudents: 12,
    tags: ["Khối A", "Khối B", "Khối D"]
  },
  {
    id: 4,
    title: "Lớp Tiếng Anh",
    level: "Mọi độ tuổi",
    description: "Giao tiếp, IELTS, TOEIC, tiếng Anh học thuật",
    duration: "3-6 tháng",
    schedule: "2-4 buổi/tuần",
    maxStudents: 8,
    tags: ["Giao tiếp", "IELTS", "TOEIC"]
  },
  {
    id: 5,
    title: "Lớp Luyện thi",
    level: "Chuyên đề",
    description: "Luyện thi chuyên, trường chuyên, học bổng",
    duration: "2-4 tháng",
    schedule: "3-4 buổi/tuần",
    maxStudents: 6,
    tags: ["Chuyên Toán", "Chuyên Lý", "HSG"]
  },
  {
    id: 6,
    title: "Lớp 1-1",
    level: "Cá nhân",
    description: "Dạy kèm riêng theo lịch linh hoạt, hiệu quả cao",
    duration: "Linh hoạt",
    schedule: "Theo thỏa thuận",
    maxStudents: 1,
    tags: ["Mọi môn", "Mọi cấp"]
  }
];

export function ProgramsSection() {
  return (
    <section id="programs" className="section-padding bg-accent/30">
      <div className="container-custom">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider mb-4 block">
            Chương trình học
          </span>
          <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
            Đa dạng lớp học phù hợp mọi nhu cầu
          </h2>
          <p className="text-muted-foreground text-lg">
            Từ học sinh tiểu học đến THPT, từ bổ trợ kiến thức đến luyện thi chuyên sâu
          </p>
        </motion.div>

        {/* Programs grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {programs.map((program, index) => (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
              whileHover={{ 
                y: -10, 
                rotateX: 2,
                rotateY: -2,
                scale: 1.02,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
              }}
              key={program.id}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all group relative z-10 bg-gradient-to-br hover:from-card hover:to-primary/5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge variant="secondary" className="mb-2 bg-secondary/50">
                    {program.level}
                  </Badge>
                  <h3 className="text-xl font-display font-semibold text-foreground">
                    {program.title}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-4">{program.description}</p>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{program.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Tối đa {program.maxStudents} HV</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {program.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Button asChild className="w-full btn-secondary group-hover:bg-primary group-hover:text-primary-foreground">
                <Link to="/#contact">
                  Đăng ký tư vấn lớp này
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
