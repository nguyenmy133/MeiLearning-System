import { mockRooms, mockFacilities } from "../data/mockData";
import type {
  Room,
  CreateRoomDTO,
  UpdateRoomDTO,
  RoomQueryParams,
  PaginatedResponse,
} from "../types";

/**
 * ============================================================================
 * ROOM SERVICE
 * ============================================================================
 */

// ==================== HELPERS ====================

const randomDelay = (min = 300, max = 700) =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min) + min))
  );

const clone = <T,>(data: T): T => JSON.parse(JSON.stringify(data));

// ==================== IN-MEMORY DB ====================

let db: Room[] = clone(mockRooms);
let nextId = Math.max(...db.map((r) => r.id), 0) + 1;

const facilitiesRef = clone(mockFacilities);

export const resetRoomData = () => {
  db = clone(mockRooms);
  nextId = Math.max(...db.map((r) => r.id), 0) + 1;
};

// ==================== QUERIES ====================

/** [GET] /api/rooms */
export const getRooms = async (
  params?: RoomQueryParams
): Promise<PaginatedResponse<Room>> => {
  await randomDelay();

  let result = clone(db);

  if (params?.search) {
    const kw = params.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(kw) ||
        r.facilityName.toLowerCase().includes(kw)
    );
  }

  if (params?.facilityId) {
    result = result.filter((r) => r.facilityId === params.facilityId);
  }

  if (params?.status) {
    result = result.filter((r) => r.status === params.status);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const total = result.length;
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/** [GET] /api/rooms/:id */
export const getRoomById = async (id: number): Promise<Room> => {
  await randomDelay();
  const item = db.find((r) => r.id === id);
  if (!item) throw new Error(`Không tìm thấy phòng ID=${id}`);
  return clone(item);
};

// ==================== MUTATIONS ====================

/** [POST] /api/rooms */
export const createRoom = async (dto: CreateRoomDTO): Promise<Room> => {
  await randomDelay();

  if (!dto.name.trim()) throw new Error("Tên phòng không được để trống");
  if (dto.capacity < 1 || dto.capacity > 200)
    throw new Error("Sức chứa phải từ 1 đến 200");

  const facility = facilitiesRef.find((f) => f.id === dto.facilityId);
  if (!facility)
    throw new Error(`Không tìm thấy cơ sở ID=${dto.facilityId}`);

  const dup = db.some(
    (r) =>
      r.facilityId === dto.facilityId &&
      r.name.toLowerCase() === dto.name.trim().toLowerCase()
  );
  if (dup)
    throw new Error(`Phòng "${dto.name}" đã tồn tại tại ${facility.name}`);

  const now = new Date().toISOString();
  const item: Room = {
    id: nextId++,
    name: dto.name.trim(),
    facilityId: dto.facilityId,
    facilityName: facility.name,
    capacity: dto.capacity,
    status: "available", // Mặc định
    createdAt: now,
    updatedAt: now,
  };

  db.push(item);
  return clone(item);
};

/** [PUT] /api/rooms/:id */
export const updateRoom = async (
  id: number,
  dto: UpdateRoomDTO
): Promise<Room> => {
  await randomDelay();

  const idx = db.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy phòng ID=${id}`);

  if (dto.capacity !== undefined && (dto.capacity < 1 || dto.capacity > 200))
    throw new Error("Sức chứa phải từ 1 đến 200");

  let facilityName = db[idx].facilityName;
  if (dto.facilityId) {
    const fac = facilitiesRef.find((f) => f.id === dto.facilityId);
    if (!fac) throw new Error(`Không tìm thấy cơ sở ID=${dto.facilityId}`);
    facilityName = fac.name;
  }

  db[idx] = {
    ...db[idx],
    ...(dto.name !== undefined && { name: dto.name.trim() }),
    ...(dto.facilityId !== undefined && {
      facilityId: dto.facilityId,
      facilityName,
    }),
    ...(dto.capacity !== undefined && { capacity: dto.capacity }),
    ...(dto.status !== undefined && { status: dto.status }),
    updatedAt: new Date().toISOString(),
  };

  return clone(db[idx]);
};

/** [DELETE] /api/rooms/:id */
export const deleteRoom = async (id: number): Promise<void> => {
  await randomDelay();

  const item = db.find((r) => r.id === id);
  if (!item) throw new Error(`Không tìm thấy phòng ID=${id}`);

  if (item.status === "occupied")
    throw new Error(
      `Không thể xóa "${item.name}" vì đang được sử dụng. Hãy kết thúc lớp học trước.`
    );

  db = db.filter((r) => r.id !== id);
};
