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

    @Query("SELECT COALESCE(SUM(t.totalAmount - t.discountAmount), 0) FROM TuitionInvoice t WHERE t.status = 'paid'")
    long sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(t.totalAmount - t.discountAmount), 0) FROM TuitionInvoice t WHERE t.status = 'paid' AND t.month = :month")
    long sumRevenueByMonth(String month);

}
