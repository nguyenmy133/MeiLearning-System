package com.meilearning.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.repository.UserRepository;

/**

 * Tạo tài khoản Admin mặc định khi DB trống.

 */

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Admin")
                    .username("admin")
                    .email("admin@meilearning.vn")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.admin)
                    .active(true)
                    .build();

            userRepository.save(admin);

            log.info("✅ Created default admin account: admin / admin123");

        }

    }

}
