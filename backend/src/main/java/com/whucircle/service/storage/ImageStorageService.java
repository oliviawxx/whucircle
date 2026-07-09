package com.whucircle.service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface ImageStorageService {
    String store(MultipartFile file, String objectKey, String contentType);

    StoredImage load(String objectKey);

    record StoredImage(InputStream inputStream, String contentType, long size) {
    }
}
