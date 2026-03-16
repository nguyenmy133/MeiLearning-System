package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.UpdateProfileRequest;
import com.meilearning.backend.dto.response.ProfileResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ProfileService {
    ProfileResponse getProfile(String username);
    ProfileResponse updateProfile(String username, UpdateProfileRequest request);
    String uploadAvatar(String username, MultipartFile file);
}
