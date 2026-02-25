# 📋 EduTrack – Phân Tích & Góp Ý Cải Thiện Hệ Thống

> **Ngày phân tích:** 25/02/2026  
> **Phiên bản:** Frontend hiện tại (React + TypeScript + shadcn/ui)  
> **Góc nhìn:** Senior Developer 10 năm kinh nghiệm  
> **Mục tiêu:** Rà soát phân quyền, nghiệp vụ, và tối ưu cho đồ án 1 tháng

---

## ⚠️ Phát Hiện Quan Trọng: Code Chưa Được Dọn Sạch

> [!CAUTION]
> Bạn nói đã bỏ các module **Analytics, Leads/CRM, Audit Log, Facilities** nhưng sau khi kiểm tra code thực tế, tất cả **vẫn còn nguyên** trong dự án:

| Module "đã bỏ" | Thực tế trong code |
|---|---|
| **Analytics nâng cao** | `admin/pages/analytics/` — vẫn có **14 files** |
| **Leads / CRM** | `AdminLeadsPage.tsx` + route `/admin/leads` + menu "Liên hệ" |
| **Audit Log** | `AdminAuditPage.tsx` + route `/admin/audit` + menu "Nhật ký" |
| **Facilities** | `AdminFacilitiesPage.tsx` + route tuy không khai báo nhưng file vẫn tồn tại, **và mock data multi-facility vẫn xuất hiện trong AdminClassesPage, AdminSchedulePage** |
| **Roles** | `AdminRolesPage.tsx` — file tồn tại, **không có route** |

**👉 Khuyến nghị:** Cần xóa sạch các file, import, route, và menu item của các module này. Đặc biệt, dữ liệu `facility` vẫn nằm rải rác trong `AdminClassesPage` (bộ lọc cơ sở, cột địa điểm) và `AdminSchedulePage` (bộ lọc cơ sở).

---

## 1️⃣ Bảng Phân Quyền Chi Tiết Theo Từng Role

### 1.1. Tổng quan chức năng đang hoạt động (có route trong App.tsx)

| # | Module | Admin | Teacher | User | Đánh giá |
|---|---|:---:|:---:|:---:|---|
| 1 | Dashboard | ✅ Tổng quan trung tâm | ✅ Tổng quan cá nhân | ✅ Tổng quan cá nhân | ✅ Tốt |
| 2 | Quản lý GV | ✅ CRUD | ❌ | ❌ | ✅ Đúng |
| 3 | Quản lý HV | ✅ CRUD | ❌ | ❌ | ✅ Đúng |
| 4 | Quản lý Môn học | ✅ CRUD | ❌ | ❌ | ✅ Đúng |
| 5 | Quản lý Lớp học | ✅ CRUD | ✅ Xem lớp mình | ❌ | ✅ Tốt |
| 6 | Lịch học | ✅ CRUD toàn bộ | ✅ Xem lịch dạy | ✅ Xem lịch học | ✅ Flow tốt |
| 7 | Điểm danh | ✅ Xem tổng hợp + Live | ✅ Điểm danh buổi học | ✅ Check-in QR | ✅ Flow tốt |
| 8 | Lịch sử điểm danh | ✅ Có trong Attendance | ❌ **Thiếu** | ✅ Xem cá nhân | ⚠️ |
| 9 | Tài liệu | ❌ **Thiếu giám sát** | ✅ Upload & quản lý | ✅ Xem & download | ⚠️ |
| 10 | Video bài giảng | ❌ | ❌ **Không ai upload** | ✅ Xem video | 🔴 Flow đứt |
| 11 | Bài thi | ❌ **Thiếu giám sát** | ✅ Tạo/sửa/kết quả | ✅ Làm bài/xem KQ | ⚠️ |
| 12 | Điểm & Nhận xét | ❌ | ✅ Nhập điểm | ❌ **Không xem được** | 🔴 Flow đứt |
| 13 | Học phí | ✅ Chốt sổ + QR | ❌ | ✅ Xem bill + QR | ✅ Flow tốt |
| 14 | Xin nghỉ / Đi muộn | ❌ **Không ai duyệt** | ❌ | ✅ Gửi đơn | 🔴 Flow đứt |
| 15 | Đổi lịch dạy | ❌ **Không ai duyệt** | ✅ Gửi yêu cầu | ❌ | 🔴 Flow đứt |
| 16 | Ticket hỗ trợ | ✅ Xử lý | ❌ | ✅ Gửi ticket | ✅ Flow tốt |
| 17 | Thông báo | ❌ **Không gửi được** | ✅ Xem | ✅ Xem | ⚠️ |
| 18 | Hồ sơ cá nhân | ❌ Chỉ dropdown | ✅ Trang riêng | ✅ Trang riêng | ⚠️ |
| 19 | Cấu hình QR | ✅ | ❌ | ❌ | ✅ Đúng |

---

## 2️⃣ Phân Tích Nghiệp Vụ – Góc Nhìn Senior

