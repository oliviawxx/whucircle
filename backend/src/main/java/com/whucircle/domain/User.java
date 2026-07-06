package com.whucircle.domain;

public record User(Long id, String email, String password, String nickname, String avatarUrl,
                   String college, String grade) {
}
