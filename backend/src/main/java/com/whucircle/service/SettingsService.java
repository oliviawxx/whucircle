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
        return settings.savePrivacy(userId, new PrivacySettings(
                request.defaultNoteVisibility(), request.defaultChannelJoinType(), request.directMessagePermission()));
    }
}
