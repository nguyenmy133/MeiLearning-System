package com.meilearning.backend.util;

import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.Teacher;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility class để resolve entity (Teacher/Student/User) từ JWT token.
 * Tránh FE phải gửi teacherId/studentId — chống giả mạo ID.
 *
 * Sử dụng: inject repository vào constructor của service, gọi static method.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Lấy username từ JWT SecurityContext.
     */
    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new ResourceNotFoundException("Chưa đăng nhập hoặc phiên đã hết hạn.");
        }
        return auth.getName();
    }

    /**
     * Resolve Teacher entity từ JWT username.
     */
    public static Teacher getCurrentTeacher(TeacherRepository teacherRepository) {
        String username = getCurrentUsername();
        return teacherRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy giáo viên với tài khoản: " + username));
    }

    /**
     * Resolve Student entity từ JWT username.
     */
    public static Student getCurrentStudent(StudentRepository studentRepository) {
        String username = getCurrentUsername();
        return studentRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy học viên với tài khoản: " + username));
    }

    /**
     * Resolve User entity từ JWT username.
     */
    public static User getCurrentUser(UserRepository userRepository) {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người dùng: " + username));
    }

    /**
     * Kiểm tra user hiện tại có role admin không.
     */
    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_admin"));
    }

    /**
     * Kiểm tra user hiện tại có role teacher không.
     */
    public static boolean isTeacher() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_teacher"));
    }

    /**
     * Kiểm tra user hiện tại có role student không.
     */
    public static boolean isStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_student"));
    }
}
