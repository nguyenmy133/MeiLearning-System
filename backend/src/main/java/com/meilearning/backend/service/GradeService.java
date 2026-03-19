package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.UpdateGradeRequest;
import com.meilearning.backend.dto.response.GradeResponse;
import com.meilearning.backend.dto.response.GradeStatsResponse;
import java.util.List;

public interface GradeService {
    List<GradeResponse> getByClass(Long classId);
    List<GradeResponse> getByStudent(Long studentId);
    GradeResponse update(UpdateGradeRequest request);
    GradeStatsResponse getStatsByClass(Long classId);
    GradeResponse updateComment(Long classId, Long studentId, String comment);
}

