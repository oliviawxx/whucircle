package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.dto.MiscDtos.ReportRequest;
import com.whucircle.dto.MiscDtos.ReportResponse;
import com.whucircle.security.CurrentUser;
import com.whucircle.service.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "举报")
@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) { this.reportService = reportService; }
    @PostMapping
    public ApiResponse<ReportResponse> create(@Valid @RequestBody ReportRequest request) {
        return ApiResponse.success(reportService.create(CurrentUser.id(), request));
    }
}
