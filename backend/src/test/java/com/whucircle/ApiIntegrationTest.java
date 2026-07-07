package com.whucircle;

import com.whucircle.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {
    private static final String AUTH = "Bearer demo-access-token";

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository users;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void healthDoesNotRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("UP"));
    }

    @Test
    void protectedApiRejectsMissingToken() throws Exception {
        mockMvc.perform(get("/api/v1/notes"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(40100));
    }

    @Test
    void demoAccountCanLogin() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"student@whu.edu.cn","password":"example123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("student@whu.edu.cn"));
    }

    @Test
    void storedPasswordIsBcryptHash() {
        String storedHash = users.findByEmail("student@whu.edu.cn").orElseThrow().passwordHash();
        org.assertj.core.api.Assertions.assertThat(storedHash).isNotEqualTo("example123");
        org.assertj.core.api.Assertions.assertThat(passwordEncoder.matches("example123", storedHash)).isTrue();
    }

    @Test
    void campusEmailCanRegisterWithVerificationCode() throws Exception {
        mockMvc.perform(post("/api/v1/auth/email-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"newstudent@whu.edu.cn","scene":"REGISTER"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.expiresIn").value(300))
                .andExpect(jsonPath("$.data.resendAfter").value(60))
                .andExpect(jsonPath("$.data.mockCode").value("123456"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"newstudent@whu.edu.cn","code":"123456","password":"password123","nickname":"新同学"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("newstudent@whu.edu.cn"));
    }

    @Test
    void externalEmailCannotRequestRegistrationCode() throws Exception {
        mockMvc.perform(post("/api/v1/auth/email-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"student@qq.com","scene":"REGISTER"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(40000));
    }

    @Test
    void currentUserCanReadAndEditProfile() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/profile").header("Authorization", AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("student@whu.edu.cn"));

        mockMvc.perform(put("/api/v1/users/me/profile")
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nickname":"小张同学",
                                  "avatarUrl":"https://example.com/avatar.jpg",
                                  "college":"新闻与传播学院",
                                  "grade":"2024级",
                                  "bio":"正在开发 WHU Circle"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nickname").value("小张同学"))
                .andExpect(jsonPath("$.data.bio").value("正在开发 WHU Circle"));
    }

    @Test
    void publicAndSocialFeedsRespectVisibility() throws Exception {
        mockMvc.perform(get("/api/v1/notes").header("Authorization", AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(3));

        mockMvc.perform(get("/api/v1/feed/social").header("Authorization", AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[?(@.id == 104)]").exists());
    }

    @Test
    void unjoinedChannelIsReadOnlyAndLimitedToFivePosts() throws Exception {
        mockMvc.perform(get("/api/v1/channels/13/posts").header("Authorization", AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(5));

        mockMvc.perform(post("/api/v1/channels/13/posts")
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"测试帖子","content":"未加入时不应发布成功"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(40302));
    }

    @Test
    void passwordChannelRejectsWrongPassword() throws Exception {
        mockMvc.perform(post("/api/v1/channels/13/join")
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"password":"wrong"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(40303));
    }
}
