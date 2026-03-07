import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// 1. Tạo instance của Axios
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Request Interceptor (Gắn Token vào mỗi Request gửi đi)
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Lấy token từ LocalStorage hoặc Zustand store
        const token = localStorage.getItem('accessToken');

        // Nếu có token, gắn nó vào header Authorization
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor (Xử lý tập trung kết quả trả về từ Backend)
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Xử lý dữ liệu trả về ở đây (có thể bóc tách response.data trực tiếp)
        return response.data;
    },
    async (error: AxiosError) => {
        // Original request configuration
        const originalRequest = error.config;

        // Xử lý lỗi 401 Unauthorized (Hết hạn Token hoặc chưa đăng nhập)
        if (error.response?.status === 401) {
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

            // Clear local state
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            // Redirect về trang Login
            window.location.href = '/login';
        }
        // Xử lý lỗi 403 Forbidden (Không có quyền truy cập)
        else if (error.response?.status === 403) {
            toast.error('Bạn không có quyền thực hiện thao tác này!');
        }
        // Xử lý lỗi 5xx Server Error
        else if (error.response?.status && error.response.status >= 500) {
            toast.error('Hệ thống đang bảo trì hoặc gặp sự cố. Vui lòng thử lại sau.');
        }
        // Lỗi mạng hoặc Timeout
        else if (error.code === 'ECONNABORTED' || !error.response) {
            toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.');
        }

        // Luôn trả về Promise.reject để React Query hoặc try-catch bắt được lỗi phía dưới
        return Promise.reject(error);
    }
);
