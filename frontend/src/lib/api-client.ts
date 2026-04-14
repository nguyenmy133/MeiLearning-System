  import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// ── In-memory token store (không bao giờ chạm localStorage) ──────────────────
// Module-level variable — sống trong JS heap, không đọc được qua XSS/DevTools
let inMemoryAccessToken: string | null = null;

export function setInMemoryToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getInMemoryToken(): string | null {
  return inMemoryAccessToken;
}

// ── Axios Instance ────────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
  withCredentials: true, // QUAN TRỌNG: gửi HttpOnly cookie cùng mọi request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ───────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = inMemoryAccessToken; // đọc từ memory, không phải localStorage
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// Backend: { data: T, message: String }
// Interceptor unwrap → service nhận { data: T, message: String }

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    // ── 401: thử refresh token trước khi logout ──────────────────────────────
    if (status === 401 && !originalRequest._retry) {
      // Không retry chính các endpoint auth để tránh vòng lặp vô hạn
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        if (isRefreshing) {
          // Đang refresh rồi — queue request lại
          return new Promise((resolve, reject) => {
            refreshQueue.push((newToken) => {
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                resolve(apiClient(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Gọi refresh — cookie tự gửi nhờ withCredentials: true
          const refreshResponse = await apiClient.post('/auth/refresh') as any;
          const newToken: string = refreshResponse.data?.accessToken ?? refreshResponse.accessToken;

          setInMemoryToken(newToken);
          processQueue(newToken);

          // Retry request gốc với token mới
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch {
          // Refresh cũng fail → phiên thực sự hết hạn
          processQueue(null);
          setInMemoryToken(null);
          localStorage.removeItem('user');
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = '/login';
        } finally {
          isRefreshing = false;
        }
      }
    }

    // ── Xử lý các status khác ────────────────────────────────────────────────
    if (status === 400) {
      const fieldErrors = error.response?.data?.errors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        Object.values(fieldErrors).forEach((msg) => toast.error(msg as string));
      } else {
        toast.error(serverMessage || 'Dữ liệu không hợp lệ.');
      }
    } else if (status === 403) {
      toast.error(serverMessage || 'Bạn không có quyền thực hiện thao tác này!');
    } else if (status === 409) {
      toast.error(serverMessage || 'Dữ liệu đã tồn tại.');
    } else if (status === 422) {
      toast.error(serverMessage || 'Dữ liệu không hợp lệ.');
    } else if (status && status >= 500) {
      toast.error('Hệ thống đang bảo trì hoặc gặp sự cố. Vui lòng thử lại sau.');
    } else if (error.code === 'ECONNABORTED' || !error.response) {
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.');
    }

    const err = new Error(serverMessage || error.message || 'Có lỗi xảy ra');
    return Promise.reject(err);
  }
);
