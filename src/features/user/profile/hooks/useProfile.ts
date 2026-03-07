import { useQuery, useMutation } from "@tanstack/react-query";
import { profileService } from "../services/profileService";
import type { UserProfileInfo } from "../types";

export const useProfile = () => {
    return useQuery({
        queryKey: ["user", "profile"],
        queryFn: () => profileService.getProfile(),
    });
};

export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: (data: Partial<UserProfileInfo>) => profileService.updateProfile(data),
    });
};
