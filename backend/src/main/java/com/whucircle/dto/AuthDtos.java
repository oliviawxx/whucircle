package com.whucircle.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record EmailCodeRequest(@NotBlank @Email String email, @NotBlank String scene) {}
    public record EmailCodeResponse(int expiresIn, int resendAfter, String mockCode) {}
    public record RegisterRequest(@NotBlank @Email String email, @NotBlank String code,
                                  @NotBlank @Size(min = 8, max = 64) String password,
                                  @NotBlank @Size(min = 2, max = 30) String nickname) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record UserView(Long id, String email, String nickname, String avatarUrl,
                           String college, String grade, String bio) {}
    public record LoginResponse(String accessToken, String refreshToken, int expiresIn, UserView user) {}
}
