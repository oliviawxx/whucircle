package com.whucircle.domain;

import java.time.OffsetDateTime;

public record Comment(Long id, Long noteId, Long authorId, String content, OffsetDateTime createdAt) {
}