### 🔴 4 Flow Bị Đứt Gãy Nghiêm Trọng

Đây là những lỗi nghiệp vụ **không thể bỏ qua** nếu muốn demo hoặc bảo vệ đồ án:

#### 1. Xin nghỉ: Học viên gửi → Không ai duyệt
- `LeavePage.tsx` có form gửi, có danh sách đơn với trạng thái `pending/approved/rejected`
- Nhưng **cả Admin lẫn Teacher đều không có giao diện duyệt**
- **Fix gợi ý:** Thêm tab "Duyệt đơn nghỉ" vào `AdminAttendancePage` (vì liên quan chuyên cần) hoặc tạo mục riêng

#### 2. Đổi lịch: Teacher gửi yêu cầu → Không ai duyệt
- `TeacherReschedulePage.tsx` có form gửi yêu cầu đổi lịch
- Admin không có giao diện duyệt
- **Fix gợi ý:** Thêm tab "Yêu cầu đổi lịch" vào `AdminSchedulePage`

#### 3. Video: User xem → Không ai upload
- `VideoLibrary.tsx` và `VideoPlayer.tsx` hiển thị video YouTube embed
- Nhưng **không có trang upload** cho Teacher hay Admin
- **Fix gợi ý:** Gộp vào `TeacherDocumentsPage` (thêm tab Video) hoặc **loại bỏ module Video** cho đỡ dở dang

#### 4. Điểm: Teacher nhập → User không xem được
- `TeacherGradesPage.tsx` cho Teacher nhập điểm từng học viên theo lớp
- Nhưng User chỉ xem điểm từng bài thi qua `ExamResult.tsx`, **không có trang tổng hợp điểm**
- **Fix gợi ý:** Thêm trang "Kết quả học tập" cho User hoặc gộp điểm vào Dashboard

### 🟡 Thiếu Sót Đáng Lưu Ý

| Vấn đề | Chi tiết | Mức độ |
|---|---|:---:|
| Admin không gửi thông báo | Chỉ có badge notification trên header, không có trang tạo/gửi thông báo | Trung bình |
| Admin không giám sát tài liệu | Teacher upload thoải mái, Admin không xem/duyệt được | Nhẹ |
| Admin thiếu ProfilePage | Dropdown menu link đến `/admin/profile` nhưng không có route → 404 | Nhẹ |
| Teacher không xem lịch sử điểm danh | Chỉ điểm danh buổi hiện tại, không review lại các buổi trước | Nhẹ |
| Dữ liệu Multi-facility còn sót | `AdminClassesPage` có bộ lọc "Cơ sở Q1/Q3/TĐ", `AdminSchedulePage` có filter "Cơ sở" → nếu bỏ Facilities thì phải dọn mock data | Trung bình |

### ✅ Các Flow Đã Ăn Khớp Tốt

| Flow | Mô tả | Đánh giá |
|---|---|---|
| **Lớp học → Lịch → Điểm danh** | Admin tạo lớp + xếp GV → Auto hiện lịch cho Teacher/User → Điểm danh QR real-time | ⭐ Rất tốt |
| **Học phí post-paid** | Admin chốt sổ cuối tháng → Tạo bill hàng loạt → User xem bill + QR thanh toán → Admin duyệt đối soát | ⭐ Rất tốt |
| **Ticket hỗ trợ** | User tạo ticket → Admin xem/ghi chú/đổi trạng thái → Flow 2 chiều hoàn chỉnh | ⭐ Tốt |
| **Tài liệu** | Teacher upload → User download (thiếu Admin giám sát nhưng flow cơ bản đủ) | 👍 Chấp nhận |

---

## 3️⃣ Đề Xuất Tối Ưu Cho Đồ Án 1 Tháng

### Nguyên tắc chọn lọc

> **Giữ lại** những module tạo thành **flow end-to-end hoàn chỉnh** giữa các role.  
> **Loại bỏ** những module bị đứt flow hoặc quá phức tạp mà không tạo giá trị demo.

### ✅ Nên Giữ Lại (Flow hoàn chỉnh)

| Ưu tiên | Module | Lý do |
|:---:|---|---|
| 🔴 P0 | Đăng nhập + Route Guard | Bắt buộc, hiện chưa có middleware protect route |
| 🔴 P0 | CRUD GV, HV, Môn học, Lớp học | Nghiệp vụ cốt lõi CRUD |
| 🔴 P0 | Lịch học (3 role) | Flow liên kết giữa Admin → Teacher → User |
| 🔴 P0 | Điểm danh QR (3 role) | Tính năng highlight, gây ấn tượng khi demo |
| 🔴 P0 | Dashboard (3 role) | Tổng quan, ấn tượng đầu tiên khi mở app |
| 🟡 P1 | Học phí (Admin + User) | Flow tài chính tuyệt vời, đã code rất tốt |
| 🟡 P1 | Ticket (Admin + User) | Flow 2 chiều hoàn chỉnh, ít effort |
| 🟡 P1 | Thông báo + Hồ sơ | Cơ bản, đã có phần lớn code |
| 🟢 P2 | Tài liệu (Teacher + User) | Flow tương đối đủ, bonus tốt |

