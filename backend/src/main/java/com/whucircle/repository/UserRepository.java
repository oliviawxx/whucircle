package com.whucircle.repository;

import com.whucircle.domain.Enums.RelationStatus;
import com.whucircle.domain.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    User save(User user);
    List<User> findAll();
    RelationStatus relation(Long currentUserId, Long targetUserId);
    void follow(Long currentUserId, Long targetUserId);
    void unfollow(Long currentUserId, Long targetUserId);
    void block(Long currentUserId, Long targetUserId);
    void unblock(Long currentUserId, Long targetUserId);
    boolean isBlockedEitherWay(Long firstUserId, Long secondUserId);
    List<User> findBlockedUsers(Long currentUserId);
}
