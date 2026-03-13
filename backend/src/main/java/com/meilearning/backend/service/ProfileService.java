package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.UpdateProfileRequest;
import com.meilearning.backend.dto.response.ProfileResponse;

public interface ProfileService {
    ProfileResponse getProfile(String username);
    ProfileResponse updateProfile(String username, UpdateProfileRequest request);
    String uploadAvatar(String username, byte[] fileData, String originalFilename);
}
