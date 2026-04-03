package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.CreateTuitionRequest;
import com.meilearning.backend.dto.request.PayTuitionRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.TuitionInvoiceResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.util.CurrentUserResolver;
import com.meilearning.backend.service.TuitionService;
import java.security.Principal;
import java.util.List;
@RestController
@RequestMapping("/api/v1/tuition")
@RequiredArgsConstructor
@Tag(name = "Tuition", description = "Quản lý học phí")
public class TuitionController {

    private final TuitionService tuitionService;
    private final CurrentUserResolver currentUser;

    @GetMapping
    @Operation(summary = "Lấy danh sách hóa đơn (Admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<PageResponse<TuitionInvoiceResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Long studentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(tuitionService.getAll(status, month, studentId, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết hóa đơn")
    @PreAuthorize("hasAnyRole('admin', 'student')")
    public ResponseEntity<TuitionInvoiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tuitionService.getById(id));
    }

    /**
     * Hóa đơn của student đang đăng nhập — resolve từ JWT.
     */
    @GetMapping("/me")
    @Operation(summary = "Hóa đơn của học viên đang đăng nhập")
    @PreAuthorize("hasRole('student')")
    public ResponseEntity<List<TuitionInvoiceResponse>> getMyInvoices(Principal principal) {
        Student student = currentUser.getStudent();
        return ResponseEntity.ok(tuitionService.getByStudent(student.getId()));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Hóa đơn của học viên (admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<TuitionInvoiceResponse>> getByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(tuitionService.getByStudent(studentId));
    }

    @PostMapping
    @Operation(summary = "Tạo hóa đơn thủ công (Admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<TuitionInvoiceResponse> create(
            @Valid @RequestBody CreateTuitionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tuitionService.create(request));
    }

    @PostMapping("/generate")
    @Operation(summary = "Tự động tạo hóa đơn tháng (Admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<TuitionInvoiceResponse>> generateMonthly(
            @RequestParam String month) {
        return ResponseEntity.ok(tuitionService.generateMonthlyInvoices(month));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Nộp chứng từ thanh toán (Student)")
    @PreAuthorize("hasAnyRole('admin', 'student')")
    public ResponseEntity<TuitionInvoiceResponse> pay(
            @PathVariable Long id,
            @Valid @RequestBody PayTuitionRequest request) {
        return ResponseEntity.ok(tuitionService.pay(id, request));
    }

    @PatchMapping("/{id}/confirm")
    @Operation(summary = "Xác nhận thanh toán (Admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<TuitionInvoiceResponse> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(tuitionService.confirm(id));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Từ chối thanh toán (Admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<TuitionInvoiceResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(tuitionService.reject(id));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Danh sách hóa đơn quá hạn")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<TuitionInvoiceResponse>> getOverdue() {
        return ResponseEntity.ok(tuitionService.getOverdue());
    }

    @GetMapping("/stats")
    @Operation(summary = "Thống kê học phí + doanh thu")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<TuitionStatsResponse> getStats(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(tuitionService.getStats(month));
    }

    @PostMapping("/remind-all")
    @Operation(summary = "Nhắc nợ hàng loạt")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<java.util.Map<String, Integer>> remindAll() {
        return ResponseEntity.ok(tuitionService.remindAll());
    }

    @PostMapping("/{id}/remind")
    @Operation(summary = "Nhắc nợ 1 hóa đơn")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> remind(@PathVariable Long id) {
        tuitionService.remind(id);
        return ResponseEntity.ok().build();
    }
}
