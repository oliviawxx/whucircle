# WHU Circle 后端 API 开发与联调文档

> 文档版本：2026-07-06
> 对应前端：当前初步展示版
> 后端：Spring Boot 3.5.16、Java 17、springdoc-openapi 2.8.17
> 当前数据源：`mock` 内存数据

## 1. 今晚交付结果

后端代码位于 `backend/`，已经可以独立启动，不依赖数据库。Swagger 当前包含 31 条路径、38 个 HTTP 操作，覆盖：

- 校内邮箱注册、登录、当前用户和退出。
- 公开主页、社交圈、我的笔记、收藏搜索、详情、评论、点赞和收藏。
- 关注、互关好友、用户主页、拉黑和黑名单。
- 频道列表、公开/密码加入、5 条游客预览、发帖、回复和点赞。
- 好友私聊/群聊列表、历史消息、发送和已读。
- 隐私设置、举报、图片上传占位接口。

已通过 6 个 Spring Boot 集成测试。当前实现用于前后端联调和产品展示，不是生产实现。

## 2. 启动与联调入口

```powershell
git clone https://github.com/oliviawxx/whucircle.git
cd whucircle\backend
mvn spring-boot:run
```

| 项目 | 地址或值 |
|---|---|
| API 根地址 | `http://127.0.0.1:8080/api/v1` |
| Swagger | `http://127.0.0.1:8080/swagger-ui/index.html` |
| OpenAPI JSON | `http://127.0.0.1:8080/v3/api-docs` |
| 前端地址 | `http://127.0.0.1:5173` |
| 测试邮箱 | `student@whu.edu.cn` |
| 测试密码 | `example123` |
| mock 验证码 | `123456` |
| 固定 Token | `demo-access-token` |
| 密码频道测试密码 | `whu2026` |

Swagger 点击右上角 `Authorize`，填 `demo-access-token`。前端请求头写完整格式：

```http
Authorization: Bearer demo-access-token
```

## 3. 必须遵守的接口约定

### 3.1 请求与响应

- JSON 请求使用 `Content-Type: application/json`。
- 字段名统一使用小驼峰，例如 `imageUrls`、`createdAt`。
- 时间统一为带时区的 ISO 8601，例如 `2026-07-06T21:00:00+08:00`。
- ID 当前为 JSON 数字，MySQL 表建议使用 `BIGINT`。
- 枚举必须传英文大写值，不传页面上的中文文字。
- 除公开认证接口外，全部携带 Bearer Token。

成功响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

错误响应：

```json
{
  "code": 40302,
  "message": "未加入频道",
  "data": null
}
```

前端不能只看 HTTP 状态码，还要判断业务字段 `code === 0`。

### 3.2 分页

列表接口统一接收 `page`、`size`，页码从 1 开始，`size` 最大 100：

```json
{
  "items": [],
  "page": 1,
  "size": 20,
  "total": 35,
  "hasMore": true
}
```

### 3.3 固定枚举

| 类型 | 可选值 |
|---|---|
| 笔记可见性 | `PUBLIC`、`FRIENDS`、`PRIVATE` |
| 笔记列表范围 | `PUBLIC`、`SOCIAL`、`MINE`、`SAVED` |
| 用户关系 | `NONE`、`FOLLOWING`、`FOLLOWER`、`FRIEND`、`BLOCKED` |
| 频道加入方式 | `PUBLIC`、`PASSWORD` |
| 会话类型 | `PRIVATE`、`GROUP` |
| 私信权限 | `EVERYONE`、`FRIENDS_ONLY`、`NONE` |
| 举报目标 | `NOTE`、`CHANNEL_POST`、`MESSAGE`、`USER` |
| 举报原因 | `ADVERTISEMENT`、`HARASSMENT`、`FALSE_INFORMATION`、`OTHER` |

### 3.4 错误码

| code | HTTP | 含义 |
|---|---:|---|
| `40000` | 400 | 参数或校内邮箱格式错误 |
| `40001` | 400 | 邮箱或密码错误 |
| `40002` | 400 | 验证码错误或过期 |
| `40100` | 401 | 未登录或 Token 无效 |
| `40300` | 403 | 无权限或被拉黑 |
| `40301` | 403 | 非好友，不能查看好友可见笔记 |
| `40302` | 403 | 未加入频道，不能互动 |
| `40303` | 403 | 频道密码错误 |
| `40400` | 404 | 用户、笔记、频道或会话不存在 |
| `40900` | 409 | 邮箱已注册等状态冲突 |
| `50000` | 500 | 未处理的服务端错误 |

