package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.UpdateGradeRequest;
import com.meilearning.backend.dto.response.GradeResponse;

import java.util.List;

public interface GradeService {
    List<GradeResponse> getByClass(Long classId);
    List<GradeResponse> getByStudent(Long studentId);
    GradeResponse update(UpdateGradeRequest request);
}
