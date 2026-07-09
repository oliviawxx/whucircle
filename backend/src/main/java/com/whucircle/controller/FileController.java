package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.dto.MiscDtos.ImageUploadResponse;
import com.whucircle.service.storage.ImageStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Tag(name = "文件")
@RestController
@RequestMapping("/api/v1/files")
public class FileController {
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/gif", "image/webp");
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    private final ImageStorageService imageStorageService;

    public FileController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @PostMapping("/images")
    public ApiResponse<ImageUploadResponse> upload(@RequestParam MultipartFile file) {
        String contentType = file.getContentType();
        if (file.isEmpty() || contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "请选择有效图片");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "图片不能超过 5MB");
        }

        LocalDate today = LocalDate.now();
        String objectKey = "images/" + today.getYear() + "/" + String.format("%02d", today.getMonthValue()) + "/"
                + UUID.randomUUID() + extensionOf(file);
        String url = imageStorageService.store(file, objectKey, contentType);
        return ApiResponse.success(new ImageUploadResponse(url));
    }

    private String extensionOf(MultipartFile file) {
        String original = file.getOriginalFilename();
        String extension = "";
        if (original != null) {
            int dot = original.lastIndexOf('.');
            if (dot >= 0 && dot < original.length() - 1) {
                extension = original.substring(dot).toLowerCase(Locale.ROOT);
            }
        }
        return switch (extension) {
            case ".jpg", ".jpeg", ".png", ".gif", ".webp" -> extension;
            default -> switch (file.getContentType()) {
                case "image/png" -> ".png";
                case "image/gif" -> ".gif";
                case "image/webp" -> ".webp";
                default -> ".jpg";
            };
        };
    }
}
