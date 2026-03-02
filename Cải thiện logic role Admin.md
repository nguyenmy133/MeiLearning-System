# 📊 BÁO CÁO RÀ SOÁT VÀ TỐI ƯU HÓA LOGIC NGHIỆP VỤ - ROLE ADMIN
**Project:** Hệ thống quản lý trung tâm đào tạo offline (EduTrack)
**Role Analyst:** BA + SA + QC
**Mục tiêu:** Rà soát, kiểm tra sự hợp lý, tìm rủi ro và đề xuất cải tiến cho các chức năng của Admin.

---

## 1. PHÂN TÍCH CHI TIẾT TỪNG MODULE CỦA ADMIN

### 1.1. Module: Dashboard (Tổng quan)
- **Điểm hợp lý:** Hiển thị các chỉ số tổng quan (số học sinh, số lớp đang mở, giáo viên, doanh thu).
- **Điểm chưa hợp lý:** Dữ liệu có thể rơi vào trạng thái "tĩnh", thiếu các bộ lọc theo thời gian (Hôm nay, Tuần này, Tháng/Năm này).
- **Rủi ro tiềm ẩn:** Khi dữ liệu lớn lên, việc query tính tổng doanh thu/học sinh theo realtime có thể làm chậm hệ thống. Do hệ thống giới hạn ở 3 roles (Admin, Teacher, User), Admin hiện tại gánh vác toàn bộ rủi ro về thông tin nhạy cảm.
- **Đề xuất cải tiến:**
  - Thêm bộ lọc filter dữ liệu theo thời gian thực để báo cáo trực quan cho Admin.
  - Áp dụng cơ chế **caching** cho dashboard để tối ưu tốc độ, đặc biệt với các chỉ số nặng như doanh thu.
- **Mức độ ưu tiên:** Medium

### 1.2. Module: Cơ sở vật chất (Phòng học, Trang thiết bị)
- **Điểm hợp lý:** Quản lý được danh sách phòng và thiết bị để phục vụ cho việc tạo lịch giảng dạy.
- **Điểm chưa hợp lý:** Form "Thêm mới Phòng học" bắt nhập "Trạng thái" là không cần thiết (Nên mặc định là Đang hoạt động khi mới tạo).
- **Rủi ro tiềm ẩn:** Xếp một lớp 35 người vào phòng có sức chứa chỉ 20 người. Phòng đang bảo trì nhưng vẫn bị xếp lịch.
- **Đề xuất cải tiến:**
  - Bỏ trường "Trạng thái" ở màn hình Thêm mới, tự động assign trạng thái mặc định (Active).
  - Về ràng buộc logic `Sức chứa (Capacity)`: Ở giai đoạn Mock Data đồ án, chưa cần code logic chặn (block) phức tạp, nhưng **nên hiển thị cảnh báo (Warning)** trên UI nếu xếp lớp vượt quá sức chứa để lấy điểm cộng từ hội đồng bảo vệ, chứng tỏ có system thinking.
- **Mức độ ưu tiên:** Medium

### 1.3. Module: Giáo viên
- **Điểm hợp lý:** Quản lý được thông tin hồ sơ và chuyên môn của giáo viên để xếp lớp.
- **Điểm chưa hợp lý:** Khi giáo viên xin nghỉ đột xuất hoặc nghỉ việc, các lớp họ "đang dạy" và "tương lai" chưa được xử lý luân chuyển.
- **Rủi ro tiềm ẩn:** Lỗi database (ràng buộc khóa ngoại không cho xóa) hoặc gây ra tình trạng lớp "vô chủ".
- **Đề xuất cải tiến:**
  - Sử dụng Soft Delete (Xóa mềm) / Quản lý trạng thái: `Đang làm việc`, `Tạm nghỉ`, `Đã nghỉ việc` (Tuyệt đối không Hard delete).
  - Khi vô hiệu hóa giáo viên, hệ thống phải **popup danh sách các lớp bị ảnh hưởng** và yêu cầu Admin Assign giáo viên mới.
- **Mức độ ưu tiên:** High

