package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.common.PageData;
import com.whucircle.domain.ChatMessage;
import com.whucircle.domain.Conversation;
import com.whucircle.dto.ChatDtos.ConversationView;
import com.whucircle.dto.ChatDtos.MessageView;
import com.whucircle.repository.ChatRepository;
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

    public ChatService(ChatRepository chats, UserRepository users) {
        this.chats = chats;
        this.users = users;
    }

    public List<ConversationView> conversations(Long currentUserId) {
        return chats.findByMember(currentUserId).stream().map(conversation -> new ConversationView(
                conversation.id(), conversation.type(), conversation.name(), conversation.lastMessage(), conversation.lastMessageAt(),
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
        Set<Long> readBy = ConcurrentHashMap.newKeySet();
        readBy.add(currentUserId);
        ChatMessage saved = chats.saveMessage(new ChatMessage(chats.nextMessageId(), conversationId, currentUserId, content, OffsetDateTime.now(), readBy));
        return toView(saved, currentUserId);
    }

    public void markRead(Long currentUserId, Long conversationId) {
        requireMember(currentUserId, conversationId);
        chats.markRead(conversationId, currentUserId);
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
