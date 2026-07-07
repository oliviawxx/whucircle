package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.common.PageData;
import com.whucircle.dto.RecommendationDtos.RecommendationCardView;
import com.whucircle.dto.RecommendationDtos.RecommendationFeedbackRequest;
import com.whucircle.dto.RecommendationDtos.RecommendationFeedbackResponse;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.RecommendationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "推荐")
@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {
    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/home")
    public ApiResponse<PageData<RecommendationCardView>> home(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(recommendationService.home(CurrentUser.id(), page, size));
    }

    @GetMapping("/notes")
    public ApiResponse<PageData<RecommendationCardView>> notes(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(recommendationService.notes(CurrentUser.id(), page, size));
    }

    @GetMapping("/users")
    public ApiResponse<PageData<RecommendationCardView>> users(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(recommendationService.users(CurrentUser.id(), page, size));
    }

    @GetMapping("/channels")
    public ApiResponse<PageData<RecommendationCardView>> channels(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(recommendationService.channels(CurrentUser.id(), page, size));
    }

    @PostMapping("/feedback")
    public ApiResponse<RecommendationFeedbackResponse> feedback(@Valid @RequestBody RecommendationFeedbackRequest request) {
        return ApiResponse.success(recommendationService.feedback(CurrentUser.id(), request));
    }
}