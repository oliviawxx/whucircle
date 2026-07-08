package com.whucircle.dto;

import com.whucircle.domain.Enums.AccountStatus;
import com.whucircle.domain.Enums.ChannelStatus;
import com.whucircle.domain.Enums.UserRole;
import com.whucircle.domain.Enums.Visibility;

import java.time.OffsetDateTime;
import java.util.List;

public final class AdminDtos {
    private AdminDtos() {}

    public record AdminSummary(int userCount, int bannedUserCount, int channelCount,
                               int bannedChannelCount, int noteCount, int channelPostCount) {}
    public record AdminUserView(Long id, String email, String nickname, String college, String grade,
                                UserRole role, AccountStatus status, int noteCount) {}
    public record AdminChannelView(Long id, String name, String joinType, String administratorName,
                                   int memberCount, ChannelStatus status) {}
    public record AdminNoteView(Long id, String title, String authorName, Visibility visibility,
                                int likeCount, int commentCount, OffsetDateTime createdAt) {}
    public record AdminChannelPostView(Long id, Long channelId, String channelName, String title,
                                       String authorName, int likeCount, int replyCount, boolean pinned,
                                       OffsetDateTime createdAt) {}
    public record AdminDashboard(AdminSummary summary, List<AdminUserView> users,
                                 List<AdminChannelView> channels, List<AdminNoteView> notes,
                                 List<AdminChannelPostView> channelPosts) {}
}
