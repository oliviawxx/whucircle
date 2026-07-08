package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.domain.Enums.RelationStatus;
import com.whucircle.domain.PrivacySettings;
import com.whucircle.domain.User;
import com.whucircle.dto.UserDtos.CurrentUserProfile;
import com.whucircle.dto.UserDtos.RelationResult;
import com.whucircle.dto.UserDtos.RelationView;
import com.whucircle.dto.UserDtos.UpdateProfileRequest;
import com.whucircle.dto.UserDtos.UserProfile;
import com.whucircle.repository.NoteRepository;
import com.whucircle.repository.SettingsRepository;
import com.whucircle.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository users;
    private final NoteRepository notes;
    private final SettingsRepository settings;

    public UserService(UserRepository users, NoteRepository notes, SettingsRepository settings) {
        this.users = users;
        this.notes = notes;
        this.settings = settings;
    }

    public List<RelationView> relations(Long currentUserId) {
        return users.findAll().stream().filter(user -> !user.id().equals(currentUserId))
                .map(user -> new RelationView(user.id(), user.nickname(), user.avatarUrl(), users.relation(currentUserId, user.id())))
                .toList();
    }

    public UserProfile profile(Long currentUserId, Long targetUserId) {
        if (users.isBlockedEitherWay(currentUserId, targetUserId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "拉黑关系下不能查看主页");
        }
        User user = requireUser(targetUserId);
        return toPublicProfile(currentUserId, user);
    }

    public List<UserProfile> search(Long currentUserId, String keyword) {
        String query = normalize(keyword).toLowerCase();
        if (query.isBlank()) return List.of();
        return users.findAll().stream()
                .filter(user -> !user.id().equals(currentUserId))
                .filter(user -> !users.isBlockedEitherWay(currentUserId, user.id()))
                .filter(user -> settings.findPrivacy(user.id()).searchableByUsers())
                .filter(user -> searchableText(user).contains(query))
                .limit(20)
                .map(user -> toPublicProfile(currentUserId, user))
                .toList();
    }

    public CurrentUserProfile currentProfile(Long currentUserId) {
        return toCurrentProfile(requireUser(currentUserId));
    }

    public CurrentUserProfile updateCurrentProfile(Long currentUserId, UpdateProfileRequest request) {
        User existing = requireUser(currentUserId);
        User updated = new User(existing.id(), existing.email(), existing.passwordHash(), request.nickname().trim(),
                normalize(request.avatarUrl()), normalize(request.college()), normalize(request.grade()), normalize(request.bio()),
                existing.role(), existing.status());
        return toCurrentProfile(users.save(updated));
    }

    public RelationResult follow(Long currentUserId, Long targetUserId) {
        validateTarget(currentUserId, targetUserId);
        if (users.relation(currentUserId, targetUserId) == RelationStatus.BLOCKED) {
            throw new BusinessException(ErrorCode.CONFLICT, "请先解除拉黑");
        }
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
                .map(user -> new UserProfile(user.id(), null, user.nickname(), user.avatarUrl(), user.college(), user.grade(),
                        user.bio(), RelationStatus.BLOCKED, user.role(), user.status()))
                .toList();
    }

    private void validateTarget(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) throw new BusinessException(ErrorCode.BAD_REQUEST, "不能对自己执行该操作");
        requireUser(targetUserId);
    }

    private User requireUser(Long id) {
        return users.findById(id).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "用户不存在"));
    }

    private UserProfile toPublicProfile(Long currentUserId, User user) {
        PrivacySettings privacy = settings.findPrivacy(user.id());
        return new UserProfile(user.id(), privacy.showEmailOnProfile() ? user.email() : null,
                user.nickname(), user.avatarUrl(), user.college(), user.grade(), user.bio(),
                users.relation(currentUserId, user.id()), user.role(), user.status());
    }

    private String searchableText(User user) {
        return String.join(" ", normalize(user.nickname()), normalize(user.college()), normalize(user.grade()), normalize(user.bio())).toLowerCase();
    }

    private CurrentUserProfile toCurrentProfile(User user) {
        int noteCount = notes.countByAuthorId(user.id());
        int followingCount = users.countFollowing(user.id());
        int followerCount = users.countFollowers(user.id());
        int friendCount = (int) users.findAll().stream()
                .filter(other -> !other.id().equals(user.id()))
                .filter(other -> users.relation(user.id(), other.id()) == RelationStatus.FRIEND)
                .count();
        return new CurrentUserProfile(user.id(), user.email(), user.nickname(), user.avatarUrl(),
                user.college(), user.grade(), user.bio(), noteCount, followingCount, followerCount, friendCount,
                user.role(), user.status());
    }

    private String normalize(String value) { return value == null ? "" : value.trim(); }
}
