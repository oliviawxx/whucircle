package com.whucircle.dto;

import com.whucircle.domain.Enums.JoinType;
import com.whucircle.domain.Enums.ChannelStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;

public final class ChannelDtos {
    private ChannelDtos() {}

    public record AdminView(Long id, String nickname) {}
    public record ChannelView(Long id, String name, JoinType joinType, boolean joined, int memberCount,
                              AdminView administrator, String announcement, ChannelStatus status) {}
    public record JoinRequest(String password) {}
    public record JoinResponse(boolean joined, int memberCount) {}
    public record PostView(Long id, Long channelId, Long authorId, String authorName, String title,
                           String content, boolean pinned, int likeCount, int replyCount,
                           boolean liked, OffsetDateTime createdAt) {}
    public record PostDetail(PostView post, List<ReplyView> replies) {}
    public record CreateChannelRequest(@NotBlank @Size(max = 50) String name,
                                        @NotNull JoinType joinType,
                                        @Size(max = 50) String password,
                                        @Size(max = 500) String announcement) {}
    public record UpdateAnnouncementRequest(@NotBlank @Size(max = 500) String announcement) {}
    public record PinPostRequest(@NotNull Boolean pinned) {}
    public record CreatePostRequest(@NotBlank @Size(max = 100) String title,
                                    @NotBlank @Size(max = 5000) String content) {}
    public record ReplyView(Long id, Long authorId, String authorName, String content, OffsetDateTime createdAt) {}
    public record CreateReplyRequest(@NotBlank @Size(max = 1000) String content) {}
}
