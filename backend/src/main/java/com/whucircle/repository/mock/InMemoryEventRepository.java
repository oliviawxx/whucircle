package com.whucircle.repository.mock;

import com.whucircle.domain.ChannelEvent;
import com.whucircle.domain.ChannelEventParticipant;
import com.whucircle.domain.Enums.EventParticipantStatus;
import com.whucircle.domain.Enums.EventStatus;
import com.whucircle.repository.EventRepository;
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
public class InMemoryEventRepository implements EventRepository {
    private final Map<Long, ChannelEvent> events = new ConcurrentHashMap<>();
    private final Map<Long, Map<Long, ChannelEventParticipant>> participants = new ConcurrentHashMap<>();
    private final AtomicLong eventIds = new AtomicLong(403);

    public InMemoryEventRepository() {
        OffsetDateTime now = OffsetDateTime.now();
        save(new ChannelEvent(401L, 11L, 2L, 302L, null, "离散数学考前答疑",
                "集中讲解图论、递推和历年题，欢迎带着题目来。",
                "信息学部 2 教 204", now.plusDays(2).withHour(19).withMinute(0),
                now.plusDays(2).withHour(21).withMinute(0), now.plusDays(2).withHour(18).withMinute(0),
                60, 0, EventStatus.PUBLISHED, now.minusHours(2), now.minusHours(2)));
        save(new ChannelEvent(402L, 12L, 3L, 304L, null, "樱顶日落摄影小队",
                "一起拍蓝调时刻，现场交流构图和后期思路。",
                "樱顶老图书馆前", now.plusDays(4).withHour(18).withMinute(20),
                now.plusDays(4).withHour(20).withMinute(0), now.plusDays(4).withHour(12).withMinute(0),
                null, 0, EventStatus.PUBLISHED, now.minusHours(1), now.minusHours(1)));
        saveParticipant(new ChannelEventParticipant(401L, 1L, EventParticipantStatus.JOINED, now.minusMinutes(30), null));
    }

    @Override public List<ChannelEvent> findByChannelId(Long channelId) {
        return events.values().stream().filter(event -> event.channelId().equals(channelId))
                .sorted(Comparator.comparing(ChannelEvent::startTime)).toList();
    }

    @Override public List<ChannelEvent> findJoinedByUserId(Long userId, OffsetDateTime from, OffsetDateTime to) {
        return events.values().stream()
                .filter(event -> participants.getOrDefault(event.id(), Map.of()).values().stream()
                        .anyMatch(p -> p.userId().equals(userId) && p.status() == EventParticipantStatus.JOINED))
                .filter(event -> from == null || !event.endTime().isBefore(from))
                .filter(event -> to == null || !event.startTime().isAfter(to))
                .sorted(Comparator.comparing(ChannelEvent::startTime)).toList();
    }

    @Override public Optional<ChannelEvent> findById(Long id) { return Optional.ofNullable(events.get(id)); }

    @Override public ChannelEvent save(ChannelEvent event) {
        events.put(event.id(), event);
        eventIds.updateAndGet(value -> Math.max(value, event.id() + 1));
        return event;
    }

    @Override public ChannelEvent updateStatus(Long eventId, String status) {
        ChannelEvent old = events.get(eventId);
        ChannelEvent updated = new ChannelEvent(old.id(), old.channelId(), old.organizerId(), old.linkedPostId(), old.conversationId(),
                old.title(), old.description(), old.location(), old.startTime(), old.endTime(), old.signupDeadline(),
                old.capacity(), old.participantCount(), EventStatus.valueOf(status), old.createdAt(), OffsetDateTime.now());
        return save(updated);
    }

    @Override public Optional<ChannelEventParticipant> findParticipant(Long eventId, Long userId) {
        return Optional.ofNullable(participants.getOrDefault(eventId, Map.of()).get(userId));
    }

    @Override public List<ChannelEventParticipant> findParticipants(Long eventId) {
        return participants.getOrDefault(eventId, Map.of()).values().stream()
                .filter(item -> item.status() == EventParticipantStatus.JOINED)
                .sorted(Comparator.comparing(ChannelEventParticipant::joinedAt)).toList();
    }

    @Override public synchronized ChannelEventParticipant saveParticipant(ChannelEventParticipant participant) {
        Optional<ChannelEventParticipant> before = findParticipant(participant.eventId(), participant.userId());
        boolean wasJoined = before.map(item -> item.status() == EventParticipantStatus.JOINED).orElse(false);
        boolean isJoined = participant.status() == EventParticipantStatus.JOINED;
        participants.computeIfAbsent(participant.eventId(), ignored -> new ConcurrentHashMap<>())
                .put(participant.userId(), participant);
        if (wasJoined != isJoined) {
            ChannelEvent event = events.get(participant.eventId());
            int delta = isJoined ? 1 : -1;
            events.put(event.id(), new ChannelEvent(event.id(), event.channelId(), event.organizerId(), event.linkedPostId(), event.conversationId(),
                    event.title(), event.description(), event.location(), event.startTime(), event.endTime(),
                    event.signupDeadline(), event.capacity(), Math.max(0, event.participantCount() + delta),
                    event.status(), event.createdAt(), OffsetDateTime.now()));
        }
        return participant;
    }

    @Override public long nextEventId() { return eventIds.getAndIncrement(); }
}
