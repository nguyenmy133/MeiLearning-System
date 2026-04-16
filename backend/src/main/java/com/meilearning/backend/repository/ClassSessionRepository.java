package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.enums.SessionStatus;
import java.time.LocalDate;
import java.util.List;
@Repository
public interface ClassSessionRepository

        extends JpaRepository<ClassSession, Long>, JpaSpecificationExecutor<ClassSession> {

    List<ClassSession> findByClassEntityId(Long classId);

    List<ClassSession> findByDate(LocalDate date);

    List<ClassSession> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<ClassSession> findByClassEntityIdAndDate(Long classId, LocalDate date);

    List<ClassSession> findByClassEntityIdAndDateBetween(Long classId, LocalDate startDate, LocalDate endDate);

    List<ClassSession> findByStatus(SessionStatus status);

    /** Lấy sessions theo ngày + trạng thái (dùng cho auto-confirm scheduler) */
    List<ClassSession> findByDateAndStatus(LocalDate date, SessionStatus status);

    /** Lấy sessions TỪ TRƯỚC TỚI NAY (vượt qua rào cản ngày mới) theo trạng thái */
    List<ClassSession> findByStatusAndDateLessThanEqual(SessionStatus status, LocalDate date);

    long countByClassEntityId(Long classId);

    long countByClassEntityIdAndStatus(Long classId, SessionStatus status);

    /** Lấy sessions của 1 teacher theo ngày (thông qua Class â†’ Teacher) */

    List<ClassSession> findByClassEntityTeacherIdAndDate(Long teacherId, LocalDate date);

    /** Lấy tất cả sessions của 1 teacher (dùng để lấy session IDs) */
    List<ClassSession> findByClassEntityTeacherId(Long teacherId);

    /** Lấy sessions của 1 teacher trong tuần */
    List<ClassSession> findByClassEntityTeacherIdAndDateBetween(Long teacherId, LocalDate startDate, LocalDate endDate);

    /** Lọc sessions của 1 lớp, chỉ lấy đến ngày chỉ định (dùng cho lịch sử điểm danh) */
    List<ClassSession> findByClassEntityIdAndDateLessThanEqual(Long classId, LocalDate date);

    /** Lấy sessions trong khoảng thời gian, loại trừ status cụ thể */
    List<ClassSession> findByDateBetweenAndStatusNot(LocalDate startDate, LocalDate endDate, SessionStatus status);

    /** Lấy sessions của 1 teacher trong khoảng thời gian, loại trừ status cụ thể */
    List<ClassSession> findByClassEntityTeacherIdAndDateBetweenAndStatusNot(Long teacherId, LocalDate startDate, LocalDate endDate, SessionStatus status);

    /** Lấy sessions tương lai của 1 lớp (dùng khi endClass → cancel sessions) */
    List<ClassSession> findByClassEntityIdAndDateAfter(Long classId, LocalDate date);

    /** Đếm sessions tương lai chưa bị cancel (dùng cho auto-extend) */
    long countByClassEntityIdAndDateGreaterThanAndStatusNot(Long classId, LocalDate date, SessionStatus status);

}

