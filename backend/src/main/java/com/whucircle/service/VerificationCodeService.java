package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.dto.AuthDtos.EmailCodeResponse;
import com.whucircle.service.mail.VerificationCodeSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.core.env.Environment;

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
    private final JdbcClient jdbc;
    private final boolean mysql;

    public VerificationCodeService(
            VerificationCodeSender sender,
            @Value("${whu-circle.mail.mode:mock}") String mailMode,
            @Value("${whu-circle.auth.verification-code:123456}") String mockCode,
            @Value("${whu-circle.auth.code-expires-in:300}") int expiresIn,
            @Value("${whu-circle.auth.code-resend-after:60}") int resendAfter,
            @Value("${whu-circle.auth.max-code-attempts:5}") int maxAttempts,
            ObjectProvider<JdbcClient> jdbc, Environment environment) {
        this.sender = sender;
        this.mailMode = mailMode;
        this.mockCode = mockCode;
        this.expiresIn = expiresIn;
        this.resendAfter = resendAfter;
        this.maxAttempts = maxAttempts;
        this.jdbc=jdbc.getIfAvailable();
        this.mysql=java.util.Arrays.asList(environment.getActiveProfiles()).contains("mysql");
    }

    public EmailCodeResponse send(String email, String scene) {
        String emailKey = email.toLowerCase();
        String key = emailKey + "|" + scene;
        Instant now = Instant.now();
        if(mysql){
            java.util.Optional<java.sql.Timestamp> latest=jdbc.sql("SELECT created_at FROM email_verification_codes WHERE email=:email AND scene=:scene AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1").param("email",emailKey).param("scene",scene).query(java.sql.Timestamp.class).optional();
            if(latest.isPresent()){
                long elapsed=Duration.between(latest.get().toInstant(),now).toSeconds();
                if(elapsed<resendAfter) throw new BusinessException(ErrorCode.CONFLICT,"请在 "+Math.max(1,resendAfter-elapsed)+" 秒后重新发送");
            }
        }
        CodeEntry existing = codes.get(key);
        if (existing != null && existing.nextSendAt().isAfter(now)) {
            long waitSeconds = Math.max(1, Duration.between(now, existing.nextSendAt()).toSeconds());
            throw new BusinessException(ErrorCode.CONFLICT, "请在 " + waitSeconds + " 秒后重新发送");
        }

        String code = "mock".equalsIgnoreCase(mailMode)
                ? mockCode
                : String.format("%06d", random.nextInt(1_000_000));
        sender.send(emailKey, code);
        if(mysql){
            jdbc.sql("UPDATE email_verification_codes SET consumed_at=NOW(3) WHERE email=:email AND scene=:scene AND consumed_at IS NULL").param("email",emailKey).param("scene",scene).update();
            jdbc.sql("INSERT INTO email_verification_codes(email,scene,code_hash,expires_at) VALUES(:email,:scene,:code,:expires)").param("email",emailKey).param("scene",scene).param("code",code).param("expires",java.time.LocalDateTime.now().plusSeconds(expiresIn)).update();
        }
        codes.put(key, new CodeEntry(code, now.plusSeconds(expiresIn), now.plusSeconds(resendAfter), 0));
        return new EmailCodeResponse(expiresIn, resendAfter, "mock".equalsIgnoreCase(mailMode) ? code : null);
    }

    public void verifyAndConsume(String email, String code, String scene) {
        String emailKey = email.toLowerCase();
        String key = emailKey + "|" + scene;
        if(mysql){
            var row=jdbc.sql("SELECT id,code_hash,expires_at,attempts FROM email_verification_codes WHERE email=:email AND scene=:scene AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1").param("email",emailKey).param("scene",scene).query((rs,n)->new DbCode(rs.getLong("id"),rs.getString("code_hash"),rs.getTimestamp("expires_at").toInstant(),rs.getInt("attempts"))).optional();
            if(row.isEmpty()||row.get().expiresAt().isBefore(Instant.now())) throw new BusinessException(ErrorCode.INVALID_CODE);
            DbCode entry=row.get();
            if(!entry.code().equals(code)){
                int attempts=entry.attempts()+1;
                jdbc.sql("UPDATE email_verification_codes SET attempts=:attempts,consumed_at=IF(:attempts>=:max,NOW(3),consumed_at) WHERE id=:id").param("attempts",attempts).param("max",maxAttempts).param("id",entry.id()).update();
                throw new BusinessException(ErrorCode.INVALID_CODE);
            }
            jdbc.sql("UPDATE email_verification_codes SET consumed_at=NOW(3) WHERE id=:id").param("id",entry.id()).update();
            codes.remove(key);
            return;
        }
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
    private record DbCode(Long id,String code,Instant expiresAt,int attempts) {}
}
