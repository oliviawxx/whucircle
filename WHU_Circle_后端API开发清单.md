# WHU Circle 后端 API 与联调说明

本文档记录当前初步完整版的接口范围、前端接入状态和后续分工。接口统一以 `/api/v1` 为前缀，前端开发时通过 Vite 代理访问，不需要手写 `http://127.0.0.1:8080`。

## 1. 通用约定

### 1.1 请求地址

- 本地后端：http://127.0.0.1:8080
- 前端代理：前端代码请求 `/api/v1/...`
- Swagger：http://127.0.0.1:8080/swagger-ui/index.html

### 1.2 返回格式

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

前端 `src/api/client.js` 会统一判断 `code`。非 0 会抛出错误并显示给页面。

### 1.3 登录态

登录成功后返回 `token`，前端保存到 `localStorage` 的 `whu-token`，之后请求自动带：

```http
Authorization: Bearer <token>
```

### 1.4 后端 Profile

- `mock`：默认内存数据，适合后端单独快速启动。
- `mysql`：连接 MySQL，本地完整联调推荐使用。
- `mysql,smtp`：连接 MySQL 并使用真实 SMTP 发送邮箱验证码。

## 2. 前端页面与接口对应

| 页面 | 已接入内容 | 主要接口 |
| --- | --- | --- |
| 登录/注册 | 发送验证码、注册、登录、找回密码、当前用户 | `/auth/*` |
| 主页 | 笔记列表、搜索、标签、详情、评论、点赞、收藏、发布 | `/notes`、`/tags` |
| 社交圈 | 关注/好友列表、好友可见笔记 | `/relations`、`/feed/social` |
| 频道 | 频道列表、加入、帖子、回复、点赞、置顶、公告 | `/channels/*`、`/channel-posts/*` |
| 活动与日历 | 已实现第一版；活动讨论与活动群聊 v1.1 已完成接口设计 | `/channels/{channelId}/events`、`/channel-events/*`、`/calendar/events` |
| 聊天 | 会话列表、消息列表、发送消息、已读 | `/conversations/*` |
| 个人主页 | 资料读取和编辑、个人动态展示 | `/users/me/profile`、`/users/{userId}` |
| 设置 | 隐私设置、私信权限、频道加入默认设置 | `/settings/privacy` |
| 通知 | 通知列表、未读数量、全部已读 | `/notifications/*` |
| 举报 | 笔记、频道帖子、聊天消息举报 | `/reports` |

## 3. 认证接口

### 3.1 发送邮箱验证码

```http
POST /api/v1/auth/email-code
POST /api/v1/auth/send-code
```

请求：

```json
{
  "email": "example@whu.edu.cn",
  "scene": "REGISTER"
}
```

说明：

- `scene` 可用于注册、找回密码等场景。
- `mysql` Profile 下会返回测试验证码，方便本地联调。
- `mysql,smtp` Profile 下走真实邮箱发送。

### 3.2 注册

```http
POST /api/v1/auth/register
```

请求：

```json
{
  "email": "example@whu.edu.cn",
  "code": "123456",
  "password": "example123",
  "nickname": "珞珈同学"
}
```

### 3.3 登录

```http
POST /api/v1/auth/login
```

请求：

```json
{
  "email": "example@whu.edu.cn",
  "password": "example123"
}
```

### 3.4 找回密码

```http
POST /api/v1/auth/reset-password
```

请求：

```json
{
  "email": "example@whu.edu.cn",
  "code": "123456",
  "newPassword": "newpass123"
}
```

### 3.5 当前用户与退出

```http
GET /api/v1/auth/me
POST /api/v1/auth/logout
```

## 4. 笔记接口

```http
GET /api/v1/notes?scope=PUBLIC&keyword=关键词&tag=学习
POST /api/v1/notes
GET /api/v1/notes/{noteId}
DELETE /api/v1/notes/{noteId}
GET /api/v1/notes/{noteId}/comments
POST /api/v1/notes/{noteId}/comments
DELETE /api/v1/notes/{noteId}/comments/{commentId}
POST /api/v1/notes/{noteId}/like
POST /api/v1/notes/{noteId}/save
GET /api/v1/feed/social
GET /api/v1/tags
```

