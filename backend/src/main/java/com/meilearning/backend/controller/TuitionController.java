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
import com.meilearning.backend.dto.response.TuitionInvoiceResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;
import com.meilearning.backend.service.TuitionService;
import java.util.List;
@RestController
@RequestMapping("/api/v1/tuition")
@RequiredArgsConstructor
@Tag(name = "Tuition", description = "Quản lý học phí")
@PreAuthorize("hasRole('admin')")
public class TuitionController {

    private final TuitionService tuitionService;

    @GetMapping
    @Operation(summary = "Lấy danh sách hóa đơn (Admin)")
    public ResponseEntity<List<TuitionInvoiceResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Long studentId) {
        return ResponseEntity.ok(tuitionService.getAll(status, month, studentId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết hóa đơn")
    public ResponseEntity<TuitionInvoiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tuitionService.getById(id));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Hóa đơn của học viên")
    public ResponseEntity<List<TuitionInvoiceResponse>> getByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(tuitionService.getByStudent(studentId));
    }

    @PostMapping
    @Operation(summary = "Tạo hóa đơn thủ công (Admin)")
    public ResponseEntity<TuitionInvoiceResponse> create(
            @Valid @RequestBody CreateTuitionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tuitionService.create(request));
    }

    @PostMapping("/generate")
    @Operation(summary = "Tự động tạo hóa đơn tháng (Admin)")
    public ResponseEntity<List<TuitionInvoiceResponse>> generateMonthly(
            @RequestParam String month) {
        return ResponseEntity.ok(tuitionService.generateMonthlyInvoices(month));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Nộp chứng từ thanh toán (Student)")
    public ResponseEntity<TuitionInvoiceResponse> pay(
            @PathVariable Long id,
            @Valid @RequestBody PayTuitionRequest request) {
        return ResponseEntity.ok(tuitionService.pay(id, request));
    }

    @PatchMapping("/{id}/confirm")
    @Operation(summary = "Xác nhận thanh toán (Admin)")
    public ResponseEntity<TuitionInvoiceResponse> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(tuitionService.confirm(id));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Từ chối thanh toán (Admin)")
    public ResponseEntity<TuitionInvoiceResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(tuitionService.reject(id));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Danh sách hóa đơn quá hạn")
    public ResponseEntity<List<TuitionInvoiceResponse>> getOverdue() {
        return ResponseEntity.ok(tuitionService.getOverdue());
    }

    @GetMapping("/stats")
    @Operation(summary = "Thống kê học phí + doanh thu")
    public ResponseEntity<TuitionStatsResponse> getStats(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(tuitionService.getStats(month));
    }
}
