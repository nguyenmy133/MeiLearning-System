import { mockClasses } from "../data/mockData";
import type {
  Class,
  CreateClassDTO,
  UpdateClassDTO,
  ClassQueryParams,
  ClassStats,
  PaginatedResponse,
  TeacherRef,
} from "../types";

/**
 * ============================================================================
 * CLASS SERVICE
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

let db: Class[] = clone(mockClasses);
let nextId = Math.max(...db.map((c) => c.id), 0) + 1;

export const resetClassData = () => {
  db = clone(mockClasses);
  nextId = Math.max(...db.map((c) => c.id), 0) + 1;
};

// ==================== MOCK TEACHER LOOKUP ====================
// Sẽ được thay bằng call đến teacher service / API khi BE xong

const mockTeacherRefs: TeacherRef[] = [
  { id: 1, name: "Nguyễn Thị Mai", avatar: "" },
  { id: 2, name: "Trần Văn Hùng", avatar: "" },
  { id: 3, name: "Lê Thị Hương", avatar: "" },
  { id: 4, name: "Phạm Minh Tuấn", avatar: "" },
  { id: 5, name: "Hoàng Thị Lan", avatar: "" },
];

export const getTeacherRefs = async (): Promise<TeacherRef[]> => {
  await randomDelay(100, 300);
  return clone(mockTeacherRefs);
};

// ==================== QUERIES ====================

/** [GET] /api/classes */
export const getClasses = async (
  params?: ClassQueryParams
): Promise<PaginatedResponse<Class>> => {
  await randomDelay();

  let result = clone(db);

  // Search (tên lớp, tên giáo viên)
  if (params?.search) {
    const kw = params.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(kw) ||
        c.teacher.name.toLowerCase().includes(kw)
    );
  }

  // Lọc môn học
  if (params?.subject) {
    result = result.filter((c) => c.subject === params.subject);
  }

  // Lọc cơ sở
  if (params?.facility) {
    result = result.filter((c) => c.facility === params.facility);
  }

  // Lọc trạng thái
  if (params?.status) {
    result = result.filter((c) => c.status === params.status);
  }

  // Phân trang
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const total = result.length;
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/** [GET] /api/classes/:id */
export const getClassById = async (id: number): Promise<Class> => {
  await randomDelay();
  const item = db.find((c) => c.id === id);
  if (!item) throw new Error(`Không tìm thấy lớp học ID=${id}`);
  return clone(item);
};

/** [GET] /api/classes/stats */
export const getClassStats = async (): Promise<ClassStats> => {
  await randomDelay(200, 400);
  const active = db.filter((c) => c.status === "active");
  return {
    totalClasses: db.length,
    activeClasses: active.length,
    upcomingClasses: db.filter((c) => c.status === "upcoming").length,
    totalStudents: active.reduce((sum, c) => sum + c.students, 0),
  };
};

// ==================== MUTATIONS ====================

/** [POST] /api/classes */
export const createClass = async (dto: CreateClassDTO): Promise<Class> => {
  await randomDelay();

  if (!dto.name.trim()) throw new Error("Tên lớp không được để trống");

  // Kiểm tra tên lớp trùng (case-insensitive)
  const dup = db.some(
    (c) => c.name.toLowerCase() === dto.name.trim().toLowerCase()
  );
  if (dup) throw new Error(`Tên lớp "${dto.name}" đã tồn tại`);

  // Validate maxStudents
  if (dto.maxStudents < 1 || dto.maxStudents > 200) {
    throw new Error("Sĩ số tối đa phải từ 1 đến 200");
  }

  // Phải có ít nhất 1 ngày học
  if (!dto.schedule || dto.schedule.length === 0) {
    throw new Error("Vui lòng chọn ít nhất một ngày học trong tuần");
  }

  // Validate mỗi slot: startTime < endTime
  for (const slot of dto.schedule) {
    if (slot.startTime >= slot.endTime) {
      throw new Error(
        `Giờ bắt đầu phải nhỏ hơn giờ kết thúc (weekday ${slot.weekday})`
      );
    }
  }

  const teacher =
    mockTeacherRefs.find((t) => t.id === dto.teacherId) ??
    ({ id: dto.teacherId, name: "Không rõ", avatar: "" } as TeacherRef);

  const now = new Date().toISOString();
  const item: Class = {
    id: nextId++,
    name: dto.name.trim(),
    subject: dto.subject,
    teacher,
    facility: dto.facility,
    room: dto.room,
    students: 0,
    maxStudents: dto.maxStudents,
    pricePerSession: dto.pricePerSession,
    schedule: dto.schedule,
    startDate: dto.startDate,
    endDate: null,
    status: "upcoming", // Mặc định khi tạo mới
    description: dto.description?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };

  db.push(item);
  return clone(item);
};

