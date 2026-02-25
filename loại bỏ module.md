# 🗑️ Phân Tích Loại Bỏ Module – EduTrack

> **Ngày:** 25/02/2026 | **Góc nhìn:** Senior Developer

---

## 📋 Yêu Cầu Loại Bỏ

| Role | Module cần bỏ | File chính |
|---|---|---|
| **User** | Ticket hỗ trợ | `TicketsPage.tsx` |
| **Admin** | Liên hệ (Leads/CRM) | `AdminLeadsPage.tsx` |
| **Admin** | Cơ sở & Phòng (Facilities) | `AdminFacilitiesPage.tsx` |
| **Admin** | Nhật ký (Audit Log) | `AdminAuditPage.tsx` |
| **Admin** | Hỗ trợ (Tickets) | `AdminTicketsPage.tsx` |

---

## ⚠️ Lời Khuyên Trước Khi Loại Bỏ

### 🔴 CẢNH BÁO: Bỏ Ticket ở cả 2 phía = Xóa hoàn toàn kênh liên lạc 2 chiều

Bạn đang bỏ **User Ticket** + **Admin Hỗ trợ** cùng lúc. Đây là một trong vài flow **end-to-end hoàn chỉnh** nhất trong dự án (User gửi → Admin xử lý → đổi trạng thái).

**Phân tích:**
- **Ưu điểm khi bỏ:** Giảm 2 page + effort backend, tập trung scope
- **Nhược điểm:** Mất kênh giao tiếp 2 chiều duy nhất giữa học viên và trung tâm. Hội đồng chấm đồ án có thể hỏi: *"Học viên gặp vấn đề thì phản hồi bằng cách nào?"*

> [!IMPORTANT]
> **Khuyến nghị:** Nếu bỏ Ticket, hãy **bổ sung vào module Thông báo** khả năng gửi tin nhắn/phản hồi, để hệ thống không hoàn toàn thiếu kênh liên lạc. Hoặc giữ Ticket ở dạng đơn giản nhất (chỉ danh sách + trạng thái, bỏ phần chat chi tiết).

### ✅ Leads, Audit, Facilities – An toàn để bỏ

| Module | Đánh giá |
|---|---|
| **Leads/CRM** | Không phải nghiệp vụ cốt lõi của trung tâm học, bỏ hoàn toàn hợp lý |
| **Audit Log** | Tính năng enterprise-grade, không cần cho đồ án |
| **Facilities** | Multi-branch phức tạp, bỏ hợp lý. Nhưng **cần dọn sạch tàn dư** trong các page khác |

---

## 🔍 Bản Đồ Tác Động (Impact Map)

### 1. Leads/CRM → Tác động đến `AdminDashboard`

| Vị trí bị ảnh hưởng | File | Dòng | Chi tiết |
|---|---|:---:|---|
| Alert "12 lead mới" | `AdminDashboard.tsx` | 137-139 | Cần xóa item trong mảng `alerts` |
| Quick stat "Lead chờ xử lý" | `AdminDashboard.tsx` | 506-513 | Cần xóa item trong quick stats |
| Menu sidebar "Liên hệ" | `AdminLayout.tsx` | 47 | Xóa menu item |
| Route `/admin/leads` | `App.tsx` | 62, 134 | Xóa import + route |
| Mock data interfaces | `mockData/index.ts` | Lead interface + `mockLeads` | Xóa |

### 2. Tickets (cả 2 phía) → Tác động đến `AdminDashboard`

| Vị trí bị ảnh hưởng | File | Dòng | Chi tiết |
|---|---|:---:|---|
| Quick stat "Yêu cầu hỗ trợ" | `AdminDashboard.tsx` | 522-529 | Cần xóa item |
| Menu sidebar Admin "Hỗ trợ" | `AdminLayout.tsx` | 48 | Xóa menu item |
| Menu sidebar User "Ticket" | `UserLayout.tsx` | 43 | Xóa menu item |
| Route `/admin/tickets` | `App.tsx` | 63, 135 | Xóa import + route |
| Route `/user/tickets` | `App.tsx` | 31, 101 | Xóa import + route |

### 3. Audit → Tác động **nhỏ, an toàn**

