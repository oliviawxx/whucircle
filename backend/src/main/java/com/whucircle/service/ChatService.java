package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.common.PageData;
import com.whucircle.domain.ChatMessage;
import com.whucircle.domain.Conversation;
import com.whucircle.domain.Enums.ConversationType;
import com.whucircle.domain.Enums.DirectMessagePermission;
import com.whucircle.domain.Enums.RelationStatus;
import com.whucircle.domain.User;
import com.whucircle.dto.ChatDtos.ConversationView;
import com.whucircle.dto.ChatDtos.CreateConversationRequest;
import com.whucircle.dto.ChatDtos.MessageView;
import com.whucircle.repository.ChatRepository;
import com.whucircle.repository.SettingsRepository;
import com.whucircle.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {
    private final ChatRepository chats;
    private final UserRepository users;
    private final SettingsRepository settings;

    public ChatService(ChatRepository chats, UserRepository users, SettingsRepository settings) {
        this.chats = chats;
        this.users = users;
        this.settings = settings;
    }

    public List<ConversationView> conversations(Long currentUserId) {
        return chats.findByMember(currentUserId).stream().map(conversation -> new ConversationView(
                conversation.id(), conversation.type(), displayName(conversation, currentUserId),
                conversation.lastMessage(), conversation.lastMessageAt(),
                (int) chats.findMessages(conversation.id()).stream().filter(message -> !message.readBy().contains(currentUserId)).count())).toList();
    }

    public PageData<MessageView> messages(Long currentUserId, Long conversationId, int page, int size) {
        requireMember(currentUserId, conversationId);
        return PageData.of(chats.findMessages(conversationId).stream().map(message -> toView(message, currentUserId)).toList(), page, size);
    }

    public MessageView send(Long currentUserId, Long conversationId, String content) {
        Conversation conversation = requireMember(currentUserId, conversationId);
        if (conversation.memberIds().stream().anyMatch(member -> !member.equals(currentUserId) && users.isBlockedEitherWay(currentUserId, member))) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "会话中存在拉黑关系，不能发送消息");
        }
        if (conversation.type() == ConversationType.PRIVATE) {
            conversation.memberIds().stream().filter(member -> !member.equals(currentUserId)).findFirst()
                    .ifPresent(targetUserId -> {
                        requireDirectMessagePermission(currentUserId, targetUserId);
                        requirePrivateMessageQuota(currentUserId, targetUserId);
                    });
        }
        Set<Long> readBy = ConcurrentHashMap.newKeySet();
        readBy.add(currentUserId);
        ChatMessage saved = chats.saveMessage(new ChatMessage(chats.nextMessageId(), conversationId, currentUserId, content, OffsetDateTime.now(), readBy));
        return toView(saved, currentUserId);
    }

    public void markRead(Long currentUserId, Long conversationId) {
        requireMember(currentUserId, conversationId);
        chats.markRead(conversationId, currentUserId);
    }

    public ConversationView createConversation(Long currentUserId, CreateConversationRequest request) {
        List<Long> participantIds = request.participantIds().stream().distinct()
                .filter(id -> !id.equals(currentUserId)).toList();
        if (request.type() == ConversationType.PRIVATE && participantIds.size() != 1) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "私聊必须且只能选择一名其他用户");
        }
        if (request.type() == ConversationType.GROUP && participantIds.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "群聊至少需要一名其他成员");
        }
        Set<Long> members = ConcurrentHashMap.newKeySet();
        members.add(currentUserId);
        members.addAll(participantIds);
        for (Long memberId : participantIds) {
            if (users.findById(memberId).isEmpty()) throw new BusinessException(ErrorCode.NOT_FOUND, "用户 " + memberId + " 不存在");
            if (users.isBlockedEitherWay(currentUserId, memberId)) {
                throw new BusinessException(ErrorCode.FORBIDDEN, "拉黑关系下不能创建会话");
            }
            if (request.type() == ConversationType.GROUP
                    && users.relation(currentUserId, memberId) != RelationStatus.FRIEND) {
                throw new BusinessException(ErrorCode.FORBIDDEN, "只能邀请好友加入群聊");
            }
        }
        if (request.type() == ConversationType.PRIVATE) {
            Long otherUserId = participantIds.get(0);
            requireDirectMessagePermission(currentUserId, otherUserId);
            return chats.findPrivateConversation(currentUserId, otherUserId)
            .map(conversation -> new ConversationView(conversation.id(), conversation.type(), conversation.name(),
            .map(conversation -> new ConversationView(conversation.id(), conversation.type(), displayName(conversation, currentUserId),
                    conversation.lastMessage(), conversation.lastMessageAt(),
                            (int) chats.findMessages(conversation.id()).stream()
                                    .filter(message -> !message.readBy().contains(currentUserId)).count()))
                    .orElseGet(() -> createNewConversation(currentUserId, request, participantIds));
        }
        return createNewConversation(currentUserId, request, participantIds);
    }

    private ConversationView createNewConversation(Long currentUserId, CreateConversationRequest request, List<Long> participantIds) {
        Set<Long> members = ConcurrentHashMap.newKeySet();
        members.add(currentUserId);
        members.addAll(participantIds);
        long conversationId = chats.nextConversationId();
        String name = request.name();
        if (name == null || name.isBlank()) {
            if (request.type() == ConversationType.PRIVATE) {
                Long otherId = participantIds.get(0);
                name = users.findById(otherId).map(user -> user.nickname()).orElse("未知用户");
            } else {
                name = "群聊 " + conversationId;
            }
        }
        Conversation conversation = new Conversation(conversationId, request.type(), name.trim(), members,
                "", OffsetDateTime.now());
        return new ConversationView(chats.saveConversation(conversation).id(), conversation.type(), conversation.name(),
        return new ConversationView(chats.saveConversation(conversation).id(), conversation.type(), displayName(conversation, currentUserId),
                "", conversation.lastMessageAt(), 0);
    }

    private String displayName(Conversation conversation, Long currentUserId) {
        if (conversation.type() == ConversationType.PRIVATE) {
            return conversation.memberIds().stream()
                    .filter(id -> !id.equals(currentUserId))
                    .findFirst()
                    .flatMap(id -> users.findById(id).map(User::nickname))
                    .orElse("未知用户");
        }
        return conversation.name();
    }

    private void requireDirectMessagePermission(Long senderId, Long recipientId) {
        DirectMessagePermission permission = settings.findPrivacy(recipientId).directMessagePermission();
        if (permission == DirectMessagePermission.NONE) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "对方不接收私信");
        }
    }

    private void requirePrivateMessageQuota(Long senderId, Long recipientId) {
        RelationStatus relation = users.relation(senderId, recipientId);
        if (relation == RelationStatus.FOLLOWER || relation == RelationStatus.FRIEND) return;
        long sentCount = chats.findByMember(senderId).stream()
                .filter(conversation -> conversation.type() == ConversationType.PRIVATE)
                .filter(conversation -> conversation.memberIds().contains(recipientId))
                .flatMap(conversation -> chats.findMessages(conversation.id()).stream())
                .filter(message -> message.senderId().equals(senderId))
                .count();
        if (sentCount >= 1) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "对方关注你之前，只能发送一条私信");
        }
    }

    private Conversation requireMember(Long userId, Long conversationId) {
        Conversation conversation = chats.findConversationById(conversationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "会话不存在"));
        if (!conversation.memberIds().contains(userId)) throw new BusinessException(ErrorCode.FORBIDDEN, "不是会话成员");
        return conversation;
    }

    private MessageView toView(ChatMessage message, Long currentUserId) {
        String senderName = users.findById(message.senderId()).map(user -> user.nickname()).orElse("未知用户");
        return new MessageView(message.id(), message.senderId(), senderName, message.content(), message.sentAt(),
                message.readBy().size() > 1, message.senderId().equals(currentUserId));
    }
}
