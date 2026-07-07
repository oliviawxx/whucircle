package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.domain.User;
import com.whucircle.dto.AuthDtos.EmailCodeResponse;
import com.whucircle.dto.AuthDtos.LoginResponse;
import com.whucircle.dto.AuthDtos.UserView;
import com.whucircle.repository.UserRepository;
import com.whucircle.security.TokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private final UserRepository users;
    private final TokenService tokens;
    private final VerificationCodeService verificationCodes;
    private final PasswordEncoder passwordEncoder;
    private final Set<String> allowedEmailDomains;
    private final int expiresIn;

    public AuthService(UserRepository users, TokenService tokens, VerificationCodeService verificationCodes,
                       PasswordEncoder passwordEncoder,
                       @Value("${whu-circle.auth.allowed-email-domains:whu.edu.cn}") String allowedEmailDomains,
                       @Value("${whu-circle.auth.token-expires-in:7200}") int expiresIn) {
        this.users = users;
        this.tokens = tokens;
        this.verificationCodes = verificationCodes;
        this.passwordEncoder = passwordEncoder;
        this.allowedEmailDomains = Arrays.stream(allowedEmailDomains.split(","))
                .map(String::trim).map(String::toLowerCase).filter(value -> !value.isBlank())
                .collect(Collectors.toUnmodifiableSet());
        this.expiresIn = expiresIn;
    }

    public EmailCodeResponse sendCode(String email, String scene) {
        String normalizedEmail = normalizeAndValidateCampusEmail(email);
        if (!"REGISTER".equalsIgnoreCase(scene)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "当前仅支持 REGISTER 验证码场景");
        }
        if (users.findByEmail(normalizedEmail).isPresent()) {
            throw new BusinessException(ErrorCode.CONFLICT, "该邮箱已注册");
        }
        return verificationCodes.send(normalizedEmail);
    }

    public LoginResponse register(String email, String code, String password, String nickname) {
        String normalizedEmail = normalizeAndValidateCampusEmail(email);
        if (users.findByEmail(normalizedEmail).isPresent()) throw new BusinessException(ErrorCode.CONFLICT, "该邮箱已注册");
        verificationCodes.verifyAndConsume(normalizedEmail, code);
        User user = users.save(new User(null, normalizedEmail, passwordEncoder.encode(password), nickname.trim(),
                "", "待完善", "待完善", ""));
        return issueTokens(user);
    }

    public LoginResponse login(String email, String password) {
        String normalizedEmail = normalizeAndValidateCampusEmail(email);
        User user = users.findByEmail(normalizedEmail)
                .filter(found -> passwordEncoder.matches(password, found.passwordHash()))
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        return issueTokens(user);
    }

    public UserView me(Long userId) {
        return toView(users.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "用户不存在")));
    }

    public void logout(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) tokens.revoke(authorization.substring(7));
    }

    private LoginResponse issueTokens(User user) {
        String accessToken = tokens.create(user.id());
        return new LoginResponse(accessToken, "mock-refresh-" + accessToken, expiresIn, toView(user));
    }

    private UserView toView(User user) {
        return new UserView(user.id(), user.email(), user.nickname(), user.avatarUrl(),
                user.college(), user.grade(), user.bio());
    }

    private String normalizeAndValidateCampusEmail(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        int separator = normalized.lastIndexOf('@');
        String domain = separator >= 0 ? normalized.substring(separator + 1) : "";
        if (!allowedEmailDomains.contains(domain)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "请使用武汉大学校内邮箱");
        }
        return normalized;
    }
}
