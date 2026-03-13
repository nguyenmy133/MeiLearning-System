import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function FeatureErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-800/30 dark:bg-red-950/20">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Không thể tải nội dung
      </h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Đã có lỗi xảy ra khi tải phần này. Vui lòng thử lại.
      </p>

      {import.meta.env.DEV && (
        <pre className="mb-4 max-h-24 w-full overflow-auto rounded bg-gray-100 p-2 text-left text-xs text-red-600 dark:bg-gray-800 dark:text-red-400">
          {error.message}
        </pre>
      )}

      <Button size="sm" onClick={resetErrorBoundary} className="gap-2">
        <RefreshCcw className="h-4 w-4" /> Thử lại
      </Button>
    </div>
  );
}

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional: fallback message override */
  fallbackMessage?: string;
}

/**
 * Error boundary cho từng feature/page — bắt lỗi render mà không crash toàn bộ app.
 *
 * Usage:
 * ```tsx
 * <FeatureErrorBoundary>
 *   <MyDashboardComponent />
 * </FeatureErrorBoundary>
 * ```
 */
export function FeatureErrorBoundary({ children }: FeatureErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={FeatureErrorFallback}
      onError={(error, info) => {
        console.error("[Feature Error]", error, info);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