笔记可见范围：

- `PUBLIC`：公开，主页可见。
- `FRIENDS`：好友可见，主要出现在社交圈。
- `PRIVATE`：私密，仅自己可见。

当前前端已接入列表、详情、评论、点赞、收藏、发布和搜索/标签筛选。

## 5. 用户、资料和关系接口

```http
GET /api/v1/users/me/profile
PUT /api/v1/users/me/profile
GET /api/v1/users/{userId}
GET /api/v1/relations
POST /api/v1/users/{userId}/follow
DELETE /api/v1/users/{userId}/follow
POST /api/v1/users/{userId}/block
DELETE /api/v1/users/{userId}/block
GET /api/v1/blocks
```

业务规则：

- 单向关注进入关注列表。
- 双向关注自动成为好友。
- 好友可见笔记只对好友开放。
- 拉黑后限制私信、评论和查看对方主页。

## 6. 频道接口

```http
GET /api/v1/channels
GET /api/v1/channels/{channelId}
POST /api/v1/channels
POST /api/v1/channels/{channelId}/join
PUT /api/v1/channels/{channelId}/announcement
GET /api/v1/channels/managed
GET /api/v1/channels/{channelId}/initial-admin
POST /api/v1/channels/{channelId}/admin-applications
POST /api/v1/channels/{channelId}/admin-invitations
PUT /api/v1/channel-admin-requests/{requestId}
GET /api/v1/channels/{channelId}/posts
POST /api/v1/channels/{channelId}/posts
GET /api/v1/channel-posts/{postId}
POST /api/v1/channel-posts/{postId}/replies
POST /api/v1/channel-posts/{postId}/like
PUT /api/v1/channel-posts/{postId}/pin
```

频道权限：

- `PUBLIC`：公开频道，可直接加入。
- `PASSWORD`：密码频道，需要密码。

频道管理员体系：
- 初始管理员（频道创建者）可修改公告、置顶帖子、邀请成员成为管理员、审批管理员申请。
- 频道管理员（被任命者）可修改公告、置顶帖子。
- 成员可申请成为管理员。

当前前端已接入频道列表、加入弹窗、密码频道、频道内发帖、帖子详情、回复、点赞、置顶、公告展示、管理员控制台和管理员申请。

## 7. 活动与日历接口草案

活动与日历 API 定义维护在独立文档中：

```text
docs/活动与日历_API_v1.md
```

当前第一版范围：

- 频道管理员发布、编辑、取消活动。
- 活动可同步生成频道帖子，供成员评论讨论。
- 频道成员加入或取消加入活动。
- 用户在个人日历中查看自己加入的活动。
- 活动发布、更新、取消产生通知。
- 活动同步帖子用于全频道公开答疑，已报名成员进入独立活动群聊。
- 取消活动不删除帖子或群聊；仅发起人可删除活动讨论帖或解散活动群聊。

主要接口：

```http
GET /api/v1/channels/{channelId}/events
POST /api/v1/channels/{channelId}/events
GET /api/v1/channel-events/{eventId}
PUT /api/v1/channel-events/{eventId}
DELETE /api/v1/channel-events/{eventId}
POST /api/v1/channel-events/{eventId}/join
DELETE /api/v1/channel-events/{eventId}/join
GET /api/v1/channel-events/{eventId}/participants
GET /api/v1/calendar/events
POST /api/v1/channel-events/{eventId}/chat
DELETE /api/v1/channel-events/{eventId}/discussion-post
DELETE /api/v1/channel-events/{eventId}/chat
```

## 8. 聊天接口

```http
GET /api/v1/conversations
POST /api/v1/conversations
GET /api/v1/conversations/{conversationId}/messages
POST /api/v1/conversations/{conversationId}/messages
PUT /api/v1/conversations/{conversationId}/read
```

会话类型：

- `PRIVATE`：好友私聊。
- `GROUP`：群聊。

当前前端已接入会话切换、消息列表、发送消息和已读标记。未读数和最后消息时间由后端返回。

