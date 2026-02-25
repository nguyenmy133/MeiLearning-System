import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, GraduationCap, Users, ShieldCheck } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Parallax 3D Setup ---
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  // -------------------------

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo: check role based on email
    if (formData.email.includes("admin")) {
      navigate("/admin/dashboard");
    } else if (formData.email.includes("teacher")) {
      navigate("/teacher/dashboard");
    } else {
      navigate("/user/dashboard");
    }
    
    toast({
      title: "Đăng nhập thành công!",
      description: "Chào mừng bạn quay trở lại.",
    });

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - 3D Interactive Branding */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="hidden lg:flex lg:w-1/2 bg-[#0a0f1c] relative overflow-hidden perspective-[1000px] border-r border-border/10 z-10"
      >
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0a0f1c] to-primary/20 pointer-events-none" />
        <motion.div 
          style={{ x: useTransform(mouseXSpring, [-0.5, 0.5], [-50, 50]), y: useTransform(mouseYSpring, [-0.5, 0.5], [-50, 50]) }}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        >
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] mix-blend-screen" />
        </motion.div>

        {/* Floating Interactive Cards (Layer 1.5 - Behind Text) */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {/* Card 1 - Student */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              x: useTransform(mouseXSpring, [-0.5, 0.5], [-60, 60]), 
              y: useTransform(mouseYSpring, [-0.5, 0.5], [-60, 60]),
              rotateX: useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]),
              rotateY: useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10])
            }}
            className="absolute top-[12%] right-[2%] xl:right-[10%] w-64 p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hidden lg:block opacity-40 xl:opacity-100"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-inner">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold leading-tight mb-1">Dành cho Học viên</p>
                <p className="text-slate-300 text-xs whitespace-nowrap">Theo dõi quá trình học tập</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 w-[75%] rounded-full" />
            </div>
          </motion.div>

          {/* Card 2 - Teacher */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{ 
              x: useTransform(mouseXSpring, [-0.5, 0.5], [-90, 90]), 
              y: useTransform(mouseYSpring, [-0.5, 0.5], [-90, 90]),
              rotateX: useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]),
              rotateY: useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15])
            }}
            className="absolute bottom-[10%] right-[2%] xl:right-[15%] w-72 p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl hidden lg:block opacity-40 xl:opacity-100"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-inner shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold mb-1">Cổng Giảng viên</p>
                <p className="text-slate-300 text-sm leading-snug">Quản lý lớp, lịch giảng dạy và đánh giá chuẩn xác.</p>
              </div>
            </div>
          </motion.div>

          {/* Card 3 - Admin */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ 
              x: useTransform(mouseXSpring, [-0.5, 0.5], [-40, 40]), 
              y: useTransform(mouseYSpring, [-0.5, 0.5], [-40, 40]),
              rotateX: useTransform(mouseYSpring, [-0.5, 0.5], [5, -5]),
              rotateY: useTransform(mouseXSpring, [-0.5, 0.5], [-5, 5])
            }}
            className="absolute top-[48%] right-[5%] xl:right-[10%] p-4 rounded-xl bg-gradient-to-tr from-white/5 to-white/10 backdrop-blur-lg border border-white/20 shadow-xl flex items-center gap-3 hidden lg:flex opacity-40 xl:opacity-100"
          >
            <ShieldCheck className="w-8 h-8 text-secondary drop-shadow-md" />
            <div>
              <p className="text-white font-semibold text-sm">Bảo mật đa tầng</p>
              <p className="text-secondary text-xs font-medium">Phân quyền chặt chẽ</p>
            </div>
          </motion.div>
        </div>

        {/* Content Container (Layer 2 - In Front, Text) */}
        <motion.div 
          style={{ 
            x: useTransform(mouseXSpring, [-0.5, 0.5], [-20, 20]), 
            y: useTransform(mouseYSpring, [-0.5, 0.5], [-20, 20]) 
          }}
          className="relative z-20 flex flex-col justify-between p-12 lg:p-16 w-full text-white pointer-events-none"
        >
          <div className="pointer-events-auto w-fit">
            <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105 origin-left group">
              <div className="w-14 h-14 rounded-2xl bg-white/10 p-2.5 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:bg-white/20 transition-all duration-300">
                <img src="/Logo.png" alt="EduTrack Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-semibold text-3xl tracking-tight text-white drop-shadow-md">EduTrack</span>
            </Link>
          </div>
          
          <div className="max-w-xl z-20 mix-blend-normal">
            <h1 className="text-5xl lg:text-5xl xl:text-6xl font-display font-bold mb-6 leading-[1.15] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/80" style={{ filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.8))' }}>
              Kiến tạo tương lai <br /> giáo dục số
            </h1>
            <p className="text-slate-200 text-lg lg:text-xl leading-relaxed max-w-lg font-medium drop-shadow-2xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              Nền tảng quản lý học tập toàn diện, nơi kết nối bền chặt giữa Học viên, Giảng viên và Nhà trường.
            </p>
          </div>

          <div className="text-sm text-slate-400 font-medium tracking-wide" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>
            © {new Date().getFullYear()} EduTrack OS. Tất cả quyền được bảo lưu.
          </div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-primary/5">
                <img src="/Logo.png" alt="EduTrack Logo" className="w-12 h-12 object-contain" />
              </div>
              <span className="font-display font-semibold text-2xl text-foreground">EduTrack</span>
            </Link>
          </div>

          <h2 className="text-2xl font-display font-bold mb-2">Đăng nhập</h2>
          <p className="text-muted-foreground mb-8">
            Nhập thông tin để truy cập tài khoản của bạn
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`mt-1.5 ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Mật khẩu
                </Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={formData.remember}
                onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Ghi nhớ đăng nhập
              </Label>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full btn-primary h-11 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          {/* Demo accounts info */}
          <div className="mt-8 p-4 rounded-lg bg-accent/50 border border-border">
            <p className="text-sm font-medium text-foreground mb-2">Demo accounts:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <code>user@test.com</code> - Học viên</li>
              <li>• <code>teacher@test.com</code> - Giáo viên</li>
              <li>• <code>admin@test.com</code> - Admin</li>
              <li className="text-muted-foreground/70">(Mật khẩu bất kỳ từ 6 ký tự)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
