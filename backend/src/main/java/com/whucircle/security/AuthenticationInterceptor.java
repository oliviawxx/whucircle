package com.whucircle.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.whucircle.common.ApiResponse;
import com.whucircle.common.ErrorCode;
import com.whucircle.domain.Enums.AccountStatus;
import com.whucircle.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;

@Component
public class AuthenticationInterceptor implements HandlerInterceptor {
    private final TokenService tokenService;
    private final ObjectMapper objectMapper;
    private final UserRepository users;

    public AuthenticationInterceptor(TokenService tokenService, ObjectMapper objectMapper, UserRepository users) {
        this.tokenService = tokenService;
        this.objectMapper = objectMapper;
        this.users = users;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            writeUnauthorized(response);
            return false;
        }
        return tokenService.resolve(authorization.substring(7)).map(userId -> {
            if (users.findById(userId).filter(user -> user.status() == AccountStatus.ACTIVE).isEmpty()) {
                try { writeForbidden(response, "账号已被封禁"); } catch (Exception ignored) { }
                return false;
            }
            CurrentUser.set(userId);
            return true;
        }).orElseGet(() -> {
            try { writeUnauthorized(response); } catch (Exception ignored) { }
            return false;
        });
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        CurrentUser.clear();
    }

    private void writeUnauthorized(HttpServletResponse response) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), ApiResponse.failure(ErrorCode.UNAUTHORIZED.code(), ErrorCode.UNAUTHORIZED.message()));
    }

    private void writeForbidden(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), ApiResponse.failure(ErrorCode.FORBIDDEN.code(), message));
    }
}
