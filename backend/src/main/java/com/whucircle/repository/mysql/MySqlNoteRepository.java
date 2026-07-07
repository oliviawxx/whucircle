package com.whucircle.repository.mysql;

import com.whucircle.domain.Comment;
import com.whucircle.domain.Enums.Visibility;
import com.whucircle.domain.Note;
import com.whucircle.repository.NoteRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@Profile("mysql")
public class MySqlNoteRepository implements NoteRepository {
    private final JdbcClient jdbc;
    public MySqlNoteRepository(JdbcClient jdbc) { this.jdbc = jdbc; }
    @Override public List<Note> findAll() { return jdbc.sql("SELECT id FROM notes ORDER BY created_at DESC").query(Long.class).list().stream().map(this::findRequired).toList(); }
    @Override public Optional<Note> findById(Long id) {
        return jdbc.sql("SELECT * FROM notes WHERE id=:id").param("id",id).query(this::mapBase).optional().map(this::hydrate);
    }
    @Override @Transactional public Note save(Note note) {
        int changed = jdbc.sql("""
                UPDATE notes SET author_id=:author,title=:title,content=:content,visibility=:visibility,
                like_count=:likes,comment_count=:comments WHERE id=:id
                """).params(baseParams(note)).update();
        if (changed == 0) jdbc.sql("""
                INSERT INTO notes(id,author_id,title,content,visibility,like_count,comment_count,created_at)
                VALUES(:id,:author,:title,:content,:visibility,:likes,:comments,:created)
                """).params(insertParams(note)).update();
        jdbc.sql("DELETE FROM note_images WHERE note_id=:id").param("id",note.id()).update();
        for (int i=0;i<note.imageUrls().size();i++) jdbc.sql("INSERT INTO note_images(note_id,image_url,sort_order) VALUES(:id,:url,:sort)")
                .params(Map.of("id",note.id(),"url",note.imageUrls().get(i),"sort",i)).update();
        jdbc.sql("DELETE FROM note_tags WHERE note_id=:id").param("id",note.id()).update();
        note.tags().forEach(tag -> jdbc.sql("INSERT INTO note_tags(note_id,tag) VALUES(:id,:tag)").params(Map.of("id",note.id(),"tag",tag)).update());
        return findRequired(note.id());
    }
    @Override public void deleteNote(Long id) { jdbc.sql("DELETE FROM notes WHERE id=:id").param("id",id).update(); }
    @Override public List<Comment> findComments(Long noteId) {
        return jdbc.sql("SELECT * FROM comments WHERE note_id=:id ORDER BY created_at").param("id",noteId).query((rs,row) ->
                new Comment(rs.getLong("id"),rs.getLong("note_id"),rs.getLong("author_id"),rs.getString("content"),time(rs,"created_at"))).list();
    }
    @Override public Comment saveComment(Comment value) {
        jdbc.sql("INSERT INTO comments(id,note_id,author_id,content,created_at) VALUES(:id,:note,:author,:content,:created)")
                .params(Map.of("id",value.id(),"note",value.noteId(),"author",value.authorId(),"content",value.content(),"created",value.createdAt().toLocalDateTime())).update();
        return value;
    }
    @Override public void deleteComment(Long noteId, Long commentId) {
        int count=jdbc.sql("DELETE FROM comments WHERE note_id=:note AND id=:id").params(Map.of("note",noteId,"id",commentId)).update();
        if(count>0) jdbc.sql("UPDATE notes SET comment_count=GREATEST(comment_count-1,0) WHERE id=:id").param("id",noteId).update();
    }
    @Override @Transactional public Note toggleLike(Long noteId, Long userId) {
        boolean active=jdbc.sql("SELECT COUNT(*) FROM note_likes WHERE note_id=:n AND user_id=:u").params(Map.of("n",noteId,"u",userId)).query(Integer.class).single()>0;
        if(active) jdbc.sql("DELETE FROM note_likes WHERE note_id=:n AND user_id=:u").params(Map.of("n",noteId,"u",userId)).update();
        else jdbc.sql("INSERT INTO note_likes(note_id,user_id) VALUES(:n,:u)").params(Map.of("n",noteId,"u",userId)).update();
        jdbc.sql("UPDATE notes SET like_count=(SELECT COUNT(*) FROM note_likes WHERE note_id=:id) WHERE id=:id").param("id",noteId).update();
        return findRequired(noteId);
    }
    @Override public Note toggleSave(Long noteId, Long userId) {
        boolean active=jdbc.sql("SELECT COUNT(*) FROM note_saves WHERE note_id=:n AND user_id=:u").params(Map.of("n",noteId,"u",userId)).query(Integer.class).single()>0;
        if(active) jdbc.sql("DELETE FROM note_saves WHERE note_id=:n AND user_id=:u").params(Map.of("n",noteId,"u",userId)).update();
        else jdbc.sql("INSERT INTO note_saves(note_id,user_id) VALUES(:n,:u)").params(Map.of("n",noteId,"u",userId)).update();
        return findRequired(noteId);
    }
    @Override public int countByAuthorId(Long id) { return jdbc.sql("SELECT COUNT(*) FROM notes WHERE author_id=:id").param("id",id).query(Integer.class).single(); }
    @Override public long nextNoteId() { return next("notes"); }
    @Override public long nextCommentId() { return next("comments"); }

    private Note mapBase(ResultSet rs,int row)throws SQLException { return new Note(rs.getLong("id"),rs.getLong("author_id"),rs.getString("title"),rs.getString("content"),
            Visibility.valueOf(rs.getString("visibility")),List.of(),List.of(),rs.getInt("like_count"),rs.getInt("comment_count"),Set.of(),Set.of(),time(rs,"created_at")); }
    private Note hydrate(Note n) { return new Note(n.id(),n.authorId(),n.title(),n.content(),n.visibility(),
            jdbc.sql("SELECT image_url FROM note_images WHERE note_id=:id ORDER BY sort_order").param("id",n.id()).query(String.class).list(),
            jdbc.sql("SELECT tag FROM note_tags WHERE note_id=:id ORDER BY tag").param("id",n.id()).query(String.class).list(),n.likeCount(),n.commentCount(),
            ids("note_likes","note_id",n.id()),ids("note_saves","note_id",n.id()),n.createdAt()); }
    private Set<Long> ids(String table,String column,Long id){Set<Long>s=ConcurrentHashMap.newKeySet();s.addAll(jdbc.sql("SELECT user_id FROM "+table+" WHERE "+column+"=:id").param("id",id).query(Long.class).list());return s;}
    private Note findRequired(Long id){return findById(id).orElseThrow();}
    private long next(String table){return jdbc.sql("SELECT COALESCE(MAX(id),0)+1 FROM "+table).query(Long.class).single();}
    private OffsetDateTime time(ResultSet rs,String col)throws SQLException{return rs.getTimestamp(col).toLocalDateTime().atOffset(ZoneOffset.ofHours(8));}
    private Map<String,Object> baseParams(Note n){return Map.of("id",n.id(),"author",n.authorId(),"title",n.title(),"content",n.content(),"visibility",n.visibility().name(),"likes",n.likeCount(),"comments",n.commentCount());}
    private Map<String,Object> insertParams(Note n){var m=new java.util.HashMap<>(baseParams(n));m.put("created",n.createdAt().toLocalDateTime());return m;}
}
