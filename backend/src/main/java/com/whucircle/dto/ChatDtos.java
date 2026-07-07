package com.whucircle.dto;

import com.whucircle.domain.Enums.ConversationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;

public final class ChatDtos {
    private ChatDtos() {}

    public record ConversationView(Long id, ConversationType type, String name, String lastMessage,
                                   OffsetDateTime lastMessageAt, int unreadCount) {}
    public record MessageView(Long id, Long senderId, String senderName, String content,
                              OffsetDateTime sentAt, boolean read, boolean mine) {}
    public record SendMessageRequest(@NotBlank @Size(max = 2000) String content) {}
    public record CreateConversationRequest(@NotNull ConversationType type,
                                            @NotEmpty @Size(max = 50) List<@NotNull Long> participantIds,
                                            @Size(max = 50) String name) {}
}
