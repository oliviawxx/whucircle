package com.whucircle.repository.mysql;

import com.whucircle.domain.ChannelEvent;
import com.whucircle.domain.ChannelEventParticipant;
import com.whucircle.domain.Enums.EventParticipantStatus;
import com.whucircle.domain.Enums.EventStatus;
import com.whucircle.repository.EventRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@Profile("mysql")
public class MySqlEventRepository implements EventRepository {
    private static final ZoneOffset OFFSET = ZoneOffset.ofHours(8);
    private final JdbcClient jdbc;

    public MySqlEventRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    @PostConstruct
    void ensureTables() {
        jdbc.sql("""
                CREATE TABLE IF NOT EXISTS channel_events (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    channel_id BIGINT NOT NULL,
                    organizer_id BIGINT NOT NULL,
                    linked_post_id BIGINT NULL,
                    title VARCHAR(100) NOT NULL,
                    description TEXT NOT NULL,
                    location VARCHAR(100) NOT NULL,
                    start_time DATETIME(3) NOT NULL,
                    end_time DATETIME(3) NOT NULL,
                    signup_deadline DATETIME(3) NULL,
                    capacity INT NULL,
                    participant_count INT NOT NULL DEFAULT 0,
                    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
                    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                    CONSTRAINT fk_channel_event_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
                    CONSTRAINT fk_channel_event_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
                    CONSTRAINT fk_channel_event_post FOREIGN KEY (linked_post_id) REFERENCES channel_posts(id) ON DELETE SET NULL,
                    CONSTRAINT chk_channel_event_status CHECK (status IN ('PUBLISHED', 'CANCELLED')),
                    INDEX idx_channel_event_channel_start (channel_id, start_time),
                    INDEX idx_channel_event_status_start (status, start_time)
                ) ENGINE=InnoDB
                """).update();
        if (!hasColumn("conversation_id")) jdbc.sql("ALTER TABLE channel_events ADD COLUMN conversation_id BIGINT NULL AFTER linked_post_id").update();
        jdbc.sql("""
                CREATE TABLE IF NOT EXISTS channel_event_participants (
                    event_id BIGINT NOT NULL,
                    user_id BIGINT NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'JOINED',
                    joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                    cancelled_at DATETIME(3) NULL,
                    PRIMARY KEY (event_id, user_id),
                    CONSTRAINT fk_event_participant_event FOREIGN KEY (event_id) REFERENCES channel_events(id) ON DELETE CASCADE,
                    CONSTRAINT fk_event_participant_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    CONSTRAINT chk_event_participant_status CHECK (status IN ('JOINED', 'CANCELLED')),
                    INDEX idx_event_participant_user_status (user_id, status, joined_at)
                ) ENGINE=InnoDB
                """).update();
    }

    @Override public List<ChannelEvent> findByChannelId(Long channelId) {
        return jdbc.sql("SELECT * FROM channel_events WHERE channel_id=:channel ORDER BY start_time ASC, id ASC")
                .param("channel", channelId).query(this::mapEvent).list();
    }

    @Override public List<ChannelEvent> findJoinedByUserId(Long userId, OffsetDateTime from, OffsetDateTime to) {
        Map<String, Object> params = new HashMap<>();
        params.put("user", userId);
        params.put("from", from == null ? null : from.toLocalDateTime());
        params.put("to", to == null ? null : to.toLocalDateTime());
        return jdbc.sql("""
                SELECT e.* FROM channel_events e
                JOIN channel_event_participants p ON p.event_id=e.id
                WHERE p.user_id=:user AND p.status='JOINED'
                    AND (:from IS NULL OR e.end_time>=:from)
                    AND (:to IS NULL OR e.start_time<=:to)
                ORDER BY e.start_time ASC, e.id ASC
                """).params(params).query(this::mapEvent).list();
    }

    @Override public Optional<ChannelEvent> findById(Long id) {
        return jdbc.sql("SELECT * FROM channel_events WHERE id=:id").param("id", id).query(this::mapEvent).optional();
    }

