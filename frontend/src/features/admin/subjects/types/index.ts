export type SubjectStatus = "active" | "inactive";

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  category: string;
  /** Giá tham khảo mỗi buổi học (VND) — dùng làm mặc định khi tạo lớp */
  basePricePerSession: number;
  teachers: number;
  classes: number;
  status: SubjectStatus;
  facilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectDTO {
  name: string;
  code: string;
  description: string;
  category: string;
  basePricePerSession: number;
  facilities: string[];
}

export interface UpdateSubjectDTO {
  name?: string;
  code?: string;
  description?: string;
  category?: string;
  basePricePerSession?: number;
  facilities?: string[];
  status?: SubjectStatus;
}

export interface SubjectQueryParams {
  search?: string;
  category?: string;
  status?: SubjectStatus | "all";
}

export interface SubjectStats {
  total: number;
  active: number;
  inactive: number;
  totalCategories: number;
}

export const SUBJECT_STATUS_LABELS: Record<SubjectStatus, string> = {
  active: "Hoạt động",
  inactive: "Tạm ngừng",
};

export const SUBJECT_CATEGORIES = [
  "Tự nhiên",
  "Xã hội",
  "Ngoại ngữ",
  "Công nghệ",
] as const;

export type SubjectCategory = (typeof SUBJECT_CATEGORIES)[number];

export const ALL_FACILITIES = [
  "Cơ sở Quận 1",
  "Cơ sở Quận 3",
  "Cơ sở Thủ Đức",
] as const;

export type FacilityName = (typeof ALL_FACILITIES)[number];
