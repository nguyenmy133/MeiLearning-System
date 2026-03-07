import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { label: "Giới thiệu", href: "/about" },
  { label: "Giáo viên", href: "/teachers" },
  { label: "Lớp học", href: "/#programs" },
  { label: "Lịch học", href: "/#schedule" },
  { label: "Học phí", href: "/#pricing" },
  { label: "Cảm nhận", href: "/#testimonials" },
  { label: "Liên hệ", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-card shadow-xl py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
            <img src="/Logo.png" alt="MeiLearning Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground tracking-tight">
            MeiLearning
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" asChild className="btn-secondary">
            <Link to="/login">Đăng nhập</Link>
          </Button>
          <Button asChild className="btn-primary">
            <Link to="/#contact">Nhận tư vấn</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-card shadow-lg border-t border-border animate-fade-in">
          <nav className="container-custom py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Chế độ hiển thị</span>
                <ThemeToggle />
              </div>
              <Button variant="outline" asChild className="btn-secondary w-full">
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button asChild className="btn-primary w-full">
                <Link to="/#contact">Nhận tư vấn</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
