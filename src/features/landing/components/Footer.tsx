import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, Clock } from "lucide-react";

const quickLinks = [
  { label: "Giới thiệu", href: "/about" },
  { label: "Giáo viên", href: "/teachers" },
  { label: "Lớp học", href: "/#programs" },
  { label: "Liên hệ", href: "/contact" },
];

const policyLinks = [
  { label: "Chính sách bảo mật", href: "/privacy" },
  { label: "Điều khoản sử dụng", href: "/terms" },
  { label: "Chính sách hoàn phí", href: "/refund" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <span className="text-secondary-foreground font-display font-bold text-lg">E</span>
              </div>
              <span className="font-display font-semibold text-xl">EduCenter</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Trung tâm dạy học trực tiếp hàng đầu, cam kết chất lượng đầu ra 
              và phát triển toàn diện cho học viên.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-display font-semibold mb-4">Chính sách</h4>
            <ul className="space-y-2">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Đăng nhập
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>contact@educenter.vn</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>8h - 21h (T2 - CN)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-6 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} EduCenter. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