### 1.4. Module: Học viên
- **Điểm hợp lý:** Lưu trữ hồ sơ, liên hệ của người học để quản lý học phí và điểm danh.
- **Điểm chưa hợp lý:** Thiếu quản lý vòng đời (lifecycle) thực tế của một học viên offline. (Ví dụ: Ốm xin bảo lưu; kẹt lịch xin chuyển lớp).
- **Rủi ro tiềm ẩn:** Xóa trực tiếp dữ liệu học sinh làm hỏng toàn bộ dữ liệu báo cáo, điểm danh, lịch sử học phí (vi phạm nguyên tắc kế toán).
- **Đề xuất cải tiến:**
  - Quản lý trạng thái học viên: `Chờ xếp lớp` -> `Đang học` -> `Bảo lưu` -> `Thôi học` -> `Cựu học viên`.
  - Hỗ trợ luồng `Chuyển lớp` (Transfer) giữa kỳ, học phí/điểm danh phải di chuyển theo.
- **Mức độ ưu tiên:** High

### 1.5. Module: Môn học
- **Điểm hợp lý:** Quản lý thôngত্তি môn, số lượng buổi học tiêu chuẩn.
- **Điểm chưa hợp lý:** Giáo trình dạy offline sẽ thay đổi theo từng năm (update version).
- **Rủi ro tiềm ẩn:** Admin sửa số buổi học/ giá tiền của môn học từ 15 xuống 10 buổi. Các lớp năm ngoái query lại sẽ bị sai lệch hoàn toàn dữ liệu.
- **Đề xuất cải tiến:**
  - Môn học thiết kế theo Version (Hoặc khi đã có lớp học sinh ra từ môn đó thì **chặn** không cho edit số buổi/ nội dung cốt lõi, bắt tạo khóa mới).
- **Mức độ ưu tiên:** Medium

### 1.6. Module: Lớp học
- **Điểm hợp lý:** Nơi trung tâm gom chung Học viên, Giáo viên, Môn học vào 1 tiến trình.
- **Điểm chưa hợp lý:** Dễ xảy ra sai sót khi thêm một học viên vào một lớp đã chuẩn bị bế giảng.
- **Rủi ro tiềm ẩn:** Lớp đã vượt quá sĩ số nhưng vẫn cố nhét thêm, làm giảm chất lượng. Lớp trạng thái "Đã kết thúc" vẫn bị sửa đổi dữ liệu.
- **Đề xuất cải tiến:**
  - Workflow trạng thái rõ ràng: `Mở đăng ký` -> `Đang diễn ra` -> `Đã kết thúc`.
  - Khóa (Lock) thêm/xóa học viên nếu lớp ở trạng thái "Đã kết thúc".
- **Mức độ ưu tiên:** High

### 1.7. Module: Lịch học
- **Điểm hợp lý:** Cung cấp TKB toàn trung tâm, giúp vận hành trơn tru.
- **Điểm chưa hợp lý:** Tạo/chỉnh sửa thủ công hoàn toàn rủi ro và tốn nguồn lực.
- **Rủi ro tiềm ẩn:** Conflict tài nguyên (Trùng phòng, Trùng giáo viên ở 2 chi nhánh, Xếp ca học ngoài giờ hoạt động của trung tâm).
- **Đề xuất cải tiến:**
  - Có thuật toán **Conflict Verification**: Chặn lưu/báo chữ đỏ nếu trùng Giáo Viên hoặc trùng Phòng Học tại cùng một khoảng thời gian.
  - Hỗ trợ Auto-generate theo quy tắc (Tạo lịch lặp lại T2, T4, T6 tới lúc hết `số buổi của khóa học`).
- **Mức độ ưu tiên:** High

