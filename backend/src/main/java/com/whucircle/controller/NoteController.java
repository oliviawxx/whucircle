package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.common.PageData;
import com.whucircle.domain.Enums.NoteScope;
import com.whucircle.dto.NoteDtos.CommentView;
import com.whucircle.dto.NoteDtos.CreateCommentRequest;
import com.whucircle.dto.NoteDtos.CreateNoteRequest;
import com.whucircle.dto.NoteDtos.NoteView;
import com.whucircle.dto.NoteDtos.ToggleResponse;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.NoteService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "笔记")
@RestController
@RequestMapping("/api/v1")
public class NoteController {
    private final NoteService noteService;

    public NoteController(NoteService noteService) { this.noteService = noteService; }

    @GetMapping("/notes")
    public ApiResponse<PageData<NoteView>> list(
            @RequestParam(defaultValue = "PUBLIC") NoteScope scope,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(noteService.list(CurrentUser.id(), scope, keyword, tag, page, size));
    }

    @PostMapping("/notes")
    public ApiResponse<NoteView> create(@Valid @RequestBody CreateNoteRequest request) {
        return ApiResponse.success(noteService.create(CurrentUser.id(), request));
    }

    @GetMapping("/notes/{noteId}")
    public ApiResponse<NoteView> detail(@PathVariable Long noteId) {
        return ApiResponse.success(noteService.detail(CurrentUser.id(), noteId));
    }

    @GetMapping("/notes/{noteId}/comments")
    public ApiResponse<List<CommentView>> comments(@PathVariable Long noteId) {
        return ApiResponse.success(noteService.comments(CurrentUser.id(), noteId));
    }

    @PostMapping("/notes/{noteId}/comments")
    public ApiResponse<CommentView> comment(@PathVariable Long noteId, @Valid @RequestBody CreateCommentRequest request) {
        return ApiResponse.success(noteService.comment(CurrentUser.id(), noteId, request.content()));
    }

    @PostMapping("/notes/{noteId}/like")
    public ApiResponse<ToggleResponse> like(@PathVariable Long noteId) {
        return ApiResponse.success(noteService.toggleLike(CurrentUser.id(), noteId));
    }

    @PostMapping("/notes/{noteId}/save")
    public ApiResponse<ToggleResponse> save(@PathVariable Long noteId) {
        return ApiResponse.success(noteService.toggleSave(CurrentUser.id(), noteId));
    }

    @GetMapping("/feed/social")
    public ApiResponse<PageData<NoteView>> socialFeed(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(noteService.list(CurrentUser.id(), NoteScope.SOCIAL, keyword, tag, page, size));
    }

    @GetMapping("/tags")
    public ApiResponse<List<String>> tags() { return ApiResponse.success(noteService.tags()); }
}
