package meilearning.com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import meilearning.com.backend.entity.ClassEntity;
import meilearning.com.backend.entity.enums.ClassStatus;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long>, JpaSpecificationExecutor<ClassEntity> {

    List<ClassEntity> findByStatus(ClassStatus status);

    List<ClassEntity> findByTeacherId(Long teacherId);

    List<ClassEntity> findBySubjectId(Long subjectId);

    List<ClassEntity> findByRoomId(Long roomId);

    long countByStatus(ClassStatus status);

    long countByTeacherId(Long teacherId);

    @Query("SELECT c FROM ClassEntity c WHERE c.status IN ('active', 'upcoming')")
    List<ClassEntity> findActiveAndUpcoming();

    @Query("SELECT COALESCE(SUM(SIZE(c.enrollments)), 0) FROM ClassEntity c WHERE c.status = 'active'")
    long countTotalStudentsInActiveClasses();
}
