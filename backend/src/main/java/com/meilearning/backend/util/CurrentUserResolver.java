package com.meilearning.backend.util;

import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.Teacher;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Injectable component để resolve current user entities từ JWT SecurityContext.
 * Thay thế việc controllers inject Repository trực tiếp.
 *
 * Usage:
 *   @RequiredArgsConstructor
 *   public class SomeController {
 *       private final CurrentUserResolver currentUser;
 *       // ...
 *       Teacher teacher = currentUser.getTeacher();
 *   }
 */
@Component
@RequiredArgsConstructor
public class CurrentUserResolver {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    /** Lấy username từ JWT SecurityContext. */
    public String getUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new ResourceNotFoundException("Chưa đăng nhập hoặc phiên đã hết hạn.");
        }
        return auth.getName();
    }

    /** Resolve Teacher entity từ JWT username. */
    public Teacher getTeacher() {
        String username = getUsername();
        return teacherRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy giáo viên với tài khoản: " + username));
    }

    /** Resolve Student entity từ JWT username. */
    public Student getStudent() {
        String username = getUsername();
        return studentRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy học viên với tài khoản: " + username));
    }

    /** Resolve User entity từ JWT username. */
    public User getUser() {
        String username = getUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người dùng: " + username));
    }

    /** Kiểm tra user hiện tại có role admin không. */
    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_admin"));
    }

    /** Kiểm tra user hiện tại có role teacher không. */
    public boolean isTeacher() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_teacher"));
    }

    /** Kiểm tra user hiện tại có role student không. */
    public boolean isStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_student"));
    }
}
