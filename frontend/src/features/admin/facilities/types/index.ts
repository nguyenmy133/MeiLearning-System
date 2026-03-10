/**
 * ============================================================================
 * MODULE CƠ SỞ VẬT CHẤT - TYPE DEFINITIONS
 * ============================================================================
 * 
 * Phân tích nghiệp vụ:
 * - Trung tâm có thể có NHIỀU cơ sở (chi nhánh) ở các địa điểm khác nhau
 * - Mỗi cơ sở có NHIỀU phòng học
 * - Mỗi phòng học có sức chứa nhất định (ràng buộc khi xếp lớp)
 * - Trạng thái cơ sở: Hoạt động / Bảo trì / Ngưng hoạt động
 * - Trạng thái phòng: Trống / Đang sử dụng / Bảo trì
 * - Khi THÊM MỚI → status mặc định (active/available)
 * - Khi SỬA → mới cho phép thay đổi trạng thái
 * ============================================================================
 */

import type { PaginatedResponse } from "@/types";

// Re-export for backward compatibility
export type { PaginatedResponse };

// ==================== ENUMS ====================

/** Trạng thái cơ sở */
export const FacilityStatus = {
  ACTIVE: "active",
  MAINTENANCE: "maintenance",
  INACTIVE: "inactive",
} as const;

export type FacilityStatusType = (typeof FacilityStatus)[keyof typeof FacilityStatus];

/** Trạng thái phòng học */
export const RoomStatus = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  MAINTENANCE: "maintenance",
} as const;

export type RoomStatusType = (typeof RoomStatus)[keyof typeof RoomStatus];

// ==================== ENTITY INTERFACES ====================

/** Cơ sở (chi nhánh) */
export interface Facility {
  id: number;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: FacilityStatusType;
  createdAt: string;
  updatedAt: string;
}

/** Phòng học */
export interface Room {
  id: number;
  name: string;
  facilityId: number;   // FK → Facility
  facilityName: string;  // Denormalized cho hiển thị nhanh
  capacity: number;      // Sức chứa (1-200)
  status: RoomStatusType;
  createdAt: string;
  updatedAt: string;
}

// ==================== DTO: CREATE (không có status, không có id) ====================

/** DTO tạo cơ sở mới - KHÔNG có trường trạng thái */
export interface CreateFacilityDTO {
  name: string;
  address: string;
  phone: string;
  manager: string;
}

/** DTO tạo phòng mới - KHÔNG có trường trạng thái */
export interface CreateRoomDTO {
  name: string;
  facilityId: number;
  capacity: number;      // min: 1, max: 200
}

// ==================== DTO: UPDATE (CÓ status) ====================

/** DTO cập nhật cơ sở - CÓ trường trạng thái */
export interface UpdateFacilityDTO {
  name?: string;
  address?: string;
  phone?: string;
  manager?: string;
  status?: FacilityStatusType;
}

/** DTO cập nhật phòng - CÓ trường trạng thái */
export interface UpdateRoomDTO {
  name?: string;
  facilityId?: number;
  capacity?: number;     // min: 1, max: 200
  status?: RoomStatusType;
}

// ==================== QUERY / FILTER ====================

/** Params lọc danh sách cơ sở */
export interface FacilityQueryParams {
  search?: string;
  status?: FacilityStatusType;
  page?: number;
  limit?: number;
}

/** Params lọc danh sách phòng */
export interface RoomQueryParams {
  search?: string;
  facilityId?: number;
  status?: RoomStatusType;
  page?: number;
  limit?: number;
}

// ==================== API RESPONSE ====================
// PaginatedResponse is re-exported from @/types (see top of file)

/** Response cho thống kê Cơ sở vật chất */
export interface FacilityStats {
  totalFacilities: number;
  totalRooms: number;
  totalCapacity: number;
  availableRooms: number;
  activeFacilities: number;
}

// ==================== LABEL MAPS (cho UI) ====================

export const FACILITY_STATUS_LABELS: Record<FacilityStatusType, string> = {
  active: "Hoạt động",
  maintenance: "Đang bảo trì",
  inactive: "Ngưng hoạt động",
};

export const ROOM_STATUS_LABELS: Record<RoomStatusType, string> = {
  available: "Trống",
  occupied: "Đang sử dụng",
  maintenance: "Đang bảo trì",
};
