import { MOCK_USER_PROFILE } from "../data/mockData";
import type { UserProfileInfo } from "../types";

export const profileService = {
    getProfile: async (): Promise<UserProfileInfo> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ ...MOCK_USER_PROFILE });
            }, 500);
        });
    },

    updateProfile: async (data: Partial<UserProfileInfo>): Promise<UserProfileInfo> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock update
                resolve({ ...MOCK_USER_PROFILE, ...data });
            }, 500);
        });
    }
};
