package com.meilearning.backend.service;

import com.meilearning.backend.dto.response.DashboardResponse;

public interface DashboardService {
    /** Aggregate toàn bộ data cho Admin Dashboard trong 1 response */
    DashboardResponse getDashboard();
}
