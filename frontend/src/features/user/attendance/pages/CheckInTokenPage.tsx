import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Loader2, QrCode } from "lucide-react";
import { useQrTokenCheckIn } from "@/features/user/attendance/hooks";

type CheckInState = "loading" | "success" | "expired" | "already" | "invalid" | "error";

export function CheckInTokenPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [state, setState] = useState<CheckInState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const checkIn = useQrTokenCheckIn();

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

    checkIn.mutate(token, {
      onSuccess: () => setState("success"),
      onError: (err: Error) => {
        const msg = err.message || "";
        if (msg.includes("hết hạn")) {
          setState("expired");
        } else if (msg.includes("đã điểm danh") || msg.includes("đã được điểm danh")) {
          setState("already");
        } else if (msg.includes("không hợp lệ") || msg.includes("không tìm thấy")) {
          setState("invalid");
        } else {
          setState("error");
          setErrorMsg(msg);
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const stateConfig: Record<CheckInState, { icon: React.ReactNode; title: string; desc: string; color: string }> = {
    loading: {
      icon: <Loader2 className="w-16 h-16 text-primary animate-spin" />,
      title: "Đang điểm danh...",
      desc: "Vui lòng đợi trong giây lát.",
      color: "text-primary",
    },
    success: {
      icon: <CheckCircle2 className="w-16 h-16 text-emerald-500" />,
      title: "Điểm danh thành công! 🎉",
      desc: "Bạn đã được ghi nhận có mặt.",
      color: "text-emerald-600",
    },
    expired: {
      icon: <Clock className="w-16 h-16 text-amber-500" />,
      title: "Mã QR đã hết hạn",
      desc: "Vui lòng yêu cầu giáo viên tạo mã QR mới.",
      color: "text-amber-600",
    },
    already: {
      icon: <CheckCircle2 className="w-16 h-16 text-blue-500" />,
      title: "Bạn đã điểm danh rồi",
      desc: "Bạn đã được điểm danh cho buổi học này trước đó.",
      color: "text-blue-600",
    },
    invalid: {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      title: "Mã QR không hợp lệ",
      desc: "Mã QR không tồn tại hoặc đã bị hủy.",
      color: "text-red-600",
    },
    error: {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      title: "Có lỗi xảy ra",
      desc: errorMsg || "Không thể điểm danh lúc này. Vui lòng thử lại.",
      color: "text-red-600",
    },
  };

  const config = stateConfig[state];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-accent/50 flex items-center justify-center">
            {config.icon}
          </div>

          <div className="space-y-2">
            <h1 className={`text-2xl font-display font-bold ${config.color}`}>
              {config.title}
            </h1>
            <p className="text-muted-foreground">{config.desc}</p>
          </div>

          {state !== "loading" && (
            <div className="flex gap-3 pt-2 w-full">
              <Button
                onClick={() => navigate("/user/dashboard")}
                className="flex-1 btn-primary"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Về Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
