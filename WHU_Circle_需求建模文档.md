# WHU Circle 需求建模文档

## 一、用户需求说明

### 1.1 项目定位

WHU Circle 是以校园社交为核心的网页端系统，围绕内容分享、关系维护、频道讨论、日常聊天四个功能展开。

```mermaid
flowchart LR
    U["用户"] --> FE["React"]
    FE --> API["Spring Boot"]
    API --> DB[("MySQL")]
    API --> SMTP["邮箱验证码"]
```

**基础功能**：校内邮箱注册与登录 / 图文笔记发布与浏览 / 关注与社交圈 / 公开与密码频道 / 私聊与群聊 / 隐私设置与举报。

### 1.2 用户角色

| 角色 | 说明 |
|---|---|
| **未登录访客** | 注册、登录、找回密码 |
| **普通用户** | 笔记、互动、关注、频道、聊天、隐私 |
| **频道管理员** | 创建频道后自动获得，可改公告和置顶 |
| **平台管理员** | 拓展角色，负责举报审核 |

```mermaid
flowchart LR
    Guest["访客"] --> User["用户"]
    User -->|建频道| CA["频道管理员"]
    PA["平台管理员"] -.->|拓展| Review["举报审核"]
```

### 1.3 核心业务需求

**认证与资料**：`@whu.edu.cn` 邮箱注册，验证码 5 分钟有效、60s 冷却、最多 5 次错误。登录签发 Token。用户维护昵称、头像、学院、年级、简介。

**笔记**：主页展示公开笔记，支持搜索和标签筛选。可见性分 PUBLIC / FRIENDS / PRIVATE。可点赞、评论、收藏。好友可见仅互关好友可看。

**社交**：关注为单向，互关后成好友。社交圈展示关注用户的笔记。拉黑后限制私信、评论和主页查看。

**频道**：公开直接加入，密码频道校验密码。未加入预览 5 条，加入后可发帖、回复、点赞。仅管理员可置顶和改公告。

**聊天**：好友私聊和群聊，会话按时间排序。后续可拓展已读和实时推送。

**通知与安全**：点赞、评论、收藏、回复触发通知。可设笔记默认可见范围和私信权限。可举报笔记、帖子、消息、用户。

### 1.4 业务流程图

```mermaid
flowchart TD
    subgraph 注册登录
        A1["输入校内邮箱"] --> A2{"邮箱有效?"}
        A2 -->|否| A3["提示"] --> A1
        A2 -->|是| A4["发送验证码"]
        A4 --> A5["输入验证码+密码"]
        A5 --> A6{"校验通过?"}
        A6 -->|否| A5
        A6 -->|是| A7["创建用户，签发 Token"]
    end
```

```mermaid
flowchart TD
    subgraph 发布笔记
        B1["填写标题/正文/图片/标签"] --> B2["选择可见范围"]
        B2 --> B3{"校验"}
        B3 -->|通过| B4["保存"]
        B4 --> B5{"可见性"}
        B5 -->|公开| B6["主页"]
        B5 -->|好友| B7["社交圈"]
        B5 -->|私密| B8["仅自己"]
    end
```

```mermaid
flowchart TD
    subgraph 社交 + 频道
        C1["A 关注 B"] --> C2{"B 已关注 A?"}
        C2 -->|否| C3["A 看到 B 公开笔记"]
        C2 -->|是| C4["互关好友，互看好友笔记"]
        D1["选择频道"] --> D2{"类型"}
        D2 -->|公开| D3["直接加入"]
        D2 -->|密码| D4["输密码"] --> D5{"正确?"}
        D5 -->|否| D4
        D5 -->|是| D3
        D3 --> D6["发帖/回复/点赞"]
    end
```

## 二、需求分析建模

### 2.1 用例图

```mermaid
flowchart LR
    Guest["访客"]
    User["用户"]
    CA["频道管理员"]
    Admin["平台管理员"]

    subgraph S["WHU Circle"]
        UC1["注册/登录"]
        UC2["编辑资料"]
        UC3["发布笔记"]
        UC4["浏览主页"]
        UC5["互动（点赞/评论/收藏）"]
        UC6["关注/拉黑"]
        UC7["社交圈"]
        UC8["加入频道"]
        UC9["频道发帖"]
        UC10["频道管理"]
        UC11["聊天"]
        UC12["隐私设置"]
        UC13["举报"]
        UC14["审核举报"]
    end

    Guest --> UC1
    User --> UC2 & UC3 & UC4 & UC5 & UC6 & UC7
    User --> UC8 & UC9 & UC11 & UC12 & UC13
    CA --> UC10
    Admin --> UC14
```

### 2.2 用例规约摘要

| 用例 | 流程要点 |
|---|---|
| **注册** | 输入邮箱 → 请求验证码 → 提交验证码+密码+昵称 → 校验通过后创建用户并返回 Token |
| **发布笔记** | 填写内容 → 选可见范围 → 系统校验后保存 → 按权限展示 |
| **加入频道** | 公开直接加入，密码频道校验后加入。未加入仅预览 5 条 |
| **频道发帖** | 仅成员可发帖，非成员不可操作 |

### 2.3 时序图

