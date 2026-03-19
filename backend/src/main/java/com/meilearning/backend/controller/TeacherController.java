package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.CreateTeacherRequest;
import com.meilearning.backend.dto.request.UpdateTeacherRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.PendingTaskResponse;
import com.meilearning.backend.dto.response.TeacherResponse;
import com.meilearning.backend.dto.response.TeacherStatsResponse;
import com.meilearning.backend.entity.enums.RequestStatus;
import com.meilearning.backend.entity.enums.RequesterType;
import com.meilearning.backend.entity.enums.SessionStatus;
import com.meilearning.backend.repository.ClassSessionRepository;
import com.meilearning.backend.repository.LeaveRequestRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.service.TeacherService;
import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
@Tag(name = "Teacher", description = "Quản lý giáo viên")
public class TeacherController {

    private final TeacherService teacherService;
    private final TeacherRepository teacherRepository;
    private final ClassSessionRepository sessionRepository;
    private final LeaveRequestRepository leaveRepository;

    // ── Admin-only endpoints ──────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Lấy danh sách giáo viên")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<PageResponse<TeacherResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(teacherService.getAll(search, subject, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết giáo viên")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<TeacherResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Tạo giáo viên mới (auto-create User account)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<TeacherResponse> create(@Valid @RequestBody CreateTeacherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin giáo viên")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<TeacherResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateTeacherRequest request) {
        return ResponseEntity.ok(teacherService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa giáo viên (phải không có lớp)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Reset mật khẩu giáo viên")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@PathVariable Long id) {
        String newPassword = teacherService.resetPassword(id);
        return ResponseEntity.ok(java.util.Map.of("newPassword", newPassword));
    }

    @PatchMapping("/{id}/lock")
    @Operation(summary = "Khóa tài khoản giáo viên")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> lockAccount(@PathVariable Long id) {
        teacherService.lockAccount(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/unlock")
    @Operation(summary = "Mở khóa tài khoản giáo viên")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> unlockAccount(@PathVariable Long id) {
        teacherService.unlockAccount(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê giáo viên")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<TeacherStatsResponse> getStats() {
        return ResponseEntity.ok(teacherService.getStats());
    }

    // ── Teacher self-service endpoints ────────────────────────────────────────

    /**
     * Aggregate pending tasks từ:
     *   1. Đơn nghỉ học viên chưa duyệt
     *   2. Buổi học hôm nay chưa điểm danh
     */
    @GetMapping("/me/pending-tasks")
    @Operation(summary = "Pending tasks của giáo viên đang đăng nhập")
    @PreAuthorize("hasRole('teacher')")
    public ResponseEntity<List<PendingTaskResponse>> getMyPendingTasks(Principal principal) {
        var teacherOpt = teacherRepository.findByUserUsername(principal.getName());
        if (teacherOpt.isEmpty()) return ResponseEntity.ok(List.of());

        var teacher = teacherOpt.get();
        List<PendingTaskResponse> tasks = new ArrayList<>();

        // 1. Pending leave requests trong session của teacher
        var allSessions = sessionRepository.findByClassEntityTeacherId(teacher.getId());
        var sessionIds = allSessions.stream().map(s -> s.getId()).toList();
        if (!sessionIds.isEmpty()) {
            long pendingLeaves = leaveRepository.findBySessionIdIn(sessionIds)
                    .stream()
                    .filter(lr -> lr.getStatus() == RequestStatus.pending
                            && lr.getRequesterType() == RequesterType.student)
                    .count();
            if (pendingLeaves > 0) {
                tasks.add(PendingTaskResponse.builder()
                        .type("leave")
                        .title("Đơn xin nghỉ chưa duyệt")
                        .description(pendingLeaves + " đơn xin nghỉ của học viên đang chờ duyệt")
                        .count((int) pendingLeaves)
                        .urgent(true)
                        .build());
            }
        }

        // 2. Buổi học hôm nay chưa điểm danh
        LocalDate today = LocalDate.now();
        long undoneToday = sessionRepository
                .findByClassEntityTeacherIdAndDate(teacher.getId(), today)
                .stream()
                .filter(s -> s.getStatus() == SessionStatus.upcoming)
                .count();
        if (undoneToday > 0) {
            tasks.add(PendingTaskResponse.builder()
                    .type("attendance")
                    .title("Buổi học chưa điểm danh")
                    .description("Hôm nay có " + undoneToday + " buổi học chưa được điểm danh")
                    .count((int) undoneToday)
                    .urgent(false)
                    .build());
        }

        return ResponseEntity.ok(tasks);
    }
}
