package com.whucircle.repository;

import com.whucircle.domain.Comment;
import com.whucircle.domain.Note;

import java.util.List;
import java.util.Optional;

public interface NoteRepository {
    List<Note> findAll();
    Optional<Note> findById(Long id);
    Note save(Note note);
    List<Comment> findComments(Long noteId);
    Comment saveComment(Comment comment);
    Note toggleLike(Long noteId, Long userId);
    Note toggleSave(Long noteId, Long userId);
    long nextNoteId();
    long nextCommentId();
}
