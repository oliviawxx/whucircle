package com.whucircle.service.storage;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@ConditionalOnProperty(prefix = "whu-circle.storage", name = "type", havingValue = "local", matchIfMissing = true)
public class LocalImageStorageService implements ImageStorageService {
    private final Path imageRoot;

    public LocalImageStorageService(@Value("${whu-circle.upload.image-dir:uploads/images}") String imageDir) {
        this.imageRoot = Path.of(imageDir).toAbsolutePath().normalize();
    }

    @Override
    public String store(MultipartFile file, String objectKey, String contentType) {
        Path target = resolveObjectKey(objectKey);
        if (!target.startsWith(imageRoot)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文件路径异常");
        }
        try {
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "图片保存失败");
        }
        return objectKey.replace('\\', '/');
    }

    @Override
    public StoredImage load(String objectKey) {
        Path target = resolveObjectKey(objectKey);
        if (!target.startsWith(imageRoot) || !Files.isRegularFile(target)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "图片不存在");
        }
        try {
            InputStream inputStream = Files.newInputStream(target);
            String contentType = Files.probeContentType(target);
            long size = Files.size(target);
            return new StoredImage(inputStream, contentType == null ? "application/octet-stream" : contentType, size);
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "图片读取失败");
        }
    }

    private Path resolveObjectKey(String objectKey) {
        String normalized = objectKey.replace('\\', '/');
        if (normalized.startsWith("images/")) {
            normalized = normalized.substring("images/".length());
        }
        return imageRoot.resolve(normalized).normalize();
    }
}
