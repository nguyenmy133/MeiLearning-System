/**
 * Centralized Mock Data for Admin Pages
 * @description Professional mock data structure for EduTrack Admin Dashboard
 * @author Senior Developer with 10 years experience
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Teacher {
    id: number;
    name: string;
    avatar: string;
    email: string;
    phone: string;
    subjects: string[];
    classes: number;
    status: 'active' | 'inactive' | 'on_leave';
    joinDate: string;
    rating?: number;
    totalStudents?: number;
}

export interface Student {
    id: number;
    name: string;
    avatar: string;
    email: string;
    phone: string;
    parentPhone: string;
    classes: string[];
    status: 'active' | 'inactive' | 'graduated';
    tuitionStatus: 'paid' | 'pending' | 'overdue';
    enrollDate: string;
    dateOfBirth?: string;
    address?: string;
}

export interface Class {
    id: number;
    name: string;
    subject: string;
    teacher: {
        name: string;
        avatar: string;
    };
    students: number;
    maxStudents: number;
    schedule: string;
    room: string;
    facility: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'upcoming' | 'cancelled';
    progress: number;
    tuitionFee?: number;
}

export interface Facility {
    id: number;
    name: string;
    address: string;
    phone: string;
    manager: string;
    rooms: number;
    status: 'active' | 'inactive' | 'maintenance';
    capacity?: number;
    openingHours?: string;
}

export interface Room {
    id: number;
    name: string;
    facility: string;
    capacity: number;
    equipment: string;
    status: 'available' | 'occupied' | 'maintenance';
    floor?: number;
}

export interface AttendanceRecord {
    id: number;
    class: string;
    date: string;
    time: string;
    total: number;
    present: number;
    absent: number;
    late: number;
    rate: number;
    teacher: string;
    notes?: string;
}

export interface Payment {
    id: number;
    student: {
        name: string;
        avatar: string;
    };
    class: string;
    amount: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue' | 'cancelled';
    paidDate?: string;
    method?: string;
    invoiceNumber?: string;
}

export interface Ticket {
    id: string;
    title: string;
    requester: string;
    channel: 'Email' | 'Phone' | 'Web' | 'Chat';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    createdAt: string;
    assignee?: string;
    category?: string;
    description?: string;
}

export interface Role {
    id: number;
    name: string;
    description: string;
    type: 'system' | 'custom';
    status: 'active' | 'inactive';
    users: number;
    permissions: string[];
    createdAt?: string;
}

export interface AuditLog {
    id: number;
    actor: string;
    action: 'create' | 'update' | 'delete' | 'login' | 'export' | 'import';
    resource: string;
    result: 'success' | 'failed';
    ip: string;
    createdAt: string;
    details?: string;
}

export interface Lead {
    id: number;
    name: string;
    phone: string;
    email: string;
    need: string;
    source: string;
    status: 'new' | 'contacted' | 'consulting' | 'converted' | 'lost';
    createdAt: string;
    notes?: string;
    assignedTo?: string;
    followUpDate?: string;
}

export interface ScheduleSession {
    id: number;
    time: string;
    class: string;
    teacher: string;
    room: string;
    facility: string;
    students: number;
    status: 'completed' | 'ongoing' | 'upcoming' | 'cancelled';
    notes?: string;
}

export interface Report {
    id: string;
    name: string;
    type: string;
    period: string;
    status: 'ready' | 'processing' | 'failed';
    createdBy: string;
    createdAt: string;
    format: 'PDF' | 'Excel' | 'CSV';
    fileSize?: string;
    downloadUrl?: string;
}

// ============================================================================
// MOCK DATA - TEACHERS
// ============================================================================

export const mockTeachers: Teacher[] = [
    {
        id: 1,
        name: "Nguyễn Thị Mai",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        email: "mai.nguyen@edu.vn",
        phone: "0901234567",
        subjects: ["Toán", "Vật Lý"],
        classes: 4,
        status: "active",
        joinDate: "2020-01-15",
        rating: 4.8,
        totalStudents: 65,
    },
    {
        id: 2,
        name: "Trần Văn Hùng",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        email: "hung.tran@edu.vn",
        phone: "0912345678",
        subjects: ["Tiếng Anh"],
        classes: 3,
        status: "active",
        joinDate: "2019-08-20",
        rating: 4.6,
        totalStudents: 48,
    },
    {
        id: 3,
        name: "Lê Thị Hương",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
        email: "huong.le@edu.vn",
        phone: "0923456789",
        subjects: ["Hóa Học", "Sinh Học"],
        classes: 3,
        status: "active",
        joinDate: "2021-03-10",
        rating: 4.7,
        totalStudents: 40,
    },
    {
        id: 4,
        name: "Phạm Minh Tuấn",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        email: "tuan.pham@edu.vn",
        phone: "0934567890",
        subjects: ["Văn", "Lịch Sử"],
        classes: 2,
        status: "active",
        joinDate: "2018-09-01",
        rating: 4.9,
        totalStudents: 35,
    },
    {
        id: 5,
        name: "Hoàng Thị Lan",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        email: "lan.hoang@edu.vn",
        phone: "0945678901",
        subjects: ["Tin Học"],
        classes: 4,
        status: "active",
        joinDate: "2022-09-01",
        rating: 4.5,
        totalStudents: 55,
    },
    {
        id: 6,
        name: "Đỗ Văn Thành",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        email: "thanh.do@edu.vn",
        phone: "0956789012",
        subjects: ["Địa Lý", "GDCD"],
        classes: 2,
        status: "on_leave",
        joinDate: "2021-06-15",
        rating: 4.3,
        totalStudents: 28,
    },
    {
        id: 7,
        name: "Vũ Thị Nga",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
        email: "nga.vu@edu.vn",
        phone: "0967890123",
        subjects: ["Toán"],
        classes: 5,
        status: "active",
        joinDate: "2019-02-01",
        rating: 4.9,
        totalStudents: 78,
    },
];

// ============================================================================
// MOCK DATA - STUDENTS
// ============================================================================

export const mockStudents: Student[] = [
    {
        id: 1,
        name: "Nguyễn Văn An",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100",
        email: "an.nguyen@gmail.com",
        phone: "0901234567",
        parentPhone: "0911234567",
        classes: ["Toán 10A", "Lý 10A"],
        status: "active",
        tuitionStatus: "paid",
        enrollDate: "2024-01-15",
        dateOfBirth: "2008-05-12",
        address: "123 Nguyễn Huệ, Q1, TP.HCM",
    },
    {
        id: 2,
        name: "Trần Thị Bình",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        email: "binh.tran@gmail.com",
        phone: "0912345678",
        parentPhone: "0922345678",
        classes: ["Anh Văn B1", "Anh Văn Speaking"],
        status: "active",
        tuitionStatus: "pending",
        enrollDate: "2024-02-20",
        dateOfBirth: "2007-08-22",
        address: "456 Lê Lợi, Q3, TP.HCM",
    },
    {
        id: 3,
        name: "Lê Minh Châu",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        email: "chau.le@gmail.com",
        phone: "0923456789",
        parentPhone: "0933456789",
        classes: ["Hóa 11"],
        status: "active",
        tuitionStatus: "paid",
        enrollDate: "2023-09-01",
        dateOfBirth: "2007-03-15",
        address: "789 Trần Hưng Đạo, Bình Thạnh, TP.HCM",
    },
    {
        id: 4,
        name: "Phạm Văn Dũng",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        email: "dung.pham@gmail.com",
        phone: "0934567890",
        parentPhone: "0944567890",
        classes: ["Văn 12", "Toán 12"],
        status: "inactive",
        tuitionStatus: "overdue",
        enrollDate: "2023-06-15",
        dateOfBirth: "2006-11-08",
        address: "321 Võ Văn Tần, Q3, TP.HCM",
    },
    {
        id: 5,
        name: "Hoàng Văn Em",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        email: "em.hoang@gmail.com",
        phone: "0945678901",
        parentPhone: "0955678901",
        classes: ["Tin Học Cơ Bản"],
        status: "active",
        tuitionStatus: "paid",
        enrollDate: "2024-03-01",
        dateOfBirth: "2008-01-20",
        address: "654 Điện Biên Phủ, Bình Thạnh, TP.HCM",
    },
    {
        id: 6,
        name: "Đặng Thị Giang",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
        email: "giang.dang@gmail.com",
        phone: "0956789012",
        parentPhone: "0966789012",
        classes: ["Toán 10A", "Hóa 11"],
        status: "active",
        tuitionStatus: "paid",
        enrollDate: "2024-01-10",
        dateOfBirth: "2008-07-18",
        address: "147 Cách Mạng Tháng 8, Q10, TP.HCM",
    },
    {
        id: 7,
        name: "Vũ Minh Hiếu",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        email: "hieu.vu@gmail.com",
        phone: "0967890123",
        parentPhone: "0977890123",
        classes: ["Anh Văn B1"],
        status: "active",
        tuitionStatus: "pending",
        enrollDate: "2024-02-15",
        dateOfBirth: "2008-09-25",
        address: "258 Lý Thường Kiệt, Q11, TP.HCM",
    },
    {
        id: 8,
        name: "Bùi Thị Hoa",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
        email: "hoa.bui@gmail.com",
        phone: "0978901234",
        parentPhone: "0988901234",
        classes: ["Văn 12"],
        status: "active",
        tuitionStatus: "paid",
        enrollDate: "2023-08-20",
        dateOfBirth: "2006-12-30",
        address: "369 Hai Bà Trưng, Q1, TP.HCM",
    },
];

// ============================================================================
// MOCK DATA - CLASSES
// ============================================================================

export const mockClasses: Class[] = [
    {
        id: 1,
        name: "Toán 10A",
        subject: "Toán",
        teacher: {
            name: "Nguyễn Thị Mai",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        },
        students: 18,
        maxStudents: 20,
        schedule: "T2, T4, T6 - 18:00",
        room: "Phòng 101",
        facility: "Cơ sở Quận 1",
        startDate: "2024-01-15",
        endDate: "2024-06-15",
        status: "active",
        progress: 65,
        tuitionFee: 2500000,
    },
    {
        id: 2,
        name: "Anh Văn B1",
        subject: "Tiếng Anh",
        teacher: {
            name: "Trần Văn Hùng",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        },
        students: 15,
        maxStudents: 18,
        schedule: "T3, T5, T7 - 19:00",
        room: "Phòng A1",
        facility: "Cơ sở Quận 3",
        startDate: "2024-02-01",
        endDate: "2024-07-01",
        status: "active",
        progress: 55,
        tuitionFee: 3000000,
    },
    {
        id: 3,
        name: "Hóa 11",
        subject: "Hóa Học",
        teacher: {
            name: "Lê Thị Hương",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
        },
        students: 12,
        maxStudents: 18,
        schedule: "T7, CN - 08:00",
        room: "Phòng Lab 1",
        facility: "Cơ sở Thủ Đức",
        startDate: "2024-03-01",
        endDate: "2024-08-01",
        status: "active",
        progress: 30,
        tuitionFee: 2800000,
    },
    {
        id: 4,
        name: "Văn 12 - Luyện thi",
        subject: "Văn",
        teacher: {
            name: "Phạm Minh Tuấn",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        },
        students: 22,
        maxStudents: 25,
        schedule: "T2, T4, T6 - 19:00",
        room: "Phòng 201",
        facility: "Cơ sở Quận 1",
        startDate: "2024-01-10",
        endDate: "2024-06-10",
        status: "active",
        progress: 70,
        tuitionFee: 3500000,
    },
    {
        id: 5,
        name: "Tin Học Cơ Bản",
        subject: "Tin Học",
        teacher: {
            name: "Hoàng Thị Lan",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        },
        students: 0,
        maxStudents: 20,
        schedule: "T3, T5, T7 - 18:00",
        room: "Phòng 102",
        facility: "Cơ sở Quận 1",
        startDate: "2024-04-01",
        endDate: "2024-09-01",
        status: "upcoming",
        progress: 0,
        tuitionFee: 2000000,
    },
    {
        id: 6,
        name: "Lý 10A",
        subject: "Vật Lý",
        teacher: {
            name: "Nguyễn Thị Mai",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        },
        students: 16,
        maxStudents: 20,
        schedule: "T3, T5 - 18:00",
        room: "Phòng 103",
        facility: "Cơ sở Quận 1",
        startDate: "2024-01-20",
        endDate: "2024-06-20",
        status: "active",
        progress: 62,
        tuitionFee: 2600000,
    },
    {
        id: 7,
        name: "Toán 12 - Luyện thi THPT",
        subject: "Toán",
        teacher: {
            name: "Vũ Thị Nga",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
        },
        students: 25,
        maxStudents: 25,
        schedule: "T7, CN - 14:00",
        room: "Phòng 301",
        facility: "Cơ sở Quận 3",
        startDate: "2023-09-01",
        endDate: "2024-05-31",
        status: "active",
        progress: 85,
        tuitionFee: 4000000,
    },
    {
        id: 8,
        name: "Anh Văn Speaking",
        subject: "Tiếng Anh",
        teacher: {
            name: "Trần Văn Hùng",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        },
        students: 10,
        maxStudents: 12,
        schedule: "T7 - 16:00",
        room: "Phòng A2",
        facility: "Cơ sở Quận 3",
        startDate: "2024-02-15",
        endDate: "2024-05-15",
        status: "active",
        progress: 50,
        tuitionFee: 3200000,
    },
];

// ============================================================================
// MOCK DATA - FACILITIES
// ============================================================================

export const mockFacilities: Facility[] = [
    {
        id: 1,
        name: "Cơ sở Quận 1",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
        phone: "028-1234-5678",
        manager: "Nguyễn Văn A",
        rooms: 8,
        status: "active",
        capacity: 200,
        openingHours: "07:00 - 22:00",
    },
    {
        id: 2,
        name: "Cơ sở Quận 3",
        address: "456 Võ Thị Sáu, Quận 3, TP.HCM",
        phone: "028-2345-6789",
        manager: "Trần Thị B",
        rooms: 6,
        status: "active",
        capacity: 150,
        openingHours: "07:00 - 22:00",
    },
    {
        id: 3,
        name: "Cơ sở Thủ Đức",
        address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
        phone: "028-3456-7890",
        manager: "Lê Văn C",
        rooms: 10,
        status: "maintenance",
        capacity: 250,
        openingHours: "07:00 - 21:00",
    },
    {
        id: 4,
        name: "Cơ sở Bình Thạnh",
        address: "147 Điện Biên Phủ, Bình Thạnh, TP.HCM",
        phone: "028-4567-8901",
        manager: "Phạm Thị D",
        rooms: 5,
        status: "active",
        capacity: 120,
        openingHours: "08:00 - 21:00",
    },
];

// ============================================================================
// MOCK DATA - ROOMS
// ============================================================================

export const mockRooms: Room[] = [
    { id: 1, name: "Phòng 101", facility: "Cơ sở Quận 1", capacity: 20, equipment: "Máy chiếu, Bảng trắng", status: "available", floor: 1 },
    { id: 2, name: "Phòng 102", facility: "Cơ sở Quận 1", capacity: 25, equipment: "Máy chiếu, Bảng trắng, Loa", status: "occupied", floor: 1 },
    { id: 3, name: "Phòng 201", facility: "Cơ sở Quận 1", capacity: 30, equipment: "Máy chiếu, Bảng trắng, Điều hòa", status: "occupied", floor: 2 },
    { id: 4, name: "Phòng 103", facility: "Cơ sở Quận 1", capacity: 20, equipment: "Máy chiếu, Bảng trắng", status: "occupied", floor: 1 },
    { id: 5, name: "Phòng A1", facility: "Cơ sở Quận 3", capacity: 18, equipment: "Máy chiếu, Bảng trắng, Loa", status: "occupied", floor: 1 },
    { id: 6, name: "Phòng Lab 1", facility: "Cơ sở Thủ Đức", capacity: 30, equipment: "Máy tính, Máy chiếu", status: "occupied", floor: 1 },
    { id: 7, name: "Phòng 301", facility: "Cơ sở Quận 3", capacity: 25, equipment: "Máy chiếu, Bảng trắng, Điều hòa", status: "occupied", floor: 3 },
    { id: 8, name: "Phòng A2", facility: "Cơ sở Quận 3", capacity: 12, equipment: "Bảng trắng, Loa, Micro", status: "occupied", floor: 1 },
    { id: 9, name: "Phòng 202", facility: "Cơ sở Quận 1", capacity: 22, equipment: "Máy chiếu, Bảng trắng", status: "available", floor: 2 },
    { id: 10, name: "Phòng B1", facility: "Cơ sở Bình Thạnh", capacity: 15, equipment: "Máy chiếu, Bảng trắng", status: "available", floor: 1 },
    { id: 11, name: "Phòng Lab 2", facility: "Cơ sở Thủ Đức", capacity: 28, equipment: "Máy tính, Máy chiếu, Điều hòa", status: "maintenance", floor: 2 },
];

// ============================================================================
// MOCK DATA - ATTENDANCE
// ============================================================================

export const mockAttendanceRecords: AttendanceRecord[] = [
    {
        id: 1,
        class: "Toán 10A",
        date: "16/12/2024",
        time: "18:00 - 20:00",
        total: 18,
        present: 16,
        absent: 1,
        late: 1,
        rate: 89,
        teacher: "Nguyễn Thị Mai",
        notes: "Học sinh Nguyễn Văn A đi muộn 15 phút",
    },
    {
        id: 2,
        class: "Anh Văn B1",
        date: "17/12/2024",
        time: "19:00 - 21:00",
        total: 15,
        present: 14,
        absent: 1,
        late: 0,
        rate: 93,
        teacher: "Trần Văn Hùng",
    },
    {
        id: 3,
        class: "Hóa 11",
        date: "14/12/2024",
        time: "08:00 - 10:00",
        total: 12,
        present: 12,
        absent: 0,
        late: 0,
        rate: 100,
        teacher: "Lê Thị Hương",
    },
    {
        id: 4,
        class: "Văn 12",
        date: "16/12/2024",
        time: "19:00 - 21:00",
        total: 22,
        present: 18,
        absent: 3,
        late: 1,
        rate: 82,
        teacher: "Phạm Minh Tuấn",
        notes: "3 học sinh vắng do ốm",
    },
    {
        id: 5,
        class: "Toán 10A",
        date: "18/12/2024",
        time: "18:00 - 20:00",
        total: 18,
        present: 17,
        absent: 0,
        late: 1,
        rate: 94,
        teacher: "Nguyễn Thị Mai",
    },
    {
        id: 6,
        class: "Lý 10A",
        date: "17/12/2024",
        time: "18:00 - 20:00",
        total: 16,
        present: 15,
        absent: 1,
        late: 0,
        rate: 94,
        teacher: "Nguyễn Thị Mai",
    },
    {
        id: 7,
        class: "Toán 12 - Luyện thi THPT",
        date: "14/12/2024",
        time: "14:00 - 17:00",
        total: 25,
        present: 24,
        absent: 0,
        late: 1,
        rate: 96,
        teacher: "Vũ Thị Nga",
    },
];

// Students with attendance issues
export const mockAttendanceIssues = [
    { id: 1, student: "Lê Thị Hương", class: "Văn 12", absences: 5, lastAttended: "10/12/2024" },
    { id: 2, student: "Nguyễn Văn An", class: "Toán 10A", absences: 3, lastAttended: "11/12/2024" },
    { id: 3, student: "Trần Minh Khoa", class: "Hóa 11", absences: 4, lastAttended: "08/12/2024" },
    { id: 4, student: "Phạm Văn Dũng", class: "Văn 12", absences: 6, lastAttended: "05/12/2024" },
];

// ============================================================================
// MOCK DATA - PAYMENTS
// ============================================================================

export const mockPayments: Payment[] = [
    {
        id: 1,
        student: { name: "Nguyễn Văn An", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100" },
        class: "Toán 10A",
        amount: 2500000,
        dueDate: "20/12/2024",
        status: "paid",
        paidDate: "15/12/2024",
        method: "Chuyển khoản",
        invoiceNumber: "INV-2024-001",
    },
    {
        id: 2,
        student: { name: "Trần Thị Bình", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
        class: "Anh Văn B1",
        amount: 3000000,
        dueDate: "22/12/2024",
        status: "pending",
        invoiceNumber: "INV-2024-002",
    },
    {
        id: 3,
        student: { name: "Lê Minh Châu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
        class: "Hóa 11",
        amount: 2800000,
        dueDate: "15/12/2024",
        status: "overdue",
        invoiceNumber: "INV-2024-003",
    },
    {
        id: 4,
        student: { name: "Phạm Văn Dũng", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
        class: "Văn 12",
        amount: 3500000,
        dueDate: "10/12/2024",
        status: "overdue",
        invoiceNumber: "INV-2024-004",
    },
    {
        id: 5,
        student: { name: "Hoàng Văn Em", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
        class: "Tin Học Cơ Bản",
        amount: 1500000,
        dueDate: "28/12/2024",
        status: "paid",
        paidDate: "18/12/2024",
        method: "Tiền mặt",
        invoiceNumber: "INV-2024-005",
    },
    {
        id: 6,
        student: { name: "Đặng Thị Giang", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
        class: "Toán 10A",
        amount: 2500000,
        dueDate: "20/12/2024",
        status: "paid",
        paidDate: "19/12/2024",
        method: "Chuyển khoản",
        invoiceNumber: "INV-2024-006",
    },
    {
        id: 7,
        student: { name: "Vũ Minh Hiếu", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
        class: "Anh Văn B1",
        amount: 3000000,
        dueDate: "25/12/2024",
        status: "pending",
        invoiceNumber: "INV-2024-007",
    },
    {
        id: 8,
        student: { name: "Bùi Thị Hoa", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
        class: "Văn 12",
        amount: 3500000,
        dueDate: "18/12/2024",
        status: "paid",
        paidDate: "17/12/2024",
        method: "Chuyển khoản",
        invoiceNumber: "INV-2024-008",
    },
];

export const mockPaymentStats = {
    totalRevenue: 450000000,
    monthRevenue: 85000000,
    pending: 12500000,
    overdue: 4500000,
};

// ============================================================================
// MOCK DATA - TICKETS
// ============================================================================

export const mockTickets: Ticket[] = [
    {
        id: "TK-1001",
        title: "Không đăng nhập được sau khi đổi mật khẩu",
        requester: "Nguyễn Minh Anh",
        channel: "Email",
        priority: "high",
        status: "open",
        createdAt: "20/12/2024 09:12",
        assignee: "Nguyễn Khoa",
        category: "Kỹ thuật",
        description: "Học viên không thể đăng nhập sau khi đổi mật khẩu qua email",
    },
    {
        id: "TK-1002",
        title: "Yêu cầu chuyển lớp học",
        requester: "Trần Văn Bình",
        channel: "Phone",
        priority: "medium",
        status: "in_progress",
        createdAt: "19/12/2024 14:30",
        assignee: "Lê Thảo",
        category: "Học vụ",
        description: "Phụ huynh yêu cầu chuyển con từ lớp Toán 10A sang 10B",
    },
    {
        id: "TK-1003",
        title: "Hỏi về lịch học tháng 1",
        requester: "Lê Thị Cúc",
        channel: "Web",
        priority: "low",
        status: "resolved",
        createdAt: "18/12/2024 10:45",
        assignee: "Nguyễn Khoa",
        category: "Tư vấn",
        description: "Phụ huynh hỏi về lịch học tháng 1/2025",
    },
    {
        id: "TK-1004",
        title: "Báo lỗi thanh toán online",
        requester: "Phạm Minh Đức",
        channel: "Chat",
        priority: "high",
        status: "in_progress",
        createdAt: "17/12/2024 16:20",
        assignee: "Nguyễn Khoa",
        category: "Kỹ thuật",
        description: "Lỗi khi thanh toán học phí qua cổng thanh toán online",
    },
    {
        id: "TK-1005",
        title: "Cập nhật số điện thoại phụ huynh",
        requester: "Đặng Thị Giang",
        channel: "Web",
        priority: "medium",
        status: "open",
        createdAt: "16/12/2024 13:20",
        assignee: "Lê Thảo",
        category: "Học vụ",
        description: "Yêu cầu cập nhật số điện thoại liên hệ của phụ huynh",
    },
    {
        id: "TK-1006",
        title: "Xin giấy xác nhận học viên",
        requester: "Vũ Minh Hiếu",
        channel: "Email",
        priority: "low",
        status: "resolved",
        createdAt: "15/12/2024 11:00",
        assignee: "Lê Thảo",
        category: "Hành chính",
        description: "Học viên cần giấy xác nhận đang học tại trung tâm",
    },
    {
        id: "TK-1007",
        title: "Khiếu nại về chất lượng giảng dạy",
        requester: "Hoàng Thị Mai",
        channel: "Phone",
        priority: "urgent",
        status: "open",
        createdAt: "20/12/2024 15:30",
        category: "Khiếu nại",
        description: "Phụ huynh không hài lòng về phương pháp giảng dạy",
    },
];

// ============================================================================
// MOCK DATA - ROLES
// ============================================================================

export const mockRoles: Role[] = [
    {
        id: 1,
        name: "Super Admin",
        description: "Toàn quyền cấu hình và quản trị hệ thống",
        type: "system",
        status: "active",
        users: 2,
        permissions: [
            "Quản trị hệ thống",
            "Quản lý người dùng",
            "Quản lý lớp",
            "Quản lý giáo viên",
            "Học viên",
            "Học phí",
            "Báo cáo",
            "Ticket",
            "Thông báo",
            "Lịch học",
        ],
        createdAt: "2023-01-01",
    },
    {
        id: 2,
        name: "Admin",
        description: "Quản lý toàn bộ hoạt động giảng dạy",
        type: "system",
        status: "active",
        users: 5,
        permissions: [
            "Quản lý người dùng",
            "Quản lý lớp",
            "Quản lý giáo viên",
            "Học viên",
            "Học phí",
            "Báo cáo",
            "Ticket",
            "Lịch học",
        ],
        createdAt: "2023-01-01",
    },
    {
        id: 3,
        name: "Giáo viên",
        description: "Quản lý lớp học và học viên của mình",
        type: "system",
        status: "active",
        users: 12,
        permissions: ["Quản lý lớp", "Học viên", "Lịch học", "Báo cáo"],
        createdAt: "2023-01-01",
    },
    {
        id: 4,
        name: "Kế toán",
        description: "Quản lý học phí và tài chính",
        type: "custom",
        status: "active",
        users: 3,
        permissions: ["Học phí", "Báo cáo", "Học viên"],
        createdAt: "2023-06-15",
    },
    {
        id: 5,
        name: "Tư vấn viên",
        description: "Tư vấn và hỗ trợ học viên",
        type: "custom",
        status: "active",
        users: 8,
        permissions: ["Học viên", "Ticket", "Lịch học"],
        createdAt: "2023-08-20",
    },
    {
        id: 6,
        name: "Học viên",
        description: "Xem thông tin cá nhân và lớp học",
        type: "system",
        status: "active",
        users: 245,
        permissions: ["Lịch học"],
        createdAt: "2023-01-01",
    },
];

// ============================================================================
// MOCK DATA - AUDIT LOGS
// ============================================================================

export const mockAuditLogs: AuditLog[] = [
    {
        id: 1,
        actor: "Nguyễn Khoa",
        action: "create",
        resource: "Lớp Toán 10A",
        result: "success",
        ip: "103.12.45.12",
        createdAt: "20/12/2024 10:12",
        details: "Tạo lớp học mới với 20 chỗ",
    },
    {
        id: 2,
        actor: "Lê Thảo",
        action: "update",
        resource: "Học viên Nguyễn Văn An",
        result: "success",
        ip: "103.12.45.13",
        createdAt: "20/12/2024 09:45",
        details: "Cập nhật số điện thoại phụ huynh",
    },
    {
        id: 3,
        actor: "Nguyễn Khoa",
        action: "delete",
        resource: "Lớp Hóa 10B",
        result: "success",
        ip: "103.12.45.12",
        createdAt: "19/12/2024 16:30",
        details: "Xóa lớp học do không đủ học viên",
    },
    {
        id: 4,
        actor: "Trần Văn Hùng",
        action: "login",
        resource: "Hệ thống",
        result: "success",
        ip: "103.12.45.14",
        createdAt: "19/12/2024 14:20",
    },
    {
        id: 5,
        actor: "Nguyễn Khoa",
        action: "export",
        resource: "Báo cáo doanh thu tháng 12",
        result: "success",
        ip: "103.12.45.12",
        createdAt: "18/12/2024 14:55",
        details: "Xuất báo cáo định dạng PDF",
    },
    {
        id: 6,
        actor: "Lê Thảo",
        action: "update",
        resource: "Học phí - Trần Thị Bình",
        result: "success",
        ip: "103.12.45.13",
        createdAt: "18/12/2024 11:30",
        details: "Xác nhận thanh toán học phí",
    },
    {
        id: 7,
        actor: "Admin System",
        action: "import",
        resource: "Danh sách học viên mới",
        result: "failed",
        ip: "127.0.0.1",
        createdAt: "17/12/2024 09:00",
        details: "Lỗi định dạng file Excel",
    },
    {
        id: 8,
        actor: "Nguyễn Khoa",
        action: "create",
        resource: "Giáo viên Vũ Thị Nga",
        result: "success",
        ip: "103.12.45.12",
        createdAt: "16/12/2024 15:20",
        details: "Thêm giáo viên mới - môn Toán",
    },
];

// ============================================================================
// MOCK DATA - LEADS
// ============================================================================

export const mockLeads: Lead[] = [
    {
        id: 1,
        name: "Nguyễn Thị E",
        phone: "0901234567",
        email: "e.nguyen@gmail.com",
        need: "Luyện thi lớp 10",
        source: "Facebook",
        status: "new",
        createdAt: "20/12/2024",
        notes: "Quan tâm đến lớp Toán, Văn",
    },
    {
        id: 2,
        name: "Trần Văn F",
        phone: "0912345678",
        email: "f.tran@gmail.com",
        need: "Tiếng Anh giao tiếp",
        source: "Website",
        status: "contacted",
        createdAt: "19/12/2024",
        notes: "Đã gọi điện, hẹn tư vấn 21/12",
        assignedTo: "Lê Thảo",
        followUpDate: "21/12/2024",
    },
    {
        id: 3,
        name: "Lê Thị G",
        phone: "0923456789",
        email: "g.le@gmail.com",
        need: "Bổ trợ Toán 12",
        source: "Giới thiệu",
        status: "consulting",
        createdAt: "18/12/2024",
        notes: "Đang tư vấn lớp Toán 12 Luyện thi",
        assignedTo: "Nguyễn Khoa",
    },
    {
        id: 4,
        name: "Phạm Văn H",
        phone: "0934567890",
        email: "h.pham@gmail.com",
        need: "Hóa 11",
        source: "Zalo",
        status: "converted",
        createdAt: "15/12/2024",
        notes: "Đã đăng ký lớp Hóa 11",
        assignedTo: "Lê Thảo",
    },
    {
        id: 5,
        name: "Hoàng Thị I",
        phone: "0945678901",
        email: "i.hoang@gmail.com",
        need: "Tin học văn phòng",
        source: "Facebook",
        status: "lost",
        createdAt: "10/12/2024",
        notes: "Không liên lạc được",
        assignedTo: "Nguyễn Khoa",
    },
    {
        id: 6,
        name: "Đỗ Văn K",
        phone: "0956789012",
        email: "k.do@gmail.com",
        need: "Luyện thi THPT Quốc gia",
        source: "Google Ads",
        status: "new",
        createdAt: "20/12/2024",
        notes: "Quan tâm đến gói combo 3 môn",
    },
    {
        id: 7,
        name: "Vũ Thị L",
        phone: "0967890123",
        email: "l.vu@gmail.com",
        need: "Tiếng Anh IELTS",
        source: "Website",
        status: "contacted",
        createdAt: "19/12/2024",
        notes: "Đã gửi email tư vấn",
        assignedTo: "Lê Thảo",
        followUpDate: "22/12/2024",
    },
];

// ============================================================================
// MOCK DATA - SCHEDULE
// ============================================================================

export const mockWeekSchedule = [
    {
        day: "Thứ 2",
        date: "16/12",
        sessions: [
            { id: 1, time: "08:00 - 10:00", class: "Văn 12", teacher: "Phạm Minh Tuấn", room: "Phòng 201", facility: "Q1", students: 22, status: "completed" as const },
            { id: 2, time: "18:00 - 20:00", class: "Toán 10A", teacher: "Nguyễn Thị Mai", room: "Phòng 101", facility: "Q1", students: 18, status: "completed" as const },
        ],
    },
    {
        day: "Thứ 3",
        date: "17/12",
        sessions: [
            { id: 3, time: "18:00 - 20:00", class: "Lý 10A", teacher: "Nguyễn Thị Mai", room: "Phòng 103", facility: "Q1", students: 16, status: "completed" as const },
            { id: 4, time: "19:00 - 21:00", class: "Anh Văn B1", teacher: "Trần Văn Hùng", room: "Phòng A1", facility: "Q3", students: 15, status: "completed" as const },
        ],
    },
    {
        day: "Thứ 4",
        date: "18/12",
        sessions: [
            { id: 5, time: "18:00 - 20:00", class: "Toán 10A", teacher: "Nguyễn Thị Mai", room: "Phòng 101", facility: "Q1", students: 18, status: "completed" as const },
            { id: 6, time: "19:00 - 21:00", class: "Văn 12", teacher: "Phạm Minh Tuấn", room: "Phòng 201", facility: "Q1", students: 22, status: "completed" as const },
        ],
    },
    {
        day: "Thứ 5",
        date: "19/12",
        sessions: [
            { id: 7, time: "19:00 - 21:00", class: "Anh Văn B1", teacher: "Trần Văn Hùng", room: "Phòng A1", facility: "Q3", students: 15, status: "upcoming" as const },
        ],
    },
    {
        day: "Thứ 6",
        date: "20/12",
        sessions: [
            { id: 8, time: "08:00 - 10:00", class: "Văn 12", teacher: "Phạm Minh Tuấn", room: "Phòng 201", facility: "Q1", students: 22, status: "upcoming" as const },
            { id: 9, time: "18:00 - 20:00", class: "Toán 10A", teacher: "Nguyễn Thị Mai", room: "Phòng 101", facility: "Q1", students: 18, status: "upcoming" as const },
        ],
    },
    {
        day: "Thứ 7",
        date: "21/12",
        sessions: [
            { id: 10, time: "14:00 - 17:00", class: "Toán 12 - Luyện thi THPT", teacher: "Vũ Thị Nga", room: "Phòng 301", facility: "Q3", students: 25, status: "upcoming" as const },
            { id: 11, time: "16:00 - 18:00", class: "Anh Văn Speaking", teacher: "Trần Văn Hùng", room: "Phòng A2", facility: "Q3", students: 10, status: "upcoming" as const },
        ],
    },
    {
        day: "Chủ nhật",
        date: "22/12",
        sessions: [
            { id: 12, time: "08:00 - 10:00", class: "Hóa 11", teacher: "Lê Thị Hương", room: "Phòng Lab 1", facility: "TĐ", students: 12, status: "upcoming" as const },
            { id: 13, time: "14:00 - 17:00", class: "Toán 12 - Luyện thi THPT", teacher: "Vũ Thị Nga", room: "Phòng 301", facility: "Q3", students: 25, status: "upcoming" as const },
        ],
    },
];

// ============================================================================
// MOCK DATA - REPORTS
// ============================================================================

export const mockReports: Report[] = [
    {
        id: "RP-2401",
        name: "Báo cáo doanh thu tháng 12",
        type: "Doanh thu",
        period: "01/12 - 31/12",
        status: "ready",
        createdBy: "Nguyễn Khoa",
        createdAt: "20/12/2024 09:30",
        format: "PDF",
        fileSize: "2.3 MB",
    },
    {
        id: "RP-2402",
        name: "Báo cáo điểm danh tuần 50",
        type: "Điểm danh",
        period: "09/12 - 15/12",
        status: "ready",
        createdBy: "Lê Thảo",
        createdAt: "19/12/2024 15:20",
        format: "Excel",
        fileSize: "1.8 MB",
    },
    {
        id: "RP-2403",
        name: "Báo cáo học viên mới tháng 12",
        type: "Học viên",
        period: "Tháng 12",
        status: "processing",
        createdBy: "Nguyễn Khoa",
        createdAt: "18/12/2024 11:00",
        format: "PDF",
    },
    {
        id: "RP-2404",
        name: "Báo cáo học phí quá hạn",
        type: "Học phí",
        period: "Tháng 12",
        status: "failed",
        createdBy: "Nguyễn Khoa",
        createdAt: "17/12/2024 16:45",
        format: "CSV",
    },
    {
        id: "RP-2405",
        name: "Báo cáo hiệu suất giáo viên Q4",
        type: "Giáo viên",
        period: "Q4 2024",
        status: "ready",
        createdBy: "Lê Thảo",
        createdAt: "16/12/2024 10:15",
        format: "PDF",
        fileSize: "3.1 MB",
    },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getTeacherById = (id: number) => mockTeachers.find(t => t.id === id);
export const getStudentById = (id: number) => mockStudents.find(s => s.id === id);
export const getClassById = (id: number) => mockClasses.find(c => c.id === id);
export const getFacilityById = (id: number) => mockFacilities.find(f => f.id === id);

export const getClassesByTeacher = (teacherName: string) =>
    mockClasses.filter(c => c.teacher.name === teacherName);

export const getStudentsByClass = (className: string) =>
    mockStudents.filter(s => s.classes.includes(className));

export const getPaymentsByStatus = (status: Payment['status']) =>
    mockPayments.filter(p => p.status === status);

export const getTicketsByStatus = (status: Ticket['status']) =>
    mockTickets.filter(t => t.status === status);

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
    teachers: mockTeachers,
    students: mockStudents,
    classes: mockClasses,
    facilities: mockFacilities,
    rooms: mockRooms,
    attendance: mockAttendanceRecords,
    attendanceIssues: mockAttendanceIssues,
    payments: mockPayments,
    paymentStats: mockPaymentStats,
    tickets: mockTickets,
    roles: mockRoles,
    auditLogs: mockAuditLogs,
    leads: mockLeads,
    schedule: mockWeekSchedule,
    reports: mockReports,
};
