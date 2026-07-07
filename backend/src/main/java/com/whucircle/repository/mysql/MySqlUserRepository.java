package com.whucircle.repository.mysql;

import com.whucircle.domain.Enums.RelationStatus;
import com.whucircle.domain.User;
import com.whucircle.repository.UserRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@Profile("mysql")
public class MySqlUserRepository implements UserRepository {
    private final JdbcClient jdbc;
    private final SimpleJdbcInsert userInsert;

    public MySqlUserRepository(JdbcClient jdbc, DataSource dataSource) {
        this.jdbc = jdbc;
        this.userInsert = new SimpleJdbcInsert(dataSource).withTableName("users")
                .usingColumns("email", "password_hash", "nickname", "avatar_url", "college", "grade", "bio")
                .usingGeneratedKeyColumns("id");
    }

    @Override public Optional<User> findById(Long id) {
        return jdbc.sql("SELECT * FROM users WHERE id=:id").param("id", id).query(this::mapUser).optional();
    }
    @Override public Optional<User> findByEmail(String email) {
        return jdbc.sql("SELECT * FROM users WHERE LOWER(email)=LOWER(:email)").param("email", email).query(this::mapUser).optional();
    }
    @Override public User save(User user) {
        if (user.id() == null) {
            Number id = userInsert.executeAndReturnKey(Map.of(
                    "email", user.email(), "password_hash", user.passwordHash(), "nickname", user.nickname(),
                    "avatar_url", safe(user.avatarUrl()), "college", safe(user.college()),
                    "grade", safe(user.grade()), "bio", safe(user.bio())));
            return findById(id.longValue()).orElseThrow();
        }
        jdbc.sql("""
                UPDATE users SET email=:email,password_hash=:password,nickname=:nickname,avatar_url=:avatar,
                college=:college,grade=:grade,bio=:bio WHERE id=:id
                """).params(Map.of("id", user.id(), "email", user.email(), "password", user.passwordHash(),
                "nickname", user.nickname(), "avatar", safe(user.avatarUrl()), "college", safe(user.college()),
                "grade", safe(user.grade()), "bio", safe(user.bio()))).update();
        return user;
    }
    @Override public List<User> findAll() { return jdbc.sql("SELECT * FROM users ORDER BY id").query(this::mapUser).list(); }
    @Override public RelationStatus relation(Long current, Long target) {
        if (exists("SELECT COUNT(*) FROM user_blocks WHERE blocker_id=:a AND blocked_id=:b", current, target)
                || exists("SELECT COUNT(*) FROM user_blocks WHERE blocker_id=:b AND blocked_id=:a", current, target)) return RelationStatus.BLOCKED;
        boolean outgoing = exists("SELECT COUNT(*) FROM user_follows WHERE follower_id=:a AND followed_id=:b", current, target);
        boolean incoming = exists("SELECT COUNT(*) FROM user_follows WHERE follower_id=:b AND followed_id=:a", current, target);
        if (outgoing && incoming) return RelationStatus.FRIEND;
        if (outgoing) return RelationStatus.FOLLOWING;
        if (incoming) return RelationStatus.FOLLOWER;
        return RelationStatus.NONE;
    }
    @Override public void follow(Long current, Long target) {
        jdbc.sql("INSERT IGNORE INTO user_follows(follower_id,followed_id) VALUES(:a,:b)").params(Map.of("a",current,"b",target)).update();
    }
    @Override public void unfollow(Long current, Long target) {
        jdbc.sql("DELETE FROM user_follows WHERE follower_id=:a AND followed_id=:b").params(Map.of("a",current,"b",target)).update();
    }
    @Override public void block(Long current, Long target) {
        jdbc.sql("INSERT IGNORE INTO user_blocks(blocker_id,blocked_id) VALUES(:a,:b)").params(Map.of("a",current,"b",target)).update();
        unfollow(current, target);
    }
    @Override public void unblock(Long current, Long target) {
        jdbc.sql("DELETE FROM user_blocks WHERE blocker_id=:a AND blocked_id=:b").params(Map.of("a",current,"b",target)).update();
    }
    @Override public boolean isBlockedEitherWay(Long first, Long second) {
        return exists("SELECT COUNT(*) FROM user_blocks WHERE (blocker_id=:a AND blocked_id=:b) OR (blocker_id=:b AND blocked_id=:a)", first, second);
    }
    @Override public List<User> findBlockedUsers(Long current) {
        return jdbc.sql("SELECT u.* FROM users u JOIN user_blocks b ON b.blocked_id=u.id WHERE b.blocker_id=:id ORDER BY u.id")
                .param("id", current).query(this::mapUser).list();
    }
    @Override public int countFollowing(Long id) { return count("SELECT COUNT(*) FROM user_follows WHERE follower_id=:id", id); }
    @Override public int countFollowers(Long id) { return count("SELECT COUNT(*) FROM user_follows WHERE followed_id=:id", id); }

    private User mapUser(java.sql.ResultSet rs, int row) throws java.sql.SQLException {
        return new User(rs.getLong("id"), rs.getString("email"), rs.getString("password_hash"), rs.getString("nickname"),
                rs.getString("avatar_url"), rs.getString("college"), rs.getString("grade"), rs.getString("bio"));
    }
    private boolean exists(String sql, Long a, Long b) {
        return jdbc.sql(sql).params(Map.of("a",a,"b",b)).query(Integer.class).single() > 0;
    }
    private int count(String sql, Long id) { return jdbc.sql(sql).param("id", id).query(Integer.class).single(); }
    private String safe(String value) { return value == null ? "" : value; }
}
