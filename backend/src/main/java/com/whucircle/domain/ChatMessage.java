package com.whucircle.domain;

import java.time.OffsetDateTime;
import java.util.Set;

public record ChatMessage(Long id, Long conversationId, Long senderId, String content,
                          OffsetDateTime sentAt, Set<Long> readBy) {
}
