package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.CreateRescheduleRequest;
import meilearning.com.backend.dto.response.RescheduleRequestResponse;

import java.util.List;

public interface RescheduleService {
    RescheduleRequestResponse create(CreateRescheduleRequest request);
    List<RescheduleRequestResponse> getAll(String status);
    List<RescheduleRequestResponse> getByTeacher(Long teacherId);
    RescheduleRequestResponse approve(Long id, String reviewedBy);
    RescheduleRequestResponse reject(Long id, String reviewedBy, String reason);
}
