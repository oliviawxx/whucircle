package com.whucircle.repository;

import com.whucircle.domain.PrivacySettings;

public interface SettingsRepository {
    PrivacySettings findPrivacy(Long userId);
    PrivacySettings savePrivacy(Long userId, PrivacySettings settings);
}
