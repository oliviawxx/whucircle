USE whu_circle;

ALTER TABLE privacy_settings
    ADD COLUMN searchable_by_users BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN show_email_on_profile BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN personalized_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN activity_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN login_alerts BOOLEAN NOT NULL DEFAULT TRUE;
