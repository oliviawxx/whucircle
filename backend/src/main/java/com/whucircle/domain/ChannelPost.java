package com.whucircle.domain;

import java.time.OffsetDateTime;
import java.util.Set;

public record ChannelPost(Long id, Long channelId, Long authorId, String title, String content,
                          boolean pinned, int likeCount, int replyCount, Set<Long> likedBy,
                          OffsetDateTime createdAt) {
}
