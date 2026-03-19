package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PendingTaskResponse {
    private String type;         // "leave", "attendance", "exam", etc.
    private String title;
    private String description;
    private int count;
    private boolean urgent;
}
