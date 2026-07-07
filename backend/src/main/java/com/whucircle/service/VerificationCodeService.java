package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.dto.AuthDtos.EmailCodeResponse;
import com.whucircle.service.mail.VerificationCodeSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationCodeService {
    private final VerificationCodeSender sender;
    private final Map<String, CodeEntry> codes = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private final String mailMode;
    private final String mockCode;
    private final int expiresIn;
    private final int resendAfter;
    private final int maxAttempts;

    public VerificationCodeService(
            VerificationCodeSender sender,
            @Value("${whu-circle.mail.mode:mock}") String mailMode,
            @Value("${whu-circle.auth.verification-code:123456}") String mockCode,
            @Value("${whu-circle.auth.code-expires-in:300}") int expiresIn,
            @Value("${whu-circle.auth.code-resend-after:60}") int resendAfter,
            @Value("${whu-circle.auth.max-code-attempts:5}") int maxAttempts) {
        this.sender = sender;
        this.mailMode = mailMode;
        this.mockCode = mockCode;
        this.expiresIn = expiresIn;
        this.resendAfter = resendAfter;
        this.maxAttempts = maxAttempts;
    }

    public EmailCodeResponse send(String email) {
        String key = email.toLowerCase();
        Instant now = Instant.now();
        CodeEntry existing = codes.get(key);
        if (existing != null && existing.nextSendAt().isAfter(now)) {
            long waitSeconds = Math.max(1, Duration.between(now, existing.nextSendAt()).toSeconds());
            throw new BusinessException(ErrorCode.CONFLICT, "请在 " + waitSeconds + " 秒后重新发送");
        }

        String code = "mock".equalsIgnoreCase(mailMode)
                ? mockCode
                : String.format("%06d", random.nextInt(1_000_000));
        sender.send(key, code);
        codes.put(key, new CodeEntry(code, now.plusSeconds(expiresIn), now.plusSeconds(resendAfter), 0));
        return new EmailCodeResponse(expiresIn, resendAfter, "mock".equalsIgnoreCase(mailMode) ? code : null);
    }

    public void verifyAndConsume(String email, String code) {
        String key = email.toLowerCase();
        CodeEntry entry = codes.get(key);
        if (entry == null || entry.expiresAt().isBefore(Instant.now())) {
            codes.remove(key);
            throw new BusinessException(ErrorCode.INVALID_CODE);
        }
        if (!entry.code().equals(code)) {
            int attempts = entry.attempts() + 1;
            if (attempts >= maxAttempts) {
                codes.remove(key);
                throw new BusinessException(ErrorCode.INVALID_CODE, "验证码错误次数过多，请重新获取");
            }
            codes.put(key, new CodeEntry(entry.code(), entry.expiresAt(), entry.nextSendAt(), attempts));
            throw new BusinessException(ErrorCode.INVALID_CODE);
        }
        codes.remove(key);
    }

    private record CodeEntry(String code, Instant expiresAt, Instant nextSendAt, int attempts) {}
}
