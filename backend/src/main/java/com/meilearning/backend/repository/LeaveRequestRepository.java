package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.LeaveRequest;
import com.meilearning.backend.entity.enums.RequestStatus;
import com.meilearning.backend.entity.enums.RequesterType;
import java.util.List;
@Repository
public interface LeaveRequestRepository

        extends JpaRepository<LeaveRequest, Long>, JpaSpecificationExecutor<LeaveRequest> {

    List<LeaveRequest> findByRequesterId(Long requesterId);

    List<LeaveRequest> findByRequesterType(RequesterType requesterType);

    List<LeaveRequest> findByStatus(RequestStatus status);

    List<LeaveRequest> findBySessionId(Long sessionId);

    List<LeaveRequest> findByRequesterIdAndStatus(Long requesterId, RequestStatus status);

    long countByStatus(RequestStatus status);

    long countByRequesterTypeAndStatus(RequesterType requesterType, RequestStatus status);

}
