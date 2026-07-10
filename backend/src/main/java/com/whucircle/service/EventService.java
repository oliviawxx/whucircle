package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.common.PageData;
import com.whucircle.domain.Channel;
import com.whucircle.domain.ChannelEvent;
import com.whucircle.domain.ChannelEventParticipant;
import com.whucircle.domain.ChannelPost;
import com.whucircle.domain.Conversation;
import com.whucircle.domain.Enums.ChannelStatus;
import com.whucircle.domain.Enums.EventParticipantStatus;
import com.whucircle.domain.Enums.EventStatus;
import com.whucircle.domain.Enums.ConversationStatus;
import com.whucircle.domain.Enums.ConversationType;
import com.whucircle.domain.Notification;
import com.whucircle.domain.User;
import com.whucircle.dto.EventDtos.CancelEventResponse;
import com.whucircle.dto.EventDtos.ChannelEventDetail;
import com.whucircle.dto.EventDtos.ChannelEventView;
import com.whucircle.dto.EventDtos.CreateEventRequest;
import com.whucircle.dto.EventDtos.EventJoinResponse;
import com.whucircle.dto.EventDtos.EventParticipantView;
import com.whucircle.dto.EventDtos.UpdateEventRequest;
import com.whucircle.repository.ChannelRepository;
import com.whucircle.repository.ChatRepository;
import com.whucircle.repository.EventRepository;
import com.whucircle.repository.NotificationRepository;
import com.whucircle.repository.SettingsRepository;
import com.whucircle.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EventService {
    private final EventRepository events;
    private final ChannelRepository channels;
    private final UserRepository users;
    private final NotificationRepository notifications;
    private final SettingsRepository settings;
    private final ChatRepository chats;

    public EventService(EventRepository events, ChannelRepository channels, UserRepository users,
                        NotificationRepository notifications, SettingsRepository settings, ChatRepository chats) {
        this.events = events;
        this.channels = channels;
        this.users = users;
        this.notifications = notifications;
        this.settings = settings;
        this.chats = chats;
    }

    public PageData<ChannelEventView> listChannelEvents(Long currentUserId, Long channelId, String status,
                                                        Boolean joined, int page, int size) {
        Channel channel = requireChannel(channelId);
        requireMember(currentUserId, channel);
        List<ChannelEventView> result = events.findByChannelId(channelId).stream()
                .filter(event -> matchesStatus(event, status))
                .filter(event -> joined == null || isJoined(event.id(), currentUserId) == joined)
                .map(event -> toView(event, currentUserId)).toList();
        return PageData.of(result, page, size);
    }

    public ChannelEventView create(Long currentUserId, Long channelId, CreateEventRequest request) {
        Channel channel = requireChannel(channelId);
        requireChannelAdministrator(currentUserId, channel);
        validateTime(request.startTime(), request.endTime(), request.signupDeadline());
        OffsetDateTime now = OffsetDateTime.now();
        Long linkedPostId = null;
        if (!Boolean.FALSE.equals(request.createPost())) {
            ChannelPost post = new ChannelPost(channels.nextPostId(), channelId, currentUserId,
                    "[活动] " + request.title().trim(), postContent(request.title(), request.description(),
                    request.location(), request.startTime(), request.endTime(), request.signupDeadline(), request.capacity()),
                    Boolean.TRUE.equals(request.pinPost()), 0, 0, ConcurrentHashMap.newKeySet(), now);
            linkedPostId = channels.savePost(post).id();
        }
        Long eventId = events.nextEventId();
        Long conversationId = Boolean.FALSE.equals(request.createChat()) ? null : createEventChat(eventId, currentUserId, request.title());
        ChannelEvent event = new ChannelEvent(eventId, channelId, currentUserId, linkedPostId, conversationId,
                request.title().trim(), request.description().trim(), request.location().trim(),
                request.startTime(), request.endTime(), request.signupDeadline(), request.capacity(),
                0, EventStatus.PUBLISHED, now, now);
        ChannelEvent saved = events.save(event);
        notifyMembers(channel, currentUserId, "CHANNEL_EVENT_CREATED", "频道发布了新活动",
                "《" + channel.name() + "》发布活动：" + saved.title(), saved.id(), false);
        return toView(saved, currentUserId);
    }

    public ChannelEventDetail detail(Long currentUserId, Long eventId) {
        ChannelEvent event = requireEvent(eventId);
        Channel channel = requireChannel(event.channelId());
        requireMember(currentUserId, channel);
        boolean admin = isChannelAdministrator(currentUserId, channel);
        List<EventParticipantView> participants = admin
                ? events.findParticipants(eventId).stream().map(this::toParticipantView).toList()
                : events.findParticipants(eventId).stream().limit(10).map(this::toParticipantView).toList();
        return new ChannelEventDetail(toView(event, currentUserId), participants);
    }

    public ChannelEventView update(Long currentUserId, Long eventId, UpdateEventRequest request) {
        ChannelEvent old = requireEvent(eventId);
        Channel channel = requireChannel(old.channelId());
        requireChannelAdministrator(currentUserId, channel);
        if (old.status() == EventStatus.CANCELLED) throw new BusinessException(ErrorCode.CONFLICT, "活动已取消");
        validateTime(request.startTime(), request.endTime(), request.signupDeadline());
        if (request.capacity() != null && request.capacity() < old.participantCount()) {
            throw new BusinessException(ErrorCode.CONFLICT, "活动名额不能小于已报名人数");
        }
        OffsetDateTime now = OffsetDateTime.now();
        ChannelEvent updated = events.save(new ChannelEvent(old.id(), old.channelId(), old.organizerId(), old.linkedPostId(), old.conversationId(),
                request.title().trim(), request.description().trim(), request.location().trim(), request.startTime(),
                request.endTime(), request.signupDeadline(), request.capacity(), old.participantCount(),
                old.status(), old.createdAt(), now));
        if (Boolean.TRUE.equals(request.syncLinkedPost()) && old.linkedPostId() != null) {
            ChannelPost post = channels.findPostById(old.linkedPostId()).orElse(null);
            if (post != null) {
                channels.savePost(new ChannelPost(post.id(), post.channelId(), post.authorId(), "[活动] " + updated.title(),
                        postContent(updated.title(), updated.description(), updated.location(), updated.startTime(),
                                updated.endTime(), updated.signupDeadline(), updated.capacity()),
                        post.pinned(), post.likeCount(), post.replyCount(), post.likedBy(), post.createdAt()));
            }
        }
        notifyParticipants(updated, "CHANNEL_EVENT_UPDATED", "活动信息已更新", "活动更新：" + updated.title());
        return toView(updated, currentUserId);
    }

    public CancelEventResponse cancel(Long currentUserId, Long eventId) {
        ChannelEvent event = requireEvent(eventId);
        Channel channel = requireChannel(event.channelId());
        requireChannelAdministrator(currentUserId, channel);
        if (event.status() == EventStatus.CANCELLED) return new CancelEventResponse(event.id(), event.status().name());
        ChannelEvent cancelled = events.updateStatus(eventId, EventStatus.CANCELLED.name());
        if (cancelled.linkedPostId() != null) {
            ChannelPost post = channels.findPostById(cancelled.linkedPostId()).orElse(null);
            if (post != null && !post.content().startsWith("【活动已取消】")) {
                channels.savePost(new ChannelPost(post.id(), post.channelId(), post.authorId(), post.title(),
                        "【活动已取消】\n" + post.content(), post.pinned(), post.likeCount(), post.replyCount(),
                        post.likedBy(), post.createdAt()));
            }
        }
        notifyParticipants(cancelled, "CHANNEL_EVENT_CANCELLED", "活动已取消", "活动取消：" + cancelled.title());
        return new CancelEventResponse(cancelled.id(), cancelled.status().name());
    }

    public EventJoinResponse join(Long currentUserId, Long eventId) {
        ChannelEvent event = requireEvent(eventId);
        Channel channel = requireChannel(event.channelId());
        requireMember(currentUserId, channel);
        ensureJoinable(event);
        if (isJoined(eventId, currentUserId)) {
            return joinResponse(events.findById(eventId).orElse(event), true);
        }
        ChannelEvent latest = events.findById(eventId).orElse(event);
        if (latest.capacity() != null && latest.participantCount() >= latest.capacity()) {
            throw new BusinessException(ErrorCode.CONFLICT, "活动名额已满");
        }
        events.saveParticipant(new ChannelEventParticipant(eventId, currentUserId, EventParticipantStatus.JOINED,
                OffsetDateTime.now(), null));
        syncChatMember(events.findById(eventId).orElse(event), currentUserId, true);
        return joinResponse(events.findById(eventId).orElse(latest), true);
    }

    public EventJoinResponse leave(Long currentUserId, Long eventId) {
        ChannelEvent event = requireEvent(eventId);
        Channel channel = requireChannel(event.channelId());
        requireMember(currentUserId, channel);
        if (event.status() == EventStatus.CANCELLED) throw new BusinessException(ErrorCode.CONFLICT, "活动已取消");
        if (ended(event)) throw new BusinessException(ErrorCode.CONFLICT, "活动已结束");
        ChannelEventParticipant existing = events.findParticipant(eventId, currentUserId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BAD_REQUEST, "尚未加入活动"));
        if (existing.status() != EventParticipantStatus.JOINED) {
            return joinResponse(event, false);
        }
        events.saveParticipant(new ChannelEventParticipant(eventId, currentUserId, EventParticipantStatus.CANCELLED,
                existing.joinedAt(), OffsetDateTime.now()));
        syncChatMember(event, currentUserId, false);
        return joinResponse(events.findById(eventId).orElse(event), false);
    }

    public PageData<EventParticipantView> participants(Long currentUserId, Long eventId, int page, int size) {
        ChannelEvent event = requireEvent(eventId);
        Channel channel = requireChannel(event.channelId());
        requireChannelAdministrator(currentUserId, channel);
        return PageData.of(events.findParticipants(eventId).stream().map(this::toParticipantView).toList(), page, size);
    }

    public List<ChannelEventView> calendar(Long currentUserId, OffsetDateTime from, OffsetDateTime to, String status) {
        OffsetDateTime start = from == null ? OffsetDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0) : from;
        OffsetDateTime end = to == null ? start.plusMonths(1).minusNanos(1) : to;
        return events.findJoinedByUserId(currentUserId, start, end).stream()
                .filter(event -> matchesStatus(event, status))
                .map(event -> toView(event, currentUserId)).toList();
    }

    private void validateTime(OffsetDateTime start, OffsetDateTime end, OffsetDateTime deadline) {
        if (!start.isBefore(end)) throw new BusinessException(ErrorCode.BAD_REQUEST, "活动时间设置不合法");
        if (deadline != null && deadline.isAfter(start)) throw new BusinessException(ErrorCode.BAD_REQUEST, "报名截止时间不能晚于活动开始时间");
    }

    private void ensureJoinable(ChannelEvent event) {
        if (event.status() == EventStatus.CANCELLED) throw new BusinessException(ErrorCode.CONFLICT, "活动已取消");
        if (ended(event)) throw new BusinessException(ErrorCode.CONFLICT, "活动已结束");
        if (event.signupDeadline() != null && OffsetDateTime.now().isAfter(event.signupDeadline())) {
            throw new BusinessException(ErrorCode.CONFLICT, "活动报名已截止");
        }
    }

    private boolean matchesStatus(ChannelEvent event, String status) {
        if (status == null || status.isBlank()) return true;
        String normalized = status.trim().toUpperCase();
        return switch (normalized) {
            case "UPCOMING" -> event.status() == EventStatus.PUBLISHED && !ended(event);
            case "PAST" -> ended(event);
            case "CANCELLED" -> event.status() == EventStatus.CANCELLED;
            default -> true;
        };
    }

    private ChannelEventView toView(ChannelEvent event, Long currentUserId) {
        Channel channel = requireChannel(event.channelId());
        User organizer = requireUser(event.organizerId());
        boolean joined = isJoined(event.id(), currentUserId);
        boolean full = event.capacity() != null && event.participantCount() >= event.capacity();
        boolean canEnterChat = event.conversationId() != null && (joined || event.organizerId().equals(currentUserId));
        return new ChannelEventView(event.id(), event.channelId(), channel.name(), event.organizerId(),
                organizer.nickname(), event.linkedPostId(), event.conversationId(), canEnterChat, event.title(), event.description(), event.location(),
                event.startTime(), event.endTime(), event.signupDeadline(), event.capacity(),
                event.participantCount(), event.status().name(), joined, full, ended(event),
                isChannelAdministrator(currentUserId, channel), event.createdAt(), event.updatedAt());
    }

    private EventParticipantView toParticipantView(ChannelEventParticipant participant) {
        User user = requireUser(participant.userId());
        return new EventParticipantView(user.id(), user.nickname(), participant.joinedAt());
    }

    private EventJoinResponse joinResponse(ChannelEvent event, boolean joined) {
        boolean full = event.capacity() != null && event.participantCount() >= event.capacity();
        return new EventJoinResponse(joined, event.participantCount(), event.capacity(), full, event.conversationId(), joined && event.conversationId() != null);
    }

    private String postContent(String title, String description, String location, OffsetDateTime start,
                               OffsetDateTime end, OffsetDateTime deadline, Integer capacity) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return "活动：" + title.trim()
                + "\n时间：" + formatter.format(start) + " - " + formatter.format(end)
                + "\n地点：" + location.trim()
                + (deadline == null ? "" : "\n报名截止：" + formatter.format(deadline))
                + (capacity == null ? "\n名额：不限" : "\n名额：" + capacity + " 人")
                + "\n\n" + description.trim();
    }

    private void notifyMembers(Channel channel, Long actorId, String type, String title, String content,
                               Long targetId, boolean onlyParticipants) {
        List<Long> receivers = onlyParticipants
                ? events.findParticipants(targetId).stream().map(ChannelEventParticipant::userId).toList()
                : channel.memberIds().stream().toList();
        receivers.stream().filter(userId -> !userId.equals(actorId)).forEach(userId -> {
            if (settings.findPrivacy(userId).activityNotifications()) {
                notifications.save(new Notification(notifications.nextId(), userId, type, title, content, targetId, false, OffsetDateTime.now()));
            }
        });
    }

    private void notifyParticipants(ChannelEvent event, String type, String title, String content) {
        events.findParticipants(event.id()).stream().map(ChannelEventParticipant::userId).distinct().forEach(userId -> {
            if (settings.findPrivacy(userId).activityNotifications()) {
                notifications.save(new Notification(notifications.nextId(), userId, type, title, content, event.id(), false, OffsetDateTime.now()));
            }
        });
    }

    private boolean isJoined(Long eventId, Long userId) {
        return events.findParticipant(eventId, userId)
                .filter(item -> item.status() == EventParticipantStatus.JOINED).isPresent();
    }

    private boolean ended(ChannelEvent event) { return event.endTime().isBefore(OffsetDateTime.now()); }

    private Long createEventChat(Long eventId, Long organizerId, String title) {
        long conversationId = chats.nextConversationId();
        java.util.Set<Long> members = ConcurrentHashMap.newKeySet();
        members.add(organizerId);
        chats.saveConversation(new Conversation(conversationId, ConversationType.GROUP,
                title.trim() + " · 活动群", organizerId, ConversationStatus.ACTIVE, members, "", OffsetDateTime.now()));
        return conversationId;
    }

    private void syncChatMember(ChannelEvent event, Long userId, boolean join) {
        if (event.conversationId() == null || event.organizerId().equals(userId)) return;
        Conversation conversation = chats.findConversationById(event.conversationId()).orElse(null);
        if (conversation == null || conversation.status() != ConversationStatus.ACTIVE) return;
        if (join) {
            java.util.Set<Long> members = ConcurrentHashMap.newKeySet();
            members.addAll(conversation.memberIds());
            members.add(userId);
            chats.saveConversation(new Conversation(conversation.id(), conversation.type(), conversation.name(), conversation.ownerId(),
                    conversation.status(), members, conversation.lastMessage(), conversation.lastMessageAt()));
        } else chats.removeMember(conversation.id(), userId);
    }

    private Channel requireChannel(Long id) {
        Channel channel = channels.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "频道不存在"));
        if (channel.status() == ChannelStatus.BANNED) throw new BusinessException(ErrorCode.FORBIDDEN, "频道已被封禁");
        return channel;
    }

    private ChannelEvent requireEvent(Long id) {
        return events.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "活动不存在"));
    }

    private User requireUser(Long id) {
        return users.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "用户不存在"));
    }

    private void requireMember(Long userId, Channel channel) {
        if (!channel.memberIds().contains(userId)) throw new BusinessException(ErrorCode.CHANNEL_NOT_JOINED);
    }

    private void requireChannelAdministrator(Long userId, Channel channel) {
        if (!isChannelAdministrator(userId, channel)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "仅频道管理员可以执行该操作");
        }
    }

    private boolean isChannelAdministrator(Long userId, Channel channel) {
        return channel.administratorId().equals(userId)
                || channels.findMemberRole(channel.id(), userId).filter("ADMIN"::equals).isPresent();
    }
}
