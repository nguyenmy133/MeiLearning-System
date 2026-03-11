package meilearning.com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import meilearning.com.backend.entity.Teacher;
import meilearning.com.backend.entity.enums.TeacherStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long>, JpaSpecificationExecutor<Teacher> {

    Optional<Teacher> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<Teacher> findByStatus(TeacherStatus status);

    long countByStatus(TeacherStatus status);

    @Query("SELECT t FROM Teacher t JOIN t.subjects s WHERE s.id = :subjectId")
    List<Teacher> findBySubjectId(Long subjectId);

    @Query("SELECT t FROM Teacher t JOIN t.user u WHERE u.email = :email")
    Optional<Teacher> findByUserEmail(String email);

    @Query("SELECT t FROM Teacher t JOIN t.user u WHERE u.username = :username")
    Optional<Teacher> findByUserUsername(String username);
}
