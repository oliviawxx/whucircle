CREATE DATABASE IF NOT EXISTS whu_circle
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE whu_circle;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    nickname VARCHAR(30) NOT NULL,
    avatar_url VARCHAR(500) NOT NULL DEFAULT '',
    college VARCHAR(100) NOT NULL DEFAULT '',
    grade VARCHAR(30) NOT NULL DEFAULT '',
    bio VARCHAR(200) NOT NULL DEFAULT '',
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT chk_user_role CHECK (role IN ('USER', 'ADMIN')),
    CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'BANNED'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_verification_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(191) NOT NULL,
    scene VARCHAR(30) NOT NULL,
    code_hash VARCHAR(100) NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    consumed_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_verification_email_scene (email, scene, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_follows (
    follower_id BIGINT NOT NULL,
    followed_id BIGINT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (follower_id, followed_id),
    CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_follow_followed FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_follow_not_self CHECK (follower_id <> followed_id),
    INDEX idx_followed_id (followed_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_blocks (
    blocker_id BIGINT NOT NULL,
    blocked_id BIGINT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT fk_block_blocker FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_block_blocked FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_block_not_self CHECK (blocker_id <> blocked_id),
    INDEX idx_blocked_id (blocked_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS privacy_settings (
    user_id BIGINT PRIMARY KEY,
    default_note_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    default_channel_join_type VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    direct_message_permission VARCHAR(20) NOT NULL DEFAULT 'FRIENDS_ONLY',
    searchable_by_users BOOLEAN NOT NULL DEFAULT TRUE,
    show_email_on_profile BOOLEAN NOT NULL DEFAULT FALSE,
    personalized_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
    activity_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    login_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_privacy_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_privacy_visibility CHECK (default_note_visibility IN ('PUBLIC', 'FRIENDS', 'PRIVATE')),
    CONSTRAINT chk_privacy_channel CHECK (default_channel_join_type IN ('PUBLIC', 'PASSWORD')),
    CONSTRAINT chk_privacy_message CHECK (direct_message_permission IN ('EVERYONE', 'FRIENDS_ONLY', 'NONE'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    author_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_note_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_note_visibility CHECK (visibility IN ('PUBLIC', 'FRIENDS', 'PRIVATE')),
    INDEX idx_note_author_created (author_id, created_at),
    INDEX idx_note_visibility_created (visibility, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS note_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    note_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_note_image_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    INDEX idx_note_image_order (note_id, sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS note_tags (
    note_id BIGINT NOT NULL,
    tag VARCHAR(30) NOT NULL,
    PRIMARY KEY (note_id, tag),
    CONSTRAINT fk_note_tag_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    INDEX idx_note_tag (tag)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    note_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_comment_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_comment_note_created (note_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS note_likes (
    note_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (note_id, user_id),
    CONSTRAINT fk_note_like_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_like_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_note_like_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS note_saves (
    note_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (note_id, user_id),
    CONSTRAINT fk_note_save_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_save_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_note_save_user_created (user_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS channels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    join_type VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    password_hash VARCHAR(100) NULL,
    administrator_id BIGINT NOT NULL,
    announcement VARCHAR(500) NOT NULL DEFAULT '',
    member_count INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_channel_admin FOREIGN KEY (administrator_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_channel_join_type CHECK (join_type IN ('PUBLIC', 'PASSWORD')),
    CONSTRAINT chk_channel_status CHECK (status IN ('ACTIVE', 'BANNED')),
    INDEX idx_channel_name (name),
    INDEX idx_channel_admin (administrator_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS channel_members (
    channel_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (channel_id, user_id),
    CONSTRAINT fk_channel_member_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_channel_member_role CHECK (role IN ('ADMIN', 'MEMBER')),
    INDEX idx_channel_member_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS channel_admin_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    channel_id BIGINT NOT NULL,
    requester_id BIGINT NOT NULL,
    inviter_id BIGINT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_channel_admin_request_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_admin_request_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_admin_request_inviter FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_channel_admin_request_type CHECK (type IN ('APPLY', 'INVITE')),
    CONSTRAINT chk_channel_admin_request_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ACCEPTED', 'DECLINED')),
    INDEX idx_channel_admin_request_channel_status (channel_id, status, created_at),
    INDEX idx_channel_admin_request_requester_status (requester_id, status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS channel_posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    channel_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    like_count INT NOT NULL DEFAULT 0,
    reply_count INT NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_channel_post_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_post_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_channel_post_order (channel_id, pinned, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS channel_replies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_channel_reply_post FOREIGN KEY (post_id) REFERENCES channel_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_reply_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_channel_reply_post_created (post_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS channel_post_likes (
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (post_id, user_id),
    CONSTRAINT fk_post_like_post FOREIGN KEY (post_id) REFERENCES channel_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_like_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post_like_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS channel_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    channel_id BIGINT NOT NULL,
    organizer_id BIGINT NOT NULL,
    linked_post_id BIGINT NULL,
    conversation_id BIGINT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    start_time DATETIME(3) NOT NULL,
    end_time DATETIME(3) NOT NULL,
    signup_deadline DATETIME(3) NULL,
    capacity INT NULL,
    participant_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_channel_event_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_event_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_event_post FOREIGN KEY (linked_post_id) REFERENCES channel_posts(id) ON DELETE SET NULL,
    CONSTRAINT chk_channel_event_status CHECK (status IN ('PUBLISHED', 'CANCELLED')),
    INDEX idx_channel_event_channel_start (channel_id, start_time),
    INDEX idx_channel_event_status_start (status, start_time)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS channel_event_participants (
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'JOINED',
    joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    cancelled_at DATETIME(3) NULL,
    PRIMARY KEY (event_id, user_id),
    CONSTRAINT fk_event_participant_event FOREIGN KEY (event_id) REFERENCES channel_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_participant_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_event_participant_status CHECK (status IN ('JOINED', 'CANCELLED')),
    INDEX idx_event_participant_user_status (user_id, status, joined_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL DEFAULT '',
    owner_id BIGINT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_message VARCHAR(2000) NOT NULL DEFAULT '',
    last_message_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT chk_conversation_type CHECK (type IN ('PRIVATE', 'GROUP')),
    CONSTRAINT chk_conversation_status CHECK (status IN ('ACTIVE', 'DISSOLVED')),
    INDEX idx_conversation_last_message (last_message_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (conversation_id, user_id),
    CONSTRAINT fk_conversation_member_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversation_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation_member_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content VARCHAR(2000) NOT NULL,
    sent_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_message_conversation_sent (conversation_id, sent_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS message_read_status (
    message_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (message_id, user_id),
    CONSTRAINT fk_message_read_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_read_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_message_read_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content VARCHAR(500) NOT NULL,
    target_id BIGINT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user_read_created (user_id, is_read, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reporter_id BIGINT NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id BIGINT NOT NULL,
    reason VARCHAR(40) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_report_user FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_report_target CHECK (target_type IN ('NOTE', 'CHANNEL_POST', 'MESSAGE', 'USER')),
    CONSTRAINT chk_report_reason CHECK (reason IN ('ADVERTISEMENT', 'HARASSMENT', 'FALSE_INFORMATION', 'OTHER')),
    CONSTRAINT chk_report_status CHECK (status IN ('PENDING', 'RESOLVED', 'REJECTED')),
    INDEX idx_report_status_created (status, created_at),
    INDEX idx_report_target (target_type, target_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auth_tokens (
    token VARCHAR(64) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_auth_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_auth_token_user (user_id),
    INDEX idx_auth_token_expires (expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    scene VARCHAR(40) NOT NULL,
    target_type VARCHAR(40) NOT NULL,
    target_id BIGINT NOT NULL,
    action VARCHAR(40) NOT NULL,
    detail VARCHAR(500) NOT NULL DEFAULT '',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_recommendation_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_recommendation_feedback_user_created (user_id, created_at)
) ENGINE=InnoDB;
