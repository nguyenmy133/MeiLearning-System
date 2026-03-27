import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  QrCode,
  CreditCard,
  RefreshCw,
  BarChart3,
  Settings,
  Bell,
  User,
  LogOut,
  Library,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/features/shared/auth/auth-context";
import { useNotifications } from "@/features/user/notifications/hooks/useNotifications";
import { notificationService } from "@/features/user/notifications/services/notificationService";
import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

const getInitials = (name?: string) => {
  if (!name) return "AD";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
};

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Building2, label: "Cơ sở vật chất", href: "/admin/facilities" },
  { icon: GraduationCap, label: "Giáo viên", href: "/admin/teachers" },
  { icon: Users, label: "Học viên", href: "/admin/students" },
  { icon: Library, label: "Môn học", href: "/admin/subjects" },
  { icon: BookOpen, label: "Lớp học", href: "/admin/classes" },
  { icon: Calendar, label: "Lịch học", href: "/admin/schedule" },
  { icon: RefreshCw, label: "Duyệt đổi lịch", href: "/admin/reschedule-approval" },
  { icon: QrCode, label: "Điểm danh", href: "/admin/attendance" },
  { icon: CreditCard, label: "Học phí", href: "/admin/tuition" },
  { icon: BarChart3, label: "Báo cáo", href: "/admin/reports" },
  { icon: Settings, label: "Cấu hình QR", href: "/admin/qr-settings" },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Fetch profile data for sidebar + header
  const { data: profile } = useQuery<ProfileData>({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get(API.PROFILE.ME);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const displayName = profile?.name ?? "Admin";
  const avatarUrl = profile?.avatar ?? undefined;

  const getCurrentPageTitle = () => {
    if (location.pathname === "/admin/notifications") return "Thông báo";
    if (location.pathname === "/admin/profile") return "Hồ sơ";

    return menuItems.find((item) => item.href === location.pathname)?.label || "Dashboard";
  };

  const handleOpenNotifications = () => {
    if (unreadNotifications > 0) {
      markAllMutation.mutate();
    }
    navigate("/admin/notifications");
  };

  const handleOpenProfile = () => {
    navigate("/admin/profile");
  };

  const queryClient = useQueryClient();

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
  });

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background safe-top">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card transition-all duration-300 lg:flex ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
              <img src="/Logo.png" alt="MeiLearning Logo" className="h-full w-full object-contain" />
            </div>
            {sidebarOpen && <span className="font-display font-semibold text-foreground">Admin</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 transition-colors hover:bg-accent"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </ScrollArea>

        {sidebarOpen && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">Quản trị viên</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg">
              <img src="/Logo.png" alt="MeiLearning Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-display font-semibold text-foreground">Admin</span>
          </Link>
          <button onClick={() => setMobileSidebarOpen(false)} className="rounded-lg p-2 hover:bg-accent touch-target flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4 safe-bottom">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </aside>

      <div className={`flex flex-1 flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileSidebarOpen(true)} className="rounded-lg p-2 hover:bg-accent lg:hidden touch-target flex items-center justify-center">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="hidden text-lg font-display font-semibold text-foreground sm:block">{getCurrentPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenNotifications}
              aria-label="Xem thông báo"
              className={`relative ${location.pathname === "/admin/notifications" ? "bg-accent" : ""}`}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-destructive p-0 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:block">{displayName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={handleOpenProfile} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-6 min-w-0 overflow-x-hidden safe-bottom">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
