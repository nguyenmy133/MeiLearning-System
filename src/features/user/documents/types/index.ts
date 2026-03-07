export interface DocumentItem {
    id: number;
    name: string;
    course: string;
    type: "pdf" | "doc" | "excel" | "ppt" | "audio" | "video";
    size: string;
    date: string;
    isNew: boolean;
    teacher: string;
    // Video-specific fields
    youtubeId?: string;
    duration?: string;
    views?: number;
    progress?: number;
    description?: string;
}

export interface CourseFilterItem {
    id: string;
    name: string;
}