### 1.8. Module: Duyệt đổi lịch
- **Điểm hợp lý:** Đảm bảo giáo viên không tự ý thay đổi TKB làm ảnh hưởng uy tín và xáo trộn học sinh.
- **Điểm chưa hợp lý:** Khi Admin bấm "Duyệt" -> Học viên không biết, dẫn đến vẫn đi học vào giờ cũ.
- **Rủi ro tiềm ẩn:** Chuyển sang lịch học mới lại trùng với lịch của một học viên bất kỳ trong lớp đó (vì họ học 2 khóa cùng lúc).
- **Đề xuất cải tiến:**
  - Gửi Notification (App/Web/Zalo/Email) tự động đến toàn bộ học sinh của lớp đó ngay khi trạng thái đổi lịch được duyệt.
  - Test conflict trên chính TKB của toàn bộ học viên trong lớp trước khi cho Admin ấn Duyệt.
- **Mức độ ưu tiên:** High

### 1.9. Module: Điểm danh
- **Điểm hợp lý:** Nền tảng để tính học phí (trả sau) hoặc tính lương Giáo viên.
- **Điểm chưa hợp lý:** Role Admin thao tác điểm danh là sai thực tế. Teacher là người đứng lớp, Teacher mới được điểm danh.
- **Rủi ro tiềm ẩn:** Sai lệch/ Gian lận số buổi. Admin thao tác nhầm sẽ dẫn đến tranh chấp học phí.
- **Đề xuất cải tiến:**
  - Chuyển quyền thao tác Điểm danh (Write) cho Teacher.
  - Admin chỉ xem (Read-only) và có quyền Override (Sửa lại điểm danh sai) nhưng **phải bắt buộc ghi note lý do (Audit Trail)**.
- **Mức độ ưu tiên:** High

### 1.10. Module: Học phí
- **Điểm hợp lý:** Xử lý dòng tiền thanh toán trực tiếp của trung tâm.
- **Điểm chưa hợp lý:** Workflow hiện tại chỉ có đóng theo dạng thẳng tắp. Thiếu tính linh hoạt của offline (Thu thêm, Hoàn tiền, Xóa nợ).
- **Rủi ro tiềm ẩn:** User gian lận học phí bằng cách sửa/ xóa hóa đơn. Xóa hóa đơn làm lệch dòng thu chi thực tế của công ty.
- **Đề xuất cải tiến:**
  - Áp dụng nguyên lý Hóa Đơn: Cấm Hard delete Invoices dưới mọi hình thức, chỉ có trạng thái `Canceled`/`Refunded`.
  - Gắn chiết khấu (Discount) hoặc tính phí phạt trả chậm.
- **Mức độ ưu tiên:** High

### 1.11. Module: Báo cáo
- **Điểm hợp lý:** Cần thiết cho CEO, Giáo vụ.
- **Điểm chưa hợp lý:** Thường chỉ ở mức xem chứ không in được. Dễ bị sót dữ liệu quá khứ.
- **Rủi ro tiềm ẩn:** Crash server nếu sinh báo cáo động nặng trên CSDL thật dài.
- **Đề xuất cải tiến:** Bổ sung tính năng Export PDF (cho phiếu thu) và Export Excel (Cho doanh thu/bảng điểm).
- **Mức độ ưu tiên:** Medium

### 1.12. Module: Cấu hình QR
- **Điểm hợp lý:** Tiện lợi, công nghệ hóa quy trình điểm danh/thu tiền.
- **Điểm chưa hợp lý:** Nếu in một mã QR code tĩnh dán lên cửa, sinh viên ở nhà vẫn có thể lấy ảnh quét điểm danh để lách luật trốn học.
- **Rủi ro tiềm ẩn:** Gian lận điểm danh diện rộng. Thanh toán ngân hàng QR tĩnh làm quản lý không match được ai vừa đóng tiền.
- **Đề xuất cải tiến:**
  - Điểm danh: QR phải là Dynamic QR (OTP) đổi mã mỗi 30 - 60 giây, generate trên màn hình tivi/máy chiếu của giáo viên.
  - Thanh toán: Tích hợp VietQR có sẵn `Nội dung chuyển khoản = Tên HS + Mã Hóa Đơn` và số tiền cụ thể để Auto-Confirm biên lai.
- **Mức độ ưu tiên:** Medium


---

