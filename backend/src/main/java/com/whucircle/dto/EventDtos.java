package com.whucircle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;

public final class EventDtos {
    private EventDtos() {}

    public record ChannelEventView(Long id, Long channelId, String channelName,
                                   Long organizerId, String organizerName, Long linkedPostId, Long conversationId, boolean canEnterChat,
                                   String title, String description, String location,
                                   OffsetDateTime startTime, OffsetDateTime endTime,
                                   OffsetDateTime signupDeadline, Integer capacity,
                                   int participantCount, String status, boolean joined,
                                   boolean full, boolean ended, boolean canManage,
                                   OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

    public record EventParticipantView(Long userId, String nickname, OffsetDateTime joinedAt) {}

    public record ChannelEventDetail(ChannelEventView event, List<EventParticipantView> participants) {}

    public record CreateEventRequest(@NotBlank @Size(max = 100) String title,
                                     @NotBlank @Size(max = 5000) String description,
                                     @NotBlank @Size(max = 100) String location,
                                     @NotNull OffsetDateTime startTime,
                                     @NotNull OffsetDateTime endTime,
                                     OffsetDateTime signupDeadline,
                                     @Positive Integer capacity,
                                     Boolean createPost,
                                     Boolean pinPost,
                                     Boolean createChat) {}

    public record UpdateEventRequest(@NotBlank @Size(max = 100) String title,
                                     @NotBlank @Size(max = 5000) String description,
                                     @NotBlank @Size(max = 100) String location,
                                     @NotNull OffsetDateTime startTime,
                                     @NotNull OffsetDateTime endTime,
                                     OffsetDateTime signupDeadline,
                                     @Positive Integer capacity,
                                     Boolean syncLinkedPost) {}

    public record CancelEventResponse(Long id, String status) {}

    public record EventJoinResponse(boolean joined, int participantCount, Integer capacity, boolean full, Long conversationId, boolean chatJoined) {}
}
