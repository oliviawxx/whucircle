package com.whucircle.repository.mysql;

import com.whucircle.domain.Notification;
import com.whucircle.repository.NotificationRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@Profile("mysql")
public class MySqlNotificationRepository implements NotificationRepository {
    private final JdbcClient jdbc;
    public MySqlNotificationRepository(JdbcClient jdbc){this.jdbc=jdbc;}
    @Override public List<Notification> findByUserId(Long id){return jdbc.sql("SELECT * FROM notifications WHERE user_id=:id ORDER BY created_at DESC").param("id",id).query(this::map).list();}
    @Override public Optional<Notification> findById(Long id){return jdbc.sql("SELECT * FROM notifications WHERE id=:id").param("id",id).query(this::map).optional();}
    @Override public Notification save(Notification n){jdbc.sql("""
            INSERT INTO notifications(id,user_id,type,title,content,target_id,is_read,created_at) VALUES(:id,:user,:type,:title,:content,:target,:read,:created)
            ON DUPLICATE KEY UPDATE type=VALUES(type),title=VALUES(title),content=VALUES(content),target_id=VALUES(target_id),is_read=VALUES(is_read)
            """).params(Map.of("id",n.id(),"user",n.userId(),"type",n.type(),"title",n.title(),"content",n.content(),"target",n.targetId()==null?0:n.targetId(),"read",n.read(),"created",n.createdAt().toLocalDateTime())).update();return n;}
    @Override public void markAllRead(Long id){jdbc.sql("UPDATE notifications SET is_read=TRUE WHERE user_id=:id").param("id",id).update();}
    @Override public long nextId(){return jdbc.sql("SELECT COALESCE(MAX(id),0)+1 FROM notifications").query(Long.class).single();}
    private Notification map(java.sql.ResultSet rs,int row)throws java.sql.SQLException{return new Notification(rs.getLong("id"),rs.getLong("user_id"),rs.getString("type"),rs.getString("title"),rs.getString("content"),(Long)rs.getObject("target_id"),rs.getBoolean("is_read"),rs.getTimestamp("created_at").toLocalDateTime().atOffset(ZoneOffset.ofHours(8)));}
}
