package com.whucircle.domain;

public record User(Long id, String email, String passwordHash, String nickname, String avatarUrl,
                   String college, String grade, String bio) {
}
