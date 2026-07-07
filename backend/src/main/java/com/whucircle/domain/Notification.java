package com.whucircle.domain;

import java.time.OffsetDateTime;

public record Notification(Long id, Long userId, String type, String title, String content,
                           Long targetId, boolean read, OffsetDateTime createdAt) {
}
