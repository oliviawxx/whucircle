package com.whucircle;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.whucircle.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest
@TestPropertySource(properties = "whu-circle.upload.image-dir=target/test-uploads/images")
class ApiIntegrationTest {
    private static final String AUTH = "Bearer demo-access-token";

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository users;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ObjectMapper objectMapper;

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

    @Test
    void channelCreatorCanManageAnnouncementAndPinnedPosts() throws Exception {
        String channelBody = mockMvc.perform(post("/api/v1/channels")
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"API 联调频道","joinType":"PUBLIC","announcement":"初始公告"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.joined").value(true))
                .andReturn().getResponse().getContentAsString();
        long channelId = objectMapper.readTree(channelBody).path("data").path("id").asLong();

        mockMvc.perform(put("/api/v1/channels/{id}/announcement", channelId)
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"announcement\":\"更新后的频道公告\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.announcement").value("更新后的频道公告"));

        String postBody = mockMvc.perform(post("/api/v1/channels/{id}/posts", channelId)
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"联调帖\",\"content\":\"用于验证置顶接口\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        long postId = objectMapper.readTree(postBody).path("data").path("id").asLong();

        mockMvc.perform(put("/api/v1/channel-posts/{id}/pin", postId)
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pinned\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pinned").value(true));
    }

    @Test
    void conversationsCanBeCreatedAndPrivateMessagePermissionIsEnforced() throws Exception {
        mockMvc.perform(post("/api/v1/conversations")
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"PRIVATE\",\"participantIds\":[6]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.type").value("PRIVATE"));

        mockMvc.perform(post("/api/v1/conversations")
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"PRIVATE\",\"participantIds\":[3]}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(40300));
    }

    @Test
    void authorCanDeleteOwnNoteAndComment() throws Exception {
        String noteBody = mockMvc.perform(post("/api/v1/notes")
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"待删除笔记","content":"测试删除流程","visibility":"PUBLIC","imageUrls":[],"tags":[]}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        long noteId = objectMapper.readTree(noteBody).path("data").path("id").asLong();

        String commentBody = mockMvc.perform(post("/api/v1/notes/{id}/comments", noteId)
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"稍后一起删除\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        long commentId = objectMapper.readTree(commentBody).path("data").path("id").asLong();

        mockMvc.perform(delete("/api/v1/notes/{noteId}/comments/{commentId}", noteId, commentId)
                        .header("Authorization", AUTH))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/v1/notes/{id}", noteId).header("Authorization", AUTH))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/notes/{id}", noteId).header("Authorization", AUTH))
                .andExpect(status().isNotFound());
    }

    @Test
    void notificationsSupportCountAndReadState() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/count").header("Authorization", AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreadCount").value(2));
        mockMvc.perform(put("/api/v1/notifications/1/read").header("Authorization", AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.read").value(true));
        mockMvc.perform(put("/api/v1/notifications/read-all").header("Authorization", AUTH))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/notifications/count").header("Authorization", AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreadCount").value(0));
    }

    @Test
    void recommendationApisReturnScoredCards() throws Exception {
        mockMvc.perform(get("/api/v1/recommendations/home").header("Authorization", AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.items[0].type").exists())
                .andExpect(jsonPath("$.data.items[0].reason").exists());

        mockMvc.perform(get("/api/v1/recommendations/notes").header("Authorization", AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].type").value("NOTE"));

        mockMvc.perform(post("/api/v1/recommendations/feedback")
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"scene":"HOME","targetType":"NOTE","targetId":105,"action":"CLICK","detail":"先联调"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"));
    }

    @Test
    void imageUploadStoresLocalFileAndReturnsUploadUrl() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "file",
                "campus.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4e, 0x47}
        );

        mockMvc.perform(multipart("/api/v1/files/images")
                        .file(image)
                        .header("Authorization", AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.url").value(org.hamcrest.Matchers.startsWith("/uploads/images/")));
    }

    @Test
    void adminApisRequireAdminRoleAndCanModerateUsersAndChannels() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard").header("Authorization", AUTH))
                .andExpect(status().isForbidden());

        String adminAuth = "Bearer " + loginAndReturnToken("admin@whu.edu.cn", "example123");

        mockMvc.perform(get("/api/v1/admin/dashboard").header("Authorization", adminAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.summary.userCount").exists())
                .andExpect(jsonPath("$.data.users[?(@.email == 'admin@whu.edu.cn')].role").value(org.hamcrest.Matchers.hasItem("ADMIN")));

        mockMvc.perform(put("/api/v1/admin/users/6/status")
                        .header("Authorization", adminAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"BANNED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("BANNED"));

        mockMvc.perform(put("/api/v1/admin/users/6/status")
                        .header("Authorization", adminAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        String channelBody = mockMvc.perform(post("/api/v1/channels")
                        .header("Authorization", AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"全站管理测试频道\",\"joinType\":\"PUBLIC\",\"announcement\":\"测试后可封禁\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        long channelId = objectMapper.readTree(channelBody).path("data").path("id").asLong();

        mockMvc.perform(put("/api/v1/admin/channels/{id}/status", channelId)
                        .header("Authorization", adminAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"BANNED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("BANNED"));

        mockMvc.perform(get("/api/v1/channels/{id}", channelId).header("Authorization", AUTH))
                .andExpect(status().isForbidden());
    }

    private String loginAndReturnToken(String email, String password) throws Exception {
        String body = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).path("data").path("accessToken").asText();
    }
}
