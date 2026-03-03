import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Edit2, Camera, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const userProfile = {
  id: "HV001",
  name: "Nguyễn Văn A",
  email: "nguyenvana@email.com",
  phone: "0901234567",
  address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
  dob: "15/05/1998",
  joinDate: "01/09/2024",
  avatar: null,
  courses: [
    { id: 1, name: "Toán 10A", level: "Cơ bản", progress: 65, startDate: "01/09/2024", endDate: "01/03/2025" },
    { id: 2, name: "Lý 10-B", level: "Cơ bản", progress: 45, startDate: "15/09/2024", endDate: "15/03/2025" },
    { id: 3, name: "IELTS-01", level: "Intermediate", progress: 30, startDate: "01/10/2024", endDate: "01/04/2025" },
  ]
};

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(userProfile);
  const [editedProfile, setEditedProfile] = useState(userProfile);
  const { toast } = useToast();

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast({
      title: "Đã cập nhật",
      description: "Thông tin cá nhân đã được cập nhật thành công",
    });
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Hồ sơ cá nhân
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin cá nhân và khóa học
        </p>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="courses">Khóa học của tôi</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Avatar Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={profile.avatar || undefined} />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {profile.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mt-4">{profile.name}</h2>
                  <Badge variant="secondary" className="mt-2">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Học viên
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">Mã HV: {profile.id}</p>
                </div>

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ngày sinh:</span>
                    <span className="text-foreground">{profile.dob}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ngày đăng ký:</span>
                    <span className="text-foreground">{profile.joinDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Thông tin liên hệ</CardTitle>
                  <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel} className="gap-2">
                      <X className="h-4 w-4" />
                      Hủy
                    </Button>
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Lưu
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={isEditing ? editedProfile.name : profile.name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={isEditing ? editedProfile.email : profile.email}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={isEditing ? editedProfile.phone : profile.phone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ngày sinh</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={isEditing ? editedProfile.dob : profile.dob}
                        onChange={(e) => setEditedProfile({ ...editedProfile, dob: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={isEditing ? editedProfile.address : profile.address}
                      onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Khóa học đang tham gia</CardTitle>
              <CardDescription>
                {profile.courses.length} khóa học
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 bg-secondary/50 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{course.name}</h3>
                        <Badge variant="outline" className="mt-1">{course.level}</Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          {course.startDate} - {course.endDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{course.progress}%</p>
                        <p className="text-xs text-muted-foreground">Hoàn thành</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Cập nhật mật khẩu để bảo vệ tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mật khẩu hiện tại</Label>
                <Input type="password" placeholder="Nhập mật khẩu hiện tại" />
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu mới</Label>
                <Input type="password" placeholder="Nhập mật khẩu mới" />
              </div>
              <div className="space-y-2">
                <Label>Xác nhận mật khẩu mới</Label>
                <Input type="password" placeholder="Nhập lại mật khẩu mới" />
              </div>
              <Button>Đổi mật khẩu</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
