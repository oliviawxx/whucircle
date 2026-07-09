package com.whucircle.service.storage;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConditionalOnProperty(prefix = "whu-circle.storage", name = "type", havingValue = "minio")
public class MinioImageStorageService implements ImageStorageService {
    private final MinioClient client;
    private final String bucket;
    private final String publicEndpoint;

    public MinioImageStorageService(
            @Value("${whu-circle.minio.endpoint}") String endpoint,
            @Value("${whu-circle.minio.access-key}") String accessKey,
            @Value("${whu-circle.minio.secret-key}") String secretKey,
            @Value("${whu-circle.minio.bucket}") String bucket,
            @Value("${whu-circle.minio.public-endpoint}") String publicEndpoint) {
        this.client = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
        this.bucket = bucket;
        this.publicEndpoint = trimTrailingSlash(publicEndpoint);
        ensureBucket();
    }

    @Override
    public String store(MultipartFile file, String objectKey, String contentType) {
        try (var input = file.getInputStream()) {
            client.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .contentType(contentType)
                    .stream(input, file.getSize(), -1)
                    .build());
            return publicEndpoint + "/" + bucket + "/" + objectKey;
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "图片保存到 MinIO 失败");
        }
    }

    private void ensureBucket() {
        try {
            boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
            client.setBucketPolicy(SetBucketPolicyArgs.builder()
                    .bucket(bucket)
                    .config(publicReadPolicy(bucket))
                    .build());
        } catch (Exception ex) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "MinIO 初始化失败");
        }
    }

    private static String publicReadPolicy(String bucket) {
        return """
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Principal": {"AWS": ["*"]},
                      "Action": ["s3:GetObject"],
                      "Resource": ["arn:aws:s3:::%s/*"]
                    }
                  ]
                }
                """.formatted(bucket);
    }

    private static String trimTrailingSlash(String value) {
        String result = value == null ? "" : value.trim();
        while (result.endsWith("/")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }
}
