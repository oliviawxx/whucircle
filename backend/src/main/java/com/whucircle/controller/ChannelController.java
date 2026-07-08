package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.common.PageData;
import com.whucircle.dto.ChannelDtos.ChannelView;
import com.whucircle.dto.ChannelDtos.AdminRequestAction;
import com.whucircle.dto.ChannelDtos.AdminRequestView;
import com.whucircle.dto.ChannelDtos.CreateChannelRequest;
import com.whucircle.dto.ChannelDtos.CreatePostRequest;
import com.whucircle.dto.ChannelDtos.CreateReplyRequest;
import com.whucircle.dto.ChannelDtos.InitialAdminDashboard;
import com.whucircle.dto.ChannelDtos.InviteAdminRequest;
import com.whucircle.dto.ChannelDtos.JoinRequest;
import com.whucircle.dto.ChannelDtos.JoinResponse;
import com.whucircle.dto.ChannelDtos.PostDetail;
import com.whucircle.dto.ChannelDtos.PostView;
import com.whucircle.dto.ChannelDtos.PinPostRequest;
import com.whucircle.dto.ChannelDtos.ReplyView;
import com.whucircle.dto.ChannelDtos.UpdateAnnouncementRequest;
import com.whucircle.dto.NoteDtos.ToggleResponse;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.ChannelService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "频道")
@RestController
@RequestMapping("/api/v1")
public class ChannelController {
    private final ChannelService channelService;

    public ChannelController(ChannelService channelService) { this.channelService = channelService; }

    @GetMapping("/channels")
    public ApiResponse<PageData<ChannelView>> channels(
            @RequestParam(required = false) Boolean joined,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(channelService.list(CurrentUser.id(), joined, keyword, page, size));
    }
    @GetMapping("/channels/{channelId}")
    public ApiResponse<ChannelView> channel(@PathVariable Long channelId) { return ApiResponse.success(channelService.detail(CurrentUser.id(), channelId)); }
    @GetMapping("/channels/managed")
    public ApiResponse<PageData<ChannelView>> managedChannels(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(channelService.managedChannels(CurrentUser.id(), page, size));
    }
    @GetMapping("/channels/{channelId}/initial-admin")
    public ApiResponse<InitialAdminDashboard> initialAdmin(@PathVariable Long channelId) {
        return ApiResponse.success(channelService.initialAdminDashboard(CurrentUser.id(), channelId));
    }
    @PostMapping("/channels/{channelId}/admin-applications")
    public ApiResponse<AdminRequestView> applyForAdmin(@PathVariable Long channelId) {
        return ApiResponse.success(channelService.applyForAdmin(CurrentUser.id(), channelId));
    }
    @PostMapping("/channels/{channelId}/admin-invitations")
    public ApiResponse<AdminRequestView> inviteAdmin(@PathVariable Long channelId,
            @Valid @RequestBody InviteAdminRequest request) {
        return ApiResponse.success(channelService.inviteAdmin(CurrentUser.id(), channelId, request.userId()));
    }
    @PutMapping("/channel-admin-requests/{requestId}")
    public ApiResponse<AdminRequestView> handleAdminRequest(@PathVariable Long requestId,
            @Valid @RequestBody AdminRequestAction request) {
        return ApiResponse.success(channelService.handleAdminRequest(CurrentUser.id(), requestId, request.action()));
    }
    @PostMapping("/channels")
    public ApiResponse<ChannelView> createChannel(@Valid @RequestBody CreateChannelRequest request) {
        return ApiResponse.success(channelService.create(CurrentUser.id(), request));
    }
    @PutMapping("/channels/{channelId}/announcement")
    public ApiResponse<ChannelView> updateAnnouncement(@PathVariable Long channelId,
            @Valid @RequestBody UpdateAnnouncementRequest request) {
        return ApiResponse.success(channelService.updateAnnouncement(CurrentUser.id(), channelId, request.announcement()));
    }
    @PostMapping("/channels/{channelId}/join")
    public ApiResponse<JoinResponse> join(@PathVariable Long channelId, @RequestBody(required = false) JoinRequest request) {
        return ApiResponse.success(channelService.join(CurrentUser.id(), channelId, request == null ? null : request.password()));
    }
    @GetMapping("/channels/{channelId}/posts")
    public ApiResponse<PageData<PostView>> posts(@PathVariable Long channelId,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(channelService.posts(CurrentUser.id(), channelId, page, size));
    }
    @PostMapping("/channels/{channelId}/posts")
    public ApiResponse<PostView> createPost(@PathVariable Long channelId, @Valid @RequestBody CreatePostRequest request) {
        return ApiResponse.success(channelService.createPost(CurrentUser.id(), channelId, request.title(), request.content(), Boolean.TRUE.equals(request.pinned())));
    }
    @GetMapping("/channel-posts/{postId}")
    public ApiResponse<PostDetail> post(@PathVariable Long postId) { return ApiResponse.success(channelService.postDetail(CurrentUser.id(), postId)); }
    @PostMapping("/channel-posts/{postId}/replies")
    public ApiResponse<ReplyView> reply(@PathVariable Long postId, @Valid @RequestBody CreateReplyRequest request) {
        return ApiResponse.success(channelService.reply(CurrentUser.id(), postId, request.content()));
    }
    @PostMapping("/channel-posts/{postId}/like")
    public ApiResponse<ToggleResponse> like(@PathVariable Long postId) { return ApiResponse.success(channelService.toggleLike(CurrentUser.id(), postId)); }
    @PutMapping("/channel-posts/{postId}/pin")
    public ApiResponse<PostView> pin(@PathVariable Long postId, @Valid @RequestBody PinPostRequest request) {
        return ApiResponse.success(channelService.setPinned(CurrentUser.id(), postId, request.pinned()));
    }
}
