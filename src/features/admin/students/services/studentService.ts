import { mockStudents } from "../data/mockData";
import type {
  Student,
  CreateStudentDTO,
  UpdateStudentDTO,
  DropStudentDTO,
  StudentQueryParams,
  StudentStats,
  PaginatedResponse,
} from "../types";

/**
 * ============================================================================
 * STUDENT SERVICE
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

let db: Student[] = clone(mockStudents);
let nextId = Math.max(...db.map((s) => s.id), 0) + 1;

export const resetStudentData = () => {
  db = clone(mockStudents);
  nextId = Math.max(...db.map((s) => s.id), 0) + 1;
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

/** [GET] /api/students */
export const getStudents = async (
  params?: StudentQueryParams
): Promise<PaginatedResponse<Student>> => {
  await randomDelay();

  let result = clone(db);

  // Search (tên, email, SĐT, SĐT phụ huynh)
  if (params?.search) {
    const kw = params.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(kw) ||
        s.email.toLowerCase().includes(kw) ||
        s.phone.includes(kw) ||
        s.parentPhone.includes(kw)
    );
  }

  // Lọc theo lớp
  if (params?.className) {
    result = result.filter((s) => s.classes.includes(params.className!));
  }

  // Lọc trạng thái học viên
  if (params?.status) {
    result = result.filter((s) => s.status === params.status);
  }

  // Lọc trạng thái học phí
  if (params?.tuitionStatus) {
    result = result.filter((s) => s.tuitionStatus === params.tuitionStatus);
  }

  // Phân trang
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const total = result.length;
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/** [GET] /api/students/:id */
export const getStudentById = async (id: number): Promise<Student> => {
  await randomDelay();
  const item = db.find((s) => s.id === id);
  if (!item) throw new Error(`Không tìm thấy học viên ID=${id}`);
  return clone(item);
};

/** [GET] /api/students/stats */
export const getStudentStats = async (): Promise<StudentStats> => {
  await randomDelay(200, 400);
  return {
    totalStudents: db.length,
    activeStudents: db.filter((s) => s.status === "active").length,
    paidTuitionCount: db.filter((s) => s.tuitionStatus === "paid").length,
    inactiveStudents: db.filter((s) => s.status === "inactive").length,
  };
};

// ==================== MUTATIONS ====================

/** [POST] /api/students */
export const createStudent = async (
  dto: CreateStudentDTO
): Promise<Student> => {
  await randomDelay();

  if (!dto.name.trim()) throw new Error("Họ tên không được để trống");
  if (!dto.username.trim())
    throw new Error("Tên đăng nhập không được để trống");
  if (!dto.password.trim()) throw new Error("Mật khẩu không được để trống");

  // Kiểm tra email trùng
  if (dto.email) {
    const dup = db.some(
      (s) => s.email.toLowerCase() === dto.email.trim().toLowerCase()
    );
    if (dup) throw new Error(`Email "${dto.email}" đã được sử dụng`);
  }

  // Kiểm tra SĐT trùng
  if (dto.phone) {
    const dup = db.some((s) => s.phone === dto.phone.trim());
    if (dup)
      throw new Error(`Số điện thoại "${dto.phone}" đã được sử dụng`);
  }

  const now = new Date().toISOString();
  const item: Student = {
    id: nextId++,
    name: dto.name.trim(),
    email: dto.email.trim(),
    phone: dto.phone.trim(),
    parentPhone: dto.parentPhone.trim(),
    avatar: "",
    dateOfBirth: dto.dateOfBirth ?? "",
    gender: dto.gender ?? "other",
    grade: dto.grade ?? "",
    address: dto.address?.trim() ?? "",
    classes: dto.classes,
    status: "active",    // Mặc định
    tuitionStatus: "pending", // Mặc định – admin cập nhật sau khi thu phí
    enrollDate: new Date().toISOString().split("T")[0],
    createdAt: now,
    updatedAt: now,
  };

  db.push(item);
  return clone(item);
};

