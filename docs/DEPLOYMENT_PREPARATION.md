# 🚀 MeiLearning System — Hướng Dẫn Chuẩn Bị Deploy

> **Tài liệu này giúp bạn chuẩn bị mọi thứ cần thiết trước khi deploy dự án MeiLearning System lên môi trường production.**

---

## 📋 Mục Lục

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Pre-Deploy Checklist](#2-pre-deploy-checklist)
3. [So Sánh Phương Án Deploy](#3-so-sánh-phương-án-deploy)
4. [Hướng Dẫn Deploy Từng Phương Án](#4-hướng-dẫn-deploy-từng-phương-án)
5. [Clean Code & Tối Ưu Trước Deploy](#5-clean-code--tối-ưu-trước-deploy)
6. [Bảo Mật (Security Hardening)](#6-bảo-mật-security-hardening)
7. [Cấu Hình Production](#7-cấu-hình-production)
8. [Domain & SSL](#8-domain--ssl)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Monitoring & Logging](#10-monitoring--logging)
11. [Backup & Recovery](#11-backup--recovery)
12. [Post-Deploy Checklist](#12-post-deploy-checklist)

---

## 1. Tổng Quan Dự Án

| Thành phần | Công nghệ | Version |
|---|---|---|
| **Backend** | Spring Boot (Java) | 3.4.3 (Java 17) |
| **Frontend** | Vite + React + TypeScript | React 18, Vite 5 |
| **Database** | PostgreSQL | 16 |
| **Containerization** | Docker + Docker Compose | ✅ Đã có |
| **Auth** | JWT (jjwt) | 0.12.6 |
| **Email** | Gmail SMTP | ✅ |
| **SMS** | SpeedSMS | ✅ |
| **Zalo OA** | ZNS Notification | ✅ |

**Kiến trúc hiện tại:**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │────▶│ PostgreSQL  │
│  (Nginx:80)  │     │ (Spring:8080)│    │   (:5432)   │
└─────────────┘     └─────────────┘     └─────────────┘
     Vite/React        Spring Boot         Database
```

---

## 2. Pre-Deploy Checklist

### 🔴 Bắt Buộc (Critical)

- [ ] **Tạo JWT Secret mới** cho production (min 64 ký tự, Base64-encoded)
  ```bash
  openssl rand -base64 64
  ```
- [ ] **Đổi mật khẩu PostgreSQL** mạnh, không dùng default `postgres`
- [ ] **Xóa/Tắt Swagger UI** trên production (hoặc đặt sau auth)
- [ ] **Đổi `ddl-auto` từ `update` sang `validate` hoặc `none`**
- [ ] **Tắt `show-sql`** — Không log SQL trên production
- [ ] **Đổi log level** từ `DEBUG` sang `WARN` hoặc `ERROR`
- [ ] **Tắt `spring-boot-devtools`** trên production (đã optional, nhưng verify)
- [ ] **Đảm bảo `.env` KHÔNG bị commit** lên Git
- [ ] **Cấu hình CORS** chỉ cho phép domain production

### 🟡 Quan Trọng (Important)

- [ ] **Cấu hình HTTPS/SSL** cho domain
- [ ] **Thiết lập backup tự động** cho PostgreSQL
- [ ] **Kiểm tra email SMTP** hoạt động trên production
- [ ] **Test SpeedSMS API key** trên production
- [ ] **Cấu hình Zalo OA** refresh token cho production
- [ ] **Rate limiting** cho API endpoints
- [ ] **File upload** — Kiểm tra giới hạn và storage
- [ ] **Timezone** — Đảm bảo server set `Asia/Ho_Chi_Minh`

### 🟢 Khuyến Khích (Nice to Have)

- [ ] **Cấu hình monitoring** (health check, metrics)
- [ ] **Thiết lập CI/CD** pipeline
- [ ] **Error tracking** (Sentry hoặc tương đương)
- [ ] **CDN** cho static assets
- [ ] **Database connection pooling** (HikariCP — đã có mặc định)

---

## 3. So Sánh Phương Án Deploy

### Bảng So Sánh Tổng Quan

| Tiêu chí | VPS + Docker Compose | Railway | Render | AWS (ECS/EC2) | Vercel + Render |
|---|---|---|---|---|---|
| **Chi phí/tháng** | ~$5–15 | ~$5–20 | ~$7–25 | ~$15–50+ | ~$0–15 |
| **Độ phức tạp** | ⭐⭐⭐ Trung bình | ⭐ Dễ | ⭐ Dễ | ⭐⭐⭐⭐⭐ Khó | ⭐⭐ Dễ |
| **Scale** | Thủ công | Tự động | Tự động | Tự động | Tự động |
| **SSL miễn phí** | Cần setup | ✅ | ✅ | Cần setup | ✅ |
| **Custom domain** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Database** | Self-hosted | Add-on | Add-on | RDS | Add-on |
| **Uptime SLA** | Tự quản lý | 99.9% | 99.9% | 99.99% | 99.9% |
| **Phù hợp** | Dự án cá nhân/startup | MVP/startup | MVP/startup | Enterprise | Frontend tĩnh + API |

---

### 📌 Phương Án 1: VPS + Docker Compose (⭐ KHUYẾN NGHỊ)

> **Phù hợp nhất cho MeiLearning** vì đã có sẵn Dockerfile + docker-compose.yml

**Ưu điểm:**
- Chi phí rẻ, kiểm soát hoàn toàn
- Đã có sẵn Docker setup
- Dễ replicate môi trường dev → production
- Tự do cấu hình, không bị vendor lock-in

**Nhược điểm:**
- Cần tự quản lý server (update, security, backup)
- Không auto-scale

**Nhà cung cấp VPS gợi ý:**
- 🇻🇳 **Tinohost / INET / Viettel IDC** — Local, latency thấp
- 🌍 **DigitalOcean** — $6/tháng (1GB RAM, 25GB SSD)
- 🌍 **Hetzner** — €3.79/tháng (2GB RAM, 20GB SSD) — **Giá tốt nhất**
- 🌍 **Vultr** — $6/tháng (1GB RAM, 25GB SSD)

---

### 📌 Phương Án 2: Railway

> **Nhanh nhất để deploy**, gần như zero-config

**Ưu điểm:**
- Deploy bằng 1 click từ GitHub
- Tự detect Dockerfile
- PostgreSQL add-on tích hợp
- Free tier: $5/tháng credit

**Nhược điểm:**
- Chi phí tăng nhanh khi traffic lớn
- Ít kiểm soát infrastructure

---

### 📌 Phương Án 3: Vercel (Frontend) + Render (Backend + DB)

> **Tách frontend và backend**, tối ưu cho từng phần

**Ưu điểm:**
- Vercel miễn phí cho frontend (static hosting tốt nhất)
- Render free tier cho backend
- PostgreSQL miễn phí 90 ngày trên Render

**Nhược điểm:**
- Cần quản lý 2 platform
- Render free tier: cold start ~30s
- Cần cấu hình CORS giữa 2 domain

---

## 4. Hướng Dẫn Deploy Từng Phương Án

### 🏆 Phương Án 1: VPS + Docker Compose (Chi Tiết)

#### Bước 1: Mua và Setup VPS

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Update hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Cài Docker Compose (nếu chưa có)
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

#### Bước 2: Clone & Cấu Hình

```bash
# Clone repo
git clone https://github.com/your-username/meilearning-system.git
cd meilearning-system

# Tạo file .env cho backend từ template
cp backend/.env.example backend/.env
nano backend/.env
```

#### Bước 3: Cấu Hình `.env` Cho Production

```env
# ── Database ────────────────────────────────────────────
DB_HOST=postgres
DB_PORT=5432
DB_NAME=meilearning
DB_USERNAME=meilearning_user
DB_PASSWORD=<MẬT_KHẨU_MẠNH_32_KÝ_TỰ>

# ── JWT ─────────────────────────────────────────────────
JWT_SECRET=<KẾT_QUẢ_TỪ: openssl rand -base64 64>
JWT_EXPIRATION_MS=86400000

# ── Server ──────────────────────────────────────────────
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# ── CORS ────────────────────────────────────────────────
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ── Logging ─────────────────────────────────────────────
LOG_LEVEL_APP=WARN
LOG_LEVEL_SECURITY=WARN

# ── JPA ─────────────────────────────────────────────────
DDL_AUTO=validate
SHOW_SQL=false

# ── Email ───────────────────────────────────────────────
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=<APP_PASSWORD_16_KÝ_TỰ>
MAIL_FROM=noreply@yourdomain.com

# ── SMS ─────────────────────────────────────────────────
SPEEDSMS_API_KEY=<API_KEY_THẬT>
SPEEDSMS_SENDER=MeiLearn
SPEEDSMS_TYPE=2
SPEEDSMS_MAX_PER_DAY=3
```

#### Bước 4: Cập Nhật `docker-compose.yml` Cho Production

Thêm file `docker-compose.prod.yml` override:

```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      SPRING_PROFILES_ACTIVE: prod
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M

  frontend:
    environment:
      VITE_API_BASE_URL: https://yourdomain.com/api/v1
    restart: always

  postgres:
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
```

#### Bước 5: Deploy

```bash
# Build và start
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Kiểm tra logs
docker compose logs -f

# Kiểm tra health
curl http://localhost:8080/actuator/health
```

#### Bước 6: Setup Nginx Reverse Proxy + SSL

```bash
# Cài Nginx
sudo apt install nginx -y

# Cài Certbot cho SSL miễn phí
sudo apt install certbot python3-certbot-nginx -y
```

Tạo file `/etc/nginx/sites-available/meilearning`:

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Upload file hỗ trợ đến 10MB
        client_max_body_size 10M;
    }

    # File uploads
    location /uploads/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
    }

    # Health check
    location /actuator/health {
        proxy_pass http://localhost:8080;
    }

    listen 80;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/meilearning /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Cài SSL (tự động)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew SSL (cron tự động)
sudo certbot renew --dry-run
```

---

### 📌 Phương Án 2: Railway (Nhanh Gọn)

#### Bước 1: Tạo Project
```
1. Vào https://railway.app → "New Project"
2. Chọn "Deploy from GitHub repo"
3. Chọn repo MeiLearning System
```

#### Bước 2: Thêm PostgreSQL
```
1. Trong project → "New" → "Database" → "PostgreSQL"
2. Copy connection string tự động
```

#### Bước 3: Cấu Hình Environment Variables
```
1. Vào service Backend → "Variables"
2. Thêm tất cả biến từ .env.example
3. Railway tự inject DATABASE_URL cho PostgreSQL
```

#### Bước 4: Deploy
```
Railway tự build từ Dockerfile khi push lên GitHub
```

---

### 📌 Phương Án 3: Vercel + Render

#### Frontend (Vercel)
```
1. Vào https://vercel.com → Import Git Repository
2. Framework Preset: Vite
3. Build Command: npm run build
4. Output Directory: dist
5. Environment Variables:
   - VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

#### Backend (Render)
```
1. Vào https://render.com → "New" → "Web Service"
2. Connect GitHub repo, chọn backend directory
3. Runtime: Docker
4. Thêm Environment Variables từ .env.example
5. Thêm PostgreSQL: "New" → "PostgreSQL"
```

---

## 5. Clean Code & Tối Ưu Trước Deploy

### 🧹 Backend — Danh Sách Cần Clean

#### 5.1 Xóa Code Không Dùng
```bash
# Tìm import không dùng (IDE sẽ highlight)
# IntelliJ: Code → Optimize Imports (Ctrl+Alt+O)

# Tìm method/class không có reference
# IntelliJ: Analyze → Run Inspection by Name → "Unused declaration"
```

#### 5.2 Kiểm Tra & Xóa
- [ ] Xóa `System.out.println()` — thay bằng Logger
- [ ] Xóa code đã comment out (đã có Git history)
- [ ] Xóa TODO/FIXME đã hoàn thành
- [ ] Xóa test data / hardcoded values
- [ ] Kiểm tra exception handling — không catch rồi swallow

#### 5.3 Tối Ưu Database Queries
```java
// ❌ N+1 Query Problem
List<Student> students = studentRepo.findAll(); // rồi loop gọi getClasses()

// ✅ Dùng JOIN FETCH hoặc @EntityGraph
@Query("SELECT s FROM Student s JOIN FETCH s.classes WHERE s.id = :id")
Optional<Student> findByIdWithClasses(@Param("id") Long id);
```

#### 5.4 Kiểm Tra API Response
- [ ] Tất cả API trả về format thống nhất (ResponseEntity)
- [ ] Error response có message rõ ràng
- [ ] Không leak stack trace ra client

### 🧹 Frontend — Danh Sách Cần Clean

#### 5.5 Build Check
```bash
cd frontend

# Kiểm tra TypeScript errors
npx tsc --noEmit

# Kiểm tra ESLint
npm run lint

# Build thử
npm run build
```

#### 5.6 Kiểm Tra & Xóa
- [ ] Xóa `console.log()` / `console.debug()`
- [ ] Xóa component không sử dụng
- [ ] Kiểm tra hardcoded URLs → chuyển sang env variables
- [ ] Kiểm tra `any` type → thay bằng proper type
- [ ] Xóa `// @ts-ignore` không cần thiết

#### 5.7 Performance
- [ ] Lazy load routes (`React.lazy` + `Suspense`)
- [ ] Kiểm tra re-render không cần thiết (React DevTools Profiler)
- [ ] Optimize images (WebP format, compression)
- [ ] Bundle size analysis:
  ```bash
  npx vite-bundle-visualizer
  ```

---

## 6. Bảo Mật (Security Hardening)

### 🔐 Backend Security

#### 6.1 JWT Secret
```bash
# Tạo secret mới, KHÔNG dùng default
openssl rand -base64 64
# Kết quả ví dụ: k8F2x9G...dài 88 ký tự...
# Paste vào JWT_SECRET trong .env
```

#### 6.2 Tắt Swagger trên Production
Tạo file `application-prod.properties`:
```properties
# Tắt Swagger UI trên production
springdoc.swagger-ui.enabled=false
springdoc.api-docs.enabled=false

# Logging
logging.level.com.meilearning.backend=WARN
logging.level.org.springframework.security=WARN

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
```

#### 6.3 Rate Limiting (nếu chưa có)
Thêm dependency vào `pom.xml`:
```xml
<!-- Bucket4j for rate limiting -->
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.10.1</version>
</dependency>
```

#### 6.4 Security Headers
Kiểm tra Spring Security config đã có:
- CSRF protection (cho non-API routes)
- XSS protection headers
- Content-Type sniffing protection
- HSTS header

### 🔐 Frontend Security

- [ ] Không lưu token trong `localStorage` nếu có thể (ưu tiên HttpOnly cookie)
- [ ] Sanitize user input trước khi render (XSS prevention)
- [ ] Kiểm tra không expose sensitive data trong source code
- [ ] CSP (Content Security Policy) headers

### 🔐 Infrastructure Security

- [ ] **SSH Key-only login** — Tắt password authentication
  ```bash
  sudo nano /etc/ssh/sshd_config
  # PasswordAuthentication no
  sudo systemctl restart sshd
  ```
- [ ] **Firewall** — Chỉ mở port cần thiết
  ```bash
  sudo ufw allow 22/tcp   # SSH
  sudo ufw allow 80/tcp   # HTTP
  sudo ufw allow 443/tcp  # HTTPS
  sudo ufw enable
  ```
- [ ] **Fail2ban** — Chống brute force
  ```bash
  sudo apt install fail2ban -y
  sudo systemctl enable fail2ban
  ```

---

## 7. Cấu Hình Production

### 7.1 Tạo Spring Profile `prod`

Tạo `backend/src/main/resources/application-prod.properties`:

```properties
# ============================================================================
# MeiLearning — Production Configuration
# ============================================================================

# ── JPA ─────────────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# ── Logging ─────────────────────────────────────────────
logging.level.com.meilearning.backend=WARN
logging.level.org.springframework.security=WARN
logging.level.org.hibernate.SQL=OFF

# ── Swagger (tắt trên production) ──────────────────────
springdoc.swagger-ui.enabled=false
springdoc.api-docs.enabled=false

# ── Actuator (giới hạn endpoints) ──────────────────────
management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=never

# ── Connection Pool ────────────────────────────────────
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.connection-timeout=20000
```

### 7.2 Frontend Environment

Tạo `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://yourdomain.com/api/v1
VITE_ZALO_URL=https://zalo.me/0973734061
VITE_HOTLINE=0973734061
```

---

## 8. Domain & SSL

### 8.1 Mua Domain
- 🇻🇳 **Tên Miền Việt Nam**: INET, Nhân Hòa, Mắt Bão (~150k–300k/năm cho `.vn`)
- 🌍 **Domain Quốc Tế**: Namecheap, Cloudflare, Google Domains (~$10/năm cho `.com`)

### 8.2 Trỏ DNS
```
Tại DNS provider:
  A Record:    @ → IP_VPS_CỦA_BẠN
  A Record:  www → IP_VPS_CỦA_BẠN
  
# Nếu dùng Cloudflare (khuyên dùng):
  A Record:    @ → IP_VPS → Proxied (orange cloud)
  CNAME:     www → @ → Proxied
```

### 8.3 SSL Certificate (Miễn phí với Let's Encrypt)
```bash
# Đã cài ở bước Nginx phía trên
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Tự động renew (cron mỗi 12h)
echo "0 0,12 * * * root certbot renew --quiet" | sudo tee -a /etc/crontab
```

---

## 9. CI/CD Pipeline

### GitHub Actions (Khuyến Nghị)

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy MeiLearning

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/deploy/meilearning-system
            git pull origin main
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
            docker system prune -f
```

**Cài đặt GitHub Secrets:**
```
Settings → Secrets → Actions:
  VPS_HOST       = IP máy chủ
  VPS_USERNAME   = deploy (user trên VPS)
  VPS_SSH_KEY    = Private SSH key
```

---

## 10. Monitoring & Logging

### 10.1 Kiểm Tra Health

```bash
# Backend health check (đã có Actuator)
curl https://yourdomain.com/actuator/health
# Expected: {"status":"UP"}
```

### 10.2 Docker Logs

```bash
# Xem logs realtime
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Xem logs 100 dòng gần nhất
docker compose logs --tail=100 backend
```

### 10.3 Uptime Monitoring (Miễn Phí)

- **UptimeRobot** (uptimerobot.com) — Free 50 monitors
- **Better Uptime** (betterstack.com) — Free tier
- Cấu hình check endpoint: `https://yourdomain.com/actuator/health`

### 10.4 Disk & Resource Monitoring

```bash
# Kiểm tra disk usage
df -h

# Kiểm tra Docker disk usage
docker system df

# Dọn dẹp Docker (images/containers cũ)
docker system prune -a --volumes
```

---

## 11. Backup & Recovery

### 11.1 Backup PostgreSQL Tự Động

Tạo script `backup.sh`:

```bash
#!/bin/bash
# ============================================================================
# MeiLearning — Database Backup Script
# ============================================================================

BACKUP_DIR="/home/deploy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/meilearning_$TIMESTAMP.sql.gz"

# Tạo thư mục nếu chưa có
mkdir -p $BACKUP_DIR

# Backup
docker exec meilearning-db pg_dump -U postgres meilearning | gzip > $BACKUP_FILE

# Xóa backup cũ hơn 30 ngày
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup completed: $BACKUP_FILE"
```

```bash
# Cấp quyền chạy
chmod +x backup.sh

# Cron job: backup mỗi ngày lúc 2h sáng
crontab -e
# Thêm dòng:
0 2 * * * /home/deploy/backup.sh >> /home/deploy/backups/backup.log 2>&1
```

### 11.2 Restore Database

```bash
# Restore từ backup
gunzip < meilearning_20260325_020000.sql.gz | docker exec -i meilearning-db psql -U postgres meilearning
```

---

## 12. Post-Deploy Checklist

### ✅ Kiểm Tra Sau Deploy

- [ ] Website load được trên trình duyệt
- [ ] HTTPS hoạt động (khóa xanh trên address bar)
- [ ] Đăng nhập/Đăng ký hoạt động
- [ ] Tất cả roles đều vào được dashboard (Admin, Teacher, Student)
- [ ] CRUD cơ bản hoạt động (tạo, sửa, xóa)
- [ ] Upload file hoạt động
- [ ] Gửi email hoạt động (reset password, thông báo)
- [ ] Gửi SMS hoạt động
- [ ] Tạo/export PDF hoạt động
- [ ] QR Code scan hoạt động
- [ ] Check trên mobile (responsive)
- [ ] Swagger UI **KHÔNG** truy cập được trên production
- [ ] `/actuator/health` trả về `{"status":"UP"}`
- [ ] Backup database chạy tự động
- [ ] Monitoring alert hoạt động

### 🔄 Quy Trình Update Sau Này

```bash
# 1. Push code lên GitHub (branch main)
git push origin main

# 2. Nếu có CI/CD: tự động deploy
# 3. Nếu thủ công:
ssh deploy@your-vps-ip
cd /home/deploy/meilearning-system
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker system prune -f
```

---

## 📝 Tóm Tắt Nhanh — Chọn Phương Án Nào?

| Nếu bạn muốn... | Chọn |
|---|---|
| **Rẻ nhất, kiểm soát hoàn toàn** | VPS + Docker Compose |
| **Nhanh nhất, ít config** | Railway |
| **Frontend free, backend riêng** | Vercel + Render |
| **Enterprise, auto-scale** | AWS ECS/EC2 |

> **💡 Khuyến nghị cho MeiLearning:** Sử dụng **VPS + Docker Compose** (Hetzner hoặc DigitalOcean) vì đã có sẵn Docker setup, chi phí rẻ, và kiểm soát hoàn toàn. Dự án giáo dục không cần auto-scale phức tạp.

---

*Tài liệu được tạo: 25/03/2026*
*Dự án: MeiLearning System v1.0.0*
