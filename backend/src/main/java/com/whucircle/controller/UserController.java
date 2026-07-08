package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.dto.UserDtos.RelationResult;
import com.whucircle.dto.UserDtos.RelationView;
import com.whucircle.dto.UserDtos.UserProfile;
import com.whucircle.dto.UserDtos.CurrentUserProfile;
import com.whucircle.dto.UserDtos.UpdateProfileRequest;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import jakarta.validation.Valid;

@Tag(name = "用户关系")
@RestController
@RequestMapping("/api/v1")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/users/me/profile")
    public ApiResponse<CurrentUserProfile> currentProfile() {
        return ApiResponse.success(userService.currentProfile(CurrentUser.id()));
    }
    @PutMapping("/users/me/profile")
    public ApiResponse<CurrentUserProfile> updateCurrentProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(userService.updateCurrentProfile(CurrentUser.id(), request));
    }
    @GetMapping("/relations")
    public ApiResponse<List<RelationView>> relations() { return ApiResponse.success(userService.relations(CurrentUser.id())); }
    @GetMapping("/users/search")
    public ApiResponse<List<UserProfile>> search(@RequestParam(defaultValue = "") String keyword) {
        return ApiResponse.success(userService.search(CurrentUser.id(), keyword));
    }
    @GetMapping("/users/{userId}")
    public ApiResponse<UserProfile> profile(@PathVariable Long userId) { return ApiResponse.success(userService.profile(CurrentUser.id(), userId)); }
    @PostMapping("/users/{userId}/follow")
    public ApiResponse<RelationResult> follow(@PathVariable Long userId) { return ApiResponse.success(userService.follow(CurrentUser.id(), userId)); }
    @DeleteMapping("/users/{userId}/follow")
    public ApiResponse<RelationResult> unfollow(@PathVariable Long userId) { return ApiResponse.success(userService.unfollow(CurrentUser.id(), userId)); }
    @PostMapping("/users/{userId}/block")
    public ApiResponse<RelationResult> block(@PathVariable Long userId) { return ApiResponse.success(userService.block(CurrentUser.id(), userId)); }
    @DeleteMapping("/users/{userId}/block")
    public ApiResponse<Void> unblock(@PathVariable Long userId) { userService.unblock(CurrentUser.id(), userId); return ApiResponse.success(); }
    @GetMapping("/blocks")
    public ApiResponse<List<UserProfile>> blocks() { return ApiResponse.success(userService.blockedUsers(CurrentUser.id())); }
}
