package com.whucircle.repository;

import com.whucircle.domain.Notification;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository {
    List<Notification> findByUserId(Long userId);
    Optional<Notification> findById(Long id);
    Notification save(Notification notification);
    void markAllRead(Long userId);
    long nextId();
}
