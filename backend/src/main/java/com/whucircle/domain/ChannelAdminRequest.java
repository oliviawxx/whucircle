package com.whucircle.domain;

import java.time.OffsetDateTime;

public record ChannelAdminRequest(Long id, Long channelId, Long requesterId, Long inviterId,
                                  String type, String status, OffsetDateTime createdAt,
                                  OffsetDateTime updatedAt) {
}
