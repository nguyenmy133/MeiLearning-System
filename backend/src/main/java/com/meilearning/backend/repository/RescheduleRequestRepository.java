package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.RescheduleRequest;
import com.meilearning.backend.entity.enums.RequestStatus;
import java.util.List;
@Repository
public interface RescheduleRequestRepository

        extends JpaRepository<RescheduleRequest, Long>, JpaSpecificationExecutor<RescheduleRequest> {

    List<RescheduleRequest> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);

    List<RescheduleRequest> findByClassEntityIdOrderByCreatedAtDesc(Long classId);

    List<RescheduleRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    List<RescheduleRequest> findByTeacherIdAndStatusOrderByCreatedAtDesc(Long teacherId, RequestStatus status);

    long countByStatus(RequestStatus status);

}
