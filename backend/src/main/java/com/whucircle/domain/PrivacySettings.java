package com.whucircle.domain;

import com.whucircle.domain.Enums.DirectMessagePermission;
import com.whucircle.domain.Enums.JoinType;
import com.whucircle.domain.Enums.Visibility;

public record PrivacySettings(Visibility defaultNoteVisibility, JoinType defaultChannelJoinType,
                              DirectMessagePermission directMessagePermission) {
}
