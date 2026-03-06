import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, ArrowRight } from "lucide-react";

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
  { label: "Đăng nhập", href: "/login" },
];

export function Footer() {
  return (
    <footer className="relative bg-[#0a0f1c] text-slate-300 overflow-hidden pt-20 pb-8 border-t border-border/10">
      {/* Premium Dark Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 lg:pr-8">
            <Link to="/" className="flex items-center gap-3 mb-6 group inline-flex">
              <div className="w-14 h-14 rounded-2xl bg-white/5 p-2.5 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:bg-white/10 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                <img src="/Logo.png" alt="MeiLearn Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-semibold text-3xl text-white tracking-tight">MeiLearn</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 pr-4">
              Hệ thống theo dõi tiến trình và quản lý học tập toàn diện. Kiến tạo trải nghiệm giáo dục chuẩn mực, tối ưu hóa năng lực của mọi học viên.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Youtube, href: "#" },
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(34,197,94,0.2)]"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-display font-semibold text-lg mb-6">Khám phá</h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="group flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-display font-semibold text-lg mb-6">Hỗ trợ</h4>
            <ul className="space-y-4">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="group flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-display font-semibold text-lg mb-6">Thông tin liên hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group cursor-pointer">
                <div className="mt-0.5 p-2.5 bg-primary/20 group-hover:bg-primary/30 transition-colors rounded-xl shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm mb-1">Cơ sở chính</p>
                  <p className="text-slate-400 text-sm leading-relaxed">Topaz Twins - Biên Hoà - Đồng Nai</p>
                </div>
              </li>
              
              <li className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group cursor-pointer">
                <div className="p-2.5 bg-primary/20 group-hover:bg-primary/30 transition-colors rounded-xl shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm mb-1">Hotline tư vấn</p>
                  <p className="text-slate-400 text-sm">{import.meta.env.VITE_HOTLINE } <span className="text-slate-500 text-xs ml-1">(8h - 21h)</span></p>
                </div>
              </li>

              <li className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group cursor-pointer">
                <div className="p-2.5 bg-primary/20 group-hover:bg-primary/30 transition-colors rounded-xl shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm mb-1">Email hỗ trợ</p>
                  <p className="text-slate-400 text-sm">contact@meilearn.vn</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Setup */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-8 mt-4">
          <p className="text-sm font-medium text-slate-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} MeiLearn. Thiết kế và phát triển với tâm huyết.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className="hover:text-white cursor-pointer transition-colors">Tiếng Việt</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <span className="hover:text-white cursor-pointer transition-colors">English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
