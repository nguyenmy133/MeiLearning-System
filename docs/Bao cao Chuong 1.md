# CHƯƠNG 1. KHẢO SÁT HỆ THỐNG

---

## 1.1. Giới thiệu đề tài

### 1.1.1. Tên đề tài

**Xây dựng hệ thống quản lý trung tâm dạy thêm trực tuyến — MeiLearning System**

### 1.1.2. Lý do chọn đề tài (Tính cấp thiết)

Trong bối cảnh giáo dục Việt Nam hiện nay, hoạt động dạy thêm — học thêm đóng vai trò quan trọng trong việc bổ trợ kiến thức cho học sinh, đặc biệt là học sinh trung học phổ thông (THPT) đang chuẩn bị cho các kỳ thi quan trọng. Các trung tâm dạy thêm tư nhân ngày càng phát triển về quy mô với số lượng học viên, giáo viên, lớp học, cơ sở vật chất ngày càng lớn. Tuy nhiên, phần lớn các trung tâm vẫn đang quản lý hoạt động theo phương thức thủ công hoặc sử dụng các công cụ rời rạc như sổ sách giấy, bảng tính Excel, Zalo/Facebook để liên lạc. Điều này dẫn đến nhiều bất cập:

- **Quản lý thông tin phân tán**: Thông tin về học viên, giáo viên, lớp học, lịch dạy được lưu trữ trên nhiều file khác nhau, thiếu tính đồng bộ và khó tra cứu.
- **Điểm danh thủ công**: Giáo viên phải điểm danh bằng sổ giấy hoặc bảng tính, dẫn đến sai sót, khó thống kê và không thể thông báo kịp thời cho phụ huynh khi học viên vắng mặt.
- **Thu học phí phức tạp**: Việc tính toán học phí theo số buổi học thực tế, theo dõi tình trạng đóng phí, nhắc nhở học phí quá hạn đều được thực hiện thủ công, tốn nhiều thời gian và dễ xảy ra nhầm lẫn.
- **Quản lý lịch dạy khó khăn**: Khi có sự thay đổi lịch dạy (dời lịch, hủy buổi, dạy bù), việc thông báo đến tất cả các bên liên quan (giáo viên, học viên, phụ huynh) thường không kịp thời và không đầy đủ.
- **Thiếu công cụ đánh giá tổng hợp**: Việc theo dõi tiến độ học tập, chấm điểm, tạo bài kiểm tra trực tuyến và xuất báo cáo thống kê đều gặp khó khăn khi không có một hệ thống thông tin tập trung.

Trước những thách thức đó, việc xây dựng một **hệ thống quản lý trung tâm dạy thêm trực tuyến** là nhu cầu cấp thiết, giúp số hóa toàn bộ quy trình vận hành, nâng cao hiệu quả quản lý và cải thiện trải nghiệm cho tất cả các bên liên quan.

### 1.1.3. Giới thiệu về khách hàng

Khách hàng của hệ thống là các **trung tâm dạy thêm tư nhân** có quy mô vừa và nhỏ, chuyên cung cấp các khóa học bổ trợ kiến thức cho học sinh trung học phổ thông (lớp 10, 11, 12). Các trung tâm này có đặc điểm chung:

- Có **nhiều cơ sở (chi nhánh)** tại các địa bàn khác nhau, mỗi cơ sở gồm nhiều phòng học với sức chứa khác nhau.
- Đội ngũ **giáo viên** đa dạng, mỗi giáo viên có thể dạy một hoặc nhiều môn học và phụ trách nhiều lớp.
- Dạy đa dạng các **môn học** thuộc nhiều lĩnh vực: Tự nhiên (Toán, Lý, Hóa, Sinh), Xã hội (Văn, Sử, Địa), Ngoại ngữ (Tiếng Anh), Công nghệ (Tin học)...
- Số lượng **học viên** có thể từ vài chục đến vài trăm, mỗi học viên có thể đăng ký nhiều lớp học cùng lúc.
- Hoạt động theo mô hình **thu học phí theo tháng**, tính dựa trên số buổi học thực tế trong tháng đó.

---

## 1.2. Khảo sát hiện trạng

Phần này mô tả chi tiết hiện trạng hoạt động của trung tâm dạy thêm **trước khi** có hệ thống MeiLearning, bao gồm cơ cấu tổ chức, các đối tượng liên quan, nghiệp vụ thường xuyên và nghiệp vụ định kỳ.

