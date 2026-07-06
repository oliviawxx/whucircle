package com.whucircle.domain;

import java.time.OffsetDateTime;

public record ChannelReply(Long id, Long postId, Long authorId, String content, OffsetDateTime createdAt) {
}
