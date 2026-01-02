import { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, BookOpen, Clock, Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const allTeachers = [
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
  },
  {
    id: 5,
    name: "Hoàng Đức Mạnh",
    subject: "Hóa học",
    experience: 11,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    certificates: ["Thạc sĩ Hóa học", "Giáo viên THPT"],
    bio: "Chuyên gia luyện thi Hóa học với phương pháp giải nhanh, hiệu quả.",
    achievements: ["Tỷ lệ đỗ ĐH khối B: 90%", "40+ học sinh giải HSG"],
    style: "Hệ thống hóa kiến thức, luyện đề có trọng tâm."
  },
  {
    id: 6,
    name: "Ngô Thị Mai",
    subject: "Tiếng Anh",
    experience: 9,
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
    certificates: ["IELTS 8.0", "TOEIC 990", "MA TESOL"],
    bio: "Chuyên gia TOEIC và giao tiếp, từng làm việc tại Singapore 5 năm.",
    achievements: ["150+ học viên đạt TOEIC 800+", "Đào tạo doanh nghiệp"],
    style: "Focus vào thực hành, ứng dụng thực tế."
  }
];

export function TeachersPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<typeof allTeachers[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeachers = allTeachers.filter(
    teacher =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding bg-accent/30">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-primary font-medium text-sm uppercase tracking-wider mb-4 block">
                Đội ngũ giáo viên
              </span>
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                Giáo viên giỏi, tận tâm
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Đội ngũ giáo viên được tuyển chọn kỹ lưỡng, có kinh nghiệm và 
                phương pháp giảng dạy hiệu quả
              </p>
              
              {/* Search */}
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc môn học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Teachers grid */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-card-hover transition-all card-hover group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-secondary/50 group-hover:ring-primary/30 transition-all flex-shrink-0">
                      <img
                        src={teacher.avatar}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-display font-semibold text-foreground truncate">
                        {teacher.name}
                      </h3>
                      <p className="text-primary font-medium text-sm mb-1">
                        {teacher.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.experience} năm kinh nghiệm
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-4 mb-4">
                    {teacher.certificates.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-xs bg-secondary/50">
                        {cert}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {teacher.bio}
                  </p>

                  <Button
                    variant="outline"
                    className="w-full btn-secondary"
                    onClick={() => setSelectedTeacher(teacher)}
                  >
                    Xem hồ sơ chi tiết
                  </Button>
                </div>
              ))}
            </div>

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Không tìm thấy giáo viên phù hợp</p>
              </div>
            )}
          </div>
        </section>

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
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Giới thiệu
                    </h4>
                    <p className="text-muted-foreground text-sm">{selectedTeacher.bio}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Kinh nghiệm
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {selectedTeacher.experience} năm giảng dạy chuyên môn
                    </p>
                  </div>

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

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Phong cách giảng dạy</h4>
                    <p className="text-muted-foreground text-sm">{selectedTeacher.style}</p>
                  </div>

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
      </main>
      <Footer />
    </div>
  );
}