### 1.2.1. Cơ cấu tổ chức

Cơ cấu tổ chức của trung tâm dạy thêm gồm các thành phần chính sau:

```
                      ┌──────────────────┐
                      │   QUẢN LÝ TRUNG  │
                      │       TÂM        │
                      │   (Admin/Chủ TT) │
                      └────────┬─────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼──────┐  ┌─────▼──────┐  ┌──────▼───────┐
     │   GIÁO VIÊN   │  │  CƠ SỞ 1  │  │   CƠ SỞ 2   │
     │  (Nhiều GV)   │  │ (Phòng học)│  │  (Phòng học) │
     └────────┬──────┘  └────────────┘  └──────────────┘
              │
     ┌────────▼──────┐
     │   HỌC VIÊN    │
     │ (Nhiều HV)    │
     └───────────────┘
```

### 1.2.2. Các đối tượng liên quan

Hệ thống hiện tại (trước khi có website) liên quan đến **ba đối tượng chính**:

| STT | Đối tượng | Vai trò | Mô tả |
|:---:|-----------|---------|-------|
| 1 | **Quản lý trung tâm (Admin)** | Người quản lý toàn bộ hoạt động | Chịu trách nhiệm quản lý giáo viên, học viên, lớp học, cơ sở vật chất, lịch dạy, thu học phí, theo dõi điểm danh, xem báo cáo thống kê. Là người ra quyết định duyệt/từ chối các yêu cầu từ giáo viên và học viên. |
| 2 | **Giáo viên (Teacher)** | Người trực tiếp giảng dạy | Phụ trách dạy một hoặc nhiều môn học, quản lý lớp học được phân công, điểm danh học viên mỗi buổi, chấm điểm, tạo bài kiểm tra, chia sẻ tài liệu học tập, và có thể gửi yêu cầu xin nghỉ dạy hoặc dời lịch dạy. |
| 3 | **Học viên (Student)** | Người tham gia học tập | Đăng ký và tham gia các lớp học, điểm danh mỗi buổi học, làm bài kiểm tra, xem điểm số, xem tài liệu, đóng học phí, và có thể gửi yêu cầu xin nghỉ học. Phụ huynh có thể theo dõi tình trạng của con thông qua thông báo điện thoại/email. |

### 1.2.3. Nghiệp vụ thường xuyên (Hàng ngày)

Các nghiệp vụ thường xuyên diễn ra hàng ngày tại trung tâm bao gồm:

**a) Nghiệp vụ của Quản lý trung tâm (Admin):**

| STT | Nghiệp vụ | Mô tả hiện trạng (thủ công) | Vấn đề gặp phải |
|:---:|-----------|------------------------------|-----------------|
| 1 | Quản lý thông tin học viên | Ghi chép thông tin học viên vào sổ hoặc file Excel: họ tên, SĐT, SĐT phụ huynh, ngày sinh, lớp trường, địa chỉ | Khó tìm kiếm, dễ sai sót khi cập nhật, không đồng bộ giữa các cơ sở |
| 2 | Quản lý thông tin giáo viên | Lưu trữ hồ sơ giáo viên bằng giấy tờ hoặc file: họ tên, SĐT, email, môn dạy, ngày gia nhập | Thiếu tập trung, khó theo dõi trạng thái hoạt động |
| 3 | Điều phối lớp học | Phân công giáo viên vào lớp, xếp phòng, xếp lịch bằng bảng tính Excel | Dễ trùng lịch, khó theo dõi khi có nhiều lớp |
| 4 | Theo dõi điểm danh | Nhận báo cáo điểm danh từ giáo viên qua sổ giấy hoặc tin nhắn | Không cập nhật real-time, phụ huynh không được thông báo kịp thời khi con vắng |
| 5 | Duyệt yêu cầu dời lịch/xin nghỉ | Nhận yêu cầu qua Zalo/gọi điện, xử lý bằng trao đổi trực tiếp | Không có hệ thống theo dõi, dễ bỏ sót yêu cầu |
| 6 | Ghi nhận ghi danh/chuyển lớp | Ghi chép thủ công việc học viên đăng ký lớp mới hoặc chuyển lớp | Không đồng bộ giữa các bộ phận |

**b) Nghiệp vụ của Giáo viên:**

