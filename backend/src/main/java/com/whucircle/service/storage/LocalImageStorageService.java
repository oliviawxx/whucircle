package com.whucircle.service.storage;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
        Path target = imageRoot.resolve(objectKey).normalize();
        if (!target.startsWith(imageRoot)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文件路径异常");
        }
        try {
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "图片保存失败");
        }
        return "/uploads/images/" + objectKey.replace('\\', '/');
    }
}
