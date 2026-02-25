// Mock data for Analytics Dashboard

export const mockOverviewData = {
    totalStudents: 245,
    totalRevenue: 122500000,
    attendanceRate: 87.5,
    activeClasses: 18,
    trends: {
        students: 12.5,
        revenue: 8.3,
        attendance: 2.1,
        classes: 5.9
    }
};

export const mockRevenueData = [
    { month: '2024-01', revenue: 98000000, students: 210, expenses: 45000000, profit: 53000000 },
    { month: '2024-02', revenue: 102000000, students: 215, expenses: 46000000, profit: 56000000 },
    { month: '2024-03', revenue: 105000000, students: 220, expenses: 47000000, profit: 58000000 },
    { month: '2024-04', revenue: 108000000, students: 225, expenses: 48000000, profit: 60000000 },
    { month: '2024-05', revenue: 110000000, students: 228, expenses: 49000000, profit: 61000000 },
    { month: '2024-06', revenue: 112000000, students: 230, expenses: 49500000, profit: 62500000 },
    { month: '2024-07', revenue: 115000000, students: 235, expenses: 50000000, profit: 65000000 },
    { month: '2024-08', revenue: 117000000, students: 238, expenses: 51000000, profit: 66000000 },
    { month: '2024-09', revenue: 118000000, students: 240, expenses: 51500000, profit: 66500000 },
    { month: '2024-10', revenue: 120000000, students: 242, expenses: 52000000, profit: 68000000 },
    { month: '2024-11', revenue: 121000000, students: 243, expenses: 52500000, profit: 68500000 },
    { month: '2024-12', revenue: 122500000, students: 245, expenses: 53000000, profit: 69500000 }
];

export const mockAttendanceData = [
    { className: 'Toán 10A', attendanceRate: 92.5, totalSessions: 48, avgStudents: 18 },
    { className: 'Toán 11B', attendanceRate: 88.3, totalSessions: 45, avgStudents: 16 },
    { className: 'Lý 10C', attendanceRate: 85.7, totalSessions: 42, avgStudents: 15 },
    { className: 'Hóa 11A', attendanceRate: 90.2, totalSessions: 46, avgStudents: 14 },
    { className: 'Anh 12B', attendanceRate: 87.9, totalSessions: 44, avgStudents: 12 },
    { className: 'Văn 10D', attendanceRate: 83.4, totalSessions: 40, avgStudents: 10 },
    { className: 'Toán 12A', attendanceRate: 91.8, totalSessions: 47, avgStudents: 20 },
    { className: 'Lý 11D', attendanceRate: 86.5, totalSessions: 43, avgStudents: 13 }
];

export const mockStudentDistribution = [
    { className: 'Toán 10', studentCount: 45, percentage: 18.4, growth: 8.5 },
    { className: 'Toán 11', studentCount: 38, percentage: 15.5, growth: 5.2 },
    { className: 'Toán 12', studentCount: 42, percentage: 17.1, growth: 12.3 },
    { className: 'Lý 10', studentCount: 35, percentage: 14.3, growth: -2.1 },
    { className: 'Lý 11', studentCount: 30, percentage: 12.2, growth: 3.4 },
    { className: 'Hóa 11', studentCount: 25, percentage: 10.2, growth: 15.6 },
    { className: 'Anh 12', studentCount: 20, percentage: 8.2, growth: 7.8 },
    { className: 'Văn 10', studentCount: 10, percentage: 4.1, growth: -5.3 }
];

// Teacher Performance Data
export const mockTeacherPerformance = [
    {
        teacherName: 'Nguyễn Văn A',
        subject: 'Toán',
        totalClasses: 3,
        totalStudents: 65,
        avgAttendance: 92.5,
        avgRating: 4.8,
        revenue: 28000000
    },
    {
        teacherName: 'Trần Thị B',
        subject: 'Lý',
        totalClasses: 2,
        totalStudents: 48,
        avgAttendance: 88.3,
        avgRating: 4.6,
        revenue: 22000000
    },
    {
        teacherName: 'Lê Văn C',
        subject: 'Hóa',
        totalClasses: 2,
        totalStudents: 40,
        avgAttendance: 90.2,
        avgRating: 4.7,
        revenue: 18000000
    },
    {
        teacherName: 'Phạm Thị D',
        subject: 'Anh',
        totalClasses: 2,
        totalStudents: 35,
        avgAttendance: 87.9,
        avgRating: 4.9,
        revenue: 20000000
    },
    {
        teacherName: 'Hoàng Văn E',
        subject: 'Văn',
        totalClasses: 1,
        totalStudents: 22,
        avgAttendance: 85.4,
        avgRating: 4.5,
        revenue: 12000000
    }
];

