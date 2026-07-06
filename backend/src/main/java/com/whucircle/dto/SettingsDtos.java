package com.whucircle.dto;

import com.whucircle.domain.Enums.DirectMessagePermission;
import com.whucircle.domain.Enums.JoinType;
import com.whucircle.domain.Enums.Visibility;
import jakarta.validation.constraints.NotNull;

public final class SettingsDtos {
    private SettingsDtos() {}

    public record PrivacyRequest(@NotNull Visibility defaultNoteVisibility,
                                 @NotNull JoinType defaultChannelJoinType,
                                 @NotNull DirectMessagePermission directMessagePermission) {}
}
