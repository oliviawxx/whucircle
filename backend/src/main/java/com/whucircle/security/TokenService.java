package com.whucircle.security;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.core.env.Environment;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {
    private final Map<String, Long> accessTokens = new ConcurrentHashMap<>();
    private final JdbcClient jdbc;
    private final boolean mysql;

    public TokenService(ObjectProvider<JdbcClient> jdbc, Environment environment) {
        this.jdbc = jdbc.getIfAvailable();
        this.mysql = java.util.Arrays.asList(environment.getActiveProfiles()).contains("mysql");
        accessTokens.put("demo-access-token", 1L);
    }

    public String create(Long userId) {
        String token = UUID.randomUUID().toString().replace("-", "");
        if (mysql) jdbc.sql("INSERT INTO auth_tokens(token,user_id,expires_at) VALUES(:token,:user,:expires)")
                .param("token",token).param("user",userId).param("expires", LocalDateTime.now().plusDays(7)).update();
        else accessTokens.put(token, userId);
        return token;
    }

    public Optional<Long> resolve(String token) {
        if (!mysql) return Optional.ofNullable(accessTokens.get(token));
        return jdbc.sql("SELECT user_id FROM auth_tokens WHERE token=:token AND expires_at>NOW(3)").param("token",token).query(Long.class).optional();
    }
    public void revoke(String token) { if(mysql) jdbc.sql("DELETE FROM auth_tokens WHERE token=:token").param("token",token).update(); else accessTokens.remove(token); }
}
