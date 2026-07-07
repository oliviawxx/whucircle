package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {
    private final Environment environment;
    public HealthController(Environment environment) { this.environment = environment; }
    @GetMapping
    public ApiResponse<Map<String, String>> health() {
        String profile = String.join(",", environment.getActiveProfiles());
        return ApiResponse.success(Map.of("status", "UP", "profile", profile.isBlank() ? "default" : profile));
    }
}
