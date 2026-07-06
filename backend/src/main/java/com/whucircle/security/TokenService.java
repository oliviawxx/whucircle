package com.whucircle.security;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {
    private final Map<String, Long> accessTokens = new ConcurrentHashMap<>();

    public TokenService() {
        accessTokens.put("demo-access-token", 1L);
    }

    public String create(Long userId) {
        String token = UUID.randomUUID().toString().replace("-", "");
        accessTokens.put(token, userId);
        return token;
    }

    public Optional<Long> resolve(String token) { return Optional.ofNullable(accessTokens.get(token)); }
    public void revoke(String token) { accessTokens.remove(token); }
}
