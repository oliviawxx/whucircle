package com.whucircle.repository.mock;

import com.whucircle.domain.Notification;
import com.whucircle.repository.NotificationRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile("mock")
public class InMemoryNotificationRepository implements NotificationRepository {
    private final Map<Long, Notification> notifications = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong(10);

    public InMemoryNotificationRepository() {
        OffsetDateTime now = OffsetDateTime.now();
        save(new Notification(1L, 1L, "NOTE_LIKE", "笔记收到点赞",
                "林深时见鹿赞了你的笔记", 105L, false, now.minusMinutes(2)));
        save(new Notification(2L, 1L, "NOTE_COMMENT", "笔记收到评论",
                "东湖边的猫评论了你的笔记", 105L, false, now.minusMinutes(12)));
        save(new Notification(3L, 1L, "POST_REPLY", "频道帖子收到回复",
                "频道成员回复了你的帖子", 301L, true, now.minusDays(1)));
    }

    @Override public List<Notification> findByUserId(Long userId) {
        return notifications.values().stream()
                .filter(item -> item.userId().equals(userId))
                .sorted(Comparator.comparing(Notification::createdAt).reversed())
                .toList();
    }

    @Override public Optional<Notification> findById(Long id) {
        return Optional.ofNullable(notifications.get(id));
    }

    @Override public Notification save(Notification notification) {
        notifications.put(notification.id(), notification);
        ids.updateAndGet(value -> Math.max(value, notification.id() + 1));
        return notification;
    }

    @Override public void markAllRead(Long userId) {
        findByUserId(userId).forEach(item -> save(new Notification(item.id(), item.userId(), item.type(),
                item.title(), item.content(), item.targetId(), true, item.createdAt())));
    }

    @Override public long nextId() { return ids.getAndIncrement(); }
}
