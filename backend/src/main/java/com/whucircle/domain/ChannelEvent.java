package com.whucircle.domain;

import com.whucircle.domain.Enums.EventStatus;

import java.time.OffsetDateTime;

public record ChannelEvent(Long id, Long channelId, Long organizerId, Long linkedPostId, Long conversationId,
                           String title, String description, String location,
                           OffsetDateTime startTime, OffsetDateTime endTime,
                           OffsetDateTime signupDeadline, Integer capacity,
                           int participantCount, EventStatus status,
                           OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
