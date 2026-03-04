import type { StudentGrade } from "../types";

export const mockGrades: Record<number, StudentGrade[]> = {
    // classId: 1 → Toán 10A
    1: [
        {
            id: 1, studentId: "HV001", name: "Nguyễn Minh Anh", avatar: "",
            examScores: [
                { examId: 1, examTitle: "Kiểm tra giữa kỳ", score: 8.5, passed: true, date: "20/01/2024" },
                { examId: 2, examTitle: "Bài tập tuần 3", score: 9.0, passed: true, date: "29/01/2024" },
            ],
            avgScore: 8.8, trend: "up", attendanceRate: 95,
            comment: "Học viên xuất sắc, luôn chuẩn bị bài tốt.",
            commentUpdatedAt: "2024-01-30",
        },
        {
            id: 2, studentId: "HV002", name: "Trần Thị Bích", avatar: "",
            examScores: [
                { examId: 1, examTitle: "Kiểm tra giữa kỳ", score: 7.0, passed: true, date: "20/01/2024" },
                { examId: 2, examTitle: "Bài tập tuần 3", score: 7.5, passed: true, date: "29/01/2024" },
            ],
            avgScore: 7.3, trend: "stable", attendanceRate: 88,
            comment: "Ổn định, cần luyện bài tập thêm.", commentUpdatedAt: "2024-01-30",
        },
        {
            id: 3, studentId: "HV003", name: "Lê Văn Cường", avatar: "",
            examScores: [
                { examId: 1, examTitle: "Kiểm tra giữa kỳ", score: 5.5, passed: false, date: "20/01/2024" },
                { examId: 2, examTitle: "Bài tập tuần 3", score: 6.0, passed: true, date: "29/01/2024" },
            ],
            avgScore: 5.8, trend: "up", attendanceRate: 75,
            comment: "Cần tập trung hơn, hay vắng mặt.", commentUpdatedAt: "2024-01-30",
        },
        {
            id: 4, studentId: "HV004", name: "Phạm Thị Dung", avatar: "",
            examScores: [
                { examId: 1, examTitle: "Kiểm tra giữa kỳ", score: 4.5, passed: false, date: "20/01/2024" },
                { examId: 2, examTitle: "Bài tập tuần 3", score: 5.0, passed: false, date: "29/01/2024" },
            ],
            avgScore: 4.8, trend: "down", attendanceRate: 60,
            comment: "Học viên có nguy cơ. Liên hệ phụ huynh.", commentUpdatedAt: "2024-01-30",
        },
        {
            id: 5, studentId: "HV005", name: "Hoàng Thị Em", avatar: "",
            examScores: [
                { examId: 1, examTitle: "Kiểm tra giữa kỳ", score: 6.5, passed: true, date: "20/01/2024" },
                { examId: 2, examTitle: "Bài tập tuần 3", score: 7.0, passed: true, date: "29/01/2024" },
            ],
            avgScore: 6.8, trend: "up", attendanceRate: 82,
            comment: "Khá tốt, cần cải thiện kỹ năng giải nhanh.", commentUpdatedAt: "2024-01-30",
        },
    ],
};
