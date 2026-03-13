package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateStudentRequest;
import com.meilearning.backend.dto.request.DropStudentRequest;
import com.meilearning.backend.dto.request.UpdateStudentRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.StudentResponse;
import com.meilearning.backend.dto.response.StudentStatsResponse;

public interface StudentService {
    PageResponse<StudentResponse> getAll(String search, Long classId, String status,
                                          String tuitionStatus, int page, int limit);
    StudentResponse getById(Long id);
    StudentResponse create(CreateStudentRequest request);
    StudentResponse update(Long id, UpdateStudentRequest request);
    void delete(Long id);
    void dropStudent(Long id, DropStudentRequest request);
    void reactivateStudent(Long id);
    String resetPassword(Long id);
    StudentStatsResponse getStats();
}
