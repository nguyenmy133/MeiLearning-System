import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Camera, Lock, Mail, MapPin, Phone, Save, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

const adminProfile = {
  fullName: "Admin MeiLearning",
  email: "admin@meilearning.vn",
  phone: "0901 234 567",
  office: "Trụ sở Quận 1, TP.HCM",
  role: "Quản trị viên hệ thống",
  department: "Phòng vận hành",
  bio: "Quản lý vận hành hệ thống đào tạo, duyệt lịch học và theo dõi chất lượng dữ liệu.",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
};

export function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: adminProfile.fullName,
    email: adminProfile.email,
    phone: adminProfile.phone,
    office: adminProfile.office,
    role: adminProfile.role,
    department: adminProfile.department,
    bio: adminProfile.bio,
  });

  const saveProfile = () => {
    setIsEditing(false);
    toast.success("Đã cập nhật hồ sơ quản trị");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Hồ sơ quản trị</h1>
          <p className="text-muted-foreground">Cập nhật thông tin liên hệ và quyền hạn hiển thị</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button onClick={saveProfile}>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Chỉnh sửa hồ sơ
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={adminProfile.avatar} />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-display font-semibold text-foreground">{formData.fullName}</h2>
              <p className="text-sm text-muted-foreground">{formData.department}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge className="bg-primary/10 text-primary">{formData.role}</Badge>
                <Badge variant="outline">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Toàn quyền
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Thông tin</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Họ và tên
                  </Label>
                  <Input
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Số điện thoại
                  </Label>
                  <Input
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Bộ phận
                  </Label>
                  <Input
                    disabled={!isEditing}
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Văn phòng
                  </Label>
                  <Input
                    disabled={!isEditing}
                    value={formData.office}
                    onChange={(e) => setFormData((prev) => ({ ...prev, office: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    disabled={!isEditing}
                    value={formData.bio}
                    rows={4}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cập nhật mật khẩu
              </CardTitle>
            </CardHeader>
            <CardContent className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label>Mật khẩu hiện tại</Label>
                <Input type="password" placeholder="Nhập mật khẩu hiện tại" />
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu mới</Label>
                <Input type="password" placeholder="Nhập mật khẩu mới" />
              </div>
              <div className="space-y-2">
                <Label>Nhập lại mật khẩu mới</Label>
                <Input type="password" placeholder="Nhập lại mật khẩu mới" />
              </div>
              <Button onClick={() => toast.success("Đã đổi mật khẩu thành công")}>Cập nhật mật khẩu</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