    @Override public ChannelEvent save(ChannelEvent event) {
        Map<String, Object> params = new HashMap<>();
        params.put("id", event.id());
        params.put("channel", event.channelId());
        params.put("organizer", event.organizerId());
        params.put("post", event.linkedPostId());
        params.put("conversation", event.conversationId());
        params.put("title", event.title());
        params.put("description", event.description());
        params.put("location", event.location());
        params.put("start", event.startTime().toLocalDateTime());
        params.put("end", event.endTime().toLocalDateTime());
        params.put("deadline", event.signupDeadline() == null ? null : event.signupDeadline().toLocalDateTime());
        params.put("capacity", event.capacity());
        params.put("count", event.participantCount());
        params.put("status", event.status().name());
        params.put("created", event.createdAt().toLocalDateTime());
        params.put("updated", event.updatedAt().toLocalDateTime());
        jdbc.sql("""
                INSERT INTO channel_events(id,channel_id,organizer_id,linked_post_id,conversation_id,title,description,location,
                    start_time,end_time,signup_deadline,capacity,participant_count,status,created_at,updated_at)
                VALUES(:id,:channel,:organizer,:post,:conversation,:title,:description,:location,:start,:end,:deadline,
                    :capacity,:count,:status,:created,:updated)
                ON DUPLICATE KEY UPDATE linked_post_id=VALUES(linked_post_id),conversation_id=VALUES(conversation_id),title=VALUES(title),
                    description=VALUES(description),location=VALUES(location),start_time=VALUES(start_time),
                    end_time=VALUES(end_time),signup_deadline=VALUES(signup_deadline),capacity=VALUES(capacity),
                    participant_count=VALUES(participant_count),status=VALUES(status),updated_at=VALUES(updated_at)
                """).params(params).update();
        return findById(event.id()).orElseThrow();
    }

    @Override public ChannelEvent updateStatus(Long eventId, String status) {
        jdbc.sql("UPDATE channel_events SET status=:status WHERE id=:id")
                .params(Map.of("status", status, "id", eventId)).update();
        return findById(eventId).orElseThrow();
    }

    @Override public Optional<ChannelEventParticipant> findParticipant(Long eventId, Long userId) {
        return jdbc.sql("SELECT * FROM channel_event_participants WHERE event_id=:event AND user_id=:user")
                .params(Map.of("event", eventId, "user", userId)).query(this::mapParticipant).optional();
    }

    @Override public List<ChannelEventParticipant> findParticipants(Long eventId) {
        return jdbc.sql("SELECT * FROM channel_event_participants WHERE event_id=:event AND status='JOINED' ORDER BY joined_at ASC")
                .param("event", eventId).query(this::mapParticipant).list();
    }

    @Override @Transactional public ChannelEventParticipant saveParticipant(ChannelEventParticipant participant) {
        Optional<ChannelEventParticipant> before = findParticipant(participant.eventId(), participant.userId());
        boolean wasJoined = before.map(item -> item.status() == EventParticipantStatus.JOINED).orElse(false);
        boolean isJoined = participant.status() == EventParticipantStatus.JOINED;
        Map<String, Object> params = new HashMap<>();
        params.put("event", participant.eventId());
        params.put("user", participant.userId());
        params.put("status", participant.status().name());
        params.put("joined", participant.joinedAt().toLocalDateTime());
        params.put("cancelled", participant.cancelledAt() == null ? null : participant.cancelledAt().toLocalDateTime());
        jdbc.sql("""
                INSERT INTO channel_event_participants(event_id,user_id,status,joined_at,cancelled_at)
                VALUES(:event,:user,:status,:joined,:cancelled)
                ON DUPLICATE KEY UPDATE status=VALUES(status),joined_at=VALUES(joined_at),cancelled_at=VALUES(cancelled_at)
                """).params(params).update();
        if (wasJoined != isJoined) {
            int delta = isJoined ? 1 : -1;
            jdbc.sql("UPDATE channel_events SET participant_count=GREATEST(0,participant_count+:delta) WHERE id=:event")
                    .params(Map.of("delta", delta, "event", participant.eventId())).update();
        }
        return findParticipant(participant.eventId(), participant.userId()).orElseThrow();
    }

    @Override public long nextEventId() { return jdbc.sql("SELECT COALESCE(MAX(id),0)+1 FROM channel_events").query(Long.class).single(); }

    private ChannelEvent mapEvent(java.sql.ResultSet rs, int row) throws java.sql.SQLException {
        return new ChannelEvent(rs.getLong("id"), rs.getLong("channel_id"), rs.getLong("organizer_id"),
                (Long) rs.getObject("linked_post_id"), (Long) rs.getObject("conversation_id"), rs.getString("title"), rs.getString("description"),
                rs.getString("location"), at(rs.getTimestamp("start_time")), at(rs.getTimestamp("end_time")),
                at(rs.getTimestamp("signup_deadline")), (Integer) rs.getObject("capacity"),
                rs.getInt("participant_count"), EventStatus.valueOf(rs.getString("status")),
                at(rs.getTimestamp("created_at")), at(rs.getTimestamp("updated_at")));
    }

    private ChannelEventParticipant mapParticipant(java.sql.ResultSet rs, int row) throws java.sql.SQLException {
        return new ChannelEventParticipant(rs.getLong("event_id"), rs.getLong("user_id"),
                EventParticipantStatus.valueOf(rs.getString("status")),
                at(rs.getTimestamp("joined_at")), at(rs.getTimestamp("cancelled_at")));
    }

    private OffsetDateTime at(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime().atOffset(OFFSET);
    }
    private boolean hasColumn(String column){return jdbc.sql("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='channel_events' AND column_name=:column").param("column",column).query(Long.class).single()>0;}
}
