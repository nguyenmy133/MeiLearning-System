---
description: Quy trình rà soát và sửa lỗi toàn diện (Full-stack Bug Fix Process)
---

# 🐛 Quy Trình Fix Bug Toàn Diện

> Workflow này áp dụng khi cần rà soát cả Frontend và Backend để tìm và sửa lỗi.

---

## Phase 1: Thu thập thông tin & Tái hiện lỗi

1. **Xác nhận triệu chứng lỗi** từ mô tả của user:
   - Lỗi xảy ra ở đâu? (trang nào, chức năng nào)
   - Khi nào lỗi xảy ra? (thao tác cụ thể nào trigger lỗi)
   - Có error message / status code cụ thể không?

2. **Xác định phạm vi liên quan** — liệt kê các file/module cần rà soát:
   - **Frontend**: Component (`.tsx`), hooks, services/API calls, types, routes
   - **Backend**: Controller, Service/ServiceImpl, Repository, Entity, DTO, Mapper

---

## Phase 2: Rà soát mã nguồn (Code Investigation)

3. **Rà soát Frontend** — kiểm tra theo thứ tự:
   - [ ] **API call**: URL endpoint, HTTP method, request payload có đúng không?
   - [ ] **Type/Interface**: Các type có khớp với response từ BE không?
   - [ ] **State management**: State có được cập nhật đúng sau khi gọi API?
   - [ ] **UI rendering**: Component có render đúng dựa trên data nhận được?
   - [ ] **Error handling**: Có xử lý lỗi đúng cách không (try/catch, error state)?
   - [ ] **Props & Dependencies**: Các props truyền vào, useEffect dependencies có đúng?

4. **Rà soát Backend** — kiểm tra theo thứ tự:
   - [ ] **Controller**: Endpoint URL, HTTP method, @PreAuthorize, request/response DTO
   - [ ] **Service/ServiceImpl**: Business logic, validation, exception handling
   - [ ] **Repository**: Query method, JPA naming convention, custom @Query
   - [ ] **Entity**: Mapping (@ManyToOne, @OneToMany...), column name, data type
   - [ ] **DTO & Mapper**: Có map đủ field không? Có convert đúng type không?
   - [ ] **Security config**: Endpoint có bị chặn bởi Security filter không?

5. **Kiểm tra sự đồng bộ FE ↔ BE**:
   - [ ] Endpoint URL trên FE có khớp với BE controller không?
   - [ ] Request DTO (field name, type) có khớp nhau không?
   - [ ] Response DTO có khớp với interface/type trên FE không?
   - [ ] Enum values có nhất quán giữa FE và BE không? (UPPERCASE vs lowercase)
   - [ ] Date/Time format có thống nhất không?

---

## Phase 3: Phân tích nguyên nhân gốc (Root Cause Analysis)

6. **Xác định nguyên nhân gốc** — trả lời các câu hỏi:
   - Lỗi thuộc layer nào? (FE / BE / cả hai / DB / Config)
   - Lỗi do logic sai, data sai, hay do thiếu xử lý?
   - Lỗi có phải regression (do thay đổi gần đây gây ra) không?

7. **Viết bản phân tích nguyên nhân** với format:

```markdown
## 🔍 Phân Tích Nguyên Nhân

### Triệu chứng
- [Mô tả chính xác triệu chứng lỗi]

### Nguyên nhân gốc
- [Root cause cụ thể, trích dẫn code/file/line nếu có]

### Phạm vi ảnh hưởng
- [Liệt kê các chức năng/trang bị ảnh hưởng bởi lỗi này]
```

---

## Phase 4: Đề xuất giải pháp (Senior-level)

8. **Đưa ra ÍT NHẤT 2 giải pháp** có thể, mỗi giải pháp cần nêu:
   - Mô tả giải pháp
   - Ưu điểm / Nhược điểm
   - Độ phức tạp (Thấp / Trung bình / Cao)
   - Rủi ro & side-effect tiềm ẩn
   - File cần thay đổi (FE + BE)
   - **🔮 Khả năng mở rộng (Scalability & Extensibility)**:
     - Giải pháp này có dễ mở rộng khi thêm tính năng mới không?
     - Nếu requirement thay đổi trong tương lai, giải pháp này có cần refactor lớn không?
     - Giải pháp có tạo ra tight coupling giữa các module không?
     - Code có dễ tái sử dụng (reusable) cho các module khác không?

