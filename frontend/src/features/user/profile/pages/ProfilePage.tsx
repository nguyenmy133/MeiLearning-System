import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Camera,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      return g ?? "";
  }
};

const getInitials = (name?: string) => {
  if (!name) return "HV";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// ── Component ────────────────────────────────────────────────────

export function ProfilePage() {
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
    dob: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Hồ sơ cá nhân
        </h1>
        <p className="text-muted-foreground mt-1">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        {/* ── Tab: Thông tin ────────────────────────────────── */}
        <TabsContent value="info" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Avatar Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={profile.avatar ?? undefined} />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8"
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
                  <h2 className="text-xl font-semibold text-foreground mt-4">{profile.name}</h2>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Học viên
                    </Badge>
                    {profile.gender && (
                      <Badge variant="outline">{genderLabel(profile.gender)}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Mã HV: {profile.id}</p>
                </div>

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ngày sinh:</span>
                    <span className="text-foreground">{profile.dob ?? "Chưa cập nhật"}</span>
                  </div>
                  {profile.joinDate && (
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Ngày đăng ký:</span>
                      <span className="text-foreground">{profile.joinDate}</span>
                    </div>
                  )}
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
                    <Save className="h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                      <X className="h-4 w-4" />
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="gap-2"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Lưu
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Họ và tên */}
                  <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={isEditing ? formData.name : profile.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={isEditing ? formData.email : profile.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={isEditing ? formData.phone : profile.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Ngày sinh */}
                  <div className="space-y-2">
                    <Label>Ngày sinh</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={isEditing ? "date" : "text"}
                        disabled={!isEditing}
                        value={isEditing ? formData.dob : (profile.dob ?? "Chưa cập nhật")}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={isEditing ? formData.address : (profile.address ?? "")}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: Bảo mật ─────────────────────────────────── */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Đổi mật khẩu
              </CardTitle>
              <CardDescription>Cập nhật mật khẩu để bảo vệ tài khoản</CardDescription>
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
                Đổi mật khẩu
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
