package com.whucircle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;

public final class RecommendationDtos {
    private RecommendationDtos() {}

    public record RecommendationCardView(Long id, String type, String title, String subtitle,
                                         String reason, double score, Long targetId,
                                         String coverUrl, List<String> tags,
                                         boolean joined, boolean followed, String badge) {}

    public record RecommendationFeedbackRequest(@NotBlank String scene,
                                                @NotBlank String targetType,
                                                @NotNull Long targetId,
                                                @NotBlank String action,
                                                @Size(max = 500) String detail) {}

    public record RecommendationFeedbackResponse(Long eventId, String status, OffsetDateTime createdAt) {}
}