/** [PUT] /api/classes/:id */
export const updateClass = async (
  id: number,
  dto: UpdateClassDTO
): Promise<Class> => {
  await randomDelay();

  const idx = db.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy lớp học ID=${id}`);

  // Kiểm tra tên lớp trùng khi đổi tên
  if (dto.name !== undefined) {
    const dup = db.some(
      (c) =>
        c.id !== id &&
        c.name.toLowerCase() === dto.name!.trim().toLowerCase()
    );
    if (dup) throw new Error(`Tên lớp "${dto.name}" đã tồn tại`);
  }

  if (dto.maxStudents !== undefined) {
    if (dto.maxStudents < 1 || dto.maxStudents > 200) {
      throw new Error("Sĩ số tối đa phải từ 1 đến 200");
    }
    // Không cho phép giảm sĩ số tối đa xuống dưới số học viên hiện tại
    if (dto.maxStudents < db[idx].students) {
      throw new Error(
        `Sĩ số tối đa không thể nhỏ hơn số học viên hiện tại (${db[idx].students})`
      );
    }
  }

  if (dto.schedule !== undefined) {
    if (dto.schedule.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một ngày học trong tuần");
    }
    for (const slot of dto.schedule) {
      if (slot.startTime >= slot.endTime) {
        throw new Error(
          `Giờ bắt đầu phải nhỏ hơn giờ kết thúc (weekday ${slot.weekday})`
        );
      }
    }
  }

  let teacher = db[idx].teacher;
  if (dto.teacherId !== undefined) {
    teacher =
      mockTeacherRefs.find((t) => t.id === dto.teacherId) ??
      ({ id: dto.teacherId, name: "Không rõ", avatar: "" } as TeacherRef);
  }

  db[idx] = {
    ...db[idx],
    ...(dto.name !== undefined && { name: dto.name.trim() }),
    ...(dto.subject !== undefined && { subject: dto.subject }),
    ...(dto.teacherId !== undefined && { teacher }),
    ...(dto.facility !== undefined && { facility: dto.facility }),
    ...(dto.room !== undefined && { room: dto.room }),
    ...(dto.maxStudents !== undefined && { maxStudents: dto.maxStudents }),
    ...(dto.schedule !== undefined && { schedule: dto.schedule }),
    ...(dto.startDate !== undefined && { startDate: dto.startDate }),
    ...(dto.description !== undefined && {
      description: dto.description.trim(),
    }),
    ...(dto.status !== undefined && { status: dto.status }),
    updatedAt: new Date().toISOString(),
  };

  return clone(db[idx]);
};

/** [DELETE] /api/classes/:id
 *  Không cho xóa lớp "active" — phải kết thúc trước. */
export const deleteClass = async (id: number): Promise<void> => {
  await randomDelay();

  const item = db.find((c) => c.id === id);
  if (!item) throw new Error(`Không tìm thấy lớp học ID=${id}`);

  if (item.status === "active") {
    throw new Error(
      `Không thể xóa lớp "${item.name}" đang hoạt động. Hãy kết thúc lớp trước.`
    );
  }

  db = db.filter((c) => c.id !== id);
};

// ==================== SPECIAL OPERATIONS ====================

/** [PATCH] /api/classes/:id/end
 *  Kết thúc lớp học → status = "completed", endDate = hôm nay */
export const endClass = async (id: number): Promise<Class> => {
  await randomDelay();

  const idx = db.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Không tìm thấy lớp học ID=${id}`);

  if (db[idx].status === "completed") {
    throw new Error(`Lớp "${db[idx].name}" đã được kết thúc rồi`);
  }

  // Chỉ active hoặc upcoming mới được kết thúc
  if (db[idx].status !== "active" && db[idx].status !== "upcoming") {
    throw new Error(`Không thể kết thúc lớp ở trạng thái hiện tại`);
  }

  const today = new Date().toISOString().split("T")[0];
  db[idx] = {
    ...db[idx],
    status: "completed",
    endDate: today,
    updatedAt: new Date().toISOString(),
  };

  return clone(db[idx]);
};
