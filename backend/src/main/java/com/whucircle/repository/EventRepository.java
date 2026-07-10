package com.whucircle.repository;

import com.whucircle.domain.ChannelEvent;
import com.whucircle.domain.ChannelEventParticipant;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository {
    List<ChannelEvent> findByChannelId(Long channelId);
    List<ChannelEvent> findJoinedByUserId(Long userId, OffsetDateTime from, OffsetDateTime to);
    Optional<ChannelEvent> findById(Long id);
    ChannelEvent save(ChannelEvent event);
    ChannelEvent updateStatus(Long eventId, String status);
    Optional<ChannelEventParticipant> findParticipant(Long eventId, Long userId);
    List<ChannelEventParticipant> findParticipants(Long eventId);
    ChannelEventParticipant saveParticipant(ChannelEventParticipant participant);
    long nextEventId();
}
