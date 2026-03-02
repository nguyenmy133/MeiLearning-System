import type { Teacher } from "../types";

/**
 * ============================================================================
 * MOCK DATA - GIÁO VIÊN
 * ============================================================================
 * 7 giáo viên thực tế, đa dạng:
 * - Nhiều môn / 1 môn
 * - active / inactive / locked
 * - Có lớp / không lớp (để test xóa)
 * ============================================================================
 */

export const mockTeachers: Teacher[] = [
  {
    id: 1,
    name: "Nguyễn Thị Mai",
    email: "mai.nguyen@edu.vn",
    phone: "0901234567",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    subjects: ["Toán", "Lý"],
    classCount: 4,
    status: "active",
    joinDate: "2022-01-15",
    createdAt: "2022-01-15T08:00:00Z",
    updatedAt: "2025-12-01T10:30:00Z",
  },
  {
    id: 2,
    name: "Trần Văn Hùng",
    email: "hung.tran@edu.vn",
    phone: "0912345678",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    subjects: ["IELTS", "TOEIC", "Anh văn"],
    classCount: 6,
    status: "active",
    joinDate: "2021-08-20",
    createdAt: "2021-08-20T08:00:00Z",
    updatedAt: "2026-01-10T14:00:00Z",
  },
  {
    id: 3,
    name: "Lê Thị Hương",
    email: "huong.le@edu.vn",
    phone: "0923456789",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    subjects: ["Hóa"],
    classCount: 3,
    status: "active",
    joinDate: "2023-02-10",
    createdAt: "2023-02-10T08:00:00Z",
    updatedAt: "2025-11-15T09:00:00Z",
  },
  {
    id: 4,
    name: "Phạm Minh Tuấn",
    email: "tuan.pham@edu.vn",
    phone: "0934567890",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    subjects: ["Văn"],
    classCount: 0,
    status: "inactive",
    joinDate: "2020-05-05",
    createdAt: "2020-05-05T08:00:00Z",
    updatedAt: "2025-09-20T16:00:00Z",
  },
  {
    id: 5,
    name: "Hoàng Thị Lan",
    email: "lan.hoang@edu.vn",
    phone: "0945678901",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    subjects: ["Tin học"],
    classCount: 4,
    status: "active",
    joinDate: "2022-09-01",
    createdAt: "2022-09-01T08:00:00Z",
    updatedAt: "2026-02-05T11:00:00Z",
  },
  {
    id: 6,
    name: "Đỗ Quang Vinh",
    email: "vinh.do@edu.vn",
    phone: "0956789012",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    subjects: ["Giao tiếp", "IELTS"],
    classCount: 2,
    status: "active",
    joinDate: "2024-01-10",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2026-01-25T08:30:00Z",
  },
  {
    id: 7,
    name: "Vũ Thanh Hải",
    email: "hai.vu@edu.vn",
    phone: "0967890123",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100",
    subjects: ["Toán", "Tin học"],
    classCount: 0,
    status: "locked",
    joinDate: "2023-06-15",
    createdAt: "2023-06-15T08:00:00Z",
    updatedAt: "2026-02-20T10:00:00Z",
  },
];
