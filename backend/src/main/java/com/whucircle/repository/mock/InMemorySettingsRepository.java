package com.whucircle.repository.mock;

import com.whucircle.domain.Enums.DirectMessagePermission;
import com.whucircle.domain.Enums.JoinType;
import com.whucircle.domain.Enums.Visibility;
import com.whucircle.domain.PrivacySettings;
import com.whucircle.repository.SettingsRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@Profile("mock")
public class InMemorySettingsRepository implements SettingsRepository {
    private final Map<Long, PrivacySettings> settings = new ConcurrentHashMap<>();

    @Override public PrivacySettings findPrivacy(Long userId) {
        return settings.computeIfAbsent(userId, ignored -> new PrivacySettings(
                Visibility.PUBLIC, JoinType.PUBLIC, DirectMessagePermission.FRIENDS_ONLY,
                true, false, true, true, true));
    }
    @Override public PrivacySettings savePrivacy(Long userId, PrivacySettings value) {
        settings.put(userId, value);
        return value;
    }
}
