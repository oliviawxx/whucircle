package com.whucircle.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("mysql")
public class MySqlSeedInitializer implements ApplicationRunner {
    private final JdbcClient jdbc;
    private final PasswordEncoder passwordEncoder;
    public MySqlSeedInitializer(JdbcClient jdbc, PasswordEncoder passwordEncoder){this.jdbc=jdbc;this.passwordEncoder=passwordEncoder;}
    @Override public void run(ApplicationArguments args){
        String hash=passwordEncoder.encode("example123");
        jdbc.sql("UPDATE users SET password_hash=:hash WHERE password_hash='{BCrypt}'").param("hash",hash).update();
        jdbc.sql("INSERT IGNORE INTO auth_tokens(token,user_id,expires_at) VALUES('demo-access-token',1,DATE_ADD(NOW(), INTERVAL 30 DAY))").update();
    }
}