| STT | Nghiệp vụ | Mô tả hiện trạng (thủ công) | Vấn đề gặp phải |
|:---:|-----------|------------------------------|-----------------|
| 1 | Điểm danh buổi học | Gọi tên từng học viên, ghi vào sổ điểm danh giấy | Tốn thời gian đầu giờ, dễ nhầm lẫn, không thông báo được cho phụ huynh |
| 2 | Giảng dạy và quản lý lớp | Dạy theo lịch cố định, theo dõi danh sách học viên trong lớp | Khi có thay đổi (thêm/bớt học viên) thường không được cập nhật kịp thời |
| 3 | Chấm điểm và nhận xét | Ghi điểm bài kiểm tra vào sổ, nhận xét bằng giấy | Phụ huynh/học viên khó tra cứu, giáo viên khó theo dõi xu hướng tiến bộ |
| 4 | Chia sẻ tài liệu | Photocopy tài liệu hoặc gửi qua Zalo/email | Thiếu hệ thống lưu trữ tập trung, học viên dễ thất lạc tài liệu |
| 5 | Gửi yêu cầu xin nghỉ/dời lịch | Liên hệ admin qua Zalo hoặc điện thoại | Không có quy trình duyệt rõ ràng, khó theo dõi trạng thái yêu cầu |

**c) Nghiệp vụ của Học viên:**

| STT | Nghiệp vụ | Mô tả hiện trạng (thủ công) | Vấn đề gặp phải |
|:---:|-----------|------------------------------|-----------------|
| 1 | Tham gia lớp học | Đến lớp theo lịch, nghe giáo viên gọi tên điểm danh | Phụ huynh không biết con có đến lớp hay không |
| 2 | Xem lịch học | Được phát lịch giấy hoặc tự ghi nhớ | Khi có thay đổi (dời lịch, hủy buổi) thường không được thông báo kịp |
| 3 | Làm bài kiểm tra | Làm bài trên giấy tại lớp | Khó tổ chức kiểm tra đồng bộ, chấm chậm, khó thống kê kết quả |
| 4 | Đóng học phí | Đóng tiền mặt trực tiếp hoặc chuyển khoản, nhận biên lai giấy | Khó theo dõi lịch sử thanh toán, dễ quên hạn đóng phí |
| 5 | Xin nghỉ học | Nhắn tin/gọi điện cho giáo viên hoặc admin | Không có hệ thống ghi nhận, giáo viên có thể không nhận được tin |

### 1.2.4. Nghiệp vụ định kỳ

Ngoài các nghiệp vụ hàng ngày, trung tâm còn có các nghiệp vụ diễn ra theo định kỳ:

| STT | Nghiệp vụ | Tần suất | Mô tả hiện trạng (thủ công) | Vấn đề gặp phải |
|:---:|-----------|----------|------------------------------|-----------------|
| 1 | **Tính và thu học phí** | Hàng tháng | Admin đếm số buổi học của từng học viên trong tháng, nhân với đơn giá, tạo hóa đơn bằng Excel, gửi thông báo thu phí qua Zalo/SMS | Rất mất thời gian với lượng học viên lớn, dễ tính sai số buổi, khó xác nhận thanh toán |
| 2 | **Thống kê điểm danh** | Hàng tháng | Tổng hợp sổ điểm danh giấy, tính tỷ lệ đi học/vắng cho từng học viên, từng lớp | Tốn nhiều công sức, số liệu thường bị chậm |
| 3 | **Tạo lịch dạy cho tháng/kỳ mới** | Đầu tháng/đầu kỳ | Xếp lịch dạy cho tất cả các lớp, phân phòng, tránh trùng giờ giáo viên | Phức tạp khi quy mô lớn, dễ xung đột lịch |
| 4 | **Báo cáo doanh thu** | Hàng tháng/quý | Admin tổng hợp thu chi từ sổ sách, tạo báo cáo bằng Excel | Thiếu chính xác, mất nhiều thời gian thống kê |
| 5 | **Đánh giá học viên** | Cuối tháng/cuối kỳ | Giáo viên viết nhận xét, chấm điểm tổng kết cho từng học viên trong lớp | Nhận xét thường chung chung, không có dữ liệu cụ thể để đánh giá xu hướng tiến bộ |
| 6 | **Tổ chức bài kiểm tra** | Định kỳ (tùy lớp) | In đề kiểm tra giấy, tổ chức thi tại lớp, chấm bài thủ công | Mất thời gian in ấn, chấm bài; khó tổ chức kiểm tra đồng loạt nhiều lớp |
| 7 | **Xử lý học viên nghỉ/bỏ học** | Khi phát sinh | Ghi nhận ngày nghỉ, lý do nghỉ vào sổ; xử lý hoàn học phí (nếu có) | Thiếu quy trình chuẩn, khó tra cứu lịch sử |
| 8 | **Gửi thông báo chung** | Khi cần thiết | Gửi tin nhắn qua nhóm Zalo/gọi điện từng người | Không đảm bảo tất cả đều nhận được, khó quản lý nội dung đã gửi |

