import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  ChevronDown
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    navigate("/login");
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
              <img src="/Logo.png" alt="MeiLearn Logo" className="w-full h-full object-contain" />
            </div>
            {sidebarOpen && (
              <span className="font-display font-semibold text-foreground">Admin</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <ScrollArea className="flex-1 py-4 px-3">
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
        </ScrollArea>

        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">Quản trị viên</p>
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
              <img src="/Logo.png" alt="MeiLearn Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-semibold text-foreground">Admin</span>
          </Link>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-accent">
            <X className="w-5 h-5" />
          </button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] py-4 px-3">
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
        </ScrollArea>
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-accent">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-display font-semibold text-foreground hidden sm:block">
              {menuItems.find(item => item.href === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                5
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:block">Admin</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/admin/profile" className="cursor-pointer">
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
