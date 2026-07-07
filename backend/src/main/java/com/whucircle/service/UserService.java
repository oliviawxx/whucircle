package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.domain.Enums.RelationStatus;
import com.whucircle.domain.User;
import com.whucircle.dto.UserDtos.RelationResult;
import com.whucircle.dto.UserDtos.RelationView;
import com.whucircle.dto.UserDtos.UserProfile;
import com.whucircle.dto.UserDtos.CurrentUserProfile;
import com.whucircle.dto.UserDtos.UpdateProfileRequest;
import com.whucircle.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository users;

    public UserService(UserRepository users) { this.users = users; }

    public List<RelationView> relations(Long currentUserId) {
        return users.findAll().stream().filter(user -> !user.id().equals(currentUserId))
                .map(user -> new RelationView(user.id(), user.nickname(), user.avatarUrl(), users.relation(currentUserId, user.id())))
                .toList();
    }

    public UserProfile profile(Long currentUserId, Long targetUserId) {
        if (users.isBlockedEitherWay(currentUserId, targetUserId)) throw new BusinessException(ErrorCode.FORBIDDEN, "拉黑关系下不能查看主页");
        User user = requireUser(targetUserId);
        return new UserProfile(user.id(), user.nickname(), user.avatarUrl(), user.college(), user.grade(),
                user.bio(), users.relation(currentUserId, targetUserId));
    }

    public CurrentUserProfile currentProfile(Long currentUserId) {
        return toCurrentProfile(requireUser(currentUserId));
    }

    public CurrentUserProfile updateCurrentProfile(Long currentUserId, UpdateProfileRequest request) {
        User existing = requireUser(currentUserId);
        User updated = new User(existing.id(), existing.email(), existing.passwordHash(), request.nickname().trim(),
                normalize(request.avatarUrl()), normalize(request.college()), normalize(request.grade()), normalize(request.bio()));
        return toCurrentProfile(users.save(updated));
    }

    public RelationResult follow(Long currentUserId, Long targetUserId) {
        validateTarget(currentUserId, targetUserId);
        if (users.relation(currentUserId, targetUserId) == RelationStatus.BLOCKED) throw new BusinessException(ErrorCode.CONFLICT, "请先解除拉黑");
        users.follow(currentUserId, targetUserId);
        return new RelationResult(users.relation(currentUserId, targetUserId));
    }

    public RelationResult unfollow(Long currentUserId, Long targetUserId) {
        validateTarget(currentUserId, targetUserId);
        users.unfollow(currentUserId, targetUserId);
        return new RelationResult(users.relation(currentUserId, targetUserId));
    }

    public RelationResult block(Long currentUserId, Long targetUserId) {
        validateTarget(currentUserId, targetUserId);
        users.block(currentUserId, targetUserId);
        return new RelationResult(RelationStatus.BLOCKED);
    }

    public void unblock(Long currentUserId, Long targetUserId) {
        requireUser(targetUserId);
        users.unblock(currentUserId, targetUserId);
    }

    public List<UserProfile> blockedUsers(Long currentUserId) {
        return users.findBlockedUsers(currentUserId).stream()
                .map(user -> new UserProfile(user.id(), user.nickname(), user.avatarUrl(), user.college(), user.grade(),
                        user.bio(), RelationStatus.BLOCKED))
                .toList();
    }

    private void validateTarget(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) throw new BusinessException(ErrorCode.BAD_REQUEST, "不能对自己执行该操作");
        requireUser(targetUserId);
    }
    private User requireUser(Long id) { return users.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "用户不存在")); }
    private CurrentUserProfile toCurrentProfile(User user) {
        return new CurrentUserProfile(user.id(), user.email(), user.nickname(), user.avatarUrl(),
                user.college(), user.grade(), user.bio());
    }
    private String normalize(String value) { return value == null ? "" : value.trim(); }
}
