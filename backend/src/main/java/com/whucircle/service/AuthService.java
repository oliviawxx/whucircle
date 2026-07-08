package com.whucircle.service;

import com.whucircle.common.BusinessException;
import com.whucircle.common.ErrorCode;
import com.whucircle.domain.Enums.AccountStatus;
import com.whucircle.domain.Enums.UserRole;
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
        String normalizedScene = scene.toUpperCase();
        if (!Set.of("REGISTER", "RESET_PASSWORD").contains(normalizedScene)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "不支持的验证码场景");
        }
        boolean exists = users.findByEmail(normalizedEmail).isPresent();
        if ("REGISTER".equals(normalizedScene) && exists) {
            throw new BusinessException(ErrorCode.CONFLICT, "该邮箱已注册");
        }
        if ("RESET_PASSWORD".equals(normalizedScene) && !exists) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "账号不存在，请先注册账号");
        }
        return verificationCodes.send(normalizedEmail, normalizedScene);
    }

    public LoginResponse register(String email, String code, String password, String nickname) {
        String normalizedEmail = normalizeAndValidateCampusEmail(email);
        if (users.findByEmail(normalizedEmail).isPresent()) throw new BusinessException(ErrorCode.CONFLICT, "该邮箱已注册");
        verificationCodes.verifyAndConsume(normalizedEmail, code, "REGISTER");
        User user = users.save(new User(null, normalizedEmail, passwordEncoder.encode(password), nickname.trim(),
                "", "待完善", "待完善", "", UserRole.USER, AccountStatus.ACTIVE));
        return issueTokens(user);
    }

    public LoginResponse login(String email, String password) {
        String normalizedEmail = normalizeAndValidateCampusEmail(email);
        User user = users.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "账号不存在，请先注册账号"));
        if (!passwordEncoder.matches(password, user.passwordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS, "密码错误");
        }
        if (user.status() == AccountStatus.BANNED) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "账号已被封禁");
        }
        return issueTokens(user);
    }

    public void resetPassword(String email, String code, String newPassword) {
        String normalizedEmail = normalizeAndValidateCampusEmail(email);
        User user = users.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "账号不存在，请先注册账号"));
        verificationCodes.verifyAndConsume(normalizedEmail, code, "RESET_PASSWORD");
        users.save(new User(user.id(), user.email(), passwordEncoder.encode(newPassword), user.nickname(),
                user.avatarUrl(), user.college(), user.grade(), user.bio(), user.role(), user.status()));
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
                user.college(), user.grade(), user.bio(), user.role(), user.status());
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