### ❌ Nên Loại Bỏ

| Module | Lý do | Effort tiết kiệm |
|---|---|:---:|
| **Video bài giảng** | Flow đứt hoàn toàn (không ai upload), effort lớn để fix | ~2 ngày |
| **Bài thi / Kiểm tra** | 5 file (ExamList, ExamTaking, ExamResult, CreateExamPage, TeacherExamManagement, TeacherExamResults) — cực kỳ phức tạp về backend (timer, chấm bài, anti-cheat) | ~5 ngày |
| **Điểm & Nhận xét** | Flow đứt (User không xem), phụ thuộc vào module Bài thi | ~1-2 ngày |
| **Xin nghỉ / Đi muộn** | Flow đứt, cần thêm trang duyệt cho Admin | ~1-2 ngày |
| **Đổi lịch dạy** | Flow đứt, cần thêm trang duyệt cho Admin | ~1-2 ngày |
| **Analytics** (14 files) | Quá nặng, trùng Dashboard | ~3-4 ngày |
| **Leads / CRM** | Không phải nghiệp vụ cốt lõi | ~2 ngày |
| **Audit Log** | Quá advanced cho đồ án | ~1 ngày |
| **Facilities** | Multi-branch quá phức tạp cho 1 trung tâm | ~1-2 ngày |
| **Reports Page** | Trùng 80% với Dashboard | ~2 ngày |

**Tổng tiết kiệm: ~20-25 ngày effort** → Tập trung vào quality thay vì quantity.

---

## 4️⃣ Kế Hoạch 4 Tuần Đề Xuất

### Tuần 1: Nền tảng & CRUD
- [ ] Dọn sạch các module đã bỏ (xóa file, route, menu, mock data facility rải rác)
- [ ] Thêm Route Guard / ProtectedRoute cho phân quyền
- [ ] Hoàn thiện luồng Login → redirect theo role
- [ ] CRUD Giáo viên + Học viên + Môn học (kết nối API)

### Tuần 2: Nghiệp vụ chính
- [ ] CRUD Lớp học → gán GV, gán Môn, gán Phòng
- [ ] Lịch học (Admin tạo → Teacher xem → User xem)
- [ ] Điểm danh QR (flow 3 role)
- [ ] Dashboard 3 role (kết nối data thực)

### Tuần 3: Tính năng bổ sung
- [ ] Học phí (Admin chốt sổ → User xem bill + QR)
- [ ] Ticket hỗ trợ (User gửi → Admin xử lý)
- [ ] Thông báo (Admin gửi → Teacher/User xem)
- [ ] Hồ sơ cá nhân

### Tuần 4: Hoàn thiện
- [ ] Tài liệu (Teacher upload → User xem) — nếu còn thời gian
- [ ] Fix bug + Polish UI
- [ ] Deploy + Test tổng thể
- [ ] Viết báo cáo đồ án

---

## 5️⃣ Góp Ý Kiến Trúc Code

### Vấn đề hiện tại & đề xuất cải thiện

| Vấn đề | Hiện trạng | Đề xuất |
|---|---|---|
| **Không có Route Guard** | Ai cũng truy cập được `/admin/*`, `/teacher/*` | Thêm `ProtectedRoute` component kiểm tra role |
| **Mock data rải rác** | Mỗi page tự define mock data inline | Tập trung vào `services/` hoặc `api/` directory |
| **3 Layout gần giống nhau** | `AdminLayout`, `TeacherLayout`, `UserLayout` copy-paste ~90% | Tạo `BaseLayout` nhận props `menuItems`, `role`, `userName` |
| **Không có global state** | Chưa có auth context, user info | Thêm `AuthContext` hoặc dùng Zustand |
| **Dead code** | Files tồn tại nhưng không dùng | Xóa `AdminRolesPage`, `AdminFacilitiesPage`, `analytics/` |

---

## 6️⃣ Tổng Kết

| Tiêu chí | Điểm | Nhận xét |
|---|:---:|---|
| UI / UX | **9/10** | Rất đẹp, professional, responsive, dark mode |
| Phân quyền | **5/10** | Có tách route nhưng thiếu guard, 4 flow đứt |
| Nghiệp vụ | **6/10** | Các flow chính tốt, nhưng nhiều module dở dang |
| Kiến trúc | **6/10** | Cấu trúc rõ nhưng thiếu shared pattern |
| Khả thi 1 tháng | **4/10** | Scope hiện tại quá lớn (~40 pages), cần cắt 40% |

> **Kết luận:** Dự án có nền tảng UI rất tốt. Cần **tập trung dọn dẹp code thừa** + **hoàn thiện 8-10 module cốt lõi** thay vì dàn trải 25+ trang. Đồ án 1 tháng với **10 module hoàn chỉnh end-to-end** sẽ ghi điểm cao hơn **25 module nửa vời**.
