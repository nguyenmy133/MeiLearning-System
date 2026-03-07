export interface UserProfileInfo {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    dob: string;
    joinDate: string;
    avatar: string | null;
    courses: Array<{
        id: number;
        name: string;
        level: string;
        progress: number;
        startDate: string;
        endDate: string;
    }>;
}
