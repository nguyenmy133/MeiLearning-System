import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Fallback UI (Giao diện hiển thị thay thế khi App/Component bị lõi)
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50/50 p-6">
      <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center space-y-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Đã có lỗi xảy ra!
          </h2>
          <p className="text-gray-500">
            Hệ thống đang gặp sự cố nhỏ. Đừng lo lắng, dữ liệu của bạn vẫn an
            toàn. Vui lòng thử lại.
          </p>
        </div>

        {/* Hiển thị chi tiết lỗi (Không nên show ra ngoài Production thực tế, nhưng ở giai đoạn Dev thì rất cần để Fix bug) */}
        {process.env.NODE_ENV === "development" && (
          <div className="w-full rounded-md bg-gray-100 p-4 text-left text-sm text-red-600 overflow-auto max-h-[150px]">
            <p className="font-semibold">Chi tiết báo lỗi:</p>
            <pre className="mt-2 text-xs">{error.message}</pre>
          </div>
        )}

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={resetErrorBoundary} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Tải lại trang
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Có thể dọn dẹp biến state ở đây nếu cần trước khi render lại
        window.location.reload();
      }}
      onError={(error, errorInfo) => {
        // Nơi gửi Log lên Sentry hoặc Server khi có lỗi Crash app diễn ra
        console.error("Lỗi Ứng Dụng Đã Bị Bắt Qua Global Error Boundary:", error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
