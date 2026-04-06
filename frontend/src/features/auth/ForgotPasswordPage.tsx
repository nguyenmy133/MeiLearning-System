import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShieldAlert,
  MessageCircle,
  Phone,
  Mail,
  KeyRound,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const STEPS = [
  {
    icon: MessageCircle,
    title: "Liên hệ quản trị viên",
    desc: "Gọi điện, nhắn tin hoặc gặp trực tiếp quản trị viên của trung tâm.",
    accent: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: ShieldAlert,
    title: "Xác minh danh tính",
    desc: "Cung cấp họ tên, số điện thoại đã đăng ký để Admin xác minh.",
    accent: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: KeyRound,
    title: "Nhận mật khẩu mới",
    desc: "Admin sẽ đặt lại mật khẩu và gửi cho bạn. Hãy đổi mật khẩu ngay sau khi đăng nhập.",
    accent: "from-emerald-500 to-green-500",
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
];

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left side — Branding (reuses LoginPage aesthetic) ────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0f1c] relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0a0f1c] to-primary/20 pointer-events-none" />
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] mix-blend-screen" />

        {/* Big lock illustration */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-16">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
            className="relative"
          >
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-40 h-40 rounded-full bg-primary/20 blur-2xl animate-pulse" />
            <div className="relative w-40 h-40 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                <KeyRound className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mt-10 max-w-md"
          >
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Bảo mật tài khoản
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Mật khẩu của bạn được quản lý an toàn. Quản trị viên sẽ hỗ trợ bạn
              khôi phục quyền truy cập nhanh chóng.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-8 mt-12"
          >
            {[
              { label: "Mã hóa", value: "AES-256" },
              { label: "Hỗ trợ", value: "24/7" },
              { label: "Xử lý", value: "< 5 phút" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-white font-display font-bold text-xl">{stat.value}</p>
                <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-16 text-sm text-slate-400 font-medium">
          © {new Date().getFullYear()} MeiLearning OS. Tất cả quyền được bảo lưu.
        </div>
      </div>

      {/* ── Right side — Content ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-primary/5">
                <img src="/Logo.png" alt="MeiLearning Logo" className="w-12 h-12 object-contain" />
              </div>
              <span className="font-display font-semibold text-2xl text-foreground">MeiLearning</span>
            </Link>
          </div>

          {/* Header */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center lg:hidden">
                <KeyRound className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                Quên mật khẩu?
              </h1>
            </div>
            <p className="text-muted-foreground mb-8">
              Đừng lo — làm theo các bước bên dưới để lấy lại quyền truy cập tài khoản.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                custom={i + 1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="group relative flex gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-sm"
              >
                {/* Step number */}
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                  {i + 1}
                </div>

                {/* Icon */}
                <div className={`shrink-0 w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground/50 self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>

          {/* Contact info box */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-primary/20 bg-primary/5 p-5"
          >
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Thông tin liên hệ Admin
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Hotline:</span>
                <a href="tel:0973734061" className="text-foreground font-medium hover:text-primary transition-colors">
                  097 373 4061
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Email:</span>
                <a href="mailto:admin@meilearning.vn" className="text-foreground font-medium hover:text-primary transition-colors">
                  admin@meilearning.vn
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                Hoặc liên hệ trực tiếp tại văn phòng trung tâm trong giờ hành chính.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6"
          >
            <Button asChild className="w-full h-11 text-base">
              <Link to="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
