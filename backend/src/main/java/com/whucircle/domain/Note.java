package com.whucircle.domain;

import com.whucircle.domain.Enums.Visibility;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

public record Note(Long id, Long authorId, String title, String content, Visibility visibility,
                   List<String> imageUrls, List<String> tags, int likeCount, int commentCount,
                   Set<Long> likedBy, Set<Long> savedBy, OffsetDateTime createdAt) {
}
