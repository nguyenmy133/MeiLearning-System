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
    { month: '2024-01', revenue: 98000000, students: 210 },
    { month: '2024-02', revenue: 102000000, students: 215 },
    { month: '2024-03', revenue: 105000000, students: 220 },
    { month: '2024-04', revenue: 108000000, students: 225 },
    { month: '2024-05', revenue: 110000000, students: 228 },
    { month: '2024-06', revenue: 112000000, students: 230 },
    { month: '2024-07', revenue: 115000000, students: 235 },
    { month: '2024-08', revenue: 117000000, students: 238 },
    { month: '2024-09', revenue: 118000000, students: 240 },
    { month: '2024-10', revenue: 120000000, students: 242 },
    { month: '2024-11', revenue: 121000000, students: 243 },
    { month: '2024-12', revenue: 122500000, students: 245 }
];

export const mockAttendanceData = [
    { className: 'Toán 10A', attendanceRate: 92.5, totalSessions: 48 },
    { className: 'Toán 11B', attendanceRate: 88.3, totalSessions: 45 },
    { className: 'Lý 10C', attendanceRate: 85.7, totalSessions: 42 },
    { className: 'Hóa 11A', attendanceRate: 90.2, totalSessions: 46 },
    { className: 'Anh 12B', attendanceRate: 87.9, totalSessions: 44 },
    { className: 'Văn 10D', attendanceRate: 83.4, totalSessions: 40 },
    { className: 'Toán 12A', attendanceRate: 91.8, totalSessions: 47 },
    { className: 'Lý 11D', attendanceRate: 86.5, totalSessions: 43 }
];

export const mockStudentDistribution = [
    { className: 'Toán 10', studentCount: 45, percentage: 18.4 },
    { className: 'Toán 11', studentCount: 38, percentage: 15.5 },
    { className: 'Toán 12', studentCount: 42, percentage: 17.1 },
    { className: 'Lý 10', studentCount: 35, percentage: 14.3 },
    { className: 'Lý 11', studentCount: 30, percentage: 12.2 },
    { className: 'Hóa 11', studentCount: 25, percentage: 10.2 },
    { className: 'Anh 12', studentCount: 20, percentage: 8.2 },
    { className: 'Văn 10', studentCount: 10, percentage: 4.1 }
];