### 1.2.5. Nhận xét hiện trạng

Qua khảo sát, có thể nhận thấy hệ thống quản lý hiện tại của trung tâm dạy thêm tồn tại nhiều hạn chế:

1. **Dữ liệu phân tán, thiếu đồng bộ**: Thông tin được lưu trữ ở nhiều nơi khác nhau (sổ giấy, Excel, Zalo), không có cơ sở dữ liệu tập trung.
2. **Quy trình thủ công, tốn thời gian**: Hầu hết các nghiệp vụ đều được thực hiện thủ công, đặc biệt là điểm danh, tính học phí, chấm điểm và tạo báo cáo.
3. **Thiếu kênh thông báo tự động**: Không có hệ thống thông báo tự động cho phụ huynh khi học viên vắng, khi có thay đổi lịch, hay khi hóa đơn đến hạn.
4. **Khó mở rộng quy mô**: Khi số lượng học viên, giáo viên, lớp học tăng, hệ thống thủ công trở nên quá tải và không đáp ứng được yêu cầu quản lý.
5. **Thiếu công cụ đánh giá**: Không có phương tiện để theo dõi xu hướng tiến bộ của học viên, thống kê tổng hợp nhiều chiều.

→ **Kết luận**: Trung tâm cần một hệ thống quản lý trực tuyến toàn diện để số hóa quy trình, tự động hóa các nghiệp vụ, và nâng cao chất lượng dịch vụ.

---

## 1.3. Yêu cầu về chức năng

Dựa trên kết quả khảo sát hiện trạng, dưới đây là các yêu cầu về chức năng mà hệ thống website MeiLearning cần đáp ứng, được phân loại theo từng nhóm đối tượng sử dụng.

### 1.3.1. Yêu cầu chức năng dành cho Quản lý trung tâm (Admin)

| STT | Mã YCNC | Tên chức năng | Mô tả chi tiết |
|:---:|:-------:|---------------|----------------|
| 1 | F-A01 | Đăng nhập / Đổi mật khẩu | Đăng nhập bằng tài khoản (username/password), hỗ trợ đổi mật khẩu khi cần |
| 2 | F-A02 | Xem Dashboard tổng quan | Hiển thị các chỉ số thống kê tổng hợp: tổng học viên, tổng giáo viên, tổng lớp học, tổng doanh thu, biểu đồ trực quan |
| 3 | F-A03 | Quản lý học viên (CRUD) | Thêm mới, sửa, xem chi tiết, khóa/mở khóa tài khoản học viên; quản lý ghi danh lớp; import hàng loạt từ file; reset mật khẩu |
| 4 | F-A04 | Quản lý giáo viên (CRUD) | Thêm mới, sửa, xem chi tiết, khóa/mở khóa tài khoản giáo viên; gán môn dạy; reset mật khẩu |
| 5 | F-A05 | Quản lý lớp học (CRUD) | Tạo lớp, chỉnh sửa, kết thúc lớp; gán giáo viên, môn học, phòng học; cấu hình lịch học (ngày, giờ), sĩ số tối đa, giá/buổi |
| 6 | F-A06 | Quản lý môn học (CRUD) | Tạo, sửa, xóa môn học; phân loại theo danh mục; thiết lập giá cơ bản/buổi |
| 7 | F-A07 | Quản lý cơ sở và phòng học | Quản lý thông tin cơ sở (chi nhánh): tên, địa chỉ, SĐT; Quản lý phòng học trong từng cơ sở: tên phòng, sức chứa, trạng thái |
| 8 | F-A08 | Quản lý lịch dạy / Thời khóa biểu | Xem lịch dạy tổng (tất cả lớp/giáo viên); tự động tạo buổi học (sessions) theo lịch cấu hình của lớp; xem lịch theo giáo viên, theo học viên |
| 9 | F-A09 | Quản lý điểm danh | Xem thống kê điểm danh theo lớp, theo buổi; xem báo cáo tỷ lệ đi học |
| 10 | F-A10 | Quản lý học phí | Tạo hóa đơn thủ công hoặc tự động theo tháng; xem danh sách hóa đơn; xác nhận/từ chối thanh toán; theo dõi hóa đơn quá hạn; thống kê doanh thu |
| 11 | F-A11 | Duyệt yêu cầu dời lịch | Xem danh sách yêu cầu dời lịch từ giáo viên; duyệt hoặc từ chối; tự động cập nhật trạng thái buổi học khi duyệt |
| 12 | F-A12 | Xem báo cáo thống kê | Báo cáo tổng quan: học viên, giáo viên, lớp, doanh thu; Báo cáo điểm danh: tỷ lệ có mặt theo lớp/tháng; Báo cáo học phí: tổng thu, nợ, quá hạn |
| 13 | F-A13 | Quản lý thông báo | Xem danh sách thông báo hệ thống; đánh dấu đã đọc |
| 14 | F-A14 | Cấu hình QR điểm danh | Thiết lập thông tin mã QR dùng cho điểm danh tại lớp |
| 15 | F-A15 | Quản lý hồ sơ cá nhân | Xem và cập nhật thông tin cá nhân, đổi ảnh đại diện |

