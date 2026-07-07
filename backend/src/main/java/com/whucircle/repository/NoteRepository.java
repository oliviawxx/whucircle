package com.whucircle.repository;

import com.whucircle.domain.Comment;
import com.whucircle.domain.Note;

import java.util.List;
import java.util.Optional;

public interface NoteRepository {
    List<Note> findAll();
    Optional<Note> findById(Long id);
    Note save(Note note);
    void deleteNote(Long noteId);
    List<Comment> findComments(Long noteId);
    Comment saveComment(Comment comment);
    void deleteComment(Long noteId, Long commentId);
    Note toggleLike(Long noteId, Long userId);
    Note toggleSave(Long noteId, Long userId);
    int countByAuthorId(Long authorId);
    long nextNoteId();
    long nextCommentId();
}
