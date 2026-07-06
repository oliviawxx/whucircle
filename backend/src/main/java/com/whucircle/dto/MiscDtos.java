package com.whucircle.dto;

import com.whucircle.domain.Enums.ReportReason;
import com.whucircle.domain.Enums.ReportTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class MiscDtos {
    private MiscDtos() {}

    public record ReportRequest(@NotNull ReportTargetType targetType, @NotNull Long targetId,
                                @NotNull ReportReason reason, @Size(max = 500) String description) {}
    public record ReportResponse(Long id, String status) {}
    public record ImageUploadResponse(@NotBlank String url) {}
}
