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
GET /api/v1/channels/{channelId}/posts
POST /api/v1/channels/{channelId}/posts
GET /api/v1/channel-posts/{postId}
POST /api/v1/channel-posts/{postId}/replies
POST /api/v1/channel-posts/{postId}/like
PUT /api/v1/channel-posts/{postId}/pin
```

频道权限：

- `PUBLIC`：公开频道，可直接加入。
- `PRIVATE`：私密频道，需要密码。

当前前端已接入频道列表、加入弹窗、密码频道、频道内发帖、帖子详情、回复、点赞、置顶和公告展示。

## 7. 聊天接口

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

## 8. 设置、通知、举报和文件

### 8.1 隐私设置

```http
GET /api/v1/settings/privacy
PUT /api/v1/settings/privacy
```

字段：

- `defaultNoteVisibility`：默认笔记可见范围。
- `defaultChannelJoinType`：默认频道加入权限。
- `directMessagePermission`：私信权限。

### 8.2 通知

```http
GET /api/v1/notifications
GET /api/v1/notifications/count
PUT /api/v1/notifications/{notificationId}/read
PUT /api/v1/notifications/read-all
```

### 8.3 举报

```http
POST /api/v1/reports
```

举报对象类型包括：

- `NOTE`
- `CHANNEL_POST`
- `MESSAGE`

### 8.4 图片上传

```http
POST /api/v1/files/images
```

当前本地联调版本会把图片保存到后端本机 `uploads/images` 目录，并返回可访问地址，例如：

```json
{
  "url": "/uploads/images/2026/07/xxxx.png"
}
```

前端发布笔记时先上传图片，再把返回的 URL 放入 `imageUrls` 提交给 `/notes`。MySQL 只保存图片 URL 和排序信息，不保存图片二进制内容。`uploads` 目录已被 Git 忽略，不要提交本地上传文件。

后续如果部署到线上，可把本地目录替换为对象存储，接口返回格式保持不变。

## 9. 推荐接口

```http
GET /api/v1/recommendations/home
GET /api/v1/recommendations/notes
GET /api/v1/recommendations/users
GET /api/v1/recommendations/channels
POST /api/v1/recommendations/feedback
```

当前页面主要使用笔记、频道和社交圈的直接接口，推荐接口作为后续扩展保留。

## 10. 数据库说明

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

## 11. 分工建议

- A 同学（前端）：继续微调页面样式、组件拆分、交互细节；新增字段前先确认 API 文档。
- B 同学（后端）：维护接口实现、接口文档、认证逻辑和业务规则。
- C 同学（数据库）：维护表结构、索引、演示数据和后续部署数据库方案。

## 12. 本轮联调重点

本轮目标是“本机可运行的初步完整版”：

- 前端页面风格保持简洁校园社交产品，不做复杂营销页。
- 后端所有核心接口可用，数据库提供足够演示数据。
- 队友拉取仓库后，按 README 初始化数据库并启动前后端即可看到同样效果。
