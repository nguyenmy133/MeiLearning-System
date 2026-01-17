# 🎓 EduTrack - Hệ Thống Quản Lý Trung Tâm Giáo Dục

<div align="center">

![EduTrack Banner](https://img.shields.io/badge/EduTrack-Education%20Management-10b981?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?style=for-the-badge&logo=tailwind-css)

**Hệ thống quản lý toàn diện cho trung tâm giáo dục với giao diện hiện đại và trải nghiệm người dùng tối ưu**

[Tính năng](#-tính-năng-chính) • [Công nghệ](#-công-nghệ-sử-dụng) • [Cài đặt](#-cài-đặt) • [Cấu trúc](#-cấu-trúc-dự-án) • [Đóng góp](#-đóng-góp)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Hướng dẫn phát triển](#-hướng-dẫn-phát-triển)
- [Design System](#-design-system)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

---

## 🌟 Giới thiệu

**EduTrack** là một hệ thống quản lý trung tâm giáo dục toàn diện, được xây dựng với công nghệ hiện đại nhất. Hệ thống cung cấp giải pháp quản lý hoàn chỉnh cho 3 vai trò chính:

- 👨‍🎓 **Học viên**: Quản lý lịch học, điểm danh, tài liệu, bài thi
- 👨‍🏫 **Giáo viên**: Quản lý lớp học, điểm danh, chấm điểm, tài liệu
- 👨‍💼 **Quản trị viên**: Quản lý toàn bộ hệ thống, báo cáo, phân quyền

### ✨ Điểm nổi bật

- 🎨 **Giao diện hiện đại**: Thiết kế chuyên nghiệp với Emerald/Teal color palette
- 🌓 **Dark Mode**: Hỗ trợ chế độ sáng/tối với localStorage persistence
- 📱 **Responsive Design**: Tối ưu cho mọi thiết bị (mobile, tablet, desktop)
- ⚡ **Performance**: Sử dụng Vite cho build time nhanh chóng
- 🎯 **Type Safety**: TypeScript đảm bảo code quality
- 🧩 **Component Library**: shadcn/ui với Radix UI primitives
- 🎭 **Animations**: Smooth transitions và micro-interactions

---

## 🚀 Tính năng chính

### 📚 Cho Học viên

- ✅ **Dashboard cá nhân** với thống kê học tập
- 📅 **Thời khóa biểu** tương tác với calendar view
- 📱 **Điểm danh QR Code** nhanh chóng, tiện lợi
- 📊 **Lịch sử điểm danh** chi tiết theo buổi học
- 📖 **Thư viện tài liệu** phân loại theo môn học
- 🎥 **Video bài giảng** với player tích hợp
- 📝 **Hệ thống bài thi** online với timer
- 💰 **Quản lý học phí** và lịch sử thanh toán
- 📋 **Xin nghỉ/đi muộn** với workflow phê duyệt
- 💬 **Hệ thống ticket** hỗ trợ học viên
- 🔔 **Thông báo** real-time

### 👨‍🏫 Cho Giáo viên

- 📊 **Dashboard giảng dạy** với thống kê lớp học
- 📅 **Lịch dạy** cá nhân với reminder
- 👥 **Quản lý lớp học** và danh sách học viên
- ✅ **Điểm danh buổi học** với QR code generator
- 📚 **Quản lý tài liệu** upload/download
- 📝 **Quản lý bài thi** tạo đề, chấm điểm tự động
- 📈 **Điểm & nhận xét** cho từng học viên
- 🔄 **Yêu cầu đổi lịch** với workflow
- 🔔 **Thông báo** từ hệ thống

### 👨‍💼 Cho Quản trị viên

- 📊 **Dashboard tổng quan** với analytics
- 🏢 **Quản lý cơ sở & phòng học**
- 👨‍🏫 **Quản lý giáo viên** CRUD operations
- 👨‍🎓 **Quản lý học viên** import/export
- 📚 **Quản lý lớp học** phân công giáo viên
- 📅 **Lịch học** toàn trung tâm
- ✅ **Điểm danh** theo dõi tổng thể
- 💰 **Quản lý học phí** thu chi, công nợ
- 🎯 **CRM Lead** quản lý khách hàng tiềm năng
- 💬 **Ticket support** xử lý yêu cầu
- 📈 **Báo cáo** đa dạng với charts
- 🔐 **RBAC** phân quyền chi tiết
- 📜 **Audit log** theo dõi hoạt động
- ⚙️ **Cấu hình QR** điểm danh

---

## 🛠️ Công nghệ sử dụng

### Core Technologies

| Technology | Version | Description |
|-----------|---------|-------------|
| **React** | 18.3.1 | UI Library |
| **TypeScript** | 5.8.3 | Type Safety |
| **Vite** | 5.4.19 | Build Tool |
| **React Router** | 6.30.1 | Routing |
| **TanStack Query** | 5.83.0 | Data Fetching |

### UI & Styling

| Technology | Version | Description |
|-----------|---------|-------------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |
| **shadcn/ui** | Latest | Component Library |
| **Radix UI** | Latest | Headless UI Primitives |
| **Lucide React** | 0.462.0 | Icon Library |
| **Recharts** | 2.15.4 | Charts & Graphs |

### Form & Validation

| Technology | Version | Description |
|-----------|---------|-------------|
| **React Hook Form** | 7.61.1 | Form Management |
| **Zod** | 3.25.76 | Schema Validation |

### Utilities

| Technology | Version | Description |
|-----------|---------|-------------|
| **date-fns** | 3.6.0 | Date Utilities |
| **clsx** | 2.1.1 | Class Names |
| **tailwind-merge** | 2.6.0 | Merge Tailwind Classes |

---

## 💻 Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 hoặc **yarn**: >= 1.22.0
- **Git**: Latest version

---

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/your-username/EduTrack_FE.git
cd EduTrack_FE
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Chạy development server

```bash
npm run dev
# hoặc
yarn dev
```

Server sẽ chạy tại: `http://localhost:5173`

### 4. Build production

```bash
npm run build
# hoặc
yarn build
```

### 5. Preview production build

```bash
npm run preview
# hoặc
yarn preview
```

---

## 📁 Cấu trúc dự án

```
EduTrack_FE/
├── public/                      # Static assets
│   ├── hero-classroom.jpg
│   └── ...
├── src/
│   ├── assets/                  # Images, fonts, etc.
│   ├── components/              # Shared components
│   │   ├── ui/                  # shadcn/ui components
│   │   └── ThemeToggle.tsx      # Dark mode toggle
│   ├── features/                # Feature-based modules
│   │   ├── landing/             # Landing pages
│   │   │   ├── components/      # Landing components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   └── ...
│   │   ├── user/                # User portal
│   │   │   ├── pages/           # User pages
│   │   │   └── UserLayout.tsx
│   │   ├── teacher/             # Teacher portal
│   │   │   ├── pages/           # Teacher pages
│   │   │   └── TeacherLayout.tsx
│   │   └── admin/               # Admin portal
│   │       ├── pages/           # Admin pages
│   │       └── AdminLayout.tsx
│   ├── lib/                     # Utility functions
│   │   └── utils.ts
│   ├── pages/                   # Special pages
│   │   └── NotFound.tsx
│   ├── App.tsx                  # Main app component
│   ├── index.css                # Global styles
│   └── main.tsx                 # Entry point
├── .gitignore
├── components.json              # shadcn/ui config
├── eslint.config.js             # ESLint config
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── postcss.config.js            # PostCSS config
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
└── README.md                    # This file
```

---

## 🎨 Design System

### Color Palette

EduTrack sử dụng **Emerald/Teal** color system chuyên nghiệp:

#### Light Mode
- **Primary**: `hsl(160 84% 39%)` - Rich Emerald
- **Secondary**: `hsl(174 62% 47%)` - Soft Teal
- **Accent**: `hsl(184 81% 94%)` - Vibrant Cyan
- **Background**: `hsl(0 0% 99%)` - Clean White

#### Dark Mode
- **Primary**: `hsl(160 77% 49%)` - Bright Emerald
- **Secondary**: `hsl(174 62% 47%)` - Soft Teal
- **Accent**: `hsl(160 40% 15%)` - Deep Teal
- **Background**: `hsl(160 50% 6%)` - Deep Emerald

### Typography

- **Display Font**: Lexend (Headings)
- **Body Font**: Inter (Body text)
- **Font Sizes**: Responsive scale from `text-xs` to `text-6xl`

### Spacing

- **Container**: `max-w-7xl` with responsive padding
- **Section Padding**: `py-16 md:py-24 lg:py-32`
- **Component Spacing**: Consistent 4px base unit

### Components

- **Buttons**: 3 variants (Primary, Secondary, Ghost)
- **Cards**: Glass morphism effects with shadows
- **Badges**: Status-based color coding
- **Inputs**: Focus states with ring effects

---

## 🔧 Hướng dẫn phát triển

### Thêm component mới

```bash
# Sử dụng shadcn/ui CLI
npx shadcn-ui@latest add [component-name]
```

### Tạo feature mới

1. Tạo folder trong `src/features/[feature-name]/`
2. Tạo các pages trong `pages/`
3. Tạo layout nếu cần
4. Thêm routes vào `App.tsx`

### Coding Standards

- ✅ Sử dụng TypeScript cho type safety
- ✅ Follow React best practices (hooks, composition)
- ✅ Sử dụng Tailwind utility classes
- ✅ Component naming: PascalCase
- ✅ File naming: PascalCase cho components, camelCase cho utils
- ✅ Responsive-first approach

### Git Workflow

```bash
# Tạo branch mới
git checkout -b feature/ten-tinh-nang

# Commit changes
git add .
git commit -m "feat: mô tả ngắn gọn"

# Push to remote
git push origin feature/ten-tinh-nang

# Tạo Pull Request
```

### Commit Message Convention

- `feat:` Tính năng mới
- `fix:` Sửa lỗi
- `docs:` Cập nhật documentation
- `style:` Thay đổi styling
- `refactor:` Refactor code
- `test:` Thêm tests
- `chore:` Cập nhật build tools, dependencies

---

## 🎯 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run build:dev` | Build development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Contributors

- **Nguyễn Văn A** - *Initial work* - [GitHub](https://github.com/username)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Liên hệ

- **Email**: support@edutrack.com
- **Website**: https://edutrack.com
- **GitHub**: https://github.com/your-org/EduTrack_FE

---

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">

**Made with ❤️ by EduTrack Team**

⭐ Star this repo if you find it helpful!

</div>
