import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Edit,
  Save,
  Camera,
  Clock,
  BookOpen,
  Users,
  Star
} from "lucide-react";
import { toast } from "sonner";

const teacherData = {
  name: "Nguyễn Văn An",
  email: "nguyenvanan@educenter.vn",
  phone: "0901234567",
  address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
  birthday: "1985-05-15",
  gender: "Nam",
  teacherId: "GV001",
  department: "Toán",
  position: "Giáo viên chính",
  startDate: "2020-09-01",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  bio: "Giáo viên Toán với hơn 10 năm kinh nghiệm giảng dạy. Chuyên gia ôn thi THPT Quốc gia với nhiều học sinh đạt điểm cao.",
  education: [
    { degree: "Thạc sĩ Toán học", school: "Đại học Sư phạm TP.HCM", year: "2012" },
    { degree: "Cử nhân Sư phạm Toán", school: "Đại học Sư phạm TP.HCM", year: "2008" }
  ],
  certifications: [
    { name: "Chứng chỉ Giảng viên Quốc tế", issuer: "Cambridge", year: "2019" },
    { name: "Chứng chỉ Phương pháp giảng dạy hiện đại", issuer: "Bộ GD&ĐT", year: "2021" }
  ]
};

const stats = {
  totalClasses: 5,
  totalStudents: 54,
  totalHours: 120,
  avgRating: 4.8
};

export function TeacherProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: teacherData.name,
    email: teacherData.email,
    phone: teacherData.phone,
    address: teacherData.address,
    bio: teacherData.bio
  });

  const handleSave = () => {
    toast.success("Đã cập nhật thông tin thành công!");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Hồ sơ giáo viên</h1>
          <p className="text-muted-foreground">Quản lý thông tin cá nhân của bạn</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar className="w-28 h-28">
                <AvatarImage src={teacherData.avatar} />
                <AvatarFallback className="text-3xl">{teacherData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h2 className="text-2xl font-display font-bold text-foreground">{teacherData.name}</h2>
                <Badge className="bg-primary/10 text-primary w-fit mx-auto sm:mx-0">
                  {teacherData.position}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{teacherData.department}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-accent rounded-lg">
                  <BookOpen className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xl font-bold">{stats.totalClasses}</p>
                  <p className="text-xs text-muted-foreground">Lớp</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-lg">
                  <Users className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xl font-bold">{stats.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Học viên</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-lg">
                  <Clock className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xl font-bold">{stats.totalHours}</p>
                  <p className="text-xs text-muted-foreground">Giờ dạy</p>
                </div>
                <div className="text-center p-3 bg-accent rounded-lg">
                  <Star className="w-5 h-5 mx-auto text-warning mb-1" />
                  <p className="text-xl font-bold">{stats.avgRating}</p>
                  <p className="text-xs text-muted-foreground">Đánh giá</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="work">Công việc</TabsTrigger>
          <TabsTrigger value="education">Học vấn</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Họ và tên
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground">{teacherData.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground">{teacherData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Số điện thoại
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground">{teacherData.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Ngày sinh
                  </label>
                  <p className="text-foreground">{new Date(teacherData.birthday).toLocaleDateString("vi-VN")}</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Địa chỉ
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground">{teacherData.address}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Giới thiệu bản thân</label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-foreground">{teacherData.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Thông tin công việc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Mã giáo viên</label>
                  <p className="text-foreground font-mono">{teacherData.teacherId}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Bộ môn</label>
                  <p className="text-foreground">{teacherData.department}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Chức vụ</label>
                  <p className="text-foreground">{teacherData.position}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Ngày vào làm</label>
                  <p className="text-foreground">{new Date(teacherData.startDate).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Chứng chỉ
                </h4>
                <div className="space-y-3">
                  {teacherData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-accent rounded-lg">
                      <Award className="w-8 h-8 text-warning" />
                      <div>
                        <p className="font-medium text-foreground">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">{cert.issuer} • {cert.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Học vấn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherData.education.map((edu, index) => (
                  <div key={index} className="relative pl-6 pb-4 border-l-2 border-primary/30 last:pb-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />
                    <div className="bg-accent p-4 rounded-lg">
                      <p className="font-semibold text-foreground">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">{edu.school}</p>
                      <Badge variant="outline" className="mt-2">{edu.year}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
