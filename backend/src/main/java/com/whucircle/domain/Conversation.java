package com.whucircle.domain;

import com.whucircle.domain.Enums.ConversationType;
import com.whucircle.domain.Enums.ConversationStatus;

import java.time.OffsetDateTime;
import java.util.Set;

public record Conversation(Long id, ConversationType type, String name, Long ownerId, ConversationStatus status, Set<Long> memberIds,
                           String lastMessage, OffsetDateTime lastMessageAt) {
}
