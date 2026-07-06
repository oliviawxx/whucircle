package com.whucircle.domain;

import com.whucircle.domain.Enums.ConversationType;

import java.time.OffsetDateTime;
import java.util.Set;

public record Conversation(Long id, ConversationType type, String name, Set<Long> memberIds,
                           String lastMessage, OffsetDateTime lastMessageAt) {
}