### 1.3.2. Yêu cầu chức năng dành cho Giáo viên (Teacher)

| STT | Mã YCNC | Tên chức năng | Mô tả chi tiết |
|:---:|:-------:|---------------|----------------|
| 1 | F-T01 | Đăng nhập / Đổi mật khẩu | Đăng nhập bằng tài khoản được cấp; đổi mật khẩu |
| 2 | F-T02 | Xem Dashboard | Hiển thị thống kê cá nhân: số lớp đang dạy, số buổi trong tuần, số học viên, lịch sắp tới |
| 3 | F-T03 | Xem và quản lý lớp học | Xem danh sách lớp đang phụ trách, chi tiết từng lớp, danh sách học viên trong lớp |
| 4 | F-T04 | Điểm danh học viên | Điểm danh hàng loạt cho buổi học (có mặt/vắng/trễ); điểm danh theo từng buổi (session) |
| 5 | F-T05 | Xem lịch dạy | Xem lịch dạy cá nhân dạng lịch (calendar), theo tuần/tháng |
| 6 | F-T06 | Quản lý bài kiểm tra | Tạo bài kiểm tra trắc nghiệm (nhiều câu hỏi, có đáp án); gán bài kiểm tra cho lớp; xuất bản/hủy; xem kết quả từng học viên |
| 7 | F-T07 | Chấm điểm học viên | Nhập/cập nhật điểm trung bình, nhận xét, đánh giá xu hướng (tiến bộ/ổn định/giảm sút) cho từng học viên theo lớp |
| 8 | F-T08 | Quản lý tài liệu | Upload tài liệu học tập (PDF, Word,...) gắn với lớp; xóa tài liệu đã upload |
| 9 | F-T09 | Gửi yêu cầu xin nghỉ | Tạo đơn xin nghỉ dạy cho buổi cụ thể, kèm lý do; theo dõi trạng thái đơn |
| 10 | F-T10 | Gửi yêu cầu dời lịch | Tạo yêu cầu dời lịch/hủy buổi dạy, chọn ngày giờ mới (nếu dời); theo dõi trạng thái |
| 11 | F-T11 | Xem thông báo | Nhận và xem các thông báo từ hệ thống (phê duyệt dời lịch, thay đổi lịch,...) |
| 12 | F-T12 | Quản lý hồ sơ cá nhân | Xem và cập nhật thông tin cá nhân |

### 1.3.3. Yêu cầu chức năng dành cho Học viên (Student)

