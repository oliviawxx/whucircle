package com.whucircle.repository.mock;

import com.whucircle.domain.Comment;
import com.whucircle.domain.Enums.Visibility;
import com.whucircle.domain.Note;
import com.whucircle.repository.NoteRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile("mock")
public class InMemoryNoteRepository implements NoteRepository {
    private final Map<Long, Note> notes = new ConcurrentHashMap<>();
    private final Map<Long, List<Comment>> comments = new ConcurrentHashMap<>();
    private final AtomicLong noteIds = new AtomicLong(100);
    private final AtomicLong commentIds = new AtomicLong(1000);

    public InMemoryNoteRepository() {
        put(new Note(101L, 2L, "傍晚从樱顶走到湖边，光线刚刚好",
                "想把今天的散步路线存一下：老图书馆、樱顶、行政楼、东湖边。适合晚饭后慢慢走。",
                Visibility.PUBLIC,
                List.of("https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=640&q=80"),
                List.of("校园生活", "摄影"), 128, 2, mutableSet(1L), mutableSet(),
                OffsetDateTime.now().minusMinutes(12)));
        put(new Note(102L, 3L, "求一个期末复习搭子",
                "晚上在工学部图书馆，主要复习英语语言学和二外。希望互相监督，不用一直聊天。",
                Visibility.PUBLIC, List.of(), List.of("学习", "互助"), 45, 1, mutableSet(), mutableSet(1L),
                OffsetDateTime.now().minusMinutes(38)));
        put(new Note(103L, 4L, "磨山云海真的值得早起",
                "六点到山顶的时候雾还没散，拍到了很安静的一组照片。路线不难，新手也可以试试。",
                Visibility.PUBLIC,
                List.of("https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=640&q=80"),
                List.of("出行", "摄影"), 76, 0, mutableSet(), mutableSet(), OffsetDateTime.now().minusHours(1)));
        put(new Note(104L, 5L, "今日食堂窗口记录",
                "桂园二楼新出的鸡腿饭不错，排队十分钟以内。下次想做一个食堂效率小表。",
                Visibility.FRIENDS,
                List.of("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=640&q=80"),
                List.of("食堂", "校园生活"), 63, 1, mutableSet(), mutableSet(), OffsetDateTime.now().minusHours(2)));
        put(new Note(105L, 1L, "课程项目分工备忘",
                "先定接口和页面，再开工。前端和后端按照接口文档并行推进。",
                Visibility.PRIVATE, List.of(), List.of("项目", "学习"), 0, 0, mutableSet(), mutableSet(),
                OffsetDateTime.now().minusHours(3)));

        saveComment(new Comment(1001L, 101L, 3L, "这个路线真的很适合晚上散步。", OffsetDateTime.now().minusMinutes(8)));
        saveComment(new Comment(1002L, 101L, 6L, "图片氛围很好。", OffsetDateTime.now().minusMinutes(6)));
        saveComment(new Comment(1003L, 102L, 1L, "我今晚也在，可以一起自习。", OffsetDateTime.now().minusMinutes(20)));
        saveComment(new Comment(1004L, 104L, 2L, "这个可以做成频道固定帖。", OffsetDateTime.now().minusHours(1)));
    }

    private Set<Long> mutableSet(Long... values) {
        Set<Long> set = ConcurrentHashMap.newKeySet();
        set.addAll(List.of(values));
        return set;
    }
    private void put(Note note) {
        notes.put(note.id(), note);
        noteIds.updateAndGet(value -> Math.max(value, note.id() + 1));
    }
    @Override public List<Note> findAll() {
        return notes.values().stream().sorted(Comparator.comparing(Note::createdAt).reversed()).toList();
    }
    @Override public java.util.Optional<Note> findById(Long id) { return java.util.Optional.ofNullable(notes.get(id)); }
    @Override public Note save(Note note) { notes.put(note.id(), note); return note; }
    @Override public void deleteNote(Long noteId) { notes.remove(noteId); comments.remove(noteId); }
    @Override public List<Comment> findComments(Long noteId) {
        return new ArrayList<>(comments.getOrDefault(noteId, List.of()));
    }
    @Override public Comment saveComment(Comment comment) {
        comments.computeIfAbsent(comment.noteId(), ignored -> new CopyOnWriteArrayList<>()).add(comment);
        commentIds.updateAndGet(value -> Math.max(value, comment.id() + 1));
        return comment;
    }
    @Override public void deleteComment(Long noteId, Long commentId) {
        List<Comment> list = comments.get(noteId);
        if (list != null) list.removeIf(comment -> comment.id().equals(commentId));
    }
    @Override public synchronized Note toggleLike(Long noteId, Long userId) {
        Note old = notes.get(noteId);
        if (old == null) return null;
        boolean removed = old.likedBy().remove(userId);
        if (!removed) old.likedBy().add(userId);
        Note updated = new Note(old.id(), old.authorId(), old.title(), old.content(), old.visibility(), old.imageUrls(), old.tags(),
                Math.max(0, old.likeCount() + (removed ? -1 : 1)), old.commentCount(), old.likedBy(), old.savedBy(), old.createdAt());
        return save(updated);
    }
    @Override public synchronized Note toggleSave(Long noteId, Long userId) {
        Note old = notes.get(noteId);
        if (old == null) return null;
        if (!old.savedBy().remove(userId)) old.savedBy().add(userId);
        return old;
    }
    @Override public long nextNoteId() { return noteIds.getAndIncrement(); }
    @Override public long nextCommentId() { return commentIds.getAndIncrement(); }
    @Override public int countByAuthorId(Long authorId) {
        return (int) notes.values().stream().filter(note -> note.authorId().equals(authorId)).count();
    }
}
