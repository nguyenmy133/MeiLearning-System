package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.Subject;
import com.meilearning.backend.entity.enums.SubjectStatus;

import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long>, JpaSpecificationExecutor<Subject> {

    Optional<Subject> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByName(String name);

    List<Subject> findByStatus(SubjectStatus status);

    List<Subject> findByCategory(String category);

    List<Subject> findByNameContainingIgnoreCase(String name);

    Optional<Subject> findByNameIgnoreCase(String name);

    long countByStatus(SubjectStatus status);

    /** Đếm tổng số giáo viên duy nhất đang dạy ít nhất 1 môn */
    @Query("SELECT COUNT(DISTINCT t) FROM Teacher t JOIN t.subjects s")
    long countDistinctTeachers();

    /** Đếm tổng số lớp đang liên kết với subject */
    @Query("SELECT COUNT(c) FROM ClassEntity c WHERE c.subject IS NOT NULL")
    long countTotalClasses();
}
