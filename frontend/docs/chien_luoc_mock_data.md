# Chiến Lược Phát Triển Frontend với Mock Data

Bạn đã hỏi một câu hỏi cực kỳ chính xác và mang tầm nhìn của một Senior Developer. Câu trả lời là: **CÓ, BẮT BUỘC NÊN LÀM MOCK DATA ĐẦY ĐỦ.**

Dưới đây là phân tích chi tiết tại sao nên làm và chiến lược triển khai để sau này nối với Backend (BE) một cách nhàn hạ nhất trong vòng 1 nốt nhạc.

---

## 1. TẠI SAO NÊN LÀM MOCK DATA ĐẦY ĐỦ?

Việc làm mock data đầy đủ từ bây giờ mang lại lợi thế khổng lồ cho đồ án của bạn:

* **Unblock Frontend (Giải phóng FE):** Khối lượng công việc FE (UI, xử lý state, routing) rất lớn. Việc có mock data giúp bạn hoàn thiện 100% FE mà không cần chờ BE viết xong API nào.
* **Định nghĩa API Contract (Hợp đồng API) sớm:** Khi viết mock data, bạn bị ép phải định dạng cấu trúc dữ liệu (Interfaces/Types). Đây chính là spec (tài liệu) để sau này BE (hay chính bạn) code BE dựa theo đúng cấu trúc này.
* **Mượt mà khi Demo:** Ngay cả khi chưa có BE, bạn vẫn có thể ấn tượng thầy cô bằng một UI hoàn chỉnh, có data "như thật", thao tác mượt mà.

---

## 2. CHIẾN LƯỢC CHUYỂN ĐỔI "MỘT CHẠM" TỪ MOCK SANG REAL API

Cái bẫy lớn nhất của sinh viên là lấy `mockData` dùng trực tiếp trong Component (như `AdminLeadsPage.tsx` hiện tại).

**Vấn đề:** Sau này có API thật, bạn phải đi sửa lại 50 trang UI khác nhau. Quá cực!

**Giải pháp chốt hạ: API SERVICE LAYER PATTERN**

Chúng ta phải tạo một tầng trung gian (Service Layer) nằm giữa UI và Mock Data. Tầng này sẽ giả lập việc gọi API có độ trễ (delay) như mạng thật.

### Bước 1: Tạo thư mục Services
Tạo một thư mục `src/services/` (hoặc `src/api/`). Ví dụ file `studentService.ts`:

```typescript
import { Student } from "@/features/admin/mockData";
import { mockStudents } from "@/features/admin/mockData";

// Giả lập độ trễ mạng (500ms)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const studentApi = {
  // Lấy danh sách
  getAll: async (): Promise<Student[]> => {
    await delay(500);
    return mockStudents;
  },

  // Thêm mới
  create: async (data: Partial<Student>): Promise<Student> => {
    await delay(500);
    const newStudent = { ...data, id: Date.now() } as Student;
    // (Trong thực tế nên lưu vào một state củamock để thấy data thay đổi)
    return newStudent;
  }
};
```

### Bước 2: Trong UI Component CHỈ GỌI SERVICE
Component tuyệt đối không biết `mockStudents` là gì. Nó chỉ biết gọi `studentApi.getAll()`.

```typescript
import { useEffect, useState } from "react";
import { studentApi } from "@/services/studentService";
import { Student } from "@/features/admin/mockData";

export function StudentPage() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
         const result = await studentApi.getAll(); // Gọi qua Service
         setData(result);
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  return <div>{/* Render bảng data */}</div>;
}
```

### Bước 3: Khoảnh Khắc "Ma Thuật" Khi Có Backend Thật
Tháng sau, bạn đã cài qua xong NodeJS/Postgres và có API thật là `http://localhost:3000/api/students`.

Bạn **KHÔNG CẦN CHẠM VÀO BẤT KỲ FILE GIAO DIỆN (.tsx) NÀO NỮA**. Bạn chỉ vào duy nhất file `studentService.ts` và sửa lại:

```typescript
import axios from 'axios';
import { Student } from "@/features/admin/mockData";

// XÓA MOCK DATA ĐI, DÙNG AXIOS
export const studentApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await axios.get('http://localhost:3000/api/students');
    return response.data;
  },
  
  create: async (data: Partial<Student>): Promise<Student> => {
    const response = await axios.post('http://localhost:3000/api/students', data);
    return response.data;
  }
};
```
***BÙM!*** 50 trang UI tự nhiên chạy với database thật mà không lỗi lấy một dòng.

---

## 3. LỜI KHUYÊN DÀNH CHO BẠN BÂY GIỜ

1. **Giữ nguyên thư mục Mock:** Những file dữ liệu giả tôi vừa viết cho bạn ở ổ `mockData/index.ts` là một kho tàng. Hãy tiếp tục thêm data vào đó nếu thấy thiếu.
2. **Refactor sớm:** Tuần tới, trước khi làm dở UI, hãy dành 1 ngày tạo ra thư mục `services/` như hướng dẫn trên và bọc tất cả các hàm mock lại thành các async function.
3. **Dùng React Query (Tùy chọn nâng cao nhưng RẤT khuyên dùng):** Nếu bạn muốn điểm đồ án cao hơn nữa và code nhàn hơn, đừng dùng `useEffect` + `setState`. Hãy cài `npm install @tanstack/react-query`. Nó sinh ra để giải quyết chuẩn xác bài toán kết nối API và cache data.

**Tóm lại:** Hãy tin tưởng vào mock data. Xây UI và Service bằng Mock thật kỹ. Đến lúc làm Backend xong, bạn sẽ thấy việc ghép nối dễ hiểu như lắp lego.