```mermaid
sequenceDiagram
    actor U as 用户
    participant BE as 后端
    participant DB as MySQL
    U->>BE: POST /auth/login（邮箱+密码）
    BE->>DB: 查询用户
    DB-->>BE: 返回 password_hash
    BE->>BE: 校验密码
    BE-->>U: 返回 Token
    U->>BE: GET /notes?scope=PUBLIC
    BE->>DB: 查询公开笔记
    DB-->>BE: 返回列表
    BE-->>U: 分页数据
    U->>BE: GET /feed/social
    BE->>DB: 查询关注关系与可见内容
    DB-->>BE: 返回结果
    BE-->>U: 社交圈列表
    U->>BE: POST /channels/{id}/posts
    BE->>DB: 校验身份，写入
    DB-->>BE: 成功
    BE-->>U: 返回帖子
```

### 2.4 数据流图

```mermaid
flowchart TD
    U["用户"] --> FE["前端"]
    FE --> AUTH["认证"] & NOTE["笔记"] & SOCIAL["社交"]
    FE --> CHANNEL["频道"] & CHAT["聊天"]
    AUTH --> DB[("数据库")]
    NOTE --> DB
    SOCIAL --> DB
    CHANNEL --> DB
    CHAT --> DB
```

### 2.5 ER 图

```mermaid
erDiagram
    users ||--o{ notes : publishes
    notes ||--o{ comments : contains
    notes ||--o{ note_images : has
    notes ||--o{ note_tags : has
    users ||--o{ note_likes : likes
    users ||--o{ note_saves : saves
    users ||--o{ user_follows : follows
    users ||--o{ user_blocks : blocks
    users ||--|| privacy_settings : owns
    users ||--o{ channels : administers
    channels ||--o{ channel_members : has
    channels ||--o{ channel_posts : contains
    channel_posts ||--o{ channel_replies : contains
    channel_posts ||--o{ channel_post_likes : liked_by
    conversations ||--o{ conversation_members : has
    conversations ||--o{ messages : contains
    messages ||--o{ message_read_status : read_by
    users ||--o{ notifications : receives
    users ||--o{ reports : submits
```

### 2.6 数据字典

| 实体 | 关键字段 |
|---|---|
| **用户** | id, email, password_hash, nickname, avatar_url, college, grade, bio |
| **笔记** | author_id, title, content, visibility, like_count, comment_count |
| **附属** | note_images, note_tags, comments, note_likes, note_saves |
| **社交** | user_follows, user_blocks, privacy_settings |
| **频道** | name, join_type(公开/密码), password_hash, administrator_id |
| **频道帖子** | channel_id, author_id, title, content, pinned |
| **聊天** | conversations(PRIVATE/GROUP), messages, message_read_status |
| **系统** | notifications, reports, email_verification_codes |

| 枚举 | 取值 |
|---|---|
| 笔记可见范围 | `PUBLIC` / `FRIENDS` / `PRIVATE` |
| 频道加入方式 | `PUBLIC` / `PASSWORD` |
| 会话类型 | `PRIVATE` / `GROUP` |
| 私信权限 | `EVERYONE` / `FRIENDS_ONLY` / `NONE` |
| 举报状态 | `PENDING` / `RESOLVED` / `REJECTED` |

### 2.7 状态图

```mermaid
stateDiagram-v2
    [*] --> NONE
    NONE --> FOLLOWING: 我关注对方
    NONE --> FOLLOWER: 对方关注我
    FOLLOWING --> FRIEND: 互关
    FOLLOWER --> FRIEND: 互关
    FRIEND --> BLOCKED: 拉黑
    BLOCKED --> NONE: 解除
    [*] --> PENDING: 提交举报
    PENDING --> RESOLVED: 处理
    PENDING --> REJECTED: 驳回
```

## 三、非功能性需求说明

### 3.1 开发与运行环境

| 层级 | 技术栈 |
|---|---|
| 前端 | React 19 + Vite 6 |
| 后端 | Spring Boot 3.5.16 + JDK 17 + Maven 3.9 |
| 数据库 | MySQL 8.4（utf8mb4） |
| 接口文档 | springdoc-openapi / Swagger |

| 服务 | 地址 |
|---|---|
| 前端开发 | `http://127.0.0.1:5173` |
| 后端 API | `http://127.0.0.1:8080/api/v1` |
| Swagger | `http://127.0.0.1:8080/swagger-ui/index.html` |

### 3.2 系统依赖

- MySQL 8.4（Docker Compose）
- QQ 邮箱 SMTP（验证码发送）
- Spring Security Crypto（BCrypt）
- 不依赖 Redis / Nginx / 消息队列

### 3.3 安全性

- 密码 BCrypt 哈希存储
- 除认证接口外全量 Token 鉴权
- 后端统一校验可见性和频道成员权限
- 拉黑限制私信、评论和主页查看
- 数据库密码和邮箱授权码不提交 GitHub

### 3.4 性能与可维护性

- 列表分页返回，默认 20 条/页，首屏 < 2s
- 前端 API 集中维护在 `src/api/`
- 后端 Controller → Service → Repository 分层
- 响应统一 `{ code, message, data }`，枚举用英文常量

## 四、拓展实现目标

- **活动组织**：活动发布、报名、日历视图
- **管理后台**：举报审核、违规处理、数据统计
- **推荐优化**：基于标签和互动的内容排序
- **WebSocket**：实时消息推送
- **文件存储**：图片外链替换为对象存储
- **统一搜索**：用户、笔记、频道、帖子
- **移动端适配**：手机浏览器布局优化
