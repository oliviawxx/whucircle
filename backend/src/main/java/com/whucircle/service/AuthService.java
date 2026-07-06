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
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private final UserRepository users;
    private final TokenService tokens;
    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();
    private final String mockCode;
    private final int expiresIn;

    public AuthService(UserRepository users, TokenService tokens,
                       @Value("${whu-circle.auth.verification-code:123456}") String mockCode,
                       @Value("${whu-circle.auth.token-expires-in:7200}") int expiresIn) {
        this.users = users;
        this.tokens = tokens;
        this.mockCode = mockCode;
        this.expiresIn = expiresIn;
    }

    public EmailCodeResponse sendCode(String email) {
        ensureCampusEmail(email);
        verificationCodes.put(email.toLowerCase(), mockCode);
        return new EmailCodeResponse(300, mockCode);
    }

    public LoginResponse register(String email, String code, String password, String nickname) {
        ensureCampusEmail(email);
        if (users.findByEmail(email).isPresent()) throw new BusinessException(ErrorCode.CONFLICT, "该邮箱已注册");
        if (!mockCode.equals(code) || !mockCode.equals(verificationCodes.get(email.toLowerCase()))) {
            throw new BusinessException(ErrorCode.INVALID_CODE);
        }
        User user = users.save(new User(null, email.toLowerCase(), password, nickname, "", "待完善", "待完善"));
        return issueTokens(user);
    }

    public LoginResponse login(String email, String password) {
        User user = users.findByEmail(email)
                .filter(found -> found.password().equals(password))
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
        return new UserView(user.id(), user.nickname(), user.avatarUrl(), user.college(), user.grade());
    }

    private void ensureCampusEmail(String email) {
        if (email == null || !email.toLowerCase().endsWith("@whu.edu.cn")) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "请使用 @whu.edu.cn 校内邮箱");
        }
    }
}
