package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.common.PageData;
import com.whucircle.domain.Channel;
import com.whucircle.domain.ChannelPost;
import com.whucircle.domain.ChannelReply;
import com.whucircle.domain.Enums.JoinType;
import com.whucircle.domain.Notification;
import com.whucircle.domain.User;
import com.whucircle.dto.ChannelDtos.AdminView;
import com.whucircle.dto.ChannelDtos.ChannelView;
import com.whucircle.dto.ChannelDtos.CreateChannelRequest;
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
                .filter(channel -> joined == null || channel.memberIds().contains(currentUserId) == joined)
                .filter(channel -> keyword == null || keyword.isBlank() || channel.name().contains(keyword.trim()))
                .map(channel -> toView(channel, currentUserId)).toList();
        return PageData.of(result, page, size);
    }

    public ChannelView detail(Long currentUserId, Long channelId) { return toView(requireChannel(channelId), currentUserId); }

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
                memberSet);
        return toView(channels.save(channel), currentUserId);
    }

    public ChannelView updateAnnouncement(Long currentUserId, Long channelId, String announcement) {
        Channel channel = requireChannel(channelId);
        requireAdministrator(currentUserId, channel);
        Channel updated = new Channel(channel.id(), channel.name(), channel.joinType(), channel.password(),
                channel.memberCount(), channel.administratorId(), announcement.trim(), channel.memberIds());
        return toView(channels.save(updated), currentUserId);
    }

    public PageData<PostView> posts(Long currentUserId, Long channelId, int page, int size) {
        Channel channel = requireChannel(channelId);
        List<ChannelPost> all = channels.findPosts(channelId);
        if (!channel.memberIds().contains(currentUserId)) all = all.stream().limit(5).toList();
        return PageData.of(all.stream().map(post -> toPostView(post, currentUserId)).toList(), page, size);
    }

    public PostView createPost(Long currentUserId, Long channelId, String title, String content) {
        requireMember(currentUserId, requireChannel(channelId));
        ChannelPost post = new ChannelPost(channels.nextPostId(), channelId, currentUserId, title, content, false,
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
        requireAdministrator(currentUserId, requireChannel(post.channelId()));
        ChannelPost updated = new ChannelPost(post.id(), post.channelId(), post.authorId(), post.title(), post.content(),
                pinned, post.likeCount(), post.replyCount(), post.likedBy(), post.createdAt());
        return toPostView(channels.savePost(updated), currentUserId);
    }

    private ChannelView toView(Channel channel, Long currentUserId) {
        User admin = users.findById(channel.administratorId()).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "管理员不存在"));
        return new ChannelView(channel.id(), channel.name(), channel.joinType(), channel.memberIds().contains(currentUserId),
                channel.memberCount(), new AdminView(admin.id(), admin.nickname()), channel.announcement());
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

    private Channel requireChannel(Long id) { return channels.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "频道不存在")); }
    private ChannelPost requirePost(Long id) { return channels.findPostById(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "频道帖子不存在")); }
    private void requireMember(Long userId, Channel channel) {
        if (!channel.memberIds().contains(userId)) throw new BusinessException(ErrorCode.CHANNEL_NOT_JOINED);
    }
    private void requireAdministrator(Long userId, Channel channel) {
        if (!channel.administratorId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "仅频道管理员可以执行该操作");
        }
    }
    private Set<Long> mutableSet() { return ConcurrentHashMap.newKeySet(); }
}
