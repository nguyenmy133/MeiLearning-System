export interface DocumentItem {
    id: number;
    name: string;
    course: string;         // Tên các lớp (comma separated)
    type: "pdf" | "doc" | "excel" | "ppt" | "audio" | "video" | "youtube";
    size: string;
    date: string;
    isNew: boolean;
    teacher: string;
    fileUrl: string;        // URL gốc từ backend — dùng để mở/tải file
    // YouTube-specific fields
    youtubeId?: string;     // Extracted from fileUrl khi type === "youtube"
    description?: string;
}

export interface CourseFilterItem {
    id: string;
    name: string;
}
