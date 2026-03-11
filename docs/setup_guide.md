# 🛠️ MeiLearning System — Hướng dẫn cài đặt môi trường Development

> **Cập nhật**: 11/03/2026

---

## 📋 Kiểm tra công cụ trên máy

| Công cụ | Trạng thái | Ghi chú |
|---------|-----------|---------|
| ☑️ **Java 22** | ✅ Đã cài | `C:\Program Files\Common Files\Oracle\Java\javapath\java.exe` |
| ☑️ **Node.js** | ✅ Đã cài | `C:\Program Files\nodejs\node.exe` |
| ☑️ **Git** | ✅ Đã cài | `C:\Program Files\Git\cmd\git.exe` |
| ☑️ **Maven** | ✅ Có sẵn wrapper | Dùng `.\mvnw.cmd` thay cho `mvn` |
| ☑️ **Docker** | ✅ Đã cài | `Docker\resources\bin\docker` |
| ❌ **PostgreSQL** | ⚠️ Chưa cài | **Cần cài đặt** — xem hướng dẫn bên dưới |

---

## 🐘 Cài đặt PostgreSQL

Bạn có **2 cách** để cài PostgreSQL. Chọn 1 trong 2:

---

### Cách 1: Dùng Docker (Khuyến nghị — vì bạn đã cài Docker)

#### Bước 1: Chạy PostgreSQL container

```powershell
docker run -d `
  --name meilearning-db `
  -e POSTGRES_DB=meilearning `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -p 5432:5432 `
  -v meilearning_pgdata:/var/lib/postgresql/data `
  postgres:16
```

> **Giải thích:**
> - `--name meilearning-db` — Đặt tên container cho dễ quản lý
> - `POSTGRES_DB=meilearning` — Tự động tạo database `meilearning`
> - `POSTGRES_USER/PASSWORD` — Khớp với `application.properties`
> - `-p 5432:5432` — Map port ra host
> - `-v meilearning_pgdata:...` — Lưu data vào Docker volume (không mất khi restart)

#### Bước 2: Kiểm tra container đang chạy

```powershell
docker ps
```

Kết quả phải thấy: `meilearning-db` ở trạng thái `Up`.

#### Bước 3: Test kết nối

```powershell
docker exec -it meilearning-db psql -U postgres -d meilearning -c "\dt"
```

> Lần đầu sẽ trống (no relations found) — Spring Boot sẽ tự tạo tables khi khởi động.

#### Các lệnh Docker thường dùng

```powershell
# Dừng database
docker stop meilearning-db

# Khởi động lại
docker start meilearning-db

# Xem logs
docker logs meilearning-db

# Xóa container (data trong volume vẫn còn)
docker rm -f meilearning-db

# Vào psql shell
docker exec -it meilearning-db psql -U postgres -d meilearning
```

---

### Cách 2: Cài PostgreSQL trực tiếp trên Windows

#### Bước 1: Download

1. Truy cập: https://www.postgresql.org/download/windows/
2. Click **"Download the installer"** (bản EDB)
3. Chọn version **16.x** (stable mới nhất)

#### Bước 2: Cài đặt

1. Chạy installer → Next
2. **Installation Directory**: để mặc định
3. **Components**: chọn tất cả (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
4. **Password cho postgres user**: nhập `postgres` (khớp với config)
5. **Port**: để mặc định `5432`
6. **Locale**: `Vietnamese, Vietnam` hoặc `Default locale`
7. Finish

#### Bước 3: Tạo database

1. Mở **pgAdmin 4** (được cài kèm)
2. Kết nối đến `localhost:5432` bằng user `postgres`, password `postgres`
3. Click phải vào **Databases** → **Create** → **Database**
4. Database name: `meilearning`
5. Click **Save**

#### Bước 4: Verify

```powershell
psql -U postgres -d meilearning -c "\dt"
```

---

## 🚀 Khởi động Backend

Sau khi PostgreSQL đã chạy:

```powershell
cd "d:\MeiLearning System\backend"
.\mvnw.cmd spring-boot:run
```

**Kết quả mong đợi:**
1. Console log hiện `Hibernate: create table ...` (tạo 19 tables)
2. Server khởi động thành công ở `http://localhost:8080`
3. Swagger UI hoạt động tại `http://localhost:8080/swagger-ui.html`

---

## 🔍 Kiểm tra Database sau khi Spring Boot chạy

### Dùng Docker:
```powershell
docker exec -it meilearning-db psql -U postgres -d meilearning -c "\dt"
```

### Dùng pgAdmin:
1. Mở pgAdmin → vào database `meilearning`
2. Expand **Schemas** → **public** → **Tables**
3. Phải thấy 19 tables (users, subjects, facilities, rooms, teachers, ...)

---

## 📁 File cấu hình liên quan

| File | Mô tả |
|------|--------|
| `backend/src/main/resources/application.properties` | Config chính (JDBC URL, credentials) |
| `backend/.env.example` | Template biến môi trường |
| `backend/pom.xml` | Dependencies (PostgreSQL driver, SpringDoc) |

---

## ⚠️ Troubleshooting

### Lỗi "Connection refused"
- PostgreSQL chưa chạy → `docker start meilearning-db` hoặc start PostgreSQL service
- Sai port → kiểm tra `application.properties` có `5432` không

### Lỗi "database 'meilearning' does not exist"
- Docker: chạy lại lệnh `docker run` ở trên (tự tạo DB)
- Local: tạo DB qua pgAdmin hoặc `createdb -U postgres meilearning`

### Lỗi "password authentication failed"
- Đảm bảo password trong `application.properties` khớp với password khi cài PostgreSQL
- Default config: username=`postgres`, password=`postgres`
