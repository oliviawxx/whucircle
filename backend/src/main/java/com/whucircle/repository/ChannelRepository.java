package com.whucircle.repository;

import com.whucircle.domain.Channel;
import com.whucircle.domain.ChannelPost;
import com.whucircle.domain.ChannelReply;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository {
    List<Channel> findAll();
    Optional<Channel> findById(Long id);
    Channel addMember(Long channelId, Long userId);
    List<ChannelPost> findPosts(Long channelId);
    Optional<ChannelPost> findPostById(Long postId);
    ChannelPost savePost(ChannelPost post);
    ChannelPost togglePostLike(Long postId, Long userId);
    List<ChannelReply> findReplies(Long postId);
    ChannelReply saveReply(ChannelReply reply);
    long nextPostId();
    long nextReplyId();
}
