import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

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
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary/50" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <span className="font-display font-bold text-lg">E</span>
              </div>
              <span className="font-display font-semibold text-xl">EduCenter</span>
            </Link>
          </div>
          
          <div>
            <h1 className="text-4xl font-display font-bold mb-4">
              Chào mừng trở lại!
            </h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Đăng nhập để truy cập thời khóa biểu, điểm danh, 
              theo dõi tiến độ học tập và nhiều tính năng khác.
            </p>
          </div>

          <div className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} EduCenter. Tất cả quyền được bảo lưu.
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
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
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">E</span>
              </div>
              <span className="font-display font-semibold text-xl text-foreground">EduCenter</span>
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
