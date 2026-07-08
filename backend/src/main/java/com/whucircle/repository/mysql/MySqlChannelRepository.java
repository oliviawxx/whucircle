package com.whucircle.repository.mysql;

import com.whucircle.domain.Channel;
import com.whucircle.domain.ChannelAdminRequest;
import com.whucircle.domain.ChannelPost;
import com.whucircle.domain.ChannelReply;
import com.whucircle.domain.Enums.JoinType;
import com.whucircle.domain.Enums.ChannelStatus;
import com.whucircle.repository.ChannelRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Repository
@Profile("mysql")
public class MySqlChannelRepository implements ChannelRepository {
    private static final ZoneOffset OFFSET = ZoneOffset.ofHours(8);
    private final JdbcClient jdbc;

    public MySqlChannelRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    @PostConstruct
    void ensureAdminRequestTable() {
        jdbc.sql("""
                CREATE TABLE IF NOT EXISTS channel_admin_requests (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    channel_id BIGINT NOT NULL,
                    requester_id BIGINT NOT NULL,
                    inviter_id BIGINT NULL,
                    type VARCHAR(20) NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                    CONSTRAINT fk_channel_admin_request_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
                    CONSTRAINT fk_channel_admin_request_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
                    CONSTRAINT fk_channel_admin_request_inviter FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE SET NULL,
                    CONSTRAINT chk_channel_admin_request_type CHECK (type IN ('APPLY', 'INVITE')),
                    CONSTRAINT chk_channel_admin_request_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ACCEPTED', 'DECLINED')),
                    INDEX idx_channel_admin_request_channel_status (channel_id, status, created_at),
                    INDEX idx_channel_admin_request_requester_status (requester_id, status, created_at)
                ) ENGINE=InnoDB
                """).update();
    }

