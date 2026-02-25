import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, BookOpen, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

const teachers = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    subject: "Toán học",
    experience: 15,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    certificates: ["Thạc sĩ Toán", "IELTS 8.0"],
    bio: "Giáo viên với 15 năm kinh nghiệm giảng dạy Toán các cấp, chuyên luyện thi HSG và chuyển cấp.",
    achievements: ["100+ học sinh đỗ trường chuyên", "50+ học sinh đạt giải HSG cấp tỉnh/thành"],
    style: "Phương pháp giảng dạy logic, dễ hiểu, chú trọng bản chất."
  },
  {
    id: 2,
    name: "Trần Thị Bích",
    subject: "Tiếng Anh",
    experience: 12,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    certificates: ["IELTS 8.5", "TESOL", "Cambridge CELTA"],
    bio: "Chuyên gia IELTS với nhiều năm kinh nghiệm đào tạo học viên đạt band 7.0+.",
    achievements: ["200+ học viên đạt IELTS 7.0+", "Tỷ lệ đỗ 95%"],
    style: "Kết hợp phương pháp giao tiếp và học thuật, tạo môi trường immersive."
  },
  {
    id: 3,
    name: "Lê Minh Tuấn",
    subject: "Vật lý",
    experience: 10,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    certificates: ["Tiến sĩ Vật lý", "Giảng viên ĐH"],
    bio: "Tiến sĩ Vật lý, giảng viên đại học, có niềm đam mê truyền cảm hứng khoa học.",
    achievements: ["30+ học sinh giải Quốc gia", "Tác giả 2 cuốn sách luyện thi"],
    style: "Giảng dạy thông qua thí nghiệm và ví dụ thực tế, khơi dậy tư duy."
  },
  {
    id: 4,
    name: "Phạm Thu Hà",
    subject: "Ngữ văn",
    experience: 8,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    certificates: ["Thạc sĩ Văn học", "NCS Tiến sĩ"],
    bio: "Giáo viên Văn với cách tiếp cận sáng tạo, giúp học sinh yêu thích môn Văn.",
    achievements: ["Điểm Văn trung bình học viên: 8.5", "Nhiều bài văn mẫu được xuất bản"],
    style: "Kết hợp văn học với đời sống, phát triển tư duy phản biện."
  }
];

export function TeachersSection() {
  const [selectedTeacher, setSelectedTeacher] = useState<typeof teachers[0] | null>(null);

  return (
    <section id="teachers" className="section-padding">
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
            Đội ngũ giáo viên
          </span>
          <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
            Giáo viên giỏi, tâm huyết với nghề
          </h2>
          <p className="text-muted-foreground text-lg">
            Đội ngũ giáo viên được tuyển chọn kỹ lưỡng, có kinh nghiệm và 
            phương pháp giảng dạy hiệu quả
          </p>
        </motion.div>

        {/* Teachers grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.5, type: "spring", stiffness: 100 }}
              whileHover={{ 
                y: -12, 
                rotateY: 5,
                rotateX: -5,
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/40 transition-all text-center group relative z-10 bg-gradient-to-tr hover:from-card hover:to-primary/10 overflow-hidden"
            >
              {/* Decorative background circle on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors duration-500" style={{ transform: "translateZ(-10px)" }} />

              {/* Avatar */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-secondary/50 group-hover:ring-primary/50 transition-all shadow-lg"
                style={{ transform: "translateZ(30px)" }}
              >
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Info */}
              <div style={{ transform: "translateZ(20px)" }}>
                <h3 className="text-lg font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {teacher.name}
                </h3>
              <p className="text-primary font-medium text-sm mb-2">
                {teacher.subject}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {teacher.experience} năm kinh nghiệm
              </p>

              </div>

              {/* Certificates */}
              <div className="flex flex-wrap justify-center gap-1.5 mb-4" style={{ transform: "translateZ(10px)" }}>
                {teacher.certificates.slice(0, 2).map((cert) => (
                  <Badge key={cert} variant="secondary" className="text-xs bg-secondary/50">
                    {cert}
                  </Badge>
                ))}
              </div>

              {/* CTA */}
              <div style={{ transform: "translateZ(25px)" }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full btn-secondary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors hover:shadow-md"
                  onClick={() => setSelectedTeacher(teacher)}
                >
                  Xem hồ sơ
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Teacher Profile Modal */}
        <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
          <DialogContent className="max-w-lg">
            {selectedTeacher && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/30">
                      <img
                        src={selectedTeacher.avatar}
                        alt={selectedTeacher.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedTeacher.name}</DialogTitle>
                      <p className="text-primary font-medium">{selectedTeacher.subject}</p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Bio */}
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Giới thiệu
                    </h4>
                    <p className="text-muted-foreground text-sm">{selectedTeacher.bio}</p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Kinh nghiệm
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {selectedTeacher.experience} năm giảng dạy chuyên môn
                    </p>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-primary" />
                      Thành tích
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedTeacher.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-secondary" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Teaching Style */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Phong cách giảng dạy</h4>
                    <p className="text-muted-foreground text-sm">{selectedTeacher.style}</p>
                  </div>

                  {/* Certificates */}
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.certificates.map((cert) => (
                      <Badge key={cert} className="bg-primary/10 text-primary hover:bg-primary/20">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
