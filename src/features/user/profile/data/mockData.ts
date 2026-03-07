import type { UserProfileInfo } from "../types";

export const MOCK_USER_PROFILE: UserProfileInfo = {
    id: "HV001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
    dob: "15/05/1998",
    joinDate: "01/09/2024",
    avatar: null,
    courses: [
        { id: 1, name: "Toán 10A", level: "Cơ bản", progress: 65, startDate: "01/09/2024", endDate: "01/03/2025" },
        { id: 2, name: "Lý 10-B", level: "Cơ bản", progress: 45, startDate: "15/09/2024", endDate: "15/03/2025" },
        { id: 3, name: "IELTS-01", level: "Intermediate", progress: 30, startDate: "01/10/2024", endDate: "01/04/2025" },
    ]
};
