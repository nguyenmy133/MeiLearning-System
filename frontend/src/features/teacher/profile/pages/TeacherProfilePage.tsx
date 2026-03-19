import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";

// ── Types ────────────────────────────────────────────────────────

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  dob: string | null;
  joinDate: string | null;
  avatar: string | null;
  role: string;
  gender: string | null;
  bio: string | null;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  dob: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Service helpers ──────────────────────────────────────────────

async function fetchProfile(): Promise<ProfileData> {
  const { data } = await apiClient.get(API.PROFILE.ME);
  return data;
}

async function updateProfile(payload: ProfileFormData): Promise<ProfileData> {
  const { data } = await apiClient.put(API.PROFILE.UPDATE, payload);
  return data;
}

async function uploadAvatar(file: File): Promise<string> {
  const form = new FormData();
  form.append("avatar", file);
  const { data } = await apiClient.post(API.PROFILE.AVATAR, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.avatarUrl;
}

async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.put(API.AUTH.CHANGE_PASSWORD, payload);
}

// ── Helpers ──────────────────────────────────────────────────────

const genderLabel = (g: string | null) => {
  switch (g) {
    case "MALE":
      return "Nam";
    case "FEMALE":
      return "Nữ";
    default:
      return g ?? "—";
  }
};

const getInitials = (name?: string) => {
  if (!name) return "GV";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// ── Component ────────────────────────────────────────────────────

export function TeacherProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Profile query ──────────────────────────────────────────
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<ProfileData>({
    queryKey: ["profile", "me"],
    queryFn: fetchProfile,
  });

  // ── Edit state ─────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    dob: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        bio: profile.bio ?? "",
        dob: profile.dob ?? "",
      });
    }
  }, [profile]);

  // ── Password state ─────────────────────────────────────────
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Mutations ──────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Đã cập nhật hồ sơ thành công!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: () => {
      toast.error("Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
    },
  });

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      toast.success("Đã cập nhật ảnh đại diện!");
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
    onError: () => {
      toast.error("Tải ảnh lên thất bại. Vui lòng thử lại.");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Đã đổi mật khẩu thành công!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
  });

  // ── Handlers ───────────────────────────────────────────────

  const handleSaveProfile = () => {
    if (!formData.name.trim()) {
      toast.error("Họ và tên không được để trống");
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        bio: profile.bio ?? "",
        dob: profile.dob ?? "",
      });
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (JPG, PNG, ...)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được lớn hơn 5MB");
      return;
    }
    avatarMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!passwordData.newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  // ── Loading / Error ────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground">Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Hồ sơ giáo viên</h1>
          <p className="text-muted-foreground">Xem và cập nhật thông tin cá nhân</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              Hủy
            </Button>
            <Button onClick={handleSaveProfile} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Chỉnh sửa hồ sơ
          </Button>
        )}
      </div>

      {/* Avatar Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar ?? undefined} />
                <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={handleAvatarClick}
                disabled={avatarMutation.isPending}
              >
                {avatarMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-display font-semibold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge className="bg-primary/10 text-primary">Giáo viên</Badge>
                {profile.gender && (
                  <Badge variant="outline">{genderLabel(profile.gender)}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Thông tin</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        {/* ── Tab: Thông tin ────────────────────────────────── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                {/* Họ và tên */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Họ và tên
                  </Label>
                  <Input
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Email */}
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

                {/* SĐT */}
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

                {/* Địa chỉ */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Địa chỉ
                  </Label>
                  <Input
                    disabled={!isEditing}
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                {/* Ngày sinh */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Ngày sinh
                  </Label>
                  <Input
                    type={isEditing ? "date" : "text"}
                    disabled={!isEditing}
                    value={isEditing ? formData.dob : (profile.dob ?? "Chưa cập nhật")}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))}
                  />
                </div>

                {/* Ngày vào làm (read-only) */}
                {profile.joinDate && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Ngày vào làm
                    </Label>
                    <Input disabled value={profile.joinDate} />
                  </div>
                )}

                {/* Giới thiệu bản thân */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Giới thiệu bản thân
                  </Label>
                  <Textarea
                    disabled={!isEditing}
                    value={formData.bio}
                    rows={4}
                    placeholder="Viết một vài dòng giới thiệu về bản thân..."
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Bảo mật ─────────────────────────────────── */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cập nhật mật khẩu
              </CardTitle>
            </CardHeader>
            <CardContent className="max-w-md space-y-4">
              {/* Mật khẩu hiện tại */}
              <div className="space-y-2">
                <Label>Mật khẩu hiện tại</Label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Nhập mật khẩu hiện tại"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div className="space-y-2">
                <Label>Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Nhập lại mật khẩu mới */}
              <div className="space-y-2">
                <Label>Nhập lại mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button onClick={handleChangePassword} disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Cập nhật mật khẩu
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
