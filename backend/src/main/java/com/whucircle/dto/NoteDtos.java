package com.whucircle.dto;

import com.whucircle.domain.Enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;

public final class NoteDtos {
    private NoteDtos() {}

    public record AuthorView(Long id, String nickname, String avatarUrl, String college) {}
    public record NoteView(Long id, AuthorView author, String title, String content, Visibility visibility,
                           List<String> imageUrls, List<String> tags, int likeCount, int commentCount,
                           boolean liked, boolean saved, OffsetDateTime createdAt) {}
    public record CreateNoteRequest(@NotBlank @Size(max = 80) String title,
                                    @NotBlank @Size(max = 3000) String content,
                                    @NotNull Visibility visibility,
                                    @Size(max = 9) List<String> imageUrls,
                                    @Size(max = 8) List<String> tags) {}
    public record CommentView(Long id, AuthorView author, String content, OffsetDateTime createdAt) {}
    public record CreateCommentRequest(@NotBlank @Size(max = 500) String content) {}
    public record ToggleResponse(boolean active, int count) {}
}
