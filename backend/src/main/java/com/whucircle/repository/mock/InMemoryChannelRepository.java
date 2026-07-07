package com.whucircle.repository.mock;

import com.whucircle.domain.Channel;
import com.whucircle.domain.ChannelPost;
import com.whucircle.domain.ChannelReply;
import com.whucircle.domain.Enums.JoinType;
import com.whucircle.repository.ChannelRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Repository
@Profile("mock")
public class InMemoryChannelRepository implements ChannelRepository {
    private final Map<Long, Channel> channels = new ConcurrentHashMap<>();
    private final Map<Long, ChannelPost> posts = new ConcurrentHashMap<>();
    private final Map<Long, List<ChannelReply>> replies = new ConcurrentHashMap<>();
    private final AtomicLong channelIds = new AtomicLong(20);
    private final AtomicLong postIds = new AtomicLong(300);
    private final AtomicLong replyIds = new AtomicLong(3000);

    public InMemoryChannelRepository() {
        channels.put(11L, new Channel(11L, "期末互助频道", JoinType.PUBLIC, null, 1248, 2L,
                "置顶资料请先看公告，重复问题会合并到集中帖。", mutableSet(1L, 2L, 3L)));
        channels.put(12L, new Channel(12L, "校园摄影社", JoinType.PUBLIC, null, 532, 3L,
                "本周主题：校园里的蓝色时刻。", mutableSet(1L, 3L, 4L)));
        channels.put(13L, new Channel(13L, "二手交换站", JoinType.PASSWORD, "whu2026", 916, 5L,
                "交易请保留聊天记录，贵重物品建议线下当面确认。", mutableSet(5L)));

        putPost(new ChannelPost(301L, 11L, 2L, "高数 A2 历年题整理到 2024 版", "资料链接会持续更新。", true, 46, 1, mutableSet(), OffsetDateTime.now().minusHours(1)));
        putPost(new ChannelPost(302L, 11L, 6L, "明晚七点线上讲一下离散数学重点", "先收集大家最想听的章节。", false, 31, 0, mutableSet(), OffsetDateTime.now().minusHours(2)));
        putPost(new ChannelPost(303L, 11L, 3L, "求推荐适合背书的空教室", "最好晚上十点前开放。", false, 16, 0, mutableSet(), OffsetDateTime.now().minusHours(3)));
        putPost(new ChannelPost(304L, 12L, 3L, "樱顶日落机位集合", "欢迎补充不同焦段的样片。", true, 52, 0, mutableSet(), OffsetDateTime.now().minusHours(1)));
        putPost(new ChannelPost(305L, 12L, 4L, "新手相机参数怎么设", "先从光圈优先开始练习。", false, 29, 0, mutableSet(), OffsetDateTime.now().minusHours(4)));
        for (int index = 0; index < 6; index++) {
            putPost(new ChannelPost(306L + index, 13L, 5L, "二手交换帖 " + (index + 1), "请在评论区说明物品状态。", index == 0,
                    24 - index, 0, mutableSet(), OffsetDateTime.now().minusHours(index + 1)));
        }
        saveReply(new ChannelReply(3001L, 301L, 1L, "收到，谢谢整理。", OffsetDateTime.now().minusMinutes(20)));
    }

    private Set<Long> mutableSet(Long... values) {
        Set<Long> set = ConcurrentHashMap.newKeySet();
        set.addAll(List.of(values));
        return set;
    }
    private void putPost(ChannelPost post) {
        posts.put(post.id(), post);
        postIds.updateAndGet(value -> Math.max(value, post.id() + 1));
    }
    @Override public List<Channel> findAll() { return channels.values().stream().sorted(Comparator.comparing(Channel::id)).toList(); }
    @Override public java.util.Optional<Channel> findById(Long id) { return java.util.Optional.ofNullable(channels.get(id)); }
    @Override public Channel save(Channel channel) { channels.put(channel.id(), channel); return channel; }
    @Override public synchronized Channel addMember(Long channelId, Long userId) {
        Channel old = channels.get(channelId);
        if (old == null) return null;
        boolean added = old.memberIds().add(userId);
        Channel updated = new Channel(old.id(), old.name(), old.joinType(), old.password(), old.memberCount() + (added ? 1 : 0),
                old.administratorId(), old.announcement(), old.memberIds());
        channels.put(channelId, updated);
        return updated;
    }
    @Override public List<ChannelPost> findPosts(Long channelId) {
        return posts.values().stream().filter(post -> post.channelId().equals(channelId))
                .sorted(Comparator.comparing(ChannelPost::pinned).reversed()
                        .thenComparing(Comparator.comparing(ChannelPost::createdAt).reversed())).toList();
    }
    @Override public java.util.Optional<ChannelPost> findPostById(Long postId) { return java.util.Optional.ofNullable(posts.get(postId)); }
    @Override public ChannelPost savePost(ChannelPost post) { posts.put(post.id(), post); return post; }
    @Override public synchronized ChannelPost togglePostLike(Long postId, Long userId) {
        ChannelPost old = posts.get(postId);
        if (old == null) return null;
        boolean removed = old.likedBy().remove(userId);
        if (!removed) old.likedBy().add(userId);
        ChannelPost updated = new ChannelPost(old.id(), old.channelId(), old.authorId(), old.title(), old.content(), old.pinned(),
                Math.max(0, old.likeCount() + (removed ? -1 : 1)), old.replyCount(), old.likedBy(), old.createdAt());
        return savePost(updated);
    }
    @Override public List<ChannelReply> findReplies(Long postId) { return new ArrayList<>(replies.getOrDefault(postId, List.of())); }
    @Override public ChannelReply saveReply(ChannelReply reply) {
        replies.computeIfAbsent(reply.postId(), ignored -> new CopyOnWriteArrayList<>()).add(reply);
        replyIds.updateAndGet(value -> Math.max(value, reply.id() + 1));
        return reply;
    }
    @Override public long nextChannelId() { return channelIds.getAndIncrement(); }
    @Override public long nextPostId() { return postIds.getAndIncrement(); }
    @Override public long nextReplyId() { return replyIds.getAndIncrement(); }
}
