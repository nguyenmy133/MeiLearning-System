package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateExamRequest;
import com.meilearning.backend.dto.request.SubmitExamResultRequest;
import com.meilearning.backend.dto.response.ExamResponse;
import com.meilearning.backend.dto.response.ExamResultResponse;
import com.meilearning.backend.dto.response.PageResponse;
import java.util.List;

public interface ExamService {
    ExamResponse create(CreateExamRequest request);
    ExamResponse getById(Long id);
    PageResponse<ExamResponse> getAll(Long teacherId, String status, int page, int limit);
    List<ExamResponse> getAll(Long teacherId, String status);
    ExamResponse publish(Long id);
    void delete(Long id);
    ExamResultResponse submit(Long examId, SubmitExamResultRequest request);
    List<ExamResultResponse> getResults(Long examId);
    ExamResultResponse getStudentResult(Long examId, Long studentId);
}
