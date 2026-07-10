USE whu_circle;

CREATE TABLE IF NOT EXISTS channel_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    channel_id BIGINT NOT NULL,
    organizer_id BIGINT NOT NULL,
    linked_post_id BIGINT NULL,
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
