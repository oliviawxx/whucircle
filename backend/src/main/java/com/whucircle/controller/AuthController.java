package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.dto.AuthDtos.EmailCodeRequest;
import com.whucircle.dto.AuthDtos.EmailCodeResponse;
import com.whucircle.dto.AuthDtos.LoginRequest;
import com.whucircle.dto.AuthDtos.LoginResponse;
import com.whucircle.dto.AuthDtos.RegisterRequest;
import com.whucircle.dto.AuthDtos.UserView;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "认证")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/email-code")
    public ApiResponse<EmailCodeResponse> emailCode(@Valid @RequestBody EmailCodeRequest request) {
        return ApiResponse.success(authService.sendCode(request.email(), request.scene()));
    }

    @PostMapping("/register")
    public ApiResponse<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request.email(), request.code(), request.password(), request.nickname()));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request.email(), request.password()));
    }

    @GetMapping("/me")
    public ApiResponse<UserView> me() { return ApiResponse.success(authService.me(CurrentUser.id())); }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        authService.logout(authorization);
        return ApiResponse.success();
    }
}