## 4. 代码结构

```text
backend/src/main/java/com/whucircle/
├─ controller/       路由、请求参数、返回 ApiResponse
├─ service/          权限与业务规则
├─ repository/       存储接口，数据库接入的边界
├─ repository/mock/  当前内存实现和演示数据
├─ domain/           业务对象与枚举
├─ dto/              请求/响应 DTO
├─ security/         Token 拦截与当前用户
├─ config/           CORS、Swagger、MVC 配置
└─ common/           响应、分页、异常和错误码
```

请求路径是：`Controller -> Service -> Repository 接口 -> mock/mysql 实现`。C 同学接数据库时不要改 Controller 的返回格式。

## 5. 已实现 API：界面、功能、实现和位置

### 5.1 公共与认证

| 界面 | 方法与路径 | 功能及实现思路 | 主要代码位置 |
|---|---|---|---|
| 启动检查 | `GET /health` | 不鉴权，返回服务和 Profile 状态 | `HealthController` |
| 注册 | `POST /auth/email-code` | 校验 `@whu.edu.cn`，mock 保存固定验证码并返回 300 秒 | `AuthController`、`AuthService.sendCode` |
| 注册 | `POST /auth/register` | 校验邮箱、验证码和重复账号，创建用户并签发 Token | `AuthController`、`AuthService.register`、`UserRepository.save` |
| 登录 | `POST /auth/login` | 按邮箱查用户并校验密码，签发访问 Token | `AuthController`、`AuthService.login`、`TokenService` |
| 全局 | `GET /auth/me` | 从 Bearer Token 解析用户 ID，再返回用户摘要 | `AuthenticationInterceptor`、`AuthService.me` |
| 个人菜单 | `POST /auth/logout` | 从内存 Token 表删除当前 Token | `AuthController.logout`、`TokenService.revoke` |

关键请求：

```json
POST /auth/login
{"email":"student@whu.edu.cn","password":"example123"}
```

```json
POST /auth/register
{"email":"new@whu.edu.cn","code":"123456","password":"example123","nickname":"新用户"}
```

### 5.2 主页、社交圈与收藏

| 界面 | 方法与路径 | 功能及实现思路 | 主要代码位置 |
|---|---|---|---|
| 主页/收藏/我的主页 | `GET /notes` | 按 `scope` 过滤，再做关键词、标签和分页；主页只返回公开笔记 | `NoteController.list`、`NoteService.list` |
| 发布弹层 | `POST /notes` | 校验标题、正文、图片数、标签数，使用当前用户创建笔记 | `NoteController.create`、`NoteService.create` |
| 笔记弹层 | `GET /notes/{noteId}` | 按公开、好友、私密规则校验后返回详情 | `NoteService.detail`、`canView` |
| 笔记弹层 | `GET /notes/{noteId}/comments` | 先校验笔记可见性，再返回评论和作者摘要 | `NoteService.comments` |
| 笔记弹层 | `POST /notes/{noteId}/comments` | 阻止拉黑关系评论，写入评论并增加计数 | `NoteService.comment` |
| 笔记卡片 | `POST /notes/{noteId}/like` | 切换当前用户点赞状态并返回最新计数 | `NoteService.toggleLike`、`NoteRepository.toggleLike` |
| 笔记卡片 | `POST /notes/{noteId}/save` | 切换收藏状态；收藏页复用 `scope=SAVED` | `NoteService.toggleSave` |
| 社交圈 | `GET /feed/social` | 只显示已关注用户；好友可见内容要求互关 | `NoteController.socialFeed`、`NoteService.isSocialVisible` |
| 标签筛选 | `GET /tags` | 汇总现有笔记标签并去重排序 | `NoteService.tags` |

列表示例：

```http
GET /api/v1/notes?scope=PUBLIC&keyword=图书馆&tag=学习&page=1&size=20
```

发布示例：

```json
{
  "title": "今天的校园记录",
  "content": "晚饭后去了樱顶。",
  "visibility": "PUBLIC",
  "imageUrls": [],
  "tags": ["校园生活"]
}
```

### 5.3 用户关系与黑名单

