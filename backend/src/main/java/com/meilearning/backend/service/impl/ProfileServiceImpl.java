package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.meilearning.backend.dto.request.UpdateProfileRequest;
import com.meilearning.backend.dto.response.ProfileResponse;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.Teacher;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.exception.DuplicateResourceException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.service.FileStorageService;
import com.meilearning.backend.service.ProfileService;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String username) {
        User user = findUser(username);
        return buildProfileResponse(user);
    }

    @Override
    public ProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = findUser(username);

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        // Email — check unique
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email '" + request.getEmail() + "' đã tồn tại");
            }
            user.setEmail(request.getEmail());
        }

        // Update role-specific fields
        if (user.getRole() == User.Role.teacher) {
            teacherRepository.findByUserId(user.getId()).ifPresent(teacher -> {
                if (request.getAddress() != null) teacher.setAddress(request.getAddress());
                teacherRepository.save(teacher);
            });
        } else if (user.getRole() == User.Role.student) {
            studentRepository.findByUserId(user.getId()).ifPresent(student -> {
                if (request.getAddress() != null) student.setAddress(request.getAddress());
                studentRepository.save(student);
            });
        }

        userRepository.save(user);
        return buildProfileResponse(user);
    }

    @Override
    public String uploadAvatar(String username, MultipartFile file) {
        User user = findUser(username);

        // Xóa avatar cũ (nếu có)
        if (user.getAvatar() != null && !user.getAvatar().isBlank()) {
            fileStorageService.delete(user.getAvatar());
        }

        // Lưu avatar mới qua FileStorageService
        String avatarUrl = fileStorageService.store(file, "avatars");
        user.setAvatar(avatarUrl);
        userRepository.save(user);
        return avatarUrl;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));
    }

    private ProfileResponse buildProfileResponse(User user) {
        String address = null;
        String dob = null;
        String joinDate = null;

        if (user.getRole() == User.Role.teacher) {
            Teacher teacher = teacherRepository.findByUserId(user.getId()).orElse(null);
            if (teacher != null) {
                address = teacher.getAddress();
                dob = teacher.getDateOfBirth() != null ? teacher.getDateOfBirth().toString() : null;
                joinDate = teacher.getJoinDate() != null ? teacher.getJoinDate().toString() : null;
            }
        } else if (user.getRole() == User.Role.student) {
            Student student = studentRepository.findByUserId(user.getId()).orElse(null);
            if (student != null) {
                address = student.getAddress();
                dob = student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : null;
                joinDate = student.getEnrollDate() != null ? student.getEnrollDate().toString() : null;
            }
        }

        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(address)
                .dob(dob)
                .joinDate(joinDate)
                .avatar(user.getAvatar())
                .role(user.getRole().name())
                .build();
    }
}
