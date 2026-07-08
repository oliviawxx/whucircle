package com.whucircle.repository.mysql;

import com.whucircle.domain.ChatMessage;
import com.whucircle.domain.Conversation;
import com.whucircle.domain.Enums.ConversationType;
import com.whucircle.repository.ChatRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Repository
@Profile("mysql")
public class MySqlChatRepository implements ChatRepository {
    private static final ZoneOffset OFFSET=ZoneOffset.ofHours(8);
    private final JdbcClient jdbc;
    public MySqlChatRepository(JdbcClient jdbc){this.jdbc=jdbc;}
    @Override public List<Conversation> findByMember(Long userId){return jdbc.sql("SELECT c.* FROM conversations c JOIN conversation_members m ON m.conversation_id=c.id WHERE m.user_id=:id ORDER BY c.last_message_at DESC").param("id",userId).query(this::mapConversation).list();}
    @Override public Optional<Conversation> findConversationById(Long id){return jdbc.sql("SELECT * FROM conversations WHERE id=:id").param("id",id).query(this::mapConversation).optional();}
    @Override public Optional<Conversation> findPrivateConversation(Long firstUserId, Long secondUserId){return jdbc.sql("""
            SELECT c.* FROM conversations c
            JOIN conversation_members m1 ON m1.conversation_id=c.id AND m1.user_id=:first
            JOIN conversation_members m2 ON m2.conversation_id=c.id AND m2.user_id=:second
            WHERE c.type='PRIVATE'
              AND (SELECT COUNT(*) FROM conversation_members cm WHERE cm.conversation_id=c.id)=2
            LIMIT 1
            """).params(Map.of("first",firstUserId,"second",secondUserId)).query(this::mapConversation).optional();}
    @Override @Transactional public Conversation saveConversation(Conversation c){jdbc.sql("INSERT INTO conversations(id,type,name,last_message,last_message_at) VALUES(:id,:type,:name,:message,:at) ON DUPLICATE KEY UPDATE name=VALUES(name),last_message=VALUES(last_message),last_message_at=VALUES(last_message_at)").params(Map.of("id",c.id(),"type",c.type().name(),"name",c.name(),"message",c.lastMessage(),"at",c.lastMessageAt().toLocalDateTime())).update();for(Long user:c.memberIds())jdbc.sql("INSERT IGNORE INTO conversation_members(conversation_id,user_id) VALUES(:conversation,:user)").params(Map.of("conversation",c.id(),"user",user)).update();return findConversationById(c.id()).orElseThrow();}
    @Override public List<ChatMessage> findMessages(Long id){return jdbc.sql("SELECT * FROM messages WHERE conversation_id=:id ORDER BY sent_at").param("id",id).query(this::mapMessage).list();}
    @Override @Transactional public ChatMessage saveMessage(ChatMessage m){jdbc.sql("INSERT INTO messages(id,conversation_id,sender_id,content,sent_at) VALUES(:id,:conversation,:sender,:content,:at)").params(Map.of("id",m.id(),"conversation",m.conversationId(),"sender",m.senderId(),"content",m.content(),"at",m.sentAt().toLocalDateTime())).update();for(Long user:m.readBy())jdbc.sql("INSERT IGNORE INTO message_read_status(message_id,user_id) VALUES(:message,:user)").params(Map.of("message",m.id(),"user",user)).update();jdbc.sql("UPDATE conversations SET last_message=:content,last_message_at=:at WHERE id=:id").params(Map.of("content",m.content(),"at",m.sentAt().toLocalDateTime(),"id",m.conversationId())).update();return m;}
    @Override public void markRead(Long conversationId,Long userId){jdbc.sql("INSERT IGNORE INTO message_read_status(message_id,user_id) SELECT id,:user FROM messages WHERE conversation_id=:conversation").params(Map.of("user",userId,"conversation",conversationId)).update();}
    @Override public long nextConversationId(){return next("conversations");}
    @Override public long nextMessageId(){return next("messages");}
    private long next(String table){return jdbc.sql("SELECT COALESCE(MAX(id),0)+1 FROM "+table).query(Long.class).single();}
    private Conversation mapConversation(java.sql.ResultSet rs,int row)throws java.sql.SQLException{long id=rs.getLong("id");return new Conversation(id,ConversationType.valueOf(rs.getString("type")),rs.getString("name"),members(id),rs.getString("last_message"),rs.getTimestamp("last_message_at").toLocalDateTime().atOffset(OFFSET));}
    private ChatMessage mapMessage(java.sql.ResultSet rs,int row)throws java.sql.SQLException{long id=rs.getLong("id");return new ChatMessage(id,rs.getLong("conversation_id"),rs.getLong("sender_id"),rs.getString("content"),rs.getTimestamp("sent_at").toLocalDateTime().atOffset(OFFSET),readers(id));}
    private Set<Long> members(Long id){return new HashSet<>(jdbc.sql("SELECT user_id FROM conversation_members WHERE conversation_id=:id").param("id",id).query(Long.class).list());}
    private Set<Long> readers(Long id){return new HashSet<>(jdbc.sql("SELECT user_id FROM message_read_status WHERE message_id=:id").param("id",id).query(Long.class).list());}
}