| STT | Mã YCNC | Tên chức năng | Mô tả chi tiết |
|:---:|:-------:|---------------|----------------|
| 1 | F-S01 | Đăng nhập / Đổi mật khẩu | Đăng nhập bằng tài khoản được cấp; đổi mật khẩu |
| 2 | F-S02 | Xem Dashboard | Hiển thị thống kê cá nhân: số lớp đang học, buổi học sắp tới, thông báo mới |
| 3 | F-S03 | Điểm danh bằng QR | Quét mã QR tại lớp để điểm danh (check-in); xem lịch sử điểm danh |
| 4 | F-S04 | Xem lịch học | Xem lịch học cá nhân theo tuần/tháng |
| 5 | F-S05 | Làm bài kiểm tra trực tuyến | Xem danh sách bài kiểm tra; làm bài trực tuyến (trắc nghiệm); nộp bài; xem kết quả |
| 6 | F-S06 | Xem điểm số | Xem điểm trung bình, nhận xét của giáo viên, xu hướng tiến bộ theo từng lớp |
| 7 | F-S07 | Xem tài liệu | Xem và tải xuống tài liệu học tập do giáo viên chia sẻ |
| 8 | F-S08 | Xem và đóng học phí | Xem hóa đơn học phí của mình; thực hiện thanh toán (chuyển khoản/upload minh chứng); theo dõi trạng thái thanh toán |
| 9 | F-S09 | Gửi yêu cầu xin nghỉ | Tạo đơn xin nghỉ học cho buổi cụ thể, kèm lý do |
| 10 | F-S10 | Xem thông báo | Nhận thông báo từ hệ thống: vắng học, thay đổi lịch, điểm mới, hóa đơn |
| 11 | F-S11 | Quản lý hồ sơ cá nhân | Xem và cập nhật thông tin cá nhân |

### 1.3.4. Yêu cầu chức năng hệ thống (System)

| STT | Mã YCNC | Tên chức năng | Mô tả chi tiết |
|:---:|:-------:|---------------|----------------|
| 1 | F-SYS01 | Phân quyền truy cập (RBAC) | Hệ thống phân quyền theo vai trò (Admin, Teacher, Student), đảm bảo mỗi vai trò chỉ truy cập được các chức năng thuộc phạm vi cho phép |
| 2 | F-SYS02 | Xác thực bằng JWT | Sử dụng JSON Web Token để xác thực và duy trì phiên đăng nhập |
| 3 | F-SYS03 | Thông báo đa kênh | Hệ thống thông báo 3 tầng: In-App (trong ứng dụng), Email (qua SMTP), SMS (cho thông báo khẩn cấp) — tự động gửi theo mức độ nghiêm trọng |
| 4 | F-SYS04 | Tự động tạo buổi học | Tự động sinh danh sách buổi học (sessions) dựa trên lịch cấu hình của lớp (ngày trong tuần, giờ bắt đầu, giờ kết thúc) |
| 5 | F-SYS05 | Tự động tạo hóa đơn học phí | Tự động tính số buổi học trong tháng và tạo hóa đơn cho từng học viên dựa trên các lớp đang ghi danh |

---

## 1.4. Yêu cầu phi chức năng

Ngoài các yêu cầu về chức năng, hệ thống MeiLearning còn cần đáp ứng các yêu cầu phi chức năng sau:

### 1.4.1. Giao diện và trải nghiệm người dùng (UI/UX)

| STT | Yêu cầu | Mô tả |
|:---:|---------|-------|
| 1 | Giao diện thân thiện, dễ sử dụng | Thiết kế trực quan, phù hợp với người dùng không chuyên về công nghệ (giáo viên, học viên, phụ huynh) |
| 2 | Thiết kế responsive | Giao diện tự động thích ứng với nhiều kích thước màn hình: máy tính, tablet, điện thoại |
| 3 | Hỗ trợ tiếng Việt | Toàn bộ giao diện và nội dung hiển thị bằng tiếng Việt, hỗ trợ đầy đủ bộ ký tự Unicode |
| 4 | Hiển thị trực quan | Sử dụng biểu đồ, biểu tượng, bảng màu để trình bày dữ liệu thống kê dễ hiểu |

### 1.4.2. Hiệu năng (Performance)

| STT | Yêu cầu | Mô tả |
|:---:|---------|-------|
| 1 | Thời gian phản hồi nhanh | Các thao tác cơ bản (xem danh sách, tìm kiếm, lọc) phản hồi trong vòng ≤ 2 giây |
| 2 | Hỗ trợ phân trang dữ liệu | Các danh sách lớn (học viên, hóa đơn, bài kiểm tra) được phân trang để tối ưu hiệu năng |
| 3 | Tối ưu hóa truy vấn CSDL | Sử dụng index, query optimization để đảm bảo hiệu năng khi dữ liệu tăng |

### 1.4.3. Bảo mật (Security)

