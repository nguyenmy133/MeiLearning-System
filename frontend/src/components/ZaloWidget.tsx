import { useState } from "react";
import { MessageCircle, X, ExternalLink, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Floating Zalo contact widget — hiển thị ở góc dưới phải.
 * Được tối ưu hoá:
 * - Load dữ liệu từ Environment (.env) thay vì Hardcode.
 * - Event Tracking (Marketing Analytics).
 * - Cross-device UX (Mobile gọi ngay, Desktop copy số).
 */

const ZALO_URL = import.meta.env.VITE_ZALO_URL || "https://zalo.me";
const HOTLINE = import.meta.env.VITE_HOTLINE || "19001234";

function formatTel(phone: string) {
  // Chuẩn hoá đầu số quốc tế cho tính tương thích
  return `tel:${phone.replace(/[\s.-]/g, "").replace(/^0/, "+84")}`;
}

export function ZaloWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleContactClick = (method: "ZALO" | "HOTLINE") => {
    // Ví dụ giả lập bắn sự kiện Analytics cho Ads/Marketing
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "generate_lead", {
        contact_method: method,
      });
    }
  };

  const handlePhoneClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    handleContactClick("HOTLINE");

    // Phát hiện thiết bị, nếu là PC thì copy vào clipboard thay vì mở App gọi điện
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      e.preventDefault(); // Chặn hành vi mở app trên máy tính
      navigator.clipboard.writeText(HOTLINE);
      toast({
        title: "Đã sao chép số điện thoại",
        description: `Bạn có thể dán (Ctrl+V) để liên hệ: ${HOTLINE}`,
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {/* Popup card */}
      {isOpen && (
        <div className="mb-2 w-72 rounded-2xl bg-card border border-border shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0068FF] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 48 48"
                className="w-6 h-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="24" fill="white" fillOpacity="0.2" />
                <path
                  d="M24 9C15.716 9 9 15.045 9 22.5c0 4.254 2.292 8.048 5.88 10.536-.165.99-.594 3.126-1.08 4.464 0 0-.066.27.138.378.204.108.396.012.396.012.528-.072 3.078-1.998 4.356-2.826A17.48 17.48 0 0024 36c8.284 0 15-6.045 15-13.5S32.284 9 24 9z"
                  fill="white"
                />
              </svg>
              <span className="text-white font-semibold text-sm">
                Liên hệ MeiLearning
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Bạn cần hỗ trợ? Liên hệ với chúng tôi qua Zalo để được tư vấn
              nhanh nhất!
            </p>

            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleContactClick("ZALO")}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0068FF]/10 hover:bg-[#0068FF]/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[#0068FF] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Nhắn tin qua Zalo
                </p>
                <p className="text-xs text-muted-foreground">
                  Phản hồi trong vòng 5 phút
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[#0068FF] transition-colors flex-shrink-0" />
            </a>

            <a
              href={formatTel(HOTLINE)}
              onClick={handlePhoneClick}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Gọi hotline
                </p>
                <p className="text-xs text-muted-foreground">{HOTLINE}</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg flex items-center justify-center
          transition-all duration-300 hover:scale-110 active:scale-95
          ${
            isOpen
              ? "bg-muted text-muted-foreground rotate-0"
              : "bg-[#0068FF] text-white"
          }
        `}
        aria-label={isOpen ? "Đóng liên hệ Zalo" : "Liên hệ Zalo"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <svg
              viewBox="0 0 48 48"
              className="w-7 h-7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 4C12.954 4 4 12.045 4 22c0 5.54 2.98 10.476 7.644 13.714-.216 1.29-.774 4.068-1.404 5.814 0 0-.084.348.18.492.264.138.516.012.516.012.684-.096 4.002-2.604 5.664-3.678A22.12 22.12 0 0024 40c11.046 0 20-8.045 20-18S35.046 4 24 4z"
                fill="white"
              />
            </svg>
            {/* Pulse ring */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#0068FF] opacity-30 animate-ping" />
          </>
        )}
      </button>
    </div>
  );
}
