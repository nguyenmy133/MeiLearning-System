import { mockFacilities, mockRooms } from "../data/mockData";
import type {
  Facility,
  Room,
  CreateFacilityDTO,
  UpdateFacilityDTO,
  FacilityQueryParams,
  FacilityStats,
  PaginatedResponse,
} from "../types";

/**
 * ============================================================================
 * FACILITY SERVICE
 * ============================================================================
 * Khi BE hoàn thiện → chỉ cần thay body mỗi function bằng axios call.
 * Signature + return type giữ nguyên → Hooks + UI không sửa gì.
 * ============================================================================
 */

// ==================== HELPERS ====================

const randomDelay = (min = 300, max = 700) =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min) + min))
  );

const clone = <T,>(data: T): T => JSON.parse(JSON.stringify(data));

// ==================== IN-MEMORY DB ====================

let db: Facility[] = clone(mockFacilities);
let nextId = Math.max(...db.map((f) => f.id), 0) + 1;

/** Reset mock DB về trạng thái ban đầu (cho dev/test) */
export const resetFacilityData = () => {
  db = clone(mockFacilities);
  nextId = Math.max(...db.map((f) => f.id), 0) + 1;
};

// ==================== QUERIES ====================

/** [GET] /api/facilities */
export const getFacilities = async (
  params?: FacilityQueryParams
): Promise<PaginatedResponse<Facility>> => {
  await randomDelay();

  let result = clone(db);

  // Search
  if (params?.search) {
    const kw = params.search.toLowerCase();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(kw) ||
        f.address.toLowerCase().includes(kw) ||
        f.manager.toLowerCase().includes(kw)
    );
  }

  // Filter status
  if (params?.status) {
    result = result.filter((f) => f.status === params.status);
  }

  // Pagination
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const total = result.length;
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/** [GET] /api/facilities/:id */
export const getFacilityById = async (id: number): Promise<Facility> => {
  await randomDelay();
  const item = db.find((f) => f.id === id);
  if (!item) throw new Error(`Không tìm thấy cơ sở ID=${id}`);
  return clone(item);
};

/** [GET] /api/facilities/stats */
export const getFacilityStats = async (): Promise<FacilityStats> => {
  await randomDelay(200, 400);

  // Dùng mockRooms clone vì roomsDB nằm ở roomService
  const rooms: Room[] = clone(mockRooms);

  return {
    totalFacilities: db.length,
    activeFacilities: db.filter((f) => f.status === "active").length,
    totalRooms: rooms.length,
    totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
    availableRooms: rooms.filter((r) => r.status === "available").length,
  };
};

/** [GET] /api/facilities/active-list — Cho dropdown (nhẹ) */
export const getActiveFacilities = async (): Promise<
  Pick<Facility, "id" | "name">[]
> => {
  await randomDelay(150, 300);
  return db
    .filter((f) => f.status === "active")
    .map(({ id, name }) => ({ id, name }));
};

// ==================== MUTATIONS ====================

/** [POST] /api/facilities */
export const createFacility = async (
  dto: CreateFacilityDTO
): Promise<Facility> => {
  await randomDelay();

  // Validate
  if (!dto.name.trim()) throw new Error("Tên cơ sở không được để trống");

  const duplicate = db.some(
    (f) => f.name.toLowerCase() === dto.name.trim().toLowerCase()
  );
  if (duplicate) throw new Error(`Cơ sở "${dto.name}" đã tồn tại`);

  const now = new Date().toISOString();
  const item: Facility = {
    id: nextId++,
    name: dto.name.trim(),
    address: dto.address.trim(),
    phone: dto.phone.trim(),
    manager: dto.manager.trim(),
    status: "active", // Mặc định khi tạo mới
    createdAt: now,
    updatedAt: now,
  };

  db.push(item);
  return clone(item);
};

/** [PUT] /api/facilities/:id */
export const updateFacility = async (
  id: number,
  dto: UpdateFacilityDTO
): Promise<Facility> => {
  await randomDelay();

  const idx = db.findIndex((f) => f.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy cơ sở ID=${id}`);

  // Check trùng tên
  if (dto.name) {
    const dup = db.some(
      (f) =>
        f.id !== id && f.name.toLowerCase() === dto.name!.trim().toLowerCase()
    );
    if (dup) throw new Error(`Cơ sở "${dto.name}" đã tồn tại`);
  }

  db[idx] = {
    ...db[idx],
    ...(dto.name !== undefined && { name: dto.name.trim() }),
    ...(dto.address !== undefined && { address: dto.address.trim() }),
    ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
    ...(dto.manager !== undefined && { manager: dto.manager.trim() }),
    ...(dto.status !== undefined && { status: dto.status }),
    updatedAt: new Date().toISOString(),
  };

  return clone(db[idx]);
};

/** [DELETE] /api/facilities/:id */
export const deleteFacility = async (id: number): Promise<void> => {
  await randomDelay();

  const item = db.find((f) => f.id === id);
  if (!item) throw new Error(`Không tìm thấy cơ sở ID=${id}`);

  db = db.filter((f) => f.id !== id);
};
