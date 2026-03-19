import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Calendar,
  History,
  FileText,
  CreditCard,
  ClipboardList,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileCheck,
  Award,
  Gamepad2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ZaloWidget } from "@/components/ZaloWidget";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/features/shared/auth/auth-context";
import { useNotifications } from "@/features/user/notifications/hooks/useNotifications";
import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/user/dashboard" },
  { icon: FileText, label: "Tài liệu & Video", href: "/user/documents" },
  { icon: FileCheck, label: "Bài thi", href: "/user/exams" },
  { icon: Award, label: "Kết quả học tập", href: "/user/grades" },
  { icon: CreditCard, label: "Học phí", href: "/user/tuition" },
  { icon: ClipboardList, label: "Xin nghỉ/đi muộn", href: "/user/leave" },
  { icon: Gamepad2, label: "Khu Giải Trí", href: "/user/games" },
  { icon: User, label: "Hồ sơ", href: "/user/profile" },
];

// Map sub-routes that don't share a prefix with any menuItem href
const subRouteMap: Record<string, string> = {
  "/user/exam-taking": "Bài thi",
  "/user/exam-result": "Bài thi",
};

function getPageTitle(pathname: string): string {
  if (subRouteMap[pathname]) return subRouteMap[pathname];
  const exact = menuItems.find(item => item.href === pathname);
  if (exact) return exact.label;
  const sorted = [...menuItems].sort((a, b) => b.href.length - a.href.length);
  const partial = sorted.find(item => pathname.startsWith(item.href + "/"));
  return partial?.label ?? "Dashboard";
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

const getInitials = (name?: string) => {
  if (!name) return "HV";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
};

export function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fetch profile data for sidebar + header
  const { data: profile } = useQuery<ProfileData>({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get(API.PROFILE.ME);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch notification count
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const displayName = profile?.name ?? "Học viên";
  const avatarUrl = profile?.avatar ?? undefined;

  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-border bg-card transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src="/Logo.png" alt="MeiLearning Logo" className="w-full h-full object-contain" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-display font-semibold text-foreground">MeiLearning</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              const cls = `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`;
              return (
                <li key={item.href}>
                  <Link to={item.href} className={cls}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">Học viên</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/50"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="/Logo.png" alt="MeiLearning Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-semibold text-foreground">MeiLearning</span>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              const cls = `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cls}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-display font-semibold text-foreground hidden sm:block">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Notification bell — real data */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/user/notifications")}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:block">{displayName}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/user/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Floating Zalo contact widget */}
      <ZaloWidget />
    </div>
  );
}
