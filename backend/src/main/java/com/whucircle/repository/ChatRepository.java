package com.whucircle.repository;

import com.whucircle.domain.ChatMessage;
import com.whucircle.domain.Conversation;

import java.util.List;
import java.util.Optional;

public interface ChatRepository {
    List<Conversation> findByMember(Long userId);
    Optional<Conversation> findConversationById(Long conversationId);
    Optional<Conversation> findPrivateConversation(Long firstUserId, Long secondUserId);
    Conversation saveConversation(Conversation conversation);
    List<ChatMessage> findMessages(Long conversationId);
    ChatMessage saveMessage(ChatMessage message);
    void markRead(Long conversationId, Long userId);
    long nextConversationId();
    long nextMessageId();
}
