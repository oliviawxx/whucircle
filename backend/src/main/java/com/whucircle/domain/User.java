package com.whucircle.domain;

import com.whucircle.domain.Enums.AccountStatus;
import com.whucircle.domain.Enums.UserRole;

public record User(Long id, String email, String passwordHash, String nickname, String avatarUrl,
                   String college, String grade, String bio, UserRole role, AccountStatus status) {
}