| STT | Yêu cầu | Mô tả |
|:---:|---------|-------|
| 1 | Xác thực và phân quyền | Mọi API đều yêu cầu xác thực (JWT); phân quyền theo vai trò (RBAC) đảm bảo người dùng chỉ truy cập đúng phạm vi |
| 2 | Mã hóa mật khẩu | Mật khẩu người dùng được mã hóa bằng BCrypt trước khi lưu vào CSDL |
| 3 | Bảo vệ API | Cấu hình CORS đúng origin; sử dụng HTTPS; kiểm tra đầu vào (input validation) |
| 4 | Bảo mật thông tin cá nhân | Thông tin nhạy cảm (SĐT phụ huynh, địa chỉ, email) chỉ được hiển thị cho người có quyền |

### 1.4.4. Khả năng mở rộng (Scalability)

| STT | Yêu cầu | Mô tả |
|:---:|---------|-------|
| 1 | Kiến trúc tách biệt Frontend — Backend | Frontend (React + Vite) và Backend (Spring Boot) tách biệt hoàn toàn, giao tiếp qua RESTful API, dễ triển khai và bảo trì độc lập |
| 2 | Hỗ trợ đa cơ sở | Hệ thống hỗ trợ quản lý nhiều cơ sở (facility) với nhiều phòng học, dễ dàng mở rộng khi trung tâm phát triển thêm chi nhánh |
| 3 | Hỗ trợ container hóa | Hệ thống hỗ trợ triển khai bằng Docker (Docker Compose) giúp dễ dàng đóng gói, triển khai và mở rộng |

### 1.4.5. Độ tin cậy và khả dụng (Reliability & Availability)

| STT | Yêu cầu | Mô tả |
|:---:|---------|-------|
| 1 | Xử lý lỗi thống nhất | Hệ thống có cơ chế xử lý lỗi tập trung (Global Exception Handler), trả về thông báo lỗi rõ ràng cho người dùng |
| 2 | Dữ liệu nhất quán | Sử dụng transaction, ràng buộc khóa ngoại (Foreign Key), ràng buộc duy nhất (Unique) để đảm bảo tính toàn vẹn dữ liệu |
| 3 | Logging và audit | Ghi nhận log hoạt động để hỗ trợ debug và kiểm tra khi có sự cố |

### 1.4.6. Công nghệ sử dụng

| Thành phần | Công nghệ | Phiên bản |
|------------|-----------|-----------|
| Backend | Spring Boot (Java) | Java 17 |
| Frontend | React + TypeScript | Vite build |
| Cơ sở dữ liệu | PostgreSQL | — |
| Xác thực | JWT (JSON Web Token) | — |
| Mã hóa mật khẩu | BCrypt | — |
| Giao tiếp | RESTful API | — |
| Email | SMTP (SendGrid) | — |
| SMS | SpeedSMS API | — |
| Triển khai | Docker / Docker Compose | — |
| Quản lý mã nguồn | Git (Monorepo) | — |

## 1.5. Mục tiêu đề tài

### 1.5.1. Mục tiêu chung

Phân tích, thiết kế và xây dựng **hệ thống quản lý trung tâm dạy thêm trực tuyến (MeiLearning System)** dưới dạng ứng dụng web, nhằm số hóa toàn bộ quy trình vận hành của trung tâm dạy thêm, thay thế phương thức quản lý thủ công bằng một nền tảng tập trung, hiện đại và dễ sử dụng.

### 1.5.2. Mục tiêu cụ thể

Thứ nhất, **khảo sát và phân tích hệ thống** — tìm hiểu hiện trạng hoạt động của trung tâm dạy thêm, phân tích các nghiệp vụ và đối tượng liên quan, từ đó xác định đầy đủ yêu cầu chức năng và phi chức năng cho hệ thống.

Thứ hai, **thiết kế hệ thống** — xây dựng kiến trúc theo mô hình Client–Server với Frontend và Backend tách biệt; thiết kế cơ sở dữ liệu quan hệ; thiết kế giao diện người dùng; xây dựng các biểu đồ UML cần thiết (Use Case, Activity, Class, Sequence).

Thứ ba, **xây dựng các module chức năng cốt lõi**, bao gồm: (1) Quản lý người dùng — đăng nhập, phân quyền theo vai trò (Admin, Teacher, Student), hồ sơ cá nhân; (2) Quản lý đào tạo — lớp học, môn học, ghi danh, lịch dạy/học, tự động tạo buổi học; (3) Quản lý cơ sở vật chất — cơ sở, phòng học, trạng thái sử dụng; (4) Điểm danh — điểm danh hàng loạt và điểm danh bằng mã QR, kèm thông báo tự động khi vắng; (5) Học phí — tạo hóa đơn tự động/thủ công, thanh toán, xác nhận, theo dõi công nợ; (6) Kiểm tra và chấm điểm — bài kiểm tra trắc nghiệm trực tuyến, chấm điểm tổng kết và nhận xét; (7) Xin nghỉ và dời lịch — quy trình gửi, duyệt, từ chối; (8) Thông báo đa kênh — tích hợp 3 tầng In-App, Email, SMS; (9) Báo cáo và thống kê — báo cáo tổng quan, điểm danh, học phí kèm biểu đồ trực quan.

