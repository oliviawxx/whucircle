package com.whucircle.dto;

import com.whucircle.domain.Enums.ConversationType;
import com.whucircle.domain.Enums.ConversationStatus;
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
    public record GroupMemberView(Long userId, String nickname, String avatarUrl, OffsetDateTime joinedAt,
                                  boolean owner, boolean mine) {}
    public record GroupDetailView(Long id, String name, Long ownerId, ConversationStatus status,
                                  int memberCount, boolean mineOwner, List<GroupMemberView> members) {}
    public record MessageView(Long id, Long senderId, String senderName, String content,
                              OffsetDateTime sentAt, boolean read, boolean mine) {}
    public record SendMessageRequest(@NotBlank @Size(max = 2000) String content) {}
    public record CreateConversationRequest(@NotNull ConversationType type,
                                            @NotEmpty @Size(max = 50) List<@NotNull Long> participantIds,
                                            @Size(max = 50) String name) {}
    public record RenameGroupRequest(@NotBlank @Size(max = 50) String name) {}
    public record TransferGroupOwnerRequest(@NotNull Long userId) {}
    public record GroupActionResponse(Long conversationId, ConversationStatus status) {}
}