| 界面 | 方法与路径 | 功能及实现思路 | 主要代码位置 |
|---|---|---|---|
| 社交圈 | `GET /relations` | 返回其他用户及当前关系状态 | `UserController.relations`、`UserRepository.relation` |
| 对方主页 | `GET /users/{userId}` | 拉黑任一方向时拒绝查看，否则返回资料和关系 | `UserService.profile` |
| 对方主页 | `POST /users/{userId}/follow` | 新增单向关注；若对方已关注我，关系立即变为 `FRIEND` | `UserService.follow`、`InMemoryUserRepository.relation` |
| 对方主页 | `DELETE /users/{userId}/follow` | 删除单向关注，好友关系自动解除 | `UserService.unfollow` |
| 对方主页 | `POST /users/{userId}/block` | 加入黑名单并取消我对对方的关注 | `UserService.block` |
| 设置 | `GET /blocks` | 返回当前用户拉黑的用户列表 | `UserService.blockedUsers` |
| 设置 | `DELETE /users/{userId}/block` | 解除拉黑，不自动恢复关注 | `UserService.unblock` |

### 5.4 频道

| 界面 | 方法与路径 | 功能及实现思路 | 主要代码位置 |
|---|---|---|---|
| 频道页 | `GET /channels` | 支持 `joined`、`keyword` 和分页，返回加入方式、公告、管理员 | `ChannelController.channels`、`ChannelService.list` |
| 频道页 | `GET /channels/{channelId}` | 返回频道详情及当前用户是否加入 | `ChannelService.detail` |
| 加入弹层 | `POST /channels/{channelId}/join` | 公开频道直接加入；密码频道校验 `password` | `ChannelService.join` |
| 频道主页 | `GET /channels/{channelId}/posts` | 已加入返回完整列表；未加入最多返回 5 条 | `ChannelService.posts` |
| 频道主页 | `POST /channels/{channelId}/posts` | 仅频道成员可发布内部帖子 | `ChannelService.createPost` |
| 帖子弹层 | `GET /channel-posts/{postId}` | 仅成员可查看完整帖子和回复 | `ChannelService.postDetail` |
| 帖子弹层 | `POST /channel-posts/{postId}/replies` | 仅成员可回复，并增加回复计数 | `ChannelService.reply` |
| 帖子弹层 | `POST /channel-posts/{postId}/like` | 仅成员可切换点赞 | `ChannelService.toggleLike` |

密码频道加入请求：

```json
{"password":"whu2026"}
```

### 5.5 聊天

| 界面 | 方法与路径 | 功能及实现思路 | 主要代码位置 |
|---|---|---|---|
| 聊天列表 | `GET /conversations` | 返回当前用户参与的私聊和群聊，按最后消息时间倒序并计算未读数 | `ChatService.conversations` |
| 会话窗口 | `GET /conversations/{id}/messages` | 校验会话成员身份，分页返回消息 | `ChatService.messages` |
| 会话窗口 | `POST /conversations/{id}/messages` | 校验成员和拉黑关系，保存消息并更新会话最后消息 | `ChatService.send`、`ChatRepository.saveMessage` |
| 会话窗口 | `PUT /conversations/{id}/read` | 把当前会话消息标记为该用户已读 | `ChatService.markRead` |

当前采用普通 HTTP，不实现 WebSocket。前端发送成功后把返回的消息插入当前列表即可。

### 5.6 设置、举报与图片

| 界面 | 方法与路径 | 功能及实现思路 | 主要代码位置 |
|---|---|---|---|
| 隐私设置 | `GET /settings/privacy` | 获取默认笔记范围、默认频道类型和私信权限 | `SettingsController.get`、`SettingsRepository` |
| 隐私设置 | `PUT /settings/privacy` | 整体覆盖三项隐私设置 | `SettingsService.update` |
| 举报入口 | `POST /reports` | 统一接收笔记、频道帖、消息、用户举报，返回待处理状态 | `ReportController`、`ReportService` |
| 发布弹层 | `POST /files/images` | 校验 multipart 图片，mock 返回固定可访问图片 URL | `FileController.upload` |

举报请求：

```json
{
  "targetType": "NOTE",
  "targetId": 101,
  "reason": "HARASSMENT",
  "description": ""
}
```

图片上传字段名必须是 `file`，Content-Type 为 `multipart/form-data`。

## 6. A、B、C 三人明日分工

### 6.1 A 同学：前端与接口接入

1. 新建 `src/api/`，按 `auth.js`、`notes.js`、`social.js`、`channels.js`、`chat.js`、`settings.js` 拆分请求。
2. 新建统一请求函数，集中配置 `baseURL`、Bearer Token、`code !== 0` 的错误处理。
3. 先接登录、主页笔记、笔记详情、频道列表、聊天列表五条主流程。
4. 页面字段只使用 DTO 中的英文枚举，不把“公开”“好友可见”等中文直接发给后端。
5. 出现字段不足时记录“界面、缺少字段、用途、示例值”，不要直接改变已有响应结构。

