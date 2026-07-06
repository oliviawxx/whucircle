package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.common.PageData;
import com.whucircle.domain.Comment;
import com.whucircle.domain.Enums.NoteScope;
import com.whucircle.domain.Enums.RelationStatus;
import com.whucircle.domain.Enums.Visibility;
import com.whucircle.domain.Note;
import com.whucircle.domain.User;
import com.whucircle.dto.NoteDtos.AuthorView;
import com.whucircle.dto.NoteDtos.CommentView;
import com.whucircle.dto.NoteDtos.CreateNoteRequest;
import com.whucircle.dto.NoteDtos.NoteView;
import com.whucircle.dto.NoteDtos.ToggleResponse;
import com.whucircle.repository.NoteRepository;
import com.whucircle.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;

@Service
public class NoteService {
    private final NoteRepository notes;
    private final UserRepository users;

    public NoteService(NoteRepository notes, UserRepository users) {
        this.notes = notes;
        this.users = users;
    }

    public PageData<NoteView> list(Long currentUserId, NoteScope scope, String keyword, String tag, int page, int size) {
        Stream<Note> stream = notes.findAll().stream();
        stream = switch (scope) {
            case PUBLIC -> stream.filter(note -> note.visibility() == Visibility.PUBLIC);
            case MINE -> stream.filter(note -> note.authorId().equals(currentUserId));
            case SAVED -> stream.filter(note -> note.savedBy().contains(currentUserId)).filter(note -> canView(currentUserId, note));
            case SOCIAL -> stream.filter(note -> isSocialVisible(currentUserId, note));
        };
        if (keyword != null && !keyword.isBlank()) {
            String query = keyword.trim().toLowerCase();
            stream = stream.filter(note -> note.title().toLowerCase().contains(query) || note.content().toLowerCase().contains(query));
        }
        if (tag != null && !tag.isBlank()) stream = stream.filter(note -> note.tags().contains(tag));
        return PageData.of(stream.map(note -> toView(note, currentUserId)).toList(), page, size);
    }

    public NoteView create(Long currentUserId, CreateNoteRequest request) {
        Note note = new Note(notes.nextNoteId(), currentUserId, request.title(), request.content(), request.visibility(),
                request.imageUrls() == null ? List.of() : List.copyOf(request.imageUrls()),
                request.tags() == null ? List.of() : List.copyOf(request.tags()),
                0, 0, mutableSet(), mutableSet(), OffsetDateTime.now());
        return toView(notes.save(note), currentUserId);
    }

    public NoteView detail(Long currentUserId, Long noteId) {
        Note note = requireNote(noteId);
        requireViewPermission(currentUserId, note);
        return toView(note, currentUserId);
    }

    public List<CommentView> comments(Long currentUserId, Long noteId) {
        Note note = requireNote(noteId);
        requireViewPermission(currentUserId, note);
        return notes.findComments(noteId).stream().map(this::toCommentView).toList();
    }

    public CommentView comment(Long currentUserId, Long noteId, String content) {
        Note note = requireNote(noteId);
        requireViewPermission(currentUserId, note);
        if (users.isBlockedEitherWay(currentUserId, note.authorId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "拉黑关系下不能评论");
        }
        Comment saved = notes.saveComment(new Comment(notes.nextCommentId(), noteId, currentUserId, content, OffsetDateTime.now()));
        notes.save(new Note(note.id(), note.authorId(), note.title(), note.content(), note.visibility(), note.imageUrls(), note.tags(),
                note.likeCount(), note.commentCount() + 1, note.likedBy(), note.savedBy(), note.createdAt()));
        return toCommentView(saved);
    }

    public ToggleResponse toggleLike(Long currentUserId, Long noteId) {
        requireViewPermission(currentUserId, requireNote(noteId));
        Note updated = notes.toggleLike(noteId, currentUserId);
        return new ToggleResponse(updated.likedBy().contains(currentUserId), updated.likeCount());
    }

    public ToggleResponse toggleSave(Long currentUserId, Long noteId) {
        requireViewPermission(currentUserId, requireNote(noteId));
        Note updated = notes.toggleSave(noteId, currentUserId);
        return new ToggleResponse(updated.savedBy().contains(currentUserId), updated.savedBy().size());
    }

    public List<String> tags() {
        return notes.findAll().stream().flatMap(note -> note.tags().stream()).distinct().sorted().toList();
    }

    private boolean isSocialVisible(Long currentUserId, Note note) {
        if (note.authorId().equals(currentUserId)) return false;
        RelationStatus relation = users.relation(currentUserId, note.authorId());
        if (relation != RelationStatus.FOLLOWING && relation != RelationStatus.FRIEND) return false;
        return note.visibility() == Visibility.PUBLIC || (note.visibility() == Visibility.FRIENDS && relation == RelationStatus.FRIEND);
    }

    private boolean canView(Long currentUserId, Note note) {
        if (note.authorId().equals(currentUserId)) return true;
        if (users.isBlockedEitherWay(currentUserId, note.authorId())) return false;
        if (note.visibility() == Visibility.PUBLIC) return true;
        return note.visibility() == Visibility.FRIENDS && users.relation(currentUserId, note.authorId()) == RelationStatus.FRIEND;
    }

    private void requireViewPermission(Long currentUserId, Note note) {
        if (!canView(currentUserId, note)) {
            ErrorCode code = note.visibility() == Visibility.FRIENDS ? ErrorCode.NOT_FRIEND : ErrorCode.FORBIDDEN;
            throw new BusinessException(code);
        }
    }

    private Note requireNote(Long noteId) {
        return notes.findById(noteId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "笔记不存在"));
    }

    private NoteView toView(Note note, Long currentUserId) {
        User author = users.findById(note.authorId()).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "作者不存在"));
        return new NoteView(note.id(), new AuthorView(author.id(), author.nickname(), author.avatarUrl(), author.college()),
                note.title(), note.content(), note.visibility(), note.imageUrls(), note.tags(), note.likeCount(), note.commentCount(),
                note.likedBy().contains(currentUserId), note.savedBy().contains(currentUserId), note.createdAt());
    }

    private CommentView toCommentView(Comment comment) {
        User author = users.findById(comment.authorId()).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "评论作者不存在"));
        return new CommentView(comment.id(), new AuthorView(author.id(), author.nickname(), author.avatarUrl(), author.college()),
                comment.content(), comment.createdAt());
    }

    private Set<Long> mutableSet() { return ConcurrentHashMap.newKeySet(); }
}
