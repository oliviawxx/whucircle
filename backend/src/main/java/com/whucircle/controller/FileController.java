package com.whucircle.controller;

import com.whucircle.common.ApiResponse;
import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.dto.MiscDtos.ImageUploadResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
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

    private final Path imageRoot;

    public FileController(@Value("${whu-circle.upload.image-dir:uploads/images}") String imageDir) {
        this.imageRoot = Path.of(imageDir).toAbsolutePath().normalize();
    }

    @PostMapping("/images")
    public ApiResponse<ImageUploadResponse> upload(@RequestParam MultipartFile file) {
        if (file.isEmpty() || file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "请选择有效图片");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "图片不能超过 5MB");
        }

        LocalDate today = LocalDate.now();
        Path relativeDir = Path.of(String.valueOf(today.getYear()), String.format("%02d", today.getMonthValue()));
        String filename = UUID.randomUUID() + extensionOf(file);
        Path target = imageRoot.resolve(relativeDir).resolve(filename).normalize();
        if (!target.startsWith(imageRoot)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文件路径异常");
        }

        try {
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "图片保存失败");
        }

        String url = "/uploads/images/" + relativeDir.toString().replace('\\', '/') + "/" + filename;
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
