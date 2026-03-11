package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.CreateExamRequest;
import meilearning.com.backend.dto.request.SubmitExamResultRequest;
import meilearning.com.backend.dto.response.ExamResponse;
import meilearning.com.backend.dto.response.ExamResultResponse;

import java.util.List;

public interface ExamService {
    ExamResponse create(CreateExamRequest request);
    ExamResponse getById(Long id);
    List<ExamResponse> getAll(Long teacherId, String status);
    ExamResponse publish(Long id);
    void delete(Long id);
    ExamResultResponse submit(Long examId, SubmitExamResultRequest request);
    List<ExamResultResponse> getResults(Long examId);
    ExamResultResponse getStudentResult(Long examId, Long studentId);
}