## 2. LUỒNG XỬ LÝ CHUẨN (WORKFLOW CHECK)

Để không có sự phụ thuộc gây lỗi logic, luồng dữ liệu trung tâm phải đi theo đúng Rule:
1. `Settings` (Phòng học, Môn học, Cấu hình) có trước.
2. `Teacher` và `User` onboarding.
3. Tạo `Lớp học` > Chọn Môn > Phân công Teacher.
4. Xếp `Lịch học` (Gen từ lịch cố định tuần).
5. Appove đưa user (Student) vào Lớp.
6. Lớp bắt đầu diễn ra ➡️ `Điểm danh` diễn ra theo daily.
7. Cuối tháng `Học phí` được tổng kết và xuất hóa đơn tự động dựa trên kết quả Điểm danh.

## 3. CHECKS CHO PHÂN QUYỀN VÀ BẢO MẬT

- **Phân quyền hệ thống:** Mức độ Đồ án tốt nghiệp thống nhất cấu trúc 3 Roles chính: `Admin`, `Teacher`, `User (Student)`. 
- **Đặc quyền Role Admin:** Admin có toàn quyền (God-mode) quản lý từ cấu hình, dữ liệu, xuất báo cáo và phê duyệt. Cần thiết kế giao diện Admin thật UX/UI rõ ràng, có Confirm Modal (VD: "Bạn có chắc muốn xoá/lưu?") trước các hành động quan trọng (Sửa TKB, Sửa hóa đơn, Xoá dữ liệu) để tránh thao tác sai bằng tay bởi vì chỉ có 1 Role Admin gánh vác toàn bộ vận hành hệ thống.

## 4. KIỂM TRA DỮ LIỆU EDGE CASES (MOCK DATA TEST CASES)

Với vai trò Software Tester, tôi đề xuất các Case sau để test trên UI lúc build:
1. **Lịch học âm:** Đổi lịch học của một buổi từ hôm nay về... tuần trước (Cần phải disable/bắt lỗi).
2. **Khóa liên đới:** Cố tình xóa Admin/Teacher đang có 3 lớp chuẩn bị giảng dạy -> Hệ thống Crash DB hay thông báo bắt Assign người mới?
3. **Thanh toán ảo:** Hóa đơn tháng là 2,000,000đ. Nhập thanh toán 3,000,000đ thì hệ thống có dư Có (Credit balance) hoặc báo lỗi không?
4. **Xung đột tài nguyên:** Đi xếp lịch dạy vào lúc "3:00 Sáng" hoặc xếp full sĩ số 100 em vào "Phòng Lab" có 15 máy tính.
5. **Duyệt đổi lịch vòng lặp:** Đổi lịch -> Duyệt -> Đổi lịch ngược về chỗ cũ -> Có cho phép không?

## 5. ĐỀ XUẤT BEST PRACTICES CHO ĐỒ ÁN TỐT NGHIỆP CỦA BẠN

Để ghi điểm tuyệt đối ở khâu System Analysis:
1. **Audit Logs (Lịch sử thao tác):** Trong các bảng cực kỳ nhạy cảm (Invoices, Attendance), thêm 1 table để lưu "Ai làm - Làm gì - Vào lúc nào". (VD: *Admin A đổi điểm danh Nguyễn Văn B từ Vắng -> Có mặt lúc 23:45*).
2. **Soft Deletion Architecture:** 100% các table Master (User, Teacher, Classes, Subject) áp dụng trường `is_deleted = boolean`. Tránh hỏng relation FK nối với các bảng con.
3. **Database Transaction:** Việc "Thu tiền" hoặc "Tạo lớp + Tạo lịch học (30 record)" cần được đưa vào Transaction DB. Nếu lỗi ở record 29 thì Rollback 100% lại từ đầu. Chống rác data.
4. **Trigger / Background Jobs:** Việc chốt sổ học phí, tính lương, báo cáo cuối tháng... nếu để Admin bấm thì nên xài Job Queue (như BullMQ/Redis) để hệ thống không bị đơ giật trong vài chục giây load.
