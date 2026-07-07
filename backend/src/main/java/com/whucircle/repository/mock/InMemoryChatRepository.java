package com.whucircle.repository.mock;

import com.whucircle.domain.ChatMessage;
import com.whucircle.domain.Conversation;
import com.whucircle.domain.Enums.ConversationType;
import com.whucircle.repository.ChatRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile({"mock", "mysql"})
public class InMemoryChatRepository implements ChatRepository {
    private final Map<Long, Conversation> conversations = new ConcurrentHashMap<>();
    private final Map<Long, List<ChatMessage>> messages = new ConcurrentHashMap<>();
    private final AtomicLong conversationIds = new AtomicLong(30);
    private final AtomicLong messageIds = new AtomicLong(500);

    public InMemoryChatRepository() {
        OffsetDateTime now = OffsetDateTime.now();
        conversations.put(21L, new Conversation(21L, ConversationType.GROUP, "期末互助小组", Set.of(1L, 2L, 6L),
                "聊天这里先做 HTTP 接口。", now.minusMinutes(1)));
        conversations.put(22L, new Conversation(22L, ConversationType.PRIVATE, "林深时见鹿", Set.of(1L, 6L),
                "我把频道规则草稿发你了。", now.minusMinutes(5)));
        conversations.put(23L, new Conversation(23L, ConversationType.GROUP, "摄影社约拍群", Set.of(1L, 3L, 4L),
                "周六下午三点集合。", now.minusHours(3)));
        putMessage(new ChatMessage(501L, 21L, 6L, "今晚先把资料目录定下来。", now.minusMinutes(4), mutableSet(1L, 6L)));
        putMessage(new ChatMessage(502L, 21L, 1L, "可以，我负责频道逻辑和原型展示。", now.minusMinutes(3), mutableSet(1L, 6L)));
        putMessage(new ChatMessage(503L, 21L, 2L, "聊天这里先做 HTTP 接口。", now.minusMinutes(1), mutableSet(2L)));
        putMessage(new ChatMessage(504L, 22L, 6L, "我把频道规则草稿发你了。", now.minusMinutes(5), mutableSet(6L)));
        putMessage(new ChatMessage(505L, 23L, 3L, "周六下午三点集合。", now.minusHours(3), mutableSet(1L, 3L)));
    }

    private Set<Long> mutableSet(Long... values) {
        Set<Long> set = ConcurrentHashMap.newKeySet();
        set.addAll(List.of(values));
        return set;
    }
    private void putMessage(ChatMessage message) {
        messages.computeIfAbsent(message.conversationId(), ignored -> new CopyOnWriteArrayList<>()).add(message);
        messageIds.updateAndGet(value -> Math.max(value, message.id() + 1));
    }
    @Override public List<Conversation> findByMember(Long userId) {
        return conversations.values().stream().filter(item -> item.memberIds().contains(userId))
                .sorted(Comparator.comparing(Conversation::lastMessageAt).reversed()).toList();
    }
    @Override public java.util.Optional<Conversation> findConversationById(Long conversationId) {
        return java.util.Optional.ofNullable(conversations.get(conversationId));
    }
    @Override public Conversation saveConversation(Conversation conversation) {
        conversations.put(conversation.id(), conversation);
        return conversation;
    }
    @Override public List<ChatMessage> findMessages(Long conversationId) {
        return messages.getOrDefault(conversationId, List.of()).stream().sorted(Comparator.comparing(ChatMessage::sentAt)).toList();
    }
    @Override public ChatMessage saveMessage(ChatMessage message) {
        putMessage(message);
        Conversation old = conversations.get(message.conversationId());
        conversations.put(old.id(), new Conversation(old.id(), old.type(), old.name(), old.memberIds(), message.content(), message.sentAt()));
        return message;
    }
    @Override public void markRead(Long conversationId, Long userId) {
        findMessages(conversationId).forEach(message -> message.readBy().add(userId));
    }
    @Override public long nextConversationId() { return conversationIds.getAndIncrement(); }
    @Override public long nextMessageId() { return messageIds.getAndIncrement(); }
}
