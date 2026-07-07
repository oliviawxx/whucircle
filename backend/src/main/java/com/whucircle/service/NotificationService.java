package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.common.PageData;
import com.whucircle.domain.Notification;
import com.whucircle.dto.MiscDtos.NotificationCount;
import com.whucircle.dto.MiscDtos.NotificationView;
import com.whucircle.repository.NotificationRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private final NotificationRepository notifications;

    public NotificationService(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    public PageData<NotificationView> list(Long userId, int page, int size) {
        return PageData.of(notifications.findByUserId(userId).stream().map(this::toView).toList(), page, size);
    }

    public NotificationCount count(Long userId) {
        int unread = (int) notifications.findByUserId(userId).stream().filter(item -> !item.read()).count();
        return new NotificationCount(unread);
    }

    public NotificationView markRead(Long userId, Long notificationId) {
        Notification item = requireOwned(userId, notificationId);
        Notification updated = new Notification(item.id(), item.userId(), item.type(), item.title(), item.content(),
                item.targetId(), true, item.createdAt());
        return toView(notifications.save(updated));
    }

    public void markAllRead(Long userId) {
        notifications.markAllRead(userId);
    }

    private Notification requireOwned(Long userId, Long notificationId) {
        Notification item = notifications.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "通知不存在"));
        if (!item.userId().equals(userId)) throw new BusinessException(ErrorCode.FORBIDDEN);
        return item;
    }

    private NotificationView toView(Notification item) {
        return new NotificationView(item.id(), item.type(), item.title(), item.content(), item.targetId(),
                item.read(), item.createdAt());
    }
}
