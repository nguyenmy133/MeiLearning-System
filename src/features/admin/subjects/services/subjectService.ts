import type {
  Subject,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  SubjectQueryParams,
  SubjectStats,
} from "../types";
import { mockSubjects } from "../data/mockData";

// ── Helpers ──────────────────────────────────────────────────────────────────
const randomDelay = () =>
  new Promise((res) => setTimeout(res, 300 + Math.random() * 400));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

// ── In-memory DB ──────────────────────────────────────────────────────────────
let db: Subject[] = clone(mockSubjects);
let nextId = Math.max(...db.map((s) => s.id)) + 1;

// ── Service ───────────────────────────────────────────────────────────────────

/** Fetch subject list with optional filters */
export async function getSubjects(params?: SubjectQueryParams): Promise<Subject[]> {
  await randomDelay();
  let result = clone(db);

  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }
  if (params?.category && params.category !== "all") {
    result = result.filter((s) => s.category === params.category);
  }
  if (params?.status && params.status !== "all") {
    result = result.filter((s) => s.status === params.status);
  }

  return result;
}

/** Fetch a single subject by id */
export async function getSubjectById(id: number): Promise<Subject> {
  await randomDelay();
  const subject = db.find((s) => s.id === id);
  if (!subject) throw new Error("Không tìm thấy môn học");
  return clone(subject);
}

/** Compute aggregate stats */
export async function getSubjectStats(): Promise<SubjectStats> {
  await randomDelay();
  return {
    total: db.length,
    active: db.filter((s) => s.status === "active").length,
    inactive: db.filter((s) => s.status === "inactive").length,
    totalTeachers: db.reduce((acc, s) => acc + s.teachers, 0),
    totalClasses: db.reduce((acc, s) => acc + s.classes, 0),
  };
}

/** Create a new subject */
export async function createSubject(dto: CreateSubjectDTO): Promise<Subject> {
  await randomDelay();

  // Validate unique code (case-insensitive)
  if (db.some((s) => s.code.toLowerCase() === dto.code.toLowerCase())) {
    throw new Error(`Mã môn "${dto.code}" đã tồn tại`);
  }
  // Validate unique name
  if (db.some((s) => s.name.toLowerCase() === dto.name.toLowerCase())) {
    throw new Error(`Môn học "${dto.name}" đã tồn tại`);
  }
  // At least one facility
  if (!dto.facilities || dto.facilities.length === 0) {
    throw new Error("Phải chọn ít nhất một cơ sở giảng dạy");
  }

  const now = new Date().toISOString();
  const subject: Subject = {
    id: nextId++,
    ...dto,
    teachers: 0,
    classes: 0,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  db.push(subject);
  return clone(subject);
}

/** Update an existing subject */
export async function updateSubject(id: number, dto: UpdateSubjectDTO): Promise<Subject> {
  await randomDelay();

  const idx = db.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Không tìm thấy môn học");

  // Validate unique code (exclude self)
  if (dto.code && db.some((s) => s.id !== id && s.code.toLowerCase() === dto.code!.toLowerCase())) {
    throw new Error(`Mã môn "${dto.code}" đã tồn tại`);
  }
  // Validate unique name (exclude self)
  if (dto.name && db.some((s) => s.id !== id && s.name.toLowerCase() === dto.name!.toLowerCase())) {
    throw new Error(`Môn học "${dto.name}" đã tồn tại`);
  }
  // At least one facility if provided
  if (dto.facilities !== undefined && dto.facilities.length === 0) {
    throw new Error("Phải chọn ít nhất một cơ sở giảng dạy");
  }

  db[idx] = { ...db[idx], ...dto, updatedAt: new Date().toISOString() };
  return clone(db[idx]);
}

/** Delete a subject — blocked if it has classes */
export async function deleteSubject(id: number): Promise<void> {
  await randomDelay();

  const subject = db.find((s) => s.id === id);
  if (!subject) throw new Error("Không tìm thấy môn học");
  if (subject.classes > 0) {
    throw new Error(
      `Không thể xóa môn học đang có ${subject.classes} lớp học. Hãy kết thúc hoặc chuyển các lớp trước.`
    );
  }

  db = db.filter((s) => s.id !== id);
}

/** Reset in-memory DB to initial mock data (dev/test utility) */
export function resetSubjectData(): void {
  db = clone(mockSubjects);
  nextId = Math.max(...db.map((s) => s.id)) + 1;
}
