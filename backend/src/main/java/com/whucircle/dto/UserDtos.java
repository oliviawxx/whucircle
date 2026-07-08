package com.whucircle.dto;

import com.whucircle.domain.Enums.AccountStatus;
import com.whucircle.domain.Enums.RelationStatus;
import com.whucircle.domain.Enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class UserDtos {
    private UserDtos() {}

    public record UserProfile(Long id, String email, String nickname, String avatarUrl, String college, String grade,
                              String bio, RelationStatus relation, UserRole role, AccountStatus status) {}
    public record CurrentUserProfile(Long id, String email, String nickname, String avatarUrl,
                                     String college, String grade, String bio,
                                     int noteCount, int followingCount, int followerCount, int friendCount,
                                     UserRole role, AccountStatus status) {}
    public record UpdateProfileRequest(@NotBlank @Size(min = 2, max = 30) String nickname,
                                       @Size(max = 500) String avatarUrl,
                                       @Size(max = 100) String college,
                                       @Size(max = 30) String grade,
                                       @Size(max = 200) String bio) {}
    public record RelationView(Long userId, String nickname, String avatarUrl, RelationStatus status) {}
    public record RelationResult(RelationStatus status) {}
}
