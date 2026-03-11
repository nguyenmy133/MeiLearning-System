package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.CreateStudentRequest;
import meilearning.com.backend.dto.request.DropStudentRequest;
import meilearning.com.backend.dto.request.UpdateStudentRequest;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.dto.response.StudentResponse;
import meilearning.com.backend.dto.response.StudentStatsResponse;

public interface StudentService {
    PageResponse<StudentResponse> getAll(String search, Long classId, String status,
                                          String tuitionStatus, int page, int limit);
    StudentResponse getById(Long id);
    StudentResponse create(CreateStudentRequest request);
    StudentResponse update(Long id, UpdateStudentRequest request);
    void delete(Long id);
    void dropStudent(Long id, DropStudentRequest request);
    void reactivateStudent(Long id);
    void resetPassword(Long id);
    StudentStatsResponse getStats();
}
