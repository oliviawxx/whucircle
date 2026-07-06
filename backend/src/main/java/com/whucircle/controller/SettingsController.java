package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.domain.PrivacySettings;
import com.whucircle.dto.SettingsDtos.PrivacyRequest;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.SettingsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "设置")
@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {
    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) { this.settingsService = settingsService; }
    @GetMapping("/privacy")
    public ApiResponse<PrivacySettings> get() { return ApiResponse.success(settingsService.get(CurrentUser.id())); }
    @PutMapping("/privacy")
    public ApiResponse<PrivacySettings> update(@Valid @RequestBody PrivacyRequest request) {
        return ApiResponse.success(settingsService.update(CurrentUser.id(), request));
    }
}
