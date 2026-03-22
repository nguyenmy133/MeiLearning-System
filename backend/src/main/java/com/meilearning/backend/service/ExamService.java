package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateExamRequest;
import com.meilearning.backend.dto.request.SubmitExamResultRequest;
import com.meilearning.backend.dto.request.UpdateExamRequest;
import com.meilearning.backend.dto.response.ExamAnswerDetailResponse;
import com.meilearning.backend.dto.response.ExamResponse;
import com.meilearning.backend.dto.response.ExamResultResponse;
import com.meilearning.backend.dto.response.ExamStatisticsResponse;
import com.meilearning.backend.dto.response.PageResponse;
import java.util.List;

public interface ExamService {
    ExamResponse create(CreateExamRequest request);
    ExamResponse getById(Long id);
    /** Student version: trả về questions KHÔNG có correctAnswer + explanation */
    ExamResponse getByIdForStudent(Long id);
    ExamResponse update(Long id, UpdateExamRequest request);
    PageResponse<ExamResponse> getAll(Long teacherId, List<Long> studentClassIds, String status, int page, int limit);
    List<ExamResponse> getAll(Long teacherId, String status);
    ExamResponse publish(Long id);
    void delete(Long id);
    ExamResultResponse submit(Long examId, SubmitExamResultRequest request);
    List<ExamResultResponse> getResults(Long examId);
    ExamResultResponse getStudentResult(Long examId, Long studentId);

    /** Lấy chi tiết câu trả lời của học viên cho bài thi */
    List<ExamAnswerDetailResponse> getStudentAnswerDetails(Long examId, Long studentId);

    /** Thống kê tổng hợp bài thi: avg, pass rate, min/max */
    ExamStatisticsResponse getStatistics(Long examId);

    /** Lưu trữ bài thi (đổi status sang archived) */
    ExamResponse archive(Long id);
}

