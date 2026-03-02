import { mockTeachers } from "../data/mockData";
import type {
  Teacher,
  CreateTeacherDTO,
  UpdateTeacherDTO,
  TeacherQueryParams,
  TeacherStats,
  PaginatedResponse,
} from "../types";
import { SUBJECT_OPTIONS } from "../types";

/**
 * ============================================================================
 * TEACHER SERVICE
 * ============================================================================
 * Khi BE xong → chỉ thay body mỗi function bằng axios call.
 * ============================================================================
 */

const randomDelay = (min = 300, max = 700) =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min) + min))
  );

const clone = <T,>(data: T): T => JSON.parse(JSON.stringify(data));

// ==================== IN-MEMORY DB ====================

let db: Teacher[] = clone(mockTeachers);
let nextId = Math.max(...db.map((t) => t.id), 0) + 1;

export const resetTeacherData = () => {
  db = clone(mockTeachers);
  nextId = Math.max(...db.map((t) => t.id), 0) + 1;
};

// ==================== HELPERS ====================

function generatePassword(): string {
  const chars =
    "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ==================== QUERIES ====================

/** [GET] /api/teachers */
export const getTeachers = async (
  params?: TeacherQueryParams
): Promise<PaginatedResponse<Teacher>> => {
  await randomDelay();

  let result = clone(db);

  // Search
  if (params?.search) {
    const kw = params.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(kw) ||
        t.email.toLowerCase().includes(kw) ||
        t.phone.includes(kw)
    );
  }

  // Filter subject
  if (params?.subject) {
    result = result.filter((t) => t.subjects.includes(params.subject!));
  }

  // Filter status
  if (params?.status) {
    result = result.filter((t) => t.status === params.status);
  }

  // Pagination
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const total = result.length;
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/** [GET] /api/teachers/:id */
export const getTeacherById = async (id: number): Promise<Teacher> => {
  await randomDelay();
  const item = db.find((t) => t.id === id);
  if (!item) throw new Error(`Không tìm thấy giáo viên ID=${id}`);
  return clone(item);
};

/** [GET] /api/teachers/stats */
export const getTeacherStats = async (): Promise<TeacherStats> => {
  await randomDelay(200, 400);
  return {
    totalTeachers: db.length,
    activeTeachers: db.filter((t) => t.status === "active").length,
    totalClasses: db.reduce((sum, t) => sum + t.classCount, 0),
    totalSubjects: SUBJECT_OPTIONS.length,
  };
};

// ==================== MUTATIONS ====================

/** [POST] /api/teachers */
export const createTeacher = async (
  dto: CreateTeacherDTO
): Promise<Teacher> => {
  await randomDelay();

  if (!dto.name.trim()) throw new Error("Họ tên không được để trống");
  if (!dto.username.trim()) throw new Error("Tên đăng nhập không được để trống");
  if (!dto.password.trim()) throw new Error("Mật khẩu không được để trống");

  // Check email trùng
  if (dto.email) {
    const dupEmail = db.some(
      (t) => t.email.toLowerCase() === dto.email.trim().toLowerCase()
    );
    if (dupEmail) throw new Error(`Email "${dto.email}" đã được sử dụng`);
  }

  // Check SĐT trùng
  if (dto.phone) {
    const dupPhone = db.some((t) => t.phone === dto.phone.trim());
    if (dupPhone) throw new Error(`Số điện thoại "${dto.phone}" đã được sử dụng`);
  }

  const now = new Date().toISOString();
  const item: Teacher = {
    id: nextId++,
    name: dto.name.trim(),
    username: dto.username.trim(),
    email: dto.email.trim(),
    phone: dto.phone.trim(),
    avatar: "",
    dateOfBirth: dto.dateOfBirth ?? "",
    gender: dto.gender ?? "other",
    address: dto.address?.trim() ?? "",
    bio: dto.bio?.trim(),
    subjects: dto.subjects,
    classCount: 0,
    status: "active", // Mặc định
    joinDate: new Date().toISOString().split("T")[0],
    createdAt: now,
    updatedAt: now,
  };

  db.push(item);
  return clone(item);
};

/** [PUT] /api/teachers/:id */
export const updateTeacher = async (
  id: number,
  dto: UpdateTeacherDTO
): Promise<Teacher> => {
  await randomDelay();

  const idx = db.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy giáo viên ID=${id}`);

  // Check email trùng
  if (dto.email) {
    const dup = db.some(
      (t) =>
        t.id !== id &&
        t.email.toLowerCase() === dto.email!.trim().toLowerCase()
    );
    if (dup) throw new Error(`Email "${dto.email}" đã được sử dụng`);
  }

  // Check SĐT trùng
  if (dto.phone) {
    const dup = db.some(
      (t) => t.id !== id && t.phone === dto.phone!.trim()
    );
    if (dup)
      throw new Error(`Số điện thoại "${dto.phone}" đã được sử dụng`);
  }

  db[idx] = {
    ...db[idx],
    ...(dto.name !== undefined && { name: dto.name.trim() }),
    ...(dto.email !== undefined && { email: dto.email.trim() }),
    ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
    ...(dto.subjects !== undefined && { subjects: dto.subjects }),
    ...(dto.status !== undefined && { status: dto.status }),
    updatedAt: new Date().toISOString(),
  };

  return clone(db[idx]);
};

/** [DELETE] /api/teachers/:id */
export const deleteTeacher = async (id: number): Promise<void> => {
  await randomDelay();

  const item = db.find((t) => t.id === id);
  if (!item) throw new Error(`Không tìm thấy giáo viên ID=${id}`);

  if (item.classCount > 0) {
    throw new Error(
      `Không thể xóa giáo viên "${item.name}" vì đang phụ trách ${item.classCount} lớp. Hãy chuyển lớp cho giáo viên khác trước.`
    );
  }

  db = db.filter((t) => t.id !== id);
};

// ==================== SPECIAL OPERATIONS ====================

/** [POST] /api/teachers/:id/reset-password → trả mật khẩu tạm */
export const resetTeacherPassword = async (
  id: number
): Promise<string> => {
  await randomDelay();

  const item = db.find((t) => t.id === id);
  if (!item) throw new Error(`Không tìm thấy giáo viên ID=${id}`);

  const newPassword = generatePassword();
  // Trong thực tế BE sẽ hash + lưu DB, ở đây chỉ trả về plain text
  return newPassword;
};

/** [PATCH] /api/teachers/:id/lock */
export const lockTeacher = async (id: number): Promise<Teacher> => {
  await randomDelay();

  const idx = db.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy giáo viên ID=${id}`);

  if (db[idx].status === "locked") {
    throw new Error(`Giáo viên "${db[idx].name}" đã bị khóa rồi`);
  }

  db[idx] = {
    ...db[idx],
    status: "locked",
    updatedAt: new Date().toISOString(),
  };

  return clone(db[idx]);
};

/** [PATCH] /api/teachers/:id/unlock */
export const unlockTeacher = async (id: number): Promise<Teacher> => {
  await randomDelay();

  const idx = db.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy giáo viên ID=${id}`);

  if (db[idx].status !== "locked") {
    throw new Error(`Giáo viên "${db[idx].name}" không ở trạng thái bị khóa`);
  }

  db[idx] = {
    ...db[idx],
    status: "active", // Mở khóa → active
    updatedAt: new Date().toISOString(),
  };

  return clone(db[idx]);
};
