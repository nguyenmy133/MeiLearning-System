# Analytics Dashboard - Documentation

## 📊 Tổng quan

Analytics Dashboard là trang tổng hợp và phân tích dữ liệu toàn diện cho hệ thống EduTrack. Được thiết kế với kinh nghiệm 10 năm trong phát triển dashboard analytics, trang này cung cấp insights chi tiết về hoạt động của trung tâm.

## ✨ Tính năng chính

### 1. **KPI Cards** (Chỉ số hiệu suất chính)
- **Tổng học viên**: Hiển thị số lượng học viên hiện tại với trend so với tháng trước
- **Doanh thu tháng**: Tổng doanh thu với xu hướng tăng/giảm
- **Tỷ lệ điểm danh**: Phần trăm điểm danh trung bình
- **Lớp đang hoạt động**: Số lượng lớp học đang diễn ra

### 2. **Tab Doanh thu**
#### Revenue Chart
- Biểu đồ line chart hiển thị 3 metrics:
  - **Doanh thu** (màu primary)
  - **Chi phí** (màu destructive/đỏ)
  - **Lợi nhuận** (màu success/xanh)
- Theo dõi xu hướng 12 tháng gần nhất
- Format tiền tệ VND chuẩn

#### Payment Status Chart
- Pie chart phân tích tình trạng thanh toán:
  - Đã thanh toán (success/xanh)
  - Chờ thanh toán (warning/vàng)
  - Quá hạn (destructive/đỏ)
- Stats cards chi tiết cho từng trạng thái
- Hiển thị số lượng học viên và số tiền

#### Weekly Activity Chart
- Grouped bar chart theo ngày trong tuần
- 3 metrics: Số lớp, Học viên đăng ký, Điểm danh
- Giúp phân tích hoạt động theo thời gian

### 3. **Tab Điểm danh**
#### Attendance Chart
- Bar chart với color-coding theo performance:
  - Xanh lá (≥90%): Xuất sắc
  - Xanh dương (80-89%): Tốt
  - Vàng (70-79%): Trung bình
  - Đỏ (<70%): Cần cải thiện

#### Retention Chart
- Multi-line chart với 4 metrics:
  - Học viên mới
  - Giữ chân
  - Rời đi
  - Tỷ lệ giữ chân (%)
- Dual Y-axis cho số lượng và phần trăm

#### Top Performing Classes
- Ranking top 5 lớp xuất sắc
- Medals (🥇🥈🥉) cho top 3
- Metrics: Điểm TB, Tỷ lệ đạt, Tỷ lệ giỏi/xuất sắc
- Gradient background cho top 1

### 4. **Tab Phân bố**
#### Student Distribution Chart
- Pie chart phân bố học viên theo lớp
- Hiển thị số lượng và phần trăm
- Legend với thông tin chi tiết

#### Weekly Activity Chart
- Tái sử dụng từ tab Doanh thu
- Cung cấp góc nhìn khác về phân bố

### 5. **Tab Giảng viên**
#### Teacher Performance Table
- Bảng chi tiết hiệu suất giảng viên:
  - Tên giảng viên
  - Môn học (badge)
  - Số lớp
  - Số học viên
  - Tỷ lệ điểm danh (color-coded)
  - Đánh giá (rating với stars)
  - Doanh thu
- Hover effects và responsive design
- Color-coding cho các metrics

### 6. **Tab Khóa học**
#### Course Popularity Chart
- Dual-axis bar chart:
  - Số đăng ký (left axis)
  - Doanh thu (right axis)
- So sánh độ phổ biến giữa các khóa học
- Compact currency format

### 7. **Insights & Recommendations**
- 3 cards tự động phân tích:
  - **Tăng trưởng tốt**: Highlight các điểm mạnh
  - **Cần chú ý**: Cảnh báo các vấn đề
  - **Đề xuất**: Gợi ý hành động
- Gradient background với border accent

## 🎨 Design Principles

