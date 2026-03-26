# 🎓 MeiLearning System

> **Nền tảng quản lý học tập toàn diện** — Kết nối Học viên, Giảng viên và Nhà trường trên một hệ thống duy nhất.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose)

---

## 📋 Tổng Quan

MeiLearning System là phần mềm quản lý trung tâm giáo dục với hệ thống phân quyền 3 vai trò:

| Vai trò | Chức năng chính |
|---------|----------------|
| **🔴 Admin** | Dashboard tổng quan, quản lý giáo viên/học viên/lớp/môn học, lịch học, điểm danh, học phí, cơ sở vật chất, báo cáo, cấu hình QR |
| **🟢 Giáo viên** | Lịch dạy, quản lý lớp, điểm danh QR, tài liệu & video, quản lý bài thi, chấm điểm & nhận xét, yêu cầu đổi lịch, duyệt đơn xin nghỉ |
| **🔵 Học viên** | Xem lớp học, điểm danh QR, tài liệu, làm bài thi online, xem điểm, học phí, xin nghỉ/đi muộn, khu giải trí |

### Tính năng nổi bật

- 🔐 **Phân quyền chặt chẽ** — Mỗi vai trò có giao diện riêng với quyền truy cập phù hợp
- 📱 **Responsive** — Hoạt động mượt mà trên Desktop, Tablet và Mobile
- 🌙 **Dark / Light mode** — Chuyển đổi giao diện sáng/tối
- 📊 **Dashboard thời gian thực** — Biểu đồ doanh thu, điểm danh, cảnh báo
- 📝 **Quản lý bài thi** — Tạo đề, chấm tự động, xem lại bài làm
- 📲 **Điểm danh QR** — Mã QR có thời gian hiệu lực, chống gian lận
- 💰 **Quản lý học phí** — Tạo hóa đơn, xuất PDF, theo dõi công nợ
- 🔔 **Thông báo** — Hệ thống thông báo real-time
- 💬 **Zalo Widget** — Hỗ trợ tư vấn nhanh cho học viên

---

## 🏗️ Kiến Trúc Dự Án

```text
MeiLearning System/
├── frontend/              # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── features/      # Feature-based modules
│   │   │   ├── admin/     #   └── 15 modules (dashboard, teachers, students, ...)
│   │   │   ├── teacher/   #   └── 11 modules (schedule, attendance, exam, ...)
│   │   │   ├── user/      #   └── 12 modules (classes, exam, tuition, games, ...)
│   │   │   ├── auth/      #   └── Login, authentication
│   │   │   ├── landing/   #   └── Trang chủ, giới thiệu, liên hệ
│   │   │   └── shared/    #   └── Guards, error pages, common
│   │   ├── components/    # UI components (shadcn/ui)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # API client, utilities
│   │   ├── config/        # API endpoints config
│   │   ├── routes/        # Route definitions (admin, teacher, user, public)
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── backend/               # Java Spring Boot 3
│   ├── src/main/java/     # Controllers, Services, Repositories
│   └── pom.xml
│
├── docs/                  # Documentation
│   ├── USER_GUIDE.md      # Hướng dẫn sử dụng
│   └── ...
│
├── Caddyfile              # Caddy reverse proxy config
├── docker-compose.yml     # Docker orchestration (3 containers)
├── .env                   # Environment variables (git-ignored)
└── .env.example           # Env template
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite** — Build nhanh, type-safe
- **React Router v6** — Client-side routing, lazy loading
- **TanStack Query** — Server state management, caching
- **shadcn/ui** + **Tailwind CSS** — Component library, responsive design
- **Recharts** — Biểu đồ tương tác
- **Framer Motion** — Smooth animations
- **Lucide Icons** — Modern icon set

### Backend
- **Java 17** + **Spring Boot 3** — REST API
- **Spring Security** + **JWT** — Authentication & Authorization
- **Spring Data JPA** — ORM Layer
- **PostgreSQL 16** — Database

### DevOps
- **Docker Compose** — 3 containers: Caddy + Frontend + Backend
- **Caddy** — Reverse proxy, auto HTTPS
- **Git** — Version control (Conventional Commits)

---

## 🚀 Quick Start

### Yêu cầu

- **Node.js** ≥ 18 · **npm** ≥ 9
- **Java** ≥ 17 · **Maven** ≥ 3.8
- **PostgreSQL** ≥ 15
- **Docker** + **Docker Compose** (cho production)

### Development

```bash
# 1. Clone repo
git clone <repo-url>
cd "MeiLearning System"

# 2. Tạo file .env từ template
cp .env.example .env
# Chỉnh sửa các biến môi trường trong .env

# 3. Chạy Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173

# 4. Chạy Backend
cd ../backend
./mvnw spring-boot:run
# → http://localhost:8080
```

### Production (Docker)

```bash
# Build và chạy toàn bộ hệ thống
docker compose up -d --build

# Xem logs
docker compose logs -f

# Dừng hệ thống
docker compose down
```

---

## 📖 Tài Liệu

| Tài liệu | Đường dẫn | Mô tả |
|-----------|-----------|-------|
| Hướng dẫn sử dụng | [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) | Hướng dẫn chi tiết cho 3 vai trò |
| Thiết kế Database | [`docs/erd_database_design.md`](docs/erd_database_design.md) | ERD và mô tả bảng dữ liệu |
| Chuẩn bị Deploy | [`docs/DEPLOYMENT_PREPARATION.md`](docs/DEPLOYMENT_PREPARATION.md) | Checklist deploy production |
| Cài đặt môi trường | [`docs/setup_guide.md`](docs/setup_guide.md) | Hướng dẫn setup development |

---

## 👥 Thông Tin Đăng Nhập

| Vai trò | Username | Mật khẩu |
|---------|----------|----------|
| Admin | Username hệ thống cấp | Do Admin cấp |
| Giáo viên | Số điện thoại đăng ký | Do Admin cấp |
| Học viên | Số điện thoại đăng ký | Do Admin cấp |

---

## 📐 Quy Ước Phát Triển

- **Monorepo**: Frontend + Backend trong cùng repository
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- **Cross-project policies**: `.gitignore`, `.editorconfig`, CI configs ở root
- **Module docs**: `frontend/README.md`, `backend/README.md` cho docs riêng từng module

---

*© 2026 MeiLearning System. All rights reserved.*
