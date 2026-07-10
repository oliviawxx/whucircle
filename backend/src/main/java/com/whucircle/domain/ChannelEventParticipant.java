package com.whucircle.domain;

import com.whucircle.domain.Enums.EventParticipantStatus;

import java.time.OffsetDateTime;

public record ChannelEventParticipant(Long eventId, Long userId, EventParticipantStatus status,
                                      OffsetDateTime joinedAt, OffsetDateTime cancelledAt) {
}