/** [PUT] /api/students/:id – Cập nhật thông tin (KHÔNG đổi status trực tiếp) */
export const updateStudent = async (
  id: number,
  dto: UpdateStudentDTO
): Promise<Student> => {
  await randomDelay();

  const idx = db.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy học viên ID=${id}`);

  // Kiểm tra email trùng
  if (dto.email) {
    const dup = db.some(
      (s) =>
        s.id !== id &&
        s.email.toLowerCase() === dto.email!.trim().toLowerCase()
    );
    if (dup) throw new Error(`Email "${dto.email}" đã được sử dụng`);
  }

  // Kiểm tra SĐT trùng
  if (dto.phone) {
    const dup = db.some(
      (s) => s.id !== id && s.phone === dto.phone!.trim()
    );
    if (dup)
      throw new Error(`Số điện thoại "${dto.phone}" đã được sử dụng`);
  }

  db[idx] = {
    ...db[idx],
    ...(dto.name !== undefined && { name: dto.name.trim() }),
    ...(dto.email !== undefined && { email: dto.email.trim() }),
    ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
    ...(dto.parentPhone !== undefined && {
      parentPhone: dto.parentPhone.trim(),
    }),
    ...(dto.classes !== undefined && { classes: dto.classes }),
    ...(dto.tuitionStatus !== undefined && {
      tuitionStatus: dto.tuitionStatus,
    }),
    updatedAt: new Date().toISOString(),
  };

  return clone(db[idx]);
};

/** [DELETE] /api/students/:id
 *  Chỉ cho phép xóa học viên đã nghỉ học (inactive).
 *  Học viên active phải ghi nhận nghỉ học trước. */
export const deleteStudent = async (id: number): Promise<void> => {
  await randomDelay();

  const item = db.find((s) => s.id === id);
  if (!item) throw new Error(`Không tìm thấy học viên ID=${id}`);

  if (item.status === "active") {
    throw new Error(
      `Không thể xóa học viên "${item.name}" đang còn theo học. Hãy ghi nhận nghỉ học trước khi xóa.`
    );
  }

  db = db.filter((s) => s.id !== id);
};

// ==================== SPECIAL OPERATIONS ====================

/** [POST] /api/students/:id/reset-password → trả mật khẩu tạm */
export const resetStudentPassword = async (id: number): Promise<string> => {
  await randomDelay();

  const item = db.find((s) => s.id === id);
  if (!item) throw new Error(`Không tìm thấy học viên ID=${id}`);

  return generatePassword();
};

/** [PATCH] /api/students/:id/drop
 *  Ghi nhận nghỉ học → status = "inactive", lưu lý do + ngày */
export const dropStudent = async (
  id: number,
  dto: DropStudentDTO
): Promise<Student> => {
  await randomDelay();

  const idx = db.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy học viên ID=${id}`);

  if (db[idx].status === "inactive") {
    throw new Error(
      `Học viên "${db[idx].name}" đã ở trạng thái nghỉ học rồi`
    );
  }

  if (!dto.reason.trim()) {
    throw new Error("Vui lòng chọn lý do nghỉ học");
  }

  db[idx] = {
    ...db[idx],
    status: "inactive",
    classes: [],           // Xóa khỏi lớp khi nghỉ học
    dropDate: dto.dropDate,
    dropReason: dto.reason.trim(),
    dropNotes: dto.notes?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  return clone(db[idx]);
};

/** [PATCH] /api/students/:id/reactivate
 *  Kích hoạt lại học viên → status = "active", xóa thông tin drop */
export const reactivateStudent = async (id: number): Promise<Student> => {
  await randomDelay();

  const idx = db.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy học viên ID=${id}`);

  if (db[idx].status === "active") {
    throw new Error(
      `Học viên "${db[idx].name}" đang ở trạng thái hoạt động rồi`
    );
  }

  // Xóa drop info, đặt tuitionStatus về "pending" để admin xác nhận lại
  const { dropDate: _dd, dropReason: _dr, dropNotes: _dn, ...rest } =
    db[idx];
  db[idx] = {
    ...rest,
    status: "active",
    tuitionStatus: "pending", // Kích hoạt lại → yêu cầu xác nhận học phí mới
    updatedAt: new Date().toISOString(),
  };

  return clone(db[idx]);
};