9. **Đánh giá theo Design Principles** — mỗi giải pháp cần được xem xét qua:
   - [ ] **Single Responsibility**: Mỗi class/component chỉ đảm nhận 1 nhiệm vụ?
   - [ ] **Open/Closed**: Có thể mở rộng mà không cần sửa code hiện tại?
   - [ ] **DRY (Don't Repeat Yourself)**: Có tạo ra code trùng lặp không?
   - [ ] **Separation of Concerns**: FE/BE/DB logic có bị lẫn lộn không?
   - [ ] **Loose Coupling**: Các module có phụ thuộc lỏng lẻo với nhau không?

10. **Đề xuất giải pháp tối ưu nhất** với tư duy senior:
    - Ưu tiên giải pháp **có khả năng mở rộng cao nhất**, dù có thể phức tạp hơn một chút
    - Giải thích tại sao giải pháp này tốt cho **dài hạn**, không chỉ fix tạm thời
    - Nếu giải pháp nhanh (quick fix) là cần thiết, phải kèm theo **TODO/kế hoạch refactor** sau
    - Đề xuất các **abstraction / pattern** nên áp dụng nếu phù hợp (Strategy, Factory, Repository pattern...)

---

## Phase 5: Lên kế hoạch thực hiện (Action Plan)

10. **Tạo implementation plan** chi tiết:
    - Liệt kê từng file cần thay đổi, nội dung thay đổi cụ thể
    - Thứ tự thực hiện (dependencies first: Entity → DTO → Repository → Service → Controller → FE)
    - Ước lượng mức độ ảnh hưởng

11. **Gửi plan để user review** trước khi thực hiện.

---

## Phase 6: Thực hiện sửa lỗi

12. **Thực hiện thay đổi** theo plan đã được duyệt:
    - Sửa Backend trước (theo thứ tự: Entity → DTO/Mapper → Repository → Service → Controller)
    - Sửa Frontend sau (theo thứ tự: Types → Services → Hooks → Components)
    - Mỗi thay đổi cần giải thích lý do bằng comment trong code (nếu logic phức tạp)

---

## Phase 7: Kiểm tra & Xác nhận

13. **Verify các thay đổi**:

    > ⚠️ **Lưu ý**: Dự án build và chạy bằng **Docker**. Sử dụng `docker-compose build` để build lại các service và `docker-compose up` để chạy. File cấu hình: `docker-compose.yml` tại thư mục gốc dự án.
`
    - [ ] Build thành công: docke compose up -d --build
    - [ ] Test chức năng đã fix — lỗi không còn tái hiện
    - [ ] Test regression — các chức năng liên quan vẫn hoạt động bình thường
    - [ ] Kiểm tra các edge case

---

## Phase 8: Viết báo cáo kết quả

14. **Tạo walkthrough/báo cáo** với format:

```markdown
# 📋 Báo Cáo Fix Bug: [Tên lỗi]

## Tóm tắt
- **Ngày**: [ngày]
- **Mức độ nghiêm trọng**: [Critical / Major / Minor]
- **Trạng thái**: ✅ Đã fix

## Triệu chứng
[Mô tả lỗi ban đầu]

## Nguyên nhân gốc
[Root cause analysis]

## Giải pháp đã áp dụng
[Mô tả giải pháp được chọn và lý do]

## Các file đã thay đổi

### Backend
| File | Thay đổi |
|------|----------|
| [file] | [mô tả] |

### Frontend
| File | Thay đổi |
|------|----------|
| [file] | [mô tả] |

## Kiểm tra
- [x] Build thành công
- [x] Lỗi đã được fix
- [x] Không có regression

## Bài học rút ra
[Những điều cần lưu ý để tránh lỗi tương tự trong tương lai]
```