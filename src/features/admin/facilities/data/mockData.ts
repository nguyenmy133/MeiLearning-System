import type { Facility, Room } from "../types";

/**
 * ============================================================================
 * MOCK DATA - CƠ SỞ VẬT CHẤT
 * ============================================================================
 * Dữ liệu giả lập cho trung tâm đào tạo tại TP.HCM:
 * - 4 cơ sở ở các quận khác nhau (đa dạng trạng thái)
 * - 15 phòng học (lý thuyết, lab, hội trường, phòng nhỏ/lớn)
 * ============================================================================
 */

export const mockFacilities: Facility[] = [
  {
    id: 1,
    name: "Cơ sở Quận 1 - Trung tâm",
    address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
    phone: "028-1234-5678",
    manager: "Nguyễn Văn An",
    status: "active",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2025-12-01T10:30:00Z",
  },
  {
    id: 2,
    name: "Cơ sở Quận 3",
    address: "456 Võ Văn Tần, Phường 5, Quận 3, TP.HCM",
    phone: "028-2345-6789",
    manager: "Trần Thị Bích",
    status: "active",
    createdAt: "2024-03-20T08:00:00Z",
    updatedAt: "2025-11-15T14:00:00Z",
  },
  {
    id: 3,
    name: "Cơ sở Thủ Đức",
    address: "789 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM",
    phone: "028-3456-7890",
    manager: "Lê Hoàng Cường",
    status: "active",
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2025-10-20T09:00:00Z",
  },
  {
    id: 4,
    name: "Cơ sở Quận 7",
    address: "321 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM",
    phone: "028-4567-8901",
    manager: "Phạm Minh Đức",
    status: "maintenance",
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2026-01-05T16:00:00Z",
  },
];

export const mockRooms: Room[] = [
  // ===== Cơ sở Quận 1 (5 phòng) =====
  {
    id: 1,
    name: "Phòng 101",
    facilityId: 1,
    facilityName: "Cơ sở Quận 1 - Trung tâm",
    capacity: 25,
    status: "available",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2025-12-01T10:30:00Z",
  },
  {
    id: 2,
    name: "Phòng 102",
    facilityId: 1,
    facilityName: "Cơ sở Quận 1 - Trung tâm",
    capacity: 20,
    status: "occupied",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2026-02-15T08:00:00Z",
  },
  {
    id: 3,
    name: "Phòng 201 - Lab",
    facilityId: 1,
    facilityName: "Cơ sở Quận 1 - Trung tâm",
    capacity: 30,
    status: "occupied",
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: "2026-02-10T14:00:00Z",
  },
  {
    id: 4,
    name: "Phòng 202",
    facilityId: 1,
    facilityName: "Cơ sở Quận 1 - Trung tâm",
    capacity: 15,
    status: "available",
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: "2025-11-20T09:00:00Z",
  },
  {
    id: 5,
    name: "Hội trường A",
    facilityId: 1,
    facilityName: "Cơ sở Quận 1 - Trung tâm",
    capacity: 80,
    status: "available",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2025-09-01T11:00:00Z",
  },

  // ===== Cơ sở Quận 3 (4 phòng) =====
  {
    id: 6,
    name: "Phòng A1",
    facilityId: 2,
    facilityName: "Cơ sở Quận 3",
    capacity: 22,
    status: "occupied",
    createdAt: "2024-03-20T08:00:00Z",
    updatedAt: "2026-02-20T10:00:00Z",
  },
  {
    id: 7,
    name: "Phòng A2",
    facilityId: 2,
    facilityName: "Cơ sở Quận 3",
    capacity: 22,
    status: "available",
    createdAt: "2024-03-20T08:00:00Z",
    updatedAt: "2025-12-05T08:00:00Z",
  },
  {
    id: 8,
    name: "Phòng B1 - Lab",
    facilityId: 2,
    facilityName: "Cơ sở Quận 3",
    capacity: 18,
    status: "maintenance",
    createdAt: "2024-04-10T08:00:00Z",
    updatedAt: "2026-02-25T16:30:00Z",
  },
  {
    id: 9,
    name: "Phòng B2",
    facilityId: 2,
    facilityName: "Cơ sở Quận 3",
    capacity: 25,
    status: "available",
    createdAt: "2024-04-10T08:00:00Z",
    updatedAt: "2025-10-15T12:00:00Z",
  },

  // ===== Cơ sở Thủ Đức (4 phòng) =====
  {
    id: 10,
    name: "Phòng TD-01",
    facilityId: 3,
    facilityName: "Cơ sở Thủ Đức",
    capacity: 30,
    status: "occupied",
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z",
  },
  {
    id: 11,
    name: "Phòng TD-02",
    facilityId: 3,
    facilityName: "Cơ sở Thủ Đức",
    capacity: 30,
    status: "available",
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2025-11-01T08:00:00Z",
  },
  {
    id: 12,
    name: "Phòng TD-Lab",
    facilityId: 3,
    facilityName: "Cơ sở Thủ Đức",
    capacity: 35,
    status: "occupied",
    createdAt: "2024-07-15T08:00:00Z",
    updatedAt: "2026-02-18T14:00:00Z",
  },
  {
    id: 13,
    name: "Phòng TD-03",
    facilityId: 3,
    facilityName: "Cơ sở Thủ Đức",
    capacity: 20,
    status: "available",
    createdAt: "2024-08-01T08:00:00Z",
    updatedAt: "2025-12-20T10:00:00Z",
  },

  // ===== Cơ sở Quận 7 (2 phòng — cơ sở đang bảo trì) =====
  {
    id: 14,
    name: "Phòng Q7-01",
    facilityId: 4,
    facilityName: "Cơ sở Quận 7",
    capacity: 28,
    status: "maintenance",
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2026-01-05T16:00:00Z",
  },
  {
    id: 15,
    name: "Phòng Q7-02",
    facilityId: 4,
    facilityName: "Cơ sở Quận 7",
    capacity: 28,
    status: "maintenance",
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2026-01-05T16:00:00Z",
  },
];
