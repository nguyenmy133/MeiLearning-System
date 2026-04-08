package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.enums.StudentStatus;
import com.meilearning.backend.entity.enums.TuitionStatus;
import java.util.List;
import java.util.Optional;
@Repository
public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {

    Optional<Student> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<Student> findByStatus(StudentStatus status);

    List<Student> findByTuitionStatus(TuitionStatus tuitionStatus);

    long countByStatus(StudentStatus status);

    long countByTuitionStatus(TuitionStatus tuitionStatus);

    @Query("SELECT s FROM Student s JOIN s.user u WHERE u.email = :email")
    Optional<Student> findByUserEmail(String email);

    @Query("SELECT s FROM Student s JOIN s.user u WHERE u.username = :username")
    Optional<Student> findByUserUsername(String username);

    @Query("SELECT s FROM Student s JOIN s.enrollments e WHERE e.classEntity.id = :classId")
    List<Student> findByClassId(Long classId);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.status = :status AND s.tuitionStatus = :tuitionStatus")
    long countByStatusAndTuitionStatus(StudentStatus status, TuitionStatus tuitionStatus);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.createdAt >= :since")
    long countCreatedSince(java.time.Instant since);

    @Query("SELECT COUNT(s) FROM Student s WHERE (s.enrollDate IS NULL OR s.enrollDate <= :endOfMonth) AND (s.dropDate IS NULL OR s.dropDate > :endOfMonth)")
    long countActiveStudentsAtDate(java.time.LocalDate endOfMonth);

}
