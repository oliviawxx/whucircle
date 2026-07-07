package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.common.PageData;
import com.whucircle.dto.MiscDtos.NotificationCount;
import com.whucircle.dto.MiscDtos.NotificationView;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "通知")
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<PageData<NotificationView>> list(@RequestParam(defaultValue = "1") int page,
                                                         @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(notificationService.list(CurrentUser.id(), page, size));
    }

    @GetMapping("/count")
    public ApiResponse<NotificationCount> count() {
        return ApiResponse.success(notificationService.count(CurrentUser.id()));
    }

    @PutMapping("/{notificationId}/read")
    public ApiResponse<NotificationView> markRead(@PathVariable Long notificationId) {
        return ApiResponse.success(notificationService.markRead(CurrentUser.id(), notificationId));
    }

    @PutMapping("/read-all")
    public ApiResponse<Void> markAllRead() {
        notificationService.markAllRead(CurrentUser.id());
        return ApiResponse.success();
    }
}
