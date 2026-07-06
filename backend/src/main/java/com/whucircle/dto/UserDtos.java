package com.whucircle.dto;

import com.whucircle.domain.Enums.RelationStatus;

public final class UserDtos {
    private UserDtos() {}

    public record UserProfile(Long id, String nickname, String avatarUrl, String college, String grade,
                              RelationStatus relation) {}
    public record RelationView(Long userId, String nickname, String avatarUrl, RelationStatus status) {}
    public record RelationResult(RelationStatus status) {}
}
