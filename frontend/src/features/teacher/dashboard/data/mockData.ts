import { ClipboardList, FileText, AlertTriangle } from "lucide-react";
import type { PendingTask } from "../types";

// MOCK: average attendance rate — replace with real API when BE is ready
export const MOCK_ATTENDANCE_RATE = 94;

// MOCK: pending tasks — replace with real API calls when BE is ready
export const MOCK_PENDING_TASKS: PendingTask[] = [
    {
        id: 1,
        type: "leave",
        label: "2 đơn xin nghỉ chờ duyệt",
        sub: "Nguyễn Văn A (Toán 10A), Trần Thị B (Lý 10B)",
        href: "/teacher/leave-approval",
        icon: ClipboardList,
        badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        urgent: true,
    },
    {
        id: 2,
        type: "exam",
        label: "1 bài kiểm tra cần chấm",
        sub: "Kiểm tra Toán 10A — hạn chấm hôm nay",
        href: "/teacher/exams",
        icon: FileText,
        badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        urgent: true,
    },
    {
        id: 3,
        type: "absent",
        label: "3 học viên vắng ≥ 3 buổi liên tiếp",
        sub: "Lớp Toán 10A, Lý 10B — cần liên hệ phụ huynh",
        href: "/teacher/attendance",
        icon: AlertTriangle,
        badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        urgent: false,
    },
];
