package meilearning.com.backend.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import meilearning.com.backend.dto.request.ChangePasswordRequest;
import meilearning.com.backend.dto.request.LoginRequest;
import meilearning.com.backend.dto.response.LoginResponse;
import meilearning.com.backend.dto.response.UserResponse;
import meilearning.com.backend.entity.User;
import meilearning.com.backend.exception.BusinessException;
import meilearning.com.backend.exception.ResourceNotFoundException;
import meilearning.com.backend.repository.UserRepository;
import meilearning.com.backend.security.JwtTokenProvider;
import meilearning.com.backend.service.AuthService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("Tên đăng nhập hoặc mật khẩu không đúng"));

        if (!user.isActive()) {
            throw new BusinessException("Tài khoản đã bị khóa. Liên hệ quản trị viên.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("Tên đăng nhập hoặc mật khẩu không đúng");
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
