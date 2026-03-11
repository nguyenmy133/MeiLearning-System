package meilearning.com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import meilearning.com.backend.entity.LeaveRequest;
import meilearning.com.backend.entity.enums.RequestStatus;
import meilearning.com.backend.entity.enums.RequesterType;

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