    @Override public List<Channel> findAll() { return jdbc.sql("SELECT * FROM channels ORDER BY id").query(this::mapChannel).list(); }
    @Override public Optional<Channel> findById(Long id) { return jdbc.sql("SELECT * FROM channels WHERE id=:id").param("id", id).query(this::mapChannel).optional(); }
    @Override @Transactional public Channel save(Channel c) {
        jdbc.sql("""
                INSERT INTO channels(id,name,join_type,password_hash,administrator_id,announcement,member_count,status)
                VALUES(:id,:name,:type,:password,:admin,:announcement,:count,:status)
                ON DUPLICATE KEY UPDATE name=VALUES(name),join_type=VALUES(join_type),password_hash=VALUES(password_hash),announcement=VALUES(announcement),member_count=VALUES(member_count),status=VALUES(status)
                """).params(Map.of("id",c.id(),"name",c.name(),"type",c.joinType().name(),"password",c.password()==null?"":c.password(),"admin",c.administratorId(),"announcement",c.announcement(),"count",c.memberCount(),"status",c.status().name())).update();
        for (Long userId : c.memberIds()) jdbc.sql("INSERT IGNORE INTO channel_members(channel_id,user_id,role) VALUES(:channel,:user,:role)").params(Map.of("channel",c.id(),"user",userId,"role",userId.equals(c.administratorId())?"ADMIN":"MEMBER")).update();
        return findById(c.id()).orElseThrow();
    }
    @Override @Transactional public Channel addMember(Long channelId, Long userId) {
        int added=jdbc.sql("INSERT IGNORE INTO channel_members(channel_id,user_id,role) VALUES(:channel,:user,'MEMBER')").params(Map.of("channel",channelId,"user",userId)).update();
        if(added>0) jdbc.sql("UPDATE channels SET member_count=member_count+1 WHERE id=:id").param("id",channelId).update();
        return findById(channelId).orElse(null);
    }
    @Override public Optional<String> findMemberRole(Long channelId, Long userId) {
        return jdbc.sql("SELECT role FROM channel_members WHERE channel_id=:channel AND user_id=:user")
                .params(Map.of("channel", channelId, "user", userId)).query(String.class).optional();
    }
    @Override public void setMemberRole(Long channelId, Long userId, String role) {
        jdbc.sql("""
                INSERT INTO channel_members(channel_id,user_id,role) VALUES(:channel,:user,:role)
                ON DUPLICATE KEY UPDATE role=VALUES(role)
                """).params(Map.of("channel", channelId, "user", userId, "role", role)).update();
    }
    @Override public List<ChannelAdminRequest> findAdminRequests(Long channelId) {
        return jdbc.sql("SELECT * FROM channel_admin_requests WHERE channel_id=:channel ORDER BY created_at DESC")
                .param("channel", channelId).query(this::mapAdminRequest).list();
    }
    @Override public List<ChannelAdminRequest> findAdminRequestsByUser(Long userId) {
        return jdbc.sql("SELECT * FROM channel_admin_requests WHERE requester_id=:user ORDER BY created_at DESC")
                .param("user", userId).query(this::mapAdminRequest).list();
    }
    @Override public Optional<ChannelAdminRequest> findAdminRequestById(Long requestId) {
        return jdbc.sql("SELECT * FROM channel_admin_requests WHERE id=:id")
                .param("id", requestId).query(this::mapAdminRequest).optional();
    }
    @Override public Optional<ChannelAdminRequest> findPendingAdminRequest(Long channelId, Long requesterId, String type) {
        return jdbc.sql("""
                SELECT * FROM channel_admin_requests
                WHERE channel_id=:channel AND requester_id=:requester AND type=:type AND status='PENDING'
                ORDER BY created_at DESC LIMIT 1
                """).params(Map.of("channel", channelId, "requester", requesterId, "type", type))
                .query(this::mapAdminRequest).optional();
    }
    @Override public ChannelAdminRequest saveAdminRequest(ChannelAdminRequest r) {
        Map<String, Object> params = new HashMap<>();
        params.put("id", r.id());
        params.put("channel", r.channelId());
        params.put("requester", r.requesterId());
        params.put("inviter", r.inviterId());
        params.put("type", r.type());
        params.put("status", r.status());
        params.put("created", r.createdAt().toLocalDateTime());
        params.put("updated", r.updatedAt().toLocalDateTime());
        jdbc.sql("""
                INSERT INTO channel_admin_requests(id,channel_id,requester_id,inviter_id,type,status,created_at,updated_at)
                VALUES(:id,:channel,:requester,:inviter,:type,:status,:created,:updated)
                ON DUPLICATE KEY UPDATE requester_id=VALUES(requester_id),inviter_id=VALUES(inviter_id),
                    type=VALUES(type),status=VALUES(status),updated_at=VALUES(updated_at)
                """).params(params).update();
        return findAdminRequestById(r.id()).orElseThrow();
    }
    @Override public List<ChannelPost> findPosts(Long channelId) { return jdbc.sql("SELECT * FROM channel_posts WHERE channel_id=:id ORDER BY pinned DESC,created_at DESC").param("id",channelId).query(this::mapPost).list(); }
    @Override public Optional<ChannelPost> findPostById(Long id) { return jdbc.sql("SELECT * FROM channel_posts WHERE id=:id").param("id",id).query(this::mapPost).optional(); }
    @Override public ChannelPost savePost(ChannelPost p) {
        jdbc.sql("""
                INSERT INTO channel_posts(id,channel_id,author_id,title,content,pinned,like_count,reply_count,created_at)
                VALUES(:id,:channel,:author,:title,:content,:pinned,:likes,:replies,:created)
                ON DUPLICATE KEY UPDATE title=VALUES(title),content=VALUES(content),pinned=VALUES(pinned),like_count=VALUES(like_count),reply_count=VALUES(reply_count)
                """).params(Map.of("id",p.id(),"channel",p.channelId(),"author",p.authorId(),"title",p.title(),"content",p.content(),"pinned",p.pinned(),"likes",p.likeCount(),"replies",p.replyCount(),"created",p.createdAt().toLocalDateTime())).update();
        return findPostById(p.id()).orElseThrow();
    }
    @Override public void deletePost(Long postId) { jdbc.sql("DELETE FROM channel_posts WHERE id=:id").param("id",postId).update(); }
    @Override @Transactional public ChannelPost togglePostLike(Long postId, Long userId) {
        int removed=jdbc.sql("DELETE FROM channel_post_likes WHERE post_id=:post AND user_id=:user").params(Map.of("post",postId,"user",userId)).update();
        int delta=-1;
        if(removed==0){jdbc.sql("INSERT INTO channel_post_likes(post_id,user_id) VALUES(:post,:user)").params(Map.of("post",postId,"user",userId)).update();delta=1;}
        jdbc.sql("UPDATE channel_posts SET like_count=GREATEST(0,like_count+:delta) WHERE id=:id").params(Map.of("delta",delta,"id",postId)).update();
        return findPostById(postId).orElse(null);
    }
    @Override public List<ChannelReply> findReplies(Long postId) { return jdbc.sql("SELECT * FROM channel_replies WHERE post_id=:id ORDER BY created_at").param("id",postId).query((rs,n)->new ChannelReply(rs.getLong("id"),rs.getLong("post_id"),rs.getLong("author_id"),rs.getString("content"),rs.getTimestamp("created_at").toLocalDateTime().atOffset(OFFSET))).list(); }
    @Override public ChannelReply saveReply(ChannelReply r) { jdbc.sql("INSERT INTO channel_replies(id,post_id,author_id,content,created_at) VALUES(:id,:post,:author,:content,:created)").params(Map.of("id",r.id(),"post",r.postId(),"author",r.authorId(),"content",r.content(),"created",r.createdAt().toLocalDateTime())).update();return r; }
    @Override public long nextChannelId(){return next("channels");}
    @Override public long nextAdminRequestId(){return next("channel_admin_requests");}
    @Override public long nextPostId(){return next("channel_posts");}
    @Override public long nextReplyId(){return next("channel_replies");}
    private long next(String table){return jdbc.sql("SELECT COALESCE(MAX(id),0)+1 FROM "+table).query(Long.class).single();}
    private Channel mapChannel(java.sql.ResultSet rs,int row)throws java.sql.SQLException{return new Channel(rs.getLong("id"),rs.getString("name"),JoinType.valueOf(rs.getString("join_type")),rs.getString("password_hash"),rs.getInt("member_count"),rs.getLong("administrator_id"),rs.getString("announcement"),members(rs.getLong("id")),ChannelStatus.valueOf(rs.getString("status")));}
    private ChannelAdminRequest mapAdminRequest(java.sql.ResultSet rs,int row)throws java.sql.SQLException{return new ChannelAdminRequest(rs.getLong("id"),rs.getLong("channel_id"),rs.getLong("requester_id"),(Long)rs.getObject("inviter_id"),rs.getString("type"),rs.getString("status"),rs.getTimestamp("created_at").toLocalDateTime().atOffset(OFFSET),rs.getTimestamp("updated_at").toLocalDateTime().atOffset(OFFSET));}
    private ChannelPost mapPost(java.sql.ResultSet rs,int row)throws java.sql.SQLException{long id=rs.getLong("id");return new ChannelPost(id,rs.getLong("channel_id"),rs.getLong("author_id"),rs.getString("title"),rs.getString("content"),rs.getBoolean("pinned"),rs.getInt("like_count"),rs.getInt("reply_count"),likes(id),rs.getTimestamp("created_at").toLocalDateTime().atOffset(OFFSET));}
    private Set<Long> members(Long id){return new HashSet<>(jdbc.sql("SELECT user_id FROM channel_members WHERE channel_id=:id").param("id",id).query(Long.class).list());}
    private Set<Long> likes(Long id){return new HashSet<>(jdbc.sql("SELECT user_id FROM channel_post_likes WHERE post_id=:id").param("id",id).query(Long.class).list());}
}