A 同学联调前确认：后端 8080 端口已启动；浏览器 Network 中请求地址为 `/api/v1/...`；请求头存在 `Authorization`；CORS 不再报错。

### 6.2 B 同学：后端与联调负责人（你）

1. 保持当前接口路径、DTO 字段、枚举和错误码稳定。
2. 根据 A 同学反馈补 DTO 或新接口，不让前端读取 Repository/数据库字段。
3. 与 C 同学逐个确认 Repository 方法所需的表和索引。
4. C 同学完成一个 MySQL Repository 后，补对应 Service 集成测试。
5. 每次合并前执行 `mvn test`，并通过 Swagger 手动检查当天新增接口。

### 6.3 C 同学：MySQL、表结构与数据库测试

1. 在 `backend/` 复制 `.env.example` 为 `.env`，执行 `docker compose up -d` 启动 MySQL 8.4。
2. 根据 `domain/`、`dto/` 和 Repository 接口设计表，不根据前端中文展示文案命名字段。
3. 第一批先建 `users`、`notes`、`note_comments`、`note_likes`、`note_saves`、`follows`、`blocks`。
4. 第二批建 `channels`、`channel_members`、`channel_posts`、`channel_post_replies`、`channel_post_likes`。
5. 第三批建 `conversations`、`conversation_members`、`messages`、`message_read_status`、`user_settings`、`reports`。
6. 加入 `spring-boot-starter-data-jpa`、`mysql-connector-j` 和 Flyway，新增 `repository/mysql/`，实现现有 Repository 接口。
7. 密码、数据库账号和 `.env` 不得提交；SQL 迁移脚本需要提交。

建议索引优先覆盖：邮箱唯一索引、笔记作者和创建时间、关注双方联合唯一索引、频道成员联合唯一索引、消息会话和发送时间。

## 7. 数据库替换步骤

当前不要删除 `repository/mock/`，两套实现通过 Profile 切换。

1. C 同学创建 `repository/mysql/` 和数据库 Entity。
2. MySQL 实现类添加 `@Profile("mysql")`，mock 实现继续保留 `@Profile("mock")`。
3. 配置环境变量：`DB_URL`、`DB_USERNAME`、`DB_PASSWORD`。
4. 使用 `--spring.profiles.active=mysql` 启动。
5. B 同学运行同一套 Controller 集成测试，确认响应 JSON 未变化。

推荐表：

```text
users, email_verification_codes, user_settings,
follows, blocks,
notes, note_images, tags, note_tags, note_comments, note_likes, note_saves,
channels, channel_members, channel_admins, channel_posts, channel_post_replies, channel_post_likes,
conversations, conversation_members, messages, message_read_status,
reports
```

## 8. 明天联调顺序

1. B 启动后端，A 用固定 Token 请求 `GET /auth/me`。
2. A 接 `GET /notes`，核对分页和笔记卡片字段。
3. A 接详情、评论、点赞和收藏。
4. A 接 `GET /feed/social`，检查好友可见笔记只出现在社交圈。
5. A 接频道列表、加入和帖子列表，验证未加入只显示 5 条。
6. A 接聊天列表和消息切换。
7. C 并行设计表，先完成用户和笔记 Repository。
8. 每完成一组，三人只讨论该组接口的字段差异，确认后再改文档和代码。

## 9. 当前限制

- mock 数据在后端重启后恢复初始状态。
- mock 密码是明文，仅用于演示；数据库版必须使用 BCrypt 等单向哈希。
- 验证码没有真实发送，接口会返回固定验证码；生产环境不能返回验证码。
- Token 当前保存在内存且不含过期检查；后续可换 JWT 或服务端会话。
- 图片上传返回固定外链，尚未保存文件或接对象存储。
- 聊天是 HTTP 拉取，没有 WebSocket 实时推送。
- `mysql` Profile 目前只有连接占位，C 同学完成依赖和实现后才能启动。

## 10. 官方资料

- [Spring Boot 3.5.16 发布说明](https://spring.io/blog/2026/06/25/spring-boot-3-5-16-available-now)
- [Spring Boot Profiles](https://docs.spring.io/spring-boot/reference/features/profiles.html)
- [Spring Boot SQL Databases](https://docs.spring.io/spring-boot/reference/data/sql.html)
- [springdoc-openapi 2.8.17](https://springdoc.org/)
- [MySQL 8.4 Reference Manual](https://dev.mysql.com/doc/refman/8.4/en/)
- [MySQL 官方 Docker 镜像](https://hub.docker.com/_/mysql)
