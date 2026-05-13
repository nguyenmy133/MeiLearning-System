package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.TuitionInvoice;
import com.meilearning.backend.entity.enums.InvoiceStatus;
import java.util.List;
@Repository
public interface TuitionInvoiceRepository

        extends JpaRepository<TuitionInvoice, Long>, JpaSpecificationExecutor<TuitionInvoice> {

    List<TuitionInvoice> findByStudentId(Long studentId);

    List<TuitionInvoice> findByMonth(String month);

    List<TuitionInvoice> findByStatus(InvoiceStatus status);

    List<TuitionInvoice> findByStudentIdAndMonth(Long studentId, String month);

    List<TuitionInvoice> findByClassEntityId(Long classId);

    long countByStatus(InvoiceStatus status);

    long countByMonth(String month);

    long countByStatusAndMonth(InvoiceStatus status, String month);

    List<TuitionInvoice> findByStatusIn(java.util.Collection<InvoiceStatus> statuses);

    /** Tìm invoice theo status và dueDate < date — dùng cho scheduler markOverdue */
    List<TuitionInvoice> findByStatusAndDueDateBefore(InvoiceStatus status, java.time.LocalDate date);

    /** Kiểm tra còn invoice chưa thanh toán của student — dùng để sync Student.tuitionStatus */
    boolean existsByStudentIdAndStatusIn(Long studentId, java.util.Collection<InvoiceStatus> statuses);



    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM TuitionInvoice t WHERE t.status = 'paid' AND t.month = :month")
    long sumRevenueByMonth(String month);

    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM TuitionInvoice t")
    long sumExpectedRevenue();

    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM TuitionInvoice t WHERE t.month = :month")
    long sumExpectedRevenueByMonth(String month);

    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM TuitionInvoice t WHERE t.status = 'paid' AND t.month = :month")
    long sumCollectedRevenueByMonth(String month);

    // ── Reports aggregation queries ──────────────────────────────────

    /** Tổng tiền đã thu (paid) */
    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM TuitionInvoice t WHERE t.status = 'paid'")
    long sumCollectedRevenue();

    /** Tổng tiền chưa thu (pending) */
    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM TuitionInvoice t WHERE t.status = 'pending'")
    long sumPendingRevenue();

    /** Tổng tiền quá hạn (overdue) */
    @Query("SELECT COALESCE(SUM(t.totalAmount), 0) FROM TuitionInvoice t WHERE t.status = 'overdue'")
    long sumOverdueRevenue();

    /** Doanh thu theo từng tháng (paid only) - trả về Object[] {month, sum} */
    @Query("SELECT t.month, COALESCE(SUM(t.totalAmount), 0) " +
           "FROM TuitionInvoice t WHERE t.status = 'paid' GROUP BY t.month ORDER BY t.month")
    List<Object[]> sumRevenueGroupByMonth();

    /** Doanh thu theo môn (qua class → subject) - trả về Object[] {subjectName, sum} */
    @Query("SELECT t.classEntity.subject.name, COALESCE(SUM(t.totalAmount), 0) " +
           "FROM TuitionInvoice t WHERE t.status = 'paid' GROUP BY t.classEntity.subject.name")
    List<Object[]> sumRevenueGroupBySubject();

    /** Doanh thu theo ngày paid (cho dashboard 7 ngày) - trả về Object[] {paidDate, sum} */
    @Query("SELECT t.paidDate, COALESCE(SUM(t.totalAmount), 0) " +
           "FROM TuitionInvoice t WHERE t.status = 'paid' AND t.paidDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.paidDate ORDER BY t.paidDate")
    List<Object[]> sumRevenueByPaidDateBetween(java.time.LocalDate startDate, java.time.LocalDate endDate);

}
