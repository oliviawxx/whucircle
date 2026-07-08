USE whu_circle;

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