### Color System
- **Primary**: Màu chủ đạo cho các elements quan trọng
- **Success**: Màu xanh lá cho metrics tích cực
- **Warning**: Màu vàng cho cảnh báo
- **Destructive**: Màu đỏ cho vấn đề cần giải quyết
- **Info**: Màu xanh dương cho thông tin

### Responsive Design
- Mobile-first approach
- Grid system responsive:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3-4 columns
- Tabs responsive với grid layout

### UX Enhancements
- **Hover effects**: Scale và background transitions
- **Color-coding**: Visual feedback cho metrics
- **Icons**: Lucide icons cho clarity
- **Tooltips**: Chi tiết khi hover vào charts
- **Legends**: Giải thích rõ ràng cho charts

## 📁 File Structure

```
analytics/
├── AnalyticsDashboard.tsx          # Main dashboard component
├── mockData.ts                      # Mock data cho tất cả components
└── components/
    ├── KPICards.tsx                 # 4 KPI cards
    ├── RevenueChart.tsx             # Revenue/Expenses/Profit chart
    ├── AttendanceChart.tsx          # Attendance by class
    ├── StudentDistributionChart.tsx # Student distribution pie
    ├── TeacherPerformanceTable.tsx  # Teacher performance table
    ├── CoursePopularityChart.tsx    # Course popularity dual-axis
    ├── PaymentStatusChart.tsx       # Payment status pie + stats
    ├── RetentionChart.tsx           # Student retention multi-line
    ├── WeeklyActivityChart.tsx      # Weekly activity grouped bar
    └── TopPerformingClasses.tsx     # Top 5 classes ranking
```

## 🔧 Mock Data

Tất cả mock data được định nghĩa trong `mockData.ts`:

- `mockOverviewData`: KPI metrics
- `mockRevenueData`: 12 tháng revenue/expenses/profit
- `mockAttendanceData`: Attendance by class
- `mockStudentDistribution`: Student distribution
- `mockTeacherPerformance`: Teacher metrics
- `mockCoursePopularity`: Course enrollment & revenue
- `mockPaymentStatus`: Payment breakdown
- `mockRetentionData`: 12 tháng retention metrics
- `mockWeeklyActivity`: Weekly activity data
- `mockTopPerformingClasses`: Top 5 classes

## 🚀 Future Enhancements

### Planned Features
1. **Date Range Picker**: Filter data theo khoảng thời gian
2. **Export Reports**: Export PDF/Excel
3. **Real-time Updates**: WebSocket integration
4. **Drill-down**: Click vào chart để xem chi tiết
5. **Comparison Mode**: So sánh nhiều kỳ
6. **Custom Dashboards**: User-defined layouts
7. **Alerts & Notifications**: Tự động cảnh báo
8. **Predictive Analytics**: AI-powered insights

### Technical Improvements
1. **Loading States**: Skeleton loaders
2. **Error Boundaries**: Graceful error handling
3. **Data Caching**: Optimize performance
4. **Lazy Loading**: Code splitting
5. **Accessibility**: ARIA labels, keyboard navigation
6. **Dark Mode**: Full dark mode support
7. **Print Styles**: Optimized for printing

## 💡 Best Practices Applied

1. **Component Reusability**: Các components được thiết kế để tái sử dụng
2. **Type Safety**: TypeScript interfaces cho tất cả props
3. **Responsive Design**: Mobile-first approach
4. **Performance**: Optimized rendering với React best practices
5. **Maintainability**: Clear file structure và naming conventions
6. **User Experience**: Intuitive navigation và visual feedback
7. **Data Visualization**: Appropriate chart types cho từng use case
8. **Accessibility**: Semantic HTML và proper ARIA labels

## 📝 Notes

- Tất cả currency được format theo chuẩn VND
- Charts sử dụng Recharts library
- UI components từ shadcn/ui
- Icons từ Lucide React
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

---

**Developed with 10 years of experience in analytics dashboard development** 🎯
