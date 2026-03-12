import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// ── Axios Instance ────────────────────────────────────────────────────────────

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request Interceptor ───────────────────────────────────────────────────────

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// Backend trả về: { data: T, message: String }   (ApiResponse wrapper)
// Interceptor trả: { data: T, message: String }
// Service dùng:    const { data } = await apiClient.get(...)  → data = T

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Trả về response.data = { data: T, message: "..." }
        return response.data;
    },
    async (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
        const status = error.response?.status;
        const serverMessage = error.response?.data?.message;

        if (status === 401) {
            toast.error(serverMessage || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } else if (status === 403) {
            toast.error(serverMessage || 'Bạn không có quyền thực hiện thao tác này!');
        } else if (status === 422) {
            // Business error — hiển thị message từ backend
            toast.error(serverMessage || 'Dữ liệu không hợp lệ.');
        } else if (status && status >= 500) {
            toast.error('Hệ thống đang bảo trì hoặc gặp sự cố. Vui lòng thử lại sau.');
        } else if (error.code === 'ECONNABORTED' || !error.response) {
            toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.');
        }

        // Tạo Error với message từ server để React Query / catch bắt được
        const err = new Error(serverMessage || error.message || 'Có lỗi xảy ra');
        return Promise.reject(err);
    }
);
