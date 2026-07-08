package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.common.PageData;
import com.whucircle.domain.Channel;
import com.whucircle.domain.ChannelAdminRequest;
import com.whucircle.domain.ChannelPost;
import com.whucircle.domain.ChannelReply;
import com.whucircle.domain.Enums.ChannelStatus;
import com.whucircle.domain.Enums.JoinType;
import com.whucircle.domain.Notification;
import com.whucircle.domain.User;
import com.whucircle.dto.ChannelDtos.AdminView;
import com.whucircle.dto.ChannelDtos.AdminMemberView;
import com.whucircle.dto.ChannelDtos.AdminRequestView;
import com.whucircle.dto.ChannelDtos.ChannelView;
import com.whucircle.dto.ChannelDtos.CreateChannelRequest;
import com.whucircle.dto.ChannelDtos.InitialAdminDashboard;
import com.whucircle.dto.ChannelDtos.JoinResponse;
import com.whucircle.dto.ChannelDtos.PostDetail;
import com.whucircle.dto.ChannelDtos.PostView;
import com.whucircle.dto.ChannelDtos.ReplyView;
import com.whucircle.dto.NoteDtos.ToggleResponse;
import com.whucircle.repository.ChannelRepository;
import com.whucircle.repository.NotificationRepository;
import com.whucircle.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChannelService {
    private final ChannelRepository channels;
    private final UserRepository users;
    private final NotificationRepository notifications;

    public ChannelService(ChannelRepository channels, UserRepository users, NotificationRepository notifications) {
        this.channels = channels;
        this.users = users;
        this.notifications = notifications;
    }

    public PageData<ChannelView> list(Long currentUserId, Boolean joined, String keyword, int page, int size) {
        List<ChannelView> result = channels.findAll().stream()
                .filter(channel -> channel.status() == ChannelStatus.ACTIVE)
                .filter(channel -> joined == null || channel.memberIds().contains(currentUserId) == joined)
                .filter(channel -> keyword == null || keyword.isBlank() || channel.name().contains(keyword.trim()))
                .map(channel -> toView(channel, currentUserId)).toList();
        return PageData.of(result, page, size);
    }

    public ChannelView detail(Long currentUserId, Long channelId) { return toView(requireChannel(channelId), currentUserId); }

    public PageData<ChannelView> managedChannels(Long currentUserId, int page, int size) {
        List<ChannelView> result = channels.findAll().stream()
                .filter(channel -> channel.status() == ChannelStatus.ACTIVE)
                .filter(channel -> channel.administratorId().equals(currentUserId))
                .map(channel -> toView(channel, currentUserId)).toList();
        return PageData.of(result, page, size);
    }

    public InitialAdminDashboard initialAdminDashboard(Long currentUserId, Long channelId) {
        Channel channel = requireChannel(channelId);
        requireChannelAdministrator(currentUserId, channel);
        List<ChannelPost> posts = channels.findPosts(channelId);
        int postCount = posts.size();
        int pinnedPostCount = (int) posts.stream().filter(ChannelPost::pinned).count();
        int replyCount = posts.stream().mapToInt(ChannelPost::replyCount).sum();
        List<PostView> recentPosts = posts.stream().limit(8).map(post -> toPostView(post, currentUserId)).toList();
        boolean initial = channel.administratorId().equals(currentUserId);
        List<AdminMemberView> members = channel.memberIds().stream().map(userId -> toAdminMemberView(channel, userId)).toList();
        List<AdminRequestView> requests = initial
                ? channels.findAdminRequests(channelId).stream().map(request -> toAdminRequestView(channel, request)).toList()
                : List.of();
        return new InitialAdminDashboard(toView(channel, currentUserId), initial ? "初始管理员" : "频道管理员", postCount,
                pinnedPostCount, replyCount, recentPosts, members, requests, true, true, initial, initial);
    }

    public AdminRequestView applyForAdmin(Long currentUserId, Long channelId) {
        Channel channel = requireChannel(channelId);
        requireMember(currentUserId, channel);
        if (isChannelAdministrator(currentUserId, channel)) throw new BusinessException(ErrorCode.BAD_REQUEST, "你已经是频道管理员");
        ChannelAdminRequest request = channels.findPendingAdminRequest(channelId, currentUserId, "APPLY")
                .orElseGet(() -> channels.saveAdminRequest(new ChannelAdminRequest(channels.nextAdminRequestId(), channelId,
                        currentUserId, null, "APPLY", "PENDING", OffsetDateTime.now(), OffsetDateTime.now())));
        User requester = requireUser(currentUserId);
        notifications.save(new Notification(notifications.nextId(), channel.administratorId(), "CHANNEL_ADMIN_APPLICATION",
                "频道管理员申请", requester.nickname() + " 申请成为「" + channel.name() + "」管理员", request.id(), false, OffsetDateTime.now()));
        return toAdminRequestView(channel, request);
    }

    public AdminRequestView inviteAdmin(Long currentUserId, Long channelId, Long targetUserId) {
        Channel channel = requireChannel(channelId);
        requireInitialAdministrator(currentUserId, channel);
        requireMember(targetUserId, channel);
        if (isChannelAdministrator(targetUserId, channel)) throw new BusinessException(ErrorCode.BAD_REQUEST, "该成员已经是频道管理员");
        ChannelAdminRequest request = channels.findPendingAdminRequest(channelId, targetUserId, "INVITE")
                .orElseGet(() -> channels.saveAdminRequest(new ChannelAdminRequest(channels.nextAdminRequestId(), channelId,
                        targetUserId, currentUserId, "INVITE", "PENDING", OffsetDateTime.now(), OffsetDateTime.now())));
        notifications.save(new Notification(notifications.nextId(), targetUserId, "CHANNEL_ADMIN_INVITE",
                "频道管理员邀请", "你被邀请成为「" + channel.name() + "」管理员", request.id(), false, OffsetDateTime.now()));
        return toAdminRequestView(channel, request);
    }

    public AdminRequestView handleAdminRequest(Long currentUserId, Long requestId, String action) {
        ChannelAdminRequest request = channels.findAdminRequestById(requestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "管理员申请不存在"));
        Channel channel = requireChannel(request.channelId());
        String normalized = action == null ? "" : action.trim().toUpperCase();
        if (!request.status().equals("PENDING")) throw new BusinessException(ErrorCode.BAD_REQUEST, "该请求已处理");
        String nextStatus;
        if (request.type().equals("APPLY")) {
            requireInitialAdministrator(currentUserId, channel);
            nextStatus = switch (normalized) {
                case "APPROVE" -> "APPROVED";
                case "REJECT" -> "REJECTED";
                default -> throw new BusinessException(ErrorCode.BAD_REQUEST, "不支持的处理动作");
            };
        } else {
            if (!request.requesterId().equals(currentUserId)) throw new BusinessException(ErrorCode.FORBIDDEN, "仅被邀请者可以处理邀请");
            nextStatus = switch (normalized) {
                case "ACCEPT" -> "ACCEPTED";
                case "DECLINE" -> "DECLINED";
                default -> throw new BusinessException(ErrorCode.BAD_REQUEST, "不支持的处理动作");
            };
        }
        ChannelAdminRequest updated = channels.saveAdminRequest(new ChannelAdminRequest(request.id(), request.channelId(),
                request.requesterId(), request.inviterId(), request.type(), nextStatus, request.createdAt(), OffsetDateTime.now()));
        if (nextStatus.equals("APPROVED") || nextStatus.equals("ACCEPTED")) {
            channels.setMemberRole(channel.id(), request.requesterId(), "ADMIN");
        }
        notifyAdminRequestResult(channel, updated);
        return toAdminRequestView(channel, updated);
    }

    public JoinResponse join(Long currentUserId, Long channelId, String password) {
        Channel channel = requireChannel(channelId);
        if (channel.memberIds().contains(currentUserId)) return new JoinResponse(true, channel.memberCount());
        if (channel.joinType() == JoinType.PASSWORD && !channel.password().equals(password)) {
            throw new BusinessException(ErrorCode.WRONG_CHANNEL_PASSWORD);
        }
        Channel updated = channels.addMember(channelId, currentUserId);
        return new JoinResponse(true, updated.memberCount());
    }

    public ChannelView create(Long currentUserId, CreateChannelRequest request) {
        if (request.joinType() == JoinType.PASSWORD && (request.password() == null || request.password().isBlank())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "密码频道必须设置密码");
        }
        Set<Long> memberSet = mutableSet();
        memberSet.add(currentUserId);
        Channel channel = new Channel(channels.nextChannelId(), request.name(), request.joinType(),
                request.password(), 1, currentUserId,
                request.announcement() == null || request.announcement().isBlank() ? "欢迎来到新频道！" : request.announcement(),
                memberSet, ChannelStatus.ACTIVE);
        return toView(channels.save(channel), currentUserId);
    }

    public ChannelView updateAnnouncement(Long currentUserId, Long channelId, String announcement) {
        Channel channel = requireChannel(channelId);
        requireChannelAdministrator(currentUserId, channel);
        Channel updated = new Channel(channel.id(), channel.name(), channel.joinType(), channel.password(),
                channel.memberCount(), channel.administratorId(), announcement.trim(), channel.memberIds(), channel.status());
        return toView(channels.save(updated), currentUserId);
    }

    public PageData<PostView> posts(Long currentUserId, Long channelId, int page, int size) {
        Channel channel = requireChannel(channelId);
        List<ChannelPost> all = channels.findPosts(channelId);
        if (!channel.memberIds().contains(currentUserId)) all = all.stream().limit(5).toList();
        return PageData.of(all.stream().map(post -> toPostView(post, currentUserId)).toList(), page, size);
    }

    public PostView createPost(Long currentUserId, Long channelId, String title, String content, boolean pinned) {
        Channel channel = requireChannel(channelId);
        requireMember(currentUserId, channel);
        if (pinned) requireChannelAdministrator(currentUserId, channel);
        ChannelPost post = new ChannelPost(channels.nextPostId(), channelId, currentUserId, title, content, pinned,
                0, 0, mutableSet(), OffsetDateTime.now());
        return toPostView(channels.savePost(post), currentUserId);
    }

    public PostDetail postDetail(Long currentUserId, Long postId) {
        ChannelPost post = requirePost(postId);
        requireMember(currentUserId, requireChannel(post.channelId()));
        List<ReplyView> replies = channels.findReplies(postId).stream().map(this::toReplyView).toList();
        return new PostDetail(toPostView(post, currentUserId), replies);
    }

    public ReplyView reply(Long currentUserId, Long postId, String content) {
        ChannelPost post = requirePost(postId);
        requireMember(currentUserId, requireChannel(post.channelId()));
        ChannelReply saved = channels.saveReply(new ChannelReply(channels.nextReplyId(), postId, currentUserId, content, OffsetDateTime.now()));
        channels.savePost(new ChannelPost(post.id(), post.channelId(), post.authorId(), post.title(), post.content(), post.pinned(),
                post.likeCount(), post.replyCount() + 1, post.likedBy(), post.createdAt()));
        if (!currentUserId.equals(post.authorId())) {
            notifications.save(new Notification(notifications.nextId(), post.authorId(), "POST_REPLY",
                    "频道帖子收到回复", content, post.id(), false, OffsetDateTime.now()));
        }
        return toReplyView(saved);
    }

    public ToggleResponse toggleLike(Long currentUserId, Long postId) {
        ChannelPost post = requirePost(postId);
        requireMember(currentUserId, requireChannel(post.channelId()));
        ChannelPost updated = channels.togglePostLike(postId, currentUserId);
        return new ToggleResponse(updated.likedBy().contains(currentUserId), updated.likeCount());
    }

    public PostView setPinned(Long currentUserId, Long postId, boolean pinned) {
        ChannelPost post = requirePost(postId);
        requireChannelAdministrator(currentUserId, requireChannel(post.channelId()));
        ChannelPost updated = new ChannelPost(post.id(), post.channelId(), post.authorId(), post.title(), post.content(),
                pinned, post.likeCount(), post.replyCount(), post.likedBy(), post.createdAt());
        return toPostView(channels.savePost(updated), currentUserId);
    }

    private ChannelView toView(Channel channel, Long currentUserId) {
        User admin = users.findById(channel.administratorId()).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "管理员不存在"));
        return new ChannelView(channel.id(), channel.name(), channel.joinType(), channel.memberIds().contains(currentUserId),
                channel.administratorId().equals(currentUserId), isChannelAdministrator(currentUserId, channel), channel.memberCount(),
                new AdminView(admin.id(), admin.nickname()), channel.announcement(), channel.status());
    }

    private AdminMemberView toAdminMemberView(Channel channel, Long userId) {
        User user = requireUser(userId);
        boolean initial = channel.administratorId().equals(userId);
        boolean admin = isChannelAdministrator(userId, channel);
        String role = initial ? "初始管理员" : admin ? "频道管理员" : "成员";
        return new AdminMemberView(user.id(), user.nickname(), role, initial, admin);
    }

    private AdminRequestView toAdminRequestView(Channel channel, ChannelAdminRequest request) {
        User requester = requireUser(request.requesterId());
        User inviter = request.inviterId() == null ? null : requireUser(request.inviterId());
        return new AdminRequestView(request.id(), channel.id(), channel.name(), requester.id(), requester.nickname(),
                inviter == null ? null : inviter.id(), inviter == null ? null : inviter.nickname(),
                request.type(), request.status(), request.createdAt());
    }

    private PostView toPostView(ChannelPost post, Long currentUserId) {
        User author = users.findById(post.authorId()).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "发帖用户不存在"));
        return new PostView(post.id(), post.channelId(), post.authorId(), author.nickname(), post.title(), post.content(), post.pinned(),
                post.likeCount(), post.replyCount(), post.likedBy().contains(currentUserId), post.createdAt());
    }

    private ReplyView toReplyView(ChannelReply reply) {
        User author = users.findById(reply.authorId()).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "回复用户不存在"));
        return new ReplyView(reply.id(), author.id(), author.nickname(), reply.content(), reply.createdAt());
    }

    private Channel requireChannel(Long id) {
        Channel channel = channels.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "频道不存在"));
        if (channel.status() == ChannelStatus.BANNED) throw new BusinessException(ErrorCode.FORBIDDEN, "频道已被封禁");
        return channel;
    }
    private ChannelPost requirePost(Long id) { return channels.findPostById(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "频道帖子不存在")); }
    private User requireUser(Long id) { return users.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "用户不存在")); }
    private void requireMember(Long userId, Channel channel) {
        if (!channel.memberIds().contains(userId)) throw new BusinessException(ErrorCode.CHANNEL_NOT_JOINED);
    }
    private void requireChannelAdministrator(Long userId, Channel channel) {
        if (!isChannelAdministrator(userId, channel)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "仅频道管理员可以执行该操作");
        }
    }
    private void requireInitialAdministrator(Long userId, Channel channel) {
        if (!channel.administratorId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "仅频道初始管理员可以执行该操作");
        }
    }
    private boolean isChannelAdministrator(Long userId, Channel channel) {
        return channel.administratorId().equals(userId)
                || channels.findMemberRole(channel.id(), userId).filter("ADMIN"::equals).isPresent();
    }
    private void notifyAdminRequestResult(Channel channel, ChannelAdminRequest request) {
        String title = request.type().equals("APPLY") ? "频道管理员申请结果" : "频道管理员邀请结果";
        String content;
        Long receiverId;
        if (request.type().equals("APPLY")) {
            receiverId = request.requesterId();
            content = switch (request.status()) {
                case "APPROVED" -> "你已成为「" + channel.name() + "」频道管理员";
                case "REJECTED" -> "你成为「" + channel.name() + "」频道管理员的申请未通过";
                default -> "「" + channel.name() + "」管理员申请状态已更新";
            };
        } else {
            receiverId = request.inviterId();
            if (receiverId == null) return;
            User requester = requireUser(request.requesterId());
            content = switch (request.status()) {
                case "ACCEPTED" -> requester.nickname() + " 已接受「" + channel.name() + "」频道管理员邀请";
                case "DECLINED" -> requester.nickname() + " 已拒绝「" + channel.name() + "」频道管理员邀请";
                default -> "「" + channel.name() + "」管理员邀请状态已更新";
            };
        }
        notifications.save(new Notification(notifications.nextId(), receiverId, "CHANNEL_ADMIN_RESULT",
                title, content, request.id(), false, OffsetDateTime.now()));
    }
    private Set<Long> mutableSet() { return ConcurrentHashMap.newKeySet(); }
}
