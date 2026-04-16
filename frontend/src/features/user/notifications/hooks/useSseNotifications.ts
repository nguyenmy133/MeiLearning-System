import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/shared/auth/auth-context";
import { apiClient, getInMemoryToken } from "@/lib/api-client";

/**
 * Max size of the processed notification set.
 * Prevents memory leak from accumulating IDs indefinitely.
 */
const DEDUP_MAX_SIZE = 200;

export function useSseNotifications() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const isConnected = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  // Dedup set: track recently processed notification IDs to prevent duplicates
  // from SSE reconnection or retry delivering the same event twice.
  const processedIds = useRef<Set<number>>(new Set());

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
                const notifId = data.id;

                // ── Dedup guard: skip if already processed ──
                if (notifId && processedIds.current.has(notifId)) {
                  console.debug("[SSE] Skipping duplicate notification:", notifId);
                  return;
                }

                // Track this notification ID
                if (notifId) {
                  processedIds.current.add(notifId);
                  // Evict oldest entries to prevent memory leak
                  if (processedIds.current.size > DEDUP_MAX_SIZE) {
                    const firstId = processedIds.current.values().next().value;
                    if (firstId !== undefined) processedIds.current.delete(firstId);
                  }
                }
                
                // 1. Toast with unique ID to prevent duplicate popups
                toast.info(`🔔 ${data.title}`, {
                  id: `notif-${notifId ?? Date.now()}`,
                  description: data.content,
                  duration: 6000,
                  className: "bg-background border border-primary/20",
                });
                
                // 2. Refresh React-Query Cache (Global Event Bus)
                // Invalidate notifications list itself
                queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "notifications" });
                queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });

                // Smart Invalidation based on notification type/title to ensure realtime UI sync
                const typeMatcher = String(data.type).toLowerCase() + " " + String(data.title).toLowerCase();
                
                if (typeMatcher.includes("leave")) {
                  queryClient.invalidateQueries({ predicate: (q) => q.queryKey.some(k => typeof k === 'string' && k.includes("leave")) });
                }
                if (typeMatcher.includes("reschedule")) {
                  queryClient.invalidateQueries({ predicate: (q) => q.queryKey.some(k => typeof k === 'string' && k.includes("reschedule")) });
                }
                if (typeMatcher.includes("exam") || typeMatcher.includes("grade") || typeMatcher.includes("result")) {
                  queryClient.invalidateQueries({ predicate: (q) => q.queryKey.some(k => typeof k === 'string' && k.includes("exam")) });
                }
                if (typeMatcher.includes("payment") || typeMatcher.includes("tuition")) {
                  queryClient.invalidateQueries({ predicate: (q) => q.queryKey.some(k => typeof k === 'string' && k.includes("tuition")) });
                  queryClient.invalidateQueries({ predicate: (q) => q.queryKey.some(k => typeof k === 'string' && k.includes("payment")) });
                }
                if (typeMatcher.includes("attendance")) {
                  queryClient.invalidateQueries({ predicate: (q) => q.queryKey.some(k => typeof k === 'string' && k.includes("attendance")) });
                }
                if (typeMatcher.includes("class") || typeMatcher.includes("schedule")) {
                  queryClient.invalidateQueries({ predicate: (q) => q.queryKey.some(k => typeof k === 'string' && k.includes("class")) });
                  queryClient.invalidateQueries({ predicate: (q) => q.queryKey.some(k => typeof k === 'string' && k.includes("schedule")) });
                }

              } catch (e) {
                console.error("[SSE] Failed to parse notification payload", e);
              }
            }
          },
          onclose() {
            // Server đóng -> fetchEventSource sẽ retry
            isConnected.current = false;
          },
          onerror(err) {
            console.error("[SSE] Connection error:", err);
            isConnected.current = false;
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
