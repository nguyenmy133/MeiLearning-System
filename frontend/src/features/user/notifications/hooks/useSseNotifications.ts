import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/shared/auth/auth-context";
import { apiClient, getInMemoryToken } from "@/lib/api-client";

export function useSseNotifications() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const isConnected = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const token = getInMemoryToken();
    
    // Không kết nối nếu chưa đăng nhập hoặc không có token
    if (!isAuthenticated || !token) {
      if (controllerRef.current) {
        controllerRef.current.abort();
        isConnected.current = false;
      }
      return;
    }

    if (isConnected.current) return;

    controllerRef.current = new AbortController();
    isConnected.current = true;

    // Lấy thông tin BaseURL đang dùng từ Axios config
    const baseURL = apiClient.defaults.baseURL || "http://localhost:8080/api/v1";
    const sseUrl = `${baseURL}/notifications/stream`;

    const connectToSse = async () => {
      try {
        await fetchEventSource(sseUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          signal: controllerRef.current?.signal,
          async onopen(response) {
            if (response.ok && response.headers.get("content-type")?.includes("text/event-stream")) {
              console.log("[SSE] Connected to notification stream.");
            } else {
              throw new Error("Failed to connect to SSE stream");
            }
          },
          onmessage(ev) {
            if (ev.event === "CONNECT") {
              console.log("[SSE] Connect Server Message:", ev.data);
            } else if (ev.event === "PING") {
              // Ignore heartbeat
            } else if (ev.event === "NEW_NOTIFICATION") {
              try {
                const data = JSON.parse(ev.data);
                
                // 1. Gây chú ý bằng Toast Notification (Pop-up)
                toast.info(`🔔 ${data.title}`, {
                  description: data.content,
                  duration: 6000,
                  className: "bg-background border border-primary/20",
                });
                
                // 2. Refresh lại React-Query Cache để Chuông nảy số [1]
                queryClient.invalidateQueries({
                  predicate: (query) => query.queryKey[0] === "notifications",
                });

              } catch (e) {
                console.error("[SSE] Failed to parse notification payload", e);
              }
            }
          },
          onclose() {
            // Server đóng -> sẽ retry ngầm bởi fetchEventSource mặc định sau vài giây
            isConnected.current = false;
          },
          onerror(err) {
            console.error("[SSE] Connection error:", err);
            isConnected.current = false;
            // Throw throw err nếu muốn retry. Nếu chặn throw thì nó dừng luôn.
            // Timeout network thường fetch-event-source tự xử lý retry.
          }
        });
      } catch (err) {
         isConnected.current = false;
      }
    };

    connectToSse();

    // Cleanup khi User logout hoặc component unmount
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        isConnected.current = false;
        console.log("[SSE] Disconnected.");
      }
    };
  }, [isAuthenticated, queryClient]);
}