// Course Popularity Data
export const mockCoursePopularity = [
    {
        courseName: 'Toán Nâng Cao 12',
        enrollments: 42,
        completionRate: 85.7,
        avgScore: 8.5,
        revenue: 35000000,
        trend: 15.2
    },
    {
        courseName: 'Toán Cơ Bản 10',
        enrollments: 45,
        completionRate: 92.3,
        avgScore: 7.8,
        revenue: 32000000,
        trend: 8.5
    },
    {
        courseName: 'Lý Nâng Cao 11',
        enrollments: 30,
        completionRate: 88.5,
        avgScore: 8.2,
        revenue: 25000000,
        trend: 3.4
    },
    {
        courseName: 'Hóa Cơ Bản 11',
        enrollments: 25,
        completionRate: 90.0,
        avgScore: 8.0,
        revenue: 18000000,
        trend: 12.8
    },
    {
        courseName: 'Tiếng Anh Giao Tiếp',
        enrollments: 20,
        completionRate: 95.0,
        avgScore: 8.8,
        revenue: 22000000,
        trend: 18.5
    }
];

// Payment Status Data
export const mockPaymentStatus = {
    paid: 185,
    pending: 42,
    overdue: 18,
    totalAmount: 122500000,
    paidAmount: 98000000,
    pendingAmount: 18500000,
    overdueAmount: 6000000
};

// Student Retention Data
export const mockRetentionData = [
    { month: '2024-01', newStudents: 15, retained: 195, churned: 8, retentionRate: 96.1 },
    { month: '2024-02', newStudents: 12, retained: 203, churned: 5, retentionRate: 97.6 },
    { month: '2024-03', newStudents: 18, retained: 210, churned: 7, retentionRate: 96.8 },
    { month: '2024-04', newStudents: 20, retained: 218, churned: 6, retentionRate: 97.3 },
    { month: '2024-05', newStudents: 14, retained: 225, churned: 9, retentionRate: 96.2 },
    { month: '2024-06', newStudents: 16, retained: 228, churned: 4, retentionRate: 98.3 },
    { month: '2024-07', newStudents: 22, retained: 232, churned: 8, retentionRate: 96.7 },
    { month: '2024-08', newStudents: 18, retained: 238, churned: 5, retentionRate: 97.9 },
    { month: '2024-09', newStudents: 15, retained: 240, churned: 7, retentionRate: 97.2 },
    { month: '2024-10', newStudents: 19, retained: 242, churned: 6, retentionRate: 97.6 },
    { month: '2024-11', newStudents: 17, retained: 243, churned: 8, retentionRate: 96.8 },
    { month: '2024-12', newStudents: 21, retained: 245, churned: 5, retentionRate: 98.0 }
];

// Financial Breakdown
export const mockFinancialBreakdown = {
    revenue: {
        tuitionFees: 98000000,
        registrationFees: 12500000,
        materialFees: 8000000,
        other: 4000000
    },
    expenses: {
        salaries: 35000000,
        rent: 8000000,
        utilities: 3500000,
        materials: 4000000,
        marketing: 2500000,
        other: 2000000
    }
};

// Top Performing Classes
export const mockTopPerformingClasses = [
    { className: 'Toán 12A', avgScore: 8.8, passRate: 98.5, excellentRate: 45.2 },
    { className: 'Anh 12B', avgScore: 8.6, passRate: 100, excellentRate: 52.3 },
    { className: 'Toán 10A', avgScore: 8.5, passRate: 96.8, excellentRate: 42.1 },
    { className: 'Hóa 11A', avgScore: 8.4, passRate: 95.2, excellentRate: 38.5 },
    { className: 'Lý 11D', avgScore: 8.2, passRate: 94.8, excellentRate: 35.7 }
];

// Weekly Activity Data
export const mockWeeklyActivity = [
    { day: 'T2', classes: 12, students: 156, attendance: 142 },
    { day: 'T3', classes: 15, students: 189, attendance: 168 },
    { day: 'T4', classes: 14, students: 178, attendance: 162 },
    { day: 'T5', classes: 16, students: 198, attendance: 178 },
    { day: 'T6', classes: 13, students: 165, attendance: 148 },
    { day: 'T7', classes: 18, students: 225, attendance: 205 },
    { day: 'CN', classes: 20, students: 248, attendance: 228 }
];
