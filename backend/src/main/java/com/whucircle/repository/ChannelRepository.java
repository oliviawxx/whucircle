package com.whucircle.repository;

import com.whucircle.domain.Channel;
import com.whucircle.domain.ChannelAdminRequest;
import com.whucircle.domain.ChannelPost;
import com.whucircle.domain.ChannelReply;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository {
    List<Channel> findAll();
    Optional<Channel> findById(Long id);
    Channel save(Channel channel);
    void deleteChannel(Long channelId);
    Channel addMember(Long channelId, Long userId);
    Optional<String> findMemberRole(Long channelId, Long userId);
    void setMemberRole(Long channelId, Long userId, String role);
    List<ChannelAdminRequest> findAdminRequests(Long channelId);
    List<ChannelAdminRequest> findAdminRequestsByUser(Long userId);
    Optional<ChannelAdminRequest> findAdminRequestById(Long requestId);
    Optional<ChannelAdminRequest> findPendingAdminRequest(Long channelId, Long requesterId, String type);
    ChannelAdminRequest saveAdminRequest(ChannelAdminRequest request);
    List<ChannelPost> findPosts(Long channelId);
    Optional<ChannelPost> findPostById(Long postId);
    ChannelPost savePost(ChannelPost post);
    void deletePost(Long postId);
    ChannelPost togglePostLike(Long postId, Long userId);
    List<ChannelReply> findReplies(Long postId);
    ChannelReply saveReply(ChannelReply reply);
    long nextChannelId();
    long nextAdminRequestId();
    long nextPostId();
    long nextReplyId();
}