群聊管理接口见：

```text
docs/群聊管理_API_v1.md
```

群聊管理支持群详情、改名、移除成员、退出群聊、转让群主和逻辑解散。前端在既有消息页右侧以可收起管理栏呈现，私聊不显示该入口。

## 9. 设置、通知、举报和文件

### 9.1 隐私设置

```http
GET /api/v1/settings/privacy
PUT /api/v1/settings/privacy
```

字段（8 项隐私设置）：

- `defaultNoteVisibility`：默认笔记可见范围（PUBLIC/FRIENDS/PRIVATE）。
- `defaultChannelJoinType`：默认频道加入方式（PUBLIC/PASSWORD）。
- `directMessagePermission`：私信权限（EVERYONE/FRIENDS_ONLY/NONE）。
- `searchableByUsers`：允许其他用户通过搜索找到你。
- `showEmailOnProfile`：在个人主页展示邮箱。
- `personalizedRecommendations`：开启个性化内容推荐。
- `activityNotifications`：活动通知。
- `loginAlerts`：登录提醒。

### 9.2 通知

```http
GET /api/v1/notifications
GET /api/v1/notifications/count
PUT /api/v1/notifications/{notificationId}/read
PUT /api/v1/notifications/read-all
```

### 9.3 举报

```http
POST /api/v1/reports
```

举报对象类型包括：

- `NOTE`
- `CHANNEL_POST`
- `MESSAGE`
- `USER`

### 9.4 图片上传

```http
POST /api/v1/files/images
```

当前图片上传支持两种方式：本地联调时将图片保存到后端本机 `uploads/images` 目录；团队联调时通过 MinIO 对象存储实现跨机器图片共享，图片统一上传到组长电脑的 MinIO bucket `whu-circle`。两种方式下接口返回格式一致，前端发布笔记时先上传图片，再把返回的 URL 放入 `imageUrls` 提交给 `/notes`。MySQL 只保存图片 URL 和排序信息，不保存图片二进制内容。`uploads` 目录已被 Git 忽略，不要提交本地上传文件。

## 10. 推荐与管理接口

### 10.1 推荐

```http
GET /api/v1/recommendations/home
GET /api/v1/recommendations/notes
GET /api/v1/recommendations/users
GET /api/v1/recommendations/channels
POST /api/v1/recommendations/feedback
```

推荐系统基于多因子评分（同学院、同年级、好友圈层、标签偏好、互动热度等维度），首页混合推荐笔记、用户和频道。

### 10.2 全站管理

```http
GET /api/v1/admin/dashboard
PUT /api/v1/admin/users/{userId}/status
PUT /api/v1/admin/channels/{channelId}/status
DELETE /api/v1/admin/notes/{noteId}
DELETE /api/v1/admin/channel-posts/{postId}
```

仅 `role=ADMIN` 可访问，后端双重校验权限。管理面板提供用户、频道、笔记、帖子四项统计数据。

## 11. 数据库说明

数据库脚本位置：

```text
backend/sql/001_schema.sql
backend/sql/002_seed.sql
backend/sql/README.md
```

注意：

- `001_schema.sql` 建库建表。
- `002_seed.sql` 写入演示用户、笔记、频道、聊天、通知等数据。
- 演示数据使用固定 demo id，不会清空真实注册账号。
- 每个队友都应在自己电脑上初始化本地 MySQL，不建议多人直接连组长电脑的本地数据库。

## 12. 分工建议

- A 同学（前端）：继续微调页面样式、组件拆分、交互细节；新增字段前先确认 API 文档。
- B 同学（后端）：维护接口实现、接口文档、认证逻辑和业务规则。
- C 同学（数据库）：维护表结构、索引、演示数据和后续部署数据库方案。

## 13. 本轮联调重点

本轮目标是“本机可运行的初步完整版”：

- 前端页面风格保持简洁校园社交产品，不做复杂营销页。
- 后端所有核心接口可用，数据库提供足够演示数据。
- 队友拉取仓库后，按 README 初始化数据库并启动前后端即可看到同样效果。