Thứ tư, **triển khai và kiểm thử** — đóng gói ứng dụng bằng Docker, triển khai thử nghiệm, kiểm thử các chức năng chính và luồng nghiệp vụ liên thông giữa các vai trò.

---

## 1.6. Kết quả dự kiến

Sau khi hoàn thành, đồ án dự kiến đạt được các kết quả chính sau:

**Về sản phẩm phần mềm**: Hệ thống MeiLearning System hoạt động đầy đủ dưới dạng ứng dụng web, bao gồm: (1) Backend API xây dựng bằng Spring Boot (Java 17), cung cấp đầy đủ endpoint cho 42 chức năng đã xác định, tích hợp xác thực JWT và phân quyền RBAC; (2) Frontend dạng Single Page Application xây dựng bằng React + TypeScript + Vite, gồm 3 giao diện riêng biệt cho Admin, Teacher và Student; (3) Cơ sở dữ liệu PostgreSQL với 19 bảng được thiết kế chuẩn hóa, đầy đủ ràng buộc toàn vẹn; (4) Hệ thống thông báo đa kênh 3 tầng (In-App, Email qua SMTP, SMS qua SpeedSMS); (5) Bộ Dockerfile và Docker Compose cho phép đóng gói và triển khai toàn bộ hệ thống một cách thống nhất.

**Về tài liệu**: Báo cáo đồ án tốt nghiệp đầy đủ các chương (Khảo sát, Phân tích & Thiết kế, Xây dựng & Triển khai, Kiểm thử, Kết luận); tài liệu thiết kế hệ thống gồm ERD, biểu đồ Use Case, Activity, Class, Sequence; tài liệu hướng dẫn triển khai; toàn bộ mã nguồn được quản lý trên Git theo mô hình Monorepo.

**Về luồng nghiệp vụ liên thông**: Hệ thống đảm bảo sự liên thông giữa các vai trò qua 7 luồng nghiệp vụ chính: (1) Điểm danh — Giáo viên điểm danh, học viên vắng nhận thông báo, Admin xem thống kê; (2) Học phí — Admin tạo hóa đơn, học viên thanh toán, Admin xác nhận; (3) Chấm điểm — Giáo viên nhập điểm, học viên xem kết quả; (4) Xin nghỉ — Học viên/Giáo viên tạo đơn, Admin duyệt; (5) Dời lịch — Giáo viên yêu cầu, Admin duyệt, hệ thống cập nhật và thông báo; (6) Bài kiểm tra — Giáo viên tạo đề, học viên làm bài, giáo viên xem kết quả; (7) Ghi danh — Admin ghi danh, học viên thấy lịch, giáo viên thấy danh sách lớp.

---

## 1.7. Tổng kết chương

Chương 1 đã trình bày tổng quan về đề tài "Xây dựng hệ thống quản lý trung tâm dạy thêm trực tuyến — MeiLearning System", bao gồm: lý do chọn đề tài xuất phát từ nhu cầu thực tế của các trung tâm dạy thêm; khảo sát hiện trạng với cơ cấu tổ chức, các đối tượng liên quan và nghiệp vụ thường xuyên/định kỳ; 42 yêu cầu chức năng chia theo 4 nhóm (Admin, Giáo viên, Học viên, Hệ thống); các yêu cầu phi chức năng về giao diện, hiệu năng, bảo mật và khả năng mở rộng; mục tiêu cụ thể bao phủ toàn bộ quy trình từ khảo sát đến triển khai; và kết quả dự kiến gồm sản phẩm phần mềm hoàn chỉnh, bộ tài liệu đồ án, cùng 7 luồng nghiệp vụ liên thông giữa các vai trò. Các nội dung này sẽ là cơ sở để thiết kế kiến trúc hệ thống, thiết kế cơ sở dữ liệu và triển khai xây dựng ở các chương tiếp theo.
