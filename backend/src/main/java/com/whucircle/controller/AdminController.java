package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.domain.Enums.AccountStatus;
import com.whucircle.domain.Enums.ChannelStatus;
import com.whucircle.dto.AdminDtos.AdminChannelView;
import com.whucircle.dto.AdminDtos.AdminDashboard;
import com.whucircle.dto.AdminDtos.AdminUserView;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.AdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "全站管理")
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ApiResponse<AdminDashboard> dashboard() {
        return ApiResponse.success(adminService.dashboard(CurrentUser.id()));
    }

    @PutMapping("/users/{userId}/status")
    public ApiResponse<AdminUserView> setUserStatus(@PathVariable Long userId,
                                                    @Valid @RequestBody UserStatusRequest request) {
        return ApiResponse.success(adminService.setUserStatus(CurrentUser.id(), userId, request.status()));
    }

    @PutMapping("/channels/{channelId}/status")
    public ApiResponse<AdminChannelView> setChannelStatus(@PathVariable Long channelId,
                                                          @Valid @RequestBody ChannelStatusRequest request) {
        return ApiResponse.success(adminService.setChannelStatus(CurrentUser.id(), channelId, request.status()));
    }

    @DeleteMapping("/notes/{noteId}")
    public ApiResponse<Void> deleteNote(@PathVariable Long noteId) {
        adminService.deleteNote(CurrentUser.id(), noteId);
        return ApiResponse.success();
    }

    @DeleteMapping("/channel-posts/{postId}")
    public ApiResponse<Void> deleteChannelPost(@PathVariable Long postId) {
        adminService.deleteChannelPost(CurrentUser.id(), postId);
        return ApiResponse.success();
    }

    public record UserStatusRequest(@NotNull AccountStatus status) {}
    public record ChannelStatusRequest(@NotNull ChannelStatus status) {}
}