| Vị trí bị ảnh hưởng | File | Dòng | Chi tiết |
|---|---|:---:|---|
| Menu sidebar "Nhật ký" | `AdminLayout.tsx` | 50 | Xóa menu item |
| Route `/admin/audit` | `App.tsx` | 66, 138 | Xóa import + route |
| Mock data | `mockData/index.ts` | AuditLog interface + `mockAuditLogs` | Xóa |

### 4. Facilities → ⚠️ Tác động **LAN RỘNG**, cần dọn kỹ

> [!WARNING]
> Đây là module có **tentacle** (tàn dư) nhiều nhất, phải dọn cẩn thận:

| Vị trí bị ảnh hưởng | File | Chi tiết cần sửa |
|---|---|---|
| Mock data lớp học | `AdminClassesPage.tsx` | Xóa field `facility` khỏi 5 mock entries, xóa `filterFacility` state, xóa filter select "Cơ sở", xóa cột "Địa điểm" (giữ lại `room`) |
| Bộ lọc cơ sở | `AdminClassesPage.tsx` | Xóa biến `facilities`, xóa `<Select>` filter facility |
| Form tạo lớp mới | `AdminClassesPage.tsx` | Xóa select "Cơ sở" trong dialog (giữ "Phòng học") |
| Mock data lịch học | `AdminSchedulePage.tsx` | Xóa field `facility` khỏi 11 session entries |
| Bộ lọc cơ sở | `AdminSchedulePage.tsx` | Xóa `selectedFacility` state, xóa biến `facilities`, xóa `<Select>` filter |
| Badge cơ sở | `AdminSchedulePage.tsx` | Xóa `{session.facility}` trong badge hiển thị |
| Form thêm buổi học | `AdminSchedulePage.tsx` | Xóa select "Cơ sở" trong dialog |
| Mock data interfaces | `mockData/index.ts` | Xóa `Facility` interface, xóa `facility` field trong các interface khác |

---

## 📊 Tổng Kết Thao Tác

| Hành động | Số lượng |
|---|:---:|
| **Files cần XÓA** | 5 files + thư mục `analytics/` (14 files) |
| **Files cần SỬA** | 5 files |
| **Mock data cần dọn** | 1 file (`mockData/index.ts`) |

### Files cần XÓA hoàn toàn:

```
❌ src/features/user/pages/TicketsPage.tsx
❌ src/features/admin/pages/AdminLeadsPage.tsx
❌ src/features/admin/pages/AdminFacilitiesPage.tsx
❌ src/features/admin/pages/AdminAuditPage.tsx
❌ src/features/admin/pages/AdminTicketsPage.tsx
❌ src/features/admin/pages/AdminRolesPage.tsx (dead code, không có route)
❌ src/features/admin/pages/analytics/ (toàn bộ thư mục)
```

### Files cần SỬA:

```
✏️ src/App.tsx                              → Xóa 5 import + 5 route
✏️ src/features/admin/AdminLayout.tsx        → Xóa 4 menu items
✏️ src/features/user/UserLayout.tsx          → Xóa 1 menu item
✏️ src/features/admin/pages/AdminDashboard.tsx → Xóa 1 alert + 2 quick stats
✏️ src/features/admin/pages/AdminClassesPage.tsx → Dọn facility data
✏️ src/features/admin/pages/AdminSchedulePage.tsx → Dọn facility data
✏️ src/features/admin/mockData/index.ts      → Dọn interfaces + mock data
```

---

## ✅ Kết Luận

| Module | Quyết định | Rủi ro |
|---|:---:|:---:|
| Leads/CRM | ✅ Bỏ | Thấp |
| Audit Log | ✅ Bỏ | Không |
| Facilities | ✅ Bỏ | Trung bình (cần dọn kỹ) |
| Admin Tickets | ⚠️ Xem xét | Mất kênh hỗ trợ |
| User Tickets | ⚠️ Xem xét | Mất kênh phản hồi |

> [!TIP]
> **Nếu quyết định bỏ Ticket**, hãy thay thế bằng cách thêm nút "Liên hệ hỗ trợ" (link Zalo/Phone) vào User sidebar hoặc Dashboard, để học viên vẫn có kênh liên lạc.

**Bạn muốn tôi tiến hành loại bỏ không? Nếu có, hãy confirm:**
1. Bỏ hẳn Ticket (cả 2 phía) hay giữ lại dạng đơn giản?
2. Cần thêm nút liên hệ Zalo/Phone thay thế không?
