package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.common.PageData;
import com.whucircle.domain.Channel;
import com.whucircle.domain.Enums.JoinType;
import com.whucircle.domain.Enums.RelationStatus;
import com.whucircle.domain.Enums.Visibility;
import com.whucircle.domain.Note;
import com.whucircle.domain.User;
import com.whucircle.dto.RecommendationDtos.RecommendationCardView;
import com.whucircle.dto.RecommendationDtos.RecommendationFeedbackRequest;
import com.whucircle.dto.RecommendationDtos.RecommendationFeedbackResponse;
import com.whucircle.repository.ChannelRepository;
import com.whucircle.repository.NoteRepository;
import com.whucircle.repository.SettingsRepository;
import com.whucircle.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.core.env.Environment;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class RecommendationService {
    private final UserRepository users;
    private final NoteRepository notes;
    private final ChannelRepository channels;
    private final SettingsRepository settings;
    private final AtomicLong feedbackIds = new AtomicLong(10000);
    private final JdbcClient jdbc;
    private final boolean mysql;

    public RecommendationService(UserRepository users, NoteRepository notes, ChannelRepository channels, SettingsRepository settings, ObjectProvider<JdbcClient> jdbc, Environment environment) {
        this.users = users;
        this.notes = notes;
        this.channels = channels;
        this.settings = settings;
        this.jdbc=jdbc.getIfAvailable();
        this.mysql=java.util.Arrays.asList(environment.getActiveProfiles()).contains("mysql");
    }

    public PageData<RecommendationCardView> home(Long currentUserId, int page, int size) {
        List<RecommendationCardView> result = new ArrayList<>();
        result.addAll(limit(notes(currentUserId, 1, 5).items(), 4));
        result.addAll(limit(users(currentUserId, 1, 5).items(), 4));
        result.addAll(limit(channels(currentUserId, 1, 5).items(), 4));
        result.sort(Comparator.comparingDouble(RecommendationCardView::score).reversed());
        return PageData.of(result, page, size);
    }

    public PageData<RecommendationCardView> notes(Long currentUserId, int page, int size) {
        User currentUser = requireUser(currentUserId);
        boolean personalized = settings.findPrivacy(currentUserId).personalizedRecommendations();
        Set<String> interestTags = personalized ? interestTags(currentUserId) : Set.of();
        List<RecommendationCardView> result = notes.findAll().stream()
                .filter(note -> canRecommendNote(currentUserId, note))
                .map(note -> toNoteCard(currentUser, note, interestTags, personalized))
                .sorted(Comparator.comparingDouble(RecommendationCardView::score).reversed())
                .toList();
        return PageData.of(result, page, size);
    }

    public PageData<RecommendationCardView> users(Long currentUserId, int page, int size) {
        User currentUser = requireUser(currentUserId);
        List<RecommendationCardView> result = users.findAll().stream()
                .filter(user -> !user.id().equals(currentUserId))
                .filter(user -> !users.isBlockedEitherWay(currentUserId, user.id()))
                .filter(user -> settings.findPrivacy(user.id()).searchableByUsers())
                .filter(user -> users.relation(currentUserId, user.id()) != RelationStatus.FOLLOWING)
                .filter(user -> users.relation(currentUserId, user.id()) != RelationStatus.FRIEND)
                .map(user -> toUserCard(currentUser, user))
                .sorted(Comparator.comparingDouble(RecommendationCardView::score).reversed())
                .toList();
        return PageData.of(result, page, size);
    }

    public PageData<RecommendationCardView> channels(Long currentUserId, int page, int size) {
        User currentUser = requireUser(currentUserId);
        List<RecommendationCardView> result = channels.findAll().stream()
                .filter(channel -> !channel.memberIds().contains(currentUserId))
                .filter(channel -> channel.memberIds().stream().noneMatch(memberId -> users.isBlockedEitherWay(currentUserId, memberId)))
                .map(channel -> toChannelCard(currentUser, channel))
                .sorted(Comparator.comparingDouble(RecommendationCardView::score).reversed())
                .toList();
        return PageData.of(result, page, size);
    }

    public RecommendationFeedbackResponse feedback(Long currentUserId, RecommendationFeedbackRequest request) {
        requireUser(currentUserId);
        if(mysql){
            jdbc.sql("INSERT INTO recommendation_feedback(user_id,scene,target_type,target_id,action,detail) VALUES(:user,:scene,:type,:target,:action,:detail)")
                    .param("user",currentUserId).param("scene",request.scene()).param("type",request.targetType()).param("target",request.targetId())
                    .param("action",request.action()).param("detail",request.detail()==null?"":request.detail()).update();
            Long id=jdbc.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();
            return new RecommendationFeedbackResponse(id,"ACCEPTED",OffsetDateTime.now());
        }
        return new RecommendationFeedbackResponse(feedbackIds.getAndIncrement(), "ACCEPTED", OffsetDateTime.now());
    }

    private RecommendationCardView toNoteCard(User currentUser, Note note, Set<String> interestTags, boolean personalized) {
        User author = requireUser(note.authorId());
        RelationStatus relation = users.relation(currentUser.id(), author.id());
        double score = 35.0;
        List<String> reasons = new ArrayList<>();
        if (personalized && author.college() != null && author.college().equals(currentUser.college())) {
            score += 18;
            reasons.add("同学院");
        }
        if (personalized && author.grade() != null && author.grade().equals(currentUser.grade())) {
            score += 8;
            reasons.add("同年级");
        }
        if (personalized && relation == RelationStatus.FRIEND) {
            score += 22;
            reasons.add("好友圈层");
        } else if (personalized && relation == RelationStatus.FOLLOWING) {
            score += 15;
            reasons.add("你关注的人");
        }
        long tagOverlap = note.tags().stream().filter(interestTags::contains).count();
        if (tagOverlap > 0) {
            score += tagOverlap * 8;
            reasons.add("命中常看标签");
        }
        score += Math.min(note.likeCount() * 0.7 + note.commentCount() * 0.9, 18);
        String reason = reasons.isEmpty() ? "内容热度较高" : String.join("、", reasons);
        String subtitle = author.nickname() + " · " + switch (note.visibility()) {
            case PUBLIC -> "公开";
            case FRIENDS -> "好友可见";
            case PRIVATE -> "仅自己可见";
        };
        String coverUrl = note.imageUrls().isEmpty() ? null : note.imageUrls().get(0);
        return new RecommendationCardView(note.id(), "NOTE", note.title(), subtitle, reason, round(score), note.id(),
                coverUrl, note.tags(), false, relation == RelationStatus.FOLLOWING || relation == RelationStatus.FRIEND, null);
    }

    private RecommendationCardView toUserCard(User currentUser, User user) {
        RelationStatus relation = users.relation(currentUser.id(), user.id());
        double score = 30.0;
        List<String> reasons = new ArrayList<>();
        if (user.college() != null && user.college().equals(currentUser.college())) {
            score += 20;
            reasons.add("同学院");
        }
        if (user.grade() != null && user.grade().equals(currentUser.grade())) {
            score += 12;
            reasons.add("同年级");
        }
        if (relation == RelationStatus.FOLLOWER) {
            score += 14;
            reasons.add("对方已关注你");
        }
        int followers = users.countFollowers(user.id());
        int following = users.countFollowing(user.id());
        score += Math.min(followers * 0.4 + following * 0.2, 10);
        String reason = reasons.isEmpty() ? "校园活跃度较高" : String.join("、", reasons);
        String subtitle = safe(user.college()) + " · " + safe(user.grade());
        return new RecommendationCardView(user.id(), "USER", user.nickname(), subtitle, reason, round(score), user.id(),
                user.avatarUrl(), List.of(), false, relation == RelationStatus.FOLLOWING || relation == RelationStatus.FRIEND, null);
    }

    private RecommendationCardView toChannelCard(User currentUser, Channel channel) {
        boolean publicChannel = channel.joinType() == JoinType.PUBLIC;
        long relatedMemberCount = channel.memberIds().stream()
                .filter(memberId -> memberId != null && !memberId.equals(currentUser.id()))
                .filter(memberId -> users.relation(currentUser.id(), memberId) == RelationStatus.FOLLOWING
                        || users.relation(currentUser.id(), memberId) == RelationStatus.FRIEND)
                .count();
        double score = 28.0 + Math.min(channel.memberCount() * 0.25, 18) + (publicChannel ? 10 : 2) + relatedMemberCount * 14;
        List<String> reasons = new ArrayList<>();
        if (publicChannel) reasons.add("公开频道");
        if (relatedMemberCount > 0) reasons.add("关注的人在里面");
        if (channel.memberCount() >= 20) reasons.add("成员较多");
        String reason = reasons.isEmpty() ? "适合扩展校园社交圈" : String.join("、", reasons);
        String subtitle = publicChannel ? "公开 · " + channel.memberCount() + " 人" : "密码频道 · " + channel.memberCount() + " 人";
        String badge = channel.memberIds().contains(currentUser.id()) ? "已加入" : (publicChannel ? "可直接加入" : "需密码");
        return new RecommendationCardView(channel.id(), "CHANNEL", channel.name(), subtitle, reason, round(score), channel.id(),
                null, List.of(), channel.memberIds().contains(currentUser.id()), false, badge);
    }

    private boolean canRecommendNote(Long currentUserId, Note note) {
        if (note.authorId().equals(currentUserId)) return false;
        if (users.isBlockedEitherWay(currentUserId, note.authorId())) return false;
        if (note.visibility() == Visibility.PUBLIC) return true;
        return note.visibility() == Visibility.FRIENDS
                && users.relation(currentUserId, note.authorId()) == RelationStatus.FRIEND;
    }

    private Set<String> interestTags(Long currentUserId) {
        return notes.findAll().stream()
                .filter(note -> note.authorId().equals(currentUserId)
                        || note.likedBy().contains(currentUserId)
                        || note.savedBy().contains(currentUserId))
                .flatMap(note -> note.tags().stream())
                .collect(Collectors.toSet());
    }

    private User requireUser(Long userId) {
        return users.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "用户不存在"));
    }

    private <T> List<T> limit(List<T> items, int max) {
        return items.stream().limit(max).toList();
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "未填写" : value;
    }
}
