import { apiClient } from "@/lib/api-client";
import type { UserProfileInfo } from "../types";

export const profileService = {
  async getProfile(): Promise<UserProfileInfo> {
    const { data } = await apiClient.get("/profile/me");
    return data;
  },

  async updateProfile(dto: Partial<UserProfileInfo>): Promise<UserProfileInfo> {
    const { data } = await apiClient.put("/profile/me", dto);
    return data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await apiClient.post("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

// Named function exports for direct use
export const getProfile = profileService.getProfile;
export const updateProfile = profileService.updateProfile;
export const uploadAvatar = profileService.uploadAvatar;
