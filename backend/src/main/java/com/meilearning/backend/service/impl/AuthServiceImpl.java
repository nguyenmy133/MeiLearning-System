package com.meilearning.backend.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import com.meilearning.backend.dto.request.ChangePasswordRequest;
import com.meilearning.backend.dto.request.LoginRequest;
import com.meilearning.backend.dto.response.LoginResponse;
import com.meilearning.backend.dto.response.UserResponse;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.security.JwtTokenProvider;
import com.meilearning.backend.service.AuthService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("TĂªn Ä‘Äƒng nháº­p hoáº·c máº­t kháº©u khĂ´ng Ä‘Ăºng"));

        if (!user.isActive()) {
            throw new BusinessException("TĂ i khoáº£n Ä‘Ă£ bá»‹ khĂ³a. LiĂªn há»‡ quáº£n trá»‹ viĂªn.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("TĂªn Ä‘Äƒng nháº­p hoáº·c máº­t kháº©u khĂ´ng Ä‘Ăºng");
        }

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getUsername(), user.getRole().name());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();

        return LoginResponse.builder()
                .user(userResponse)
                .accessToken(token)
                .build();
    }

    @Override
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("KhĂ´ng tĂ¬m tháº¥y ngÆ°á»i dĂ¹ng: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Máº­t kháº©u hiá»‡n táº¡i khĂ´ng Ä‘Ăºng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("KhĂ´ng tĂ¬m tháº¥y ngÆ°á»i dĂ¹ng: " + username));

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
