package com.whucircle.service;

import com.whucircle.domain.PrivacySettings;
import com.whucircle.dto.SettingsDtos.PrivacyRequest;
import com.whucircle.repository.SettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class SettingsService {
    private final SettingsRepository settings;

    public SettingsService(SettingsRepository settings) { this.settings = settings; }
    public PrivacySettings get(Long userId) { return settings.findPrivacy(userId); }
    public PrivacySettings update(Long userId, PrivacyRequest request) {
        PrivacySettings existing = settings.findPrivacy(userId);
        return settings.savePrivacy(userId, new PrivacySettings(
                request.defaultNoteVisibility(),
                request.defaultChannelJoinType(),
                request.directMessagePermission(),
                request.searchableByUsers() == null ? existing.searchableByUsers() : request.searchableByUsers(),
                request.showEmailOnProfile() == null ? existing.showEmailOnProfile() : request.showEmailOnProfile(),
                request.personalizedRecommendations() == null ? existing.personalizedRecommendations() : request.personalizedRecommendations(),
                request.activityNotifications() == null ? existing.activityNotifications() : request.activityNotifications(),
                request.loginAlerts() == null ? existing.loginAlerts() : request.loginAlerts()));
    }
}
