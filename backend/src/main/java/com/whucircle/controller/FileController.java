package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.dto.MiscDtos.ImageUploadResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "文件")
@RestController
@RequestMapping("/api/v1/files")
public class FileController {
    @PostMapping("/images")
    public ApiResponse<ImageUploadResponse> upload(@RequestParam MultipartFile file) {
        if (file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "请选择有效图片");
        }
        return ApiResponse.success(new ImageUploadResponse(
                "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80"));
    }
}
