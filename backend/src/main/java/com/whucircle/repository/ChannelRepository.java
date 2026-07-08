package com.whucircle.repository;

import com.whucircle.domain.Channel;
import com.whucircle.domain.ChannelPost;
import com.whucircle.domain.ChannelReply;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository {
    List<Channel> findAll();
    Optional<Channel> findById(Long id);
    Channel save(Channel channel);
    Channel addMember(Long channelId, Long userId);
    List<ChannelPost> findPosts(Long channelId);
    Optional<ChannelPost> findPostById(Long postId);
    ChannelPost savePost(ChannelPost post);
    void deletePost(Long postId);
    ChannelPost togglePostLike(Long postId, Long userId);
    List<ChannelReply> findReplies(Long postId);
    ChannelReply saveReply(ChannelReply reply);
    long nextChannelId();
    long nextPostId();
    long nextReplyId();
}
