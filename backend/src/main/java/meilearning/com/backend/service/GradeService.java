package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.UpdateGradeRequest;
import meilearning.com.backend.dto.response.GradeResponse;

import java.util.List;

public interface GradeService {
    List<GradeResponse> getByClass(Long classId);
    List<GradeResponse> getByStudent(Long studentId);
    GradeResponse update(UpdateGradeRequest request);
}
