import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  QrCode,
  FileText,
  BarChart3,
  RefreshCw,
  ClipboardList,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileCheck
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/features/shared/auth/auth-context";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard" },
  { icon: Calendar, label: "Lịch dạy", href: "/teacher/schedule" },
  { icon: Users, label: "Lớp của tôi", href: "/teacher/classes" },
  { icon: QrCode, label: "Điểm danh buổi học", href: "/teacher/attendance" },
  { icon: FileText, label: "Tài liệu", href: "/teacher/documents" },
  { icon: FileCheck, label: "Quản lý bài thi", href: "/teacher/exams" },
  { icon: BarChart3, label: "Điểm & nhận xét", href: "/teacher/grades" },
  { icon: RefreshCw, label: "Yêu cầu đổi lịch", href: "/teacher/reschedule" },
  { icon: ClipboardList, label: "Duyệt đơn xin nghỉ", href: "/teacher/leave-approval" },
  { icon: User, label: "Hồ sơ", href: "/teacher/profile" },
];

function getPageTitle(pathname: string): string {
  // Exact match first
  const exact = menuItems.find(item => item.href === pathname);
  if (exact) return exact.label;
  // StartsWith match — sort by length desc to match most specific route first
  const sorted = [...menuItems].sort((a, b) => b.href.length - a.href.length);
  const partial = sorted.find(item => pathname.startsWith(item.href + "/"));
  return partial?.label ?? "Dashboard";
}

export function TeacherLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
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

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
                <AvatarFallback>GV</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Nguyễn Văn An</p>
                <p className="text-xs text-muted-foreground truncate">Giáo viên Toán</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/50"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

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
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-accent">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
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

      {/* Main */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-accent">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-display font-semibold text-foreground hidden sm:block">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                    2
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <p className="font-semibold text-sm">Thông báo</p>
                  <Badge variant="secondary" className="text-xs">2 mới</Badge>
                </div>
                <ul className="divide-y divide-border">
                  <li className="px-4 py-3 hover:bg-accent/50 transition-colors">
                    <p className="text-sm font-medium">Yêu cầu đổi lịch được duyệt</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Lớp Toán 10A — Admin đã chấp thuận</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">5 phút trước</p>
                  </li>
                  <li className="px-4 py-3 hover:bg-accent/50 transition-colors">
                    <p className="text-sm font-medium">Đơn xin nghỉ mới</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Nguyễn Văn An xin nghỉ buổi họ Toán 10A</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">20 phút trước</p>
                  </li>
                </ul>
                <div className="px-4 py-2 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground">Không có thông báo cũ hơn</p>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
                    <AvatarFallback>GV</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:block">Thầy An</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/teacher/profile" className="cursor-pointer">
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

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
