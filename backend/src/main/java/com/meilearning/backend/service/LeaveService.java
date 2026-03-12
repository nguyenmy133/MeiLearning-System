package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateLeaveRequest;
import com.meilearning.backend.dto.response.LeaveRequestResponse;

import java.util.List;

public interface LeaveService {
    LeaveRequestResponse create(CreateLeaveRequest request);
    List<LeaveRequestResponse> getAll(String status, String requesterType);
    List<LeaveRequestResponse> getByRequester(Long requesterId);
    LeaveRequestResponse approve(Long id, Long reviewerId);
    LeaveRequestResponse reject(Long id, Long reviewerId, String reason);
}
