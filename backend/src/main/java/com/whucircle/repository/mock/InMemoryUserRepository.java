package com.whucircle.repository.mock;

import com.whucircle.domain.Enums.RelationStatus;
import com.whucircle.domain.User;
import com.whucircle.repository.UserRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile("mock")
public class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> users = new ConcurrentHashMap<>();
    private final Map<Long, Set<Long>> following = new ConcurrentHashMap<>();
    private final Map<Long, Set<Long>> blocks = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong(10);

    public InMemoryUserRepository(PasswordEncoder passwordEncoder) {
        saveSeed(new User(1L, "student@whu.edu.cn", passwordEncoder.encode("example123"), "小张",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
                "新闻与传播学院", "2024级", "记录校园生活和课程项目。"));
        saveSeed(new User(2L, "wind@whu.edu.cn", passwordEncoder.encode("example123"), "珞珈山下的风",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
                "计算机学院", "2023级", "喜欢散步和摄影。"));
        saveSeed(new User(3L, "cat@whu.edu.cn", passwordEncoder.encode("example123"), "东湖边的猫",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
                "外国语言文学学院", "2024级", "寻找学习搭子。"));
        saveSeed(new User(4L, "orange@whu.edu.cn", passwordEncoder.encode("example123"), "一只小橘子",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
                "测绘学院", "2022级", "周末出行记录。"));
        saveSeed(new User(5L, "noodle@whu.edu.cn", passwordEncoder.encode("example123"), "热干面观察员",
                "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80",
                "经济与管理学院", "2023级", "认真吃饭，认真记录。"));
        saveSeed(new User(6L, "lin@whu.edu.cn", passwordEncoder.encode("example123"), "林深时见鹿", "", "文学院", "2024级", ""));

        follow(1L, 2L);
        follow(2L, 1L);
        follow(1L, 3L);
        follow(1L, 5L);
        follow(5L, 1L);
        follow(6L, 1L);
        follow(1L, 6L);
    }

    private void saveSeed(User user) {
        users.put(user.id(), user);
        ids.updateAndGet(value -> Math.max(value, user.id() + 1));
    }

    @Override public Optional<User> findById(Long id) { return Optional.ofNullable(users.get(id)); }
    @Override public Optional<User> findByEmail(String email) {
        return users.values().stream().filter(user -> user.email().equalsIgnoreCase(email)).findFirst();
    }
    @Override public User save(User user) {
        User saved = user.id() == null
                ? new User(ids.getAndIncrement(), user.email(), user.passwordHash(), user.nickname(), user.avatarUrl(), user.college(), user.grade(), user.bio())
                : user;
        users.put(saved.id(), saved);
        return saved;
    }
    @Override public List<User> findAll() {
        return users.values().stream().sorted(Comparator.comparing(User::id)).toList();
    }

    @Override
    public RelationStatus relation(Long currentUserId, Long targetUserId) {
        if (blocks.getOrDefault(currentUserId, Set.of()).contains(targetUserId)) return RelationStatus.BLOCKED;
        boolean outgoing = following.getOrDefault(currentUserId, Set.of()).contains(targetUserId);
        boolean incoming = following.getOrDefault(targetUserId, Set.of()).contains(currentUserId);
        if (outgoing && incoming) return RelationStatus.FRIEND;
        if (outgoing) return RelationStatus.FOLLOWING;
        if (incoming) return RelationStatus.FOLLOWER;
        return RelationStatus.NONE;
    }

    @Override public void follow(Long currentUserId, Long targetUserId) {
        following.computeIfAbsent(currentUserId, ignored -> ConcurrentHashMap.newKeySet()).add(targetUserId);
    }
    @Override public void unfollow(Long currentUserId, Long targetUserId) {
        following.computeIfAbsent(currentUserId, ignored -> ConcurrentHashMap.newKeySet()).remove(targetUserId);
    }
    @Override public void block(Long currentUserId, Long targetUserId) {
        blocks.computeIfAbsent(currentUserId, ignored -> ConcurrentHashMap.newKeySet()).add(targetUserId);
        unfollow(currentUserId, targetUserId);
    }
    @Override public void unblock(Long currentUserId, Long targetUserId) {
        blocks.computeIfAbsent(currentUserId, ignored -> ConcurrentHashMap.newKeySet()).remove(targetUserId);
    }
    @Override public boolean isBlockedEitherWay(Long firstUserId, Long secondUserId) {
        return blocks.getOrDefault(firstUserId, Set.of()).contains(secondUserId)
                || blocks.getOrDefault(secondUserId, Set.of()).contains(firstUserId);
    }
    @Override public List<User> findBlockedUsers(Long currentUserId) {
        List<User> result = new ArrayList<>();
        for (Long id : blocks.getOrDefault(currentUserId, Set.of())) findById(id).ifPresent(result::add);
        return result;
    }
}
