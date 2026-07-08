package com.whucircle.repository.mysql;

import com.whucircle.domain.Enums.DirectMessagePermission;
import com.whucircle.domain.Enums.JoinType;
import com.whucircle.domain.Enums.Visibility;
import com.whucircle.domain.PrivacySettings;
import com.whucircle.repository.SettingsRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
@Profile("mysql")
public class MySqlSettingsRepository implements SettingsRepository {
    private final JdbcClient jdbc;
    public MySqlSettingsRepository(JdbcClient jdbc) { this.jdbc = jdbc; }
    @Override public PrivacySettings findPrivacy(Long userId) {
        return jdbc.sql("SELECT * FROM privacy_settings WHERE user_id=:id").param("id",userId).query((rs,row) ->
                new PrivacySettings(Visibility.valueOf(rs.getString("default_note_visibility")),
                        JoinType.valueOf(rs.getString("default_channel_join_type")),
                        DirectMessagePermission.valueOf(rs.getString("direct_message_permission")),
                        rs.getBoolean("searchable_by_users"),
                        rs.getBoolean("show_email_on_profile"),
                        rs.getBoolean("personalized_recommendations"),
                        rs.getBoolean("activity_notifications"),
                        rs.getBoolean("login_alerts"))).optional()
                .orElseGet(() -> savePrivacy(userId, new PrivacySettings(
                        Visibility.PUBLIC, JoinType.PUBLIC, DirectMessagePermission.FRIENDS_ONLY,
                        true, false, true, true, true)));
    }
    @Override public PrivacySettings savePrivacy(Long userId, PrivacySettings value) {
        jdbc.sql("""
                INSERT INTO privacy_settings(user_id,default_note_visibility,default_channel_join_type,direct_message_permission,
                    searchable_by_users,show_email_on_profile,personalized_recommendations,activity_notifications,login_alerts)
                VALUES(:id,:note,:channel,:message,:searchable,:showEmail,:personalized,:activity,:login)
                ON DUPLICATE KEY UPDATE default_note_visibility=VALUES(default_note_visibility),
                default_channel_join_type=VALUES(default_channel_join_type),
                direct_message_permission=VALUES(direct_message_permission),
                searchable_by_users=VALUES(searchable_by_users),
                show_email_on_profile=VALUES(show_email_on_profile),
                personalized_recommendations=VALUES(personalized_recommendations),
                activity_notifications=VALUES(activity_notifications),
                login_alerts=VALUES(login_alerts)
                """).params(Map.of(
                "id",userId,
                "note",value.defaultNoteVisibility().name(),
                "channel",value.defaultChannelJoinType().name(),
                "message",value.directMessagePermission().name(),
                "searchable",value.searchableByUsers(),
                "showEmail",value.showEmailOnProfile(),
                "personalized",value.personalizedRecommendations(),
                "activity",value.activityNotifications(),
                "login",value.loginAlerts())).update();
        return value;
    }
}
