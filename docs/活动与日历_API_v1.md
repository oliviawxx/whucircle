# WHU Circle 活动与日历 API v1 草案

本文档定义频道活动和个人日历的第一版 API。接口统一使用 `/api/v1` 前缀，返回格式沿用项目现有约定：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

所有接口默认需要登录，并通过请求头携带：

```http
Authorization: Bearer <token>
```

## 1. 业务范围

第一版目标：

- 频道管理员可以在频道内发布统一活动。
- 活动可以同步生成一条频道帖子，供成员评论讨论。
- 活动可以建立仅面向已报名成员的活动群聊，用于后续协调。
- 频道成员可以加入或取消加入活动。
- 用户可以在个人日历中查看自己加入的活动。
- 活动发布、更新、取消可以产生通知。

第一版暂不包含：

- 报名审核。
- 活动签到。
- 重复活动。
- 外部日历导出。
- 活动图片独立上传。

## 2. 枚举约定

### 2.1 活动状态 `eventStatus`

| 值 | 说明 |
| --- | --- |
| `PUBLISHED` | 已发布，可展示，可报名 |
| `CANCELLED` | 已取消，不可报名 |

活动是否已结束由 `endTime < 当前时间` 判断，第一版不单独落库 `ENDED`。

### 2.2 报名状态 `participationStatus`

| 值 | 说明 |
| --- | --- |
| `NONE` | 当前用户未加入 |
| `JOINED` | 当前用户已加入 |
| `CANCELLED` | 当前用户曾取消加入，通常接口返回中可折叠为 `NONE` |

### 2.3 通知类型

| 值 | 说明 |
| --- | --- |
| `CHANNEL_EVENT_CREATED` | 频道发布新活动 |
| `CHANNEL_EVENT_UPDATED` | 活动信息更新 |
| `CHANNEL_EVENT_CANCELLED` | 活动取消 |
| `CHANNEL_EVENT_CHAT_CREATED` | 已创建活动群聊 |
| `CHANNEL_EVENT_CHAT_DISSOLVED` | 活动群聊已解散 |

## 3. 数据视图

### 3.1 活动列表视图 `ChannelEventView`

```json
{
  "id": 401,
  "channelId": 11,
  "channelName": "期末互助频道",
  "organizerId": 2,
  "organizerName": "遥遥",
  "linkedPostId": 301,
  "conversationId": 501,
  "chatStatus": "ACTIVE",
  "chatMemberCount": 29,
  "canEnterChat": true,
  "title": "离散数学考前答疑",
  "description": "集中讲解图论、递推和历年题。",
  "location": "信息学部 2 教 204",
  "startTime": "2026-07-15T19:00:00+08:00",
  "endTime": "2026-07-15T21:00:00+08:00",
  "signupDeadline": "2026-07-15T18:00:00+08:00",
  "capacity": 60,
  "participantCount": 28,
  "status": "PUBLISHED",
  "joined": true,
  "full": false,
  "ended": false,
  "canManage": true,
  "createdAt": "2026-07-10T10:00:00+08:00",
  "updatedAt": "2026-07-10T10:00:00+08:00"
}
```

字段说明：

- `linkedPostId`：活动关联的频道帖子 ID；如果管理员选择不同步帖子，则为 `null`。
- `conversationId`：活动关联群聊 ID；没有建立或群聊已经解散时为 `null`。
- `chatStatus`：`NOT_CREATED`、`ACTIVE`、`DISSOLVED`。活动取消不会改变群聊状态。
- `canEnterChat`：当前用户是否可进入活动群聊，仅活动发起人和已报名成员为 `true`。
- `capacity`：名额上限；不限人数时为 `null`。
- `joined`：当前登录用户是否已加入。
- `full`：`capacity != null && participantCount >= capacity`。
- `ended`：`endTime` 早于当前时间。
- `canManage`：当前用户是否为频道管理员。

### 3.2 活动详情视图 `ChannelEventDetail`

```json
{
  "event": {
    "id": 401,
    "channelId": 11,
    "channelName": "期末互助频道",
    "organizerId": 2,
    "organizerName": "遥遥",
    "linkedPostId": 301,
    "title": "离散数学考前答疑",
    "description": "集中讲解图论、递推和历年题。",
    "location": "信息学部 2 教 204",
    "startTime": "2026-07-15T19:00:00+08:00",
    "endTime": "2026-07-15T21:00:00+08:00",
    "signupDeadline": "2026-07-15T18:00:00+08:00",
    "capacity": 60,
    "participantCount": 28,
    "status": "PUBLISHED",
    "joined": true,
    "full": false,
    "ended": false,
    "canManage": true,
    "createdAt": "2026-07-10T10:00:00+08:00",
    "updatedAt": "2026-07-10T10:00:00+08:00"
  },
  "participants": [
    {
      "userId": 1,
      "nickname": "珞珈同学",
      "joinedAt": "2026-07-10T10:05:00+08:00"
    }
  ]
}
```

说明：

- 普通成员查看详情时，`participants` 可以只返回空数组或前 10 个报名用户。
- 频道管理员查看详情时，`participants` 返回完整报名列表。

### 3.3 报名结果 `EventJoinResponse`

```json
{
  "joined": true,
  "participantCount": 29,
  "capacity": 60,
  "full": false
}
```

## 4. 频道活动接口

### 4.1 获取频道活动列表

```http
GET /api/v1/channels/{channelId}/events?status=UPCOMING&joined=false&page=1&size=20
```

权限：

- 已加入频道成员可查看完整活动列表。
- 未加入频道用户最多查看公开摘要；第一版建议直接要求加入频道。

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | string | 否 | `UPCOMING`、`PAST`、`CANCELLED`，为空表示全部 |
| `joined` | boolean | 否 | 是否只看当前用户已加入的活动 |
| `page` | number | 否 | 默认 `1` |
| `size` | number | 否 | 默认 `20` |

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": 401,
        "channelId": 11,
        "channelName": "期末互助频道",
        "organizerId": 2,
        "organizerName": "遥遥",
        "linkedPostId": 301,
        "title": "离散数学考前答疑",
        "description": "集中讲解图论、递推和历年题。",
        "location": "信息学部 2 教 204",
        "startTime": "2026-07-15T19:00:00+08:00",
        "endTime": "2026-07-15T21:00:00+08:00",
        "signupDeadline": "2026-07-15T18:00:00+08:00",
        "capacity": 60,
        "participantCount": 28,
        "status": "PUBLISHED",
        "joined": false,
        "full": false,
        "ended": false,
        "canManage": true,
        "createdAt": "2026-07-10T10:00:00+08:00",
        "updatedAt": "2026-07-10T10:00:00+08:00"
      }
    ],
    "page": 1,
    "size": 20,
    "total": 1
  }
}
```

### 4.2 发布频道活动

```http
POST /api/v1/channels/{channelId}/events
```

权限：

- 仅频道管理员可调用。

请求：

```json
{
  "title": "离散数学考前答疑",
  "description": "集中讲解图论、递推和历年题。",
  "location": "信息学部 2 教 204",
  "startTime": "2026-07-15T19:00:00+08:00",
  "endTime": "2026-07-15T21:00:00+08:00",
  "signupDeadline": "2026-07-15T18:00:00+08:00",
  "capacity": 60,
  "createPost": true,
  "pinPost": false,
  "createChat": true
}
```

字段校验：

- `title`：必填，最多 100 字。
- `description`：必填，最多 5000 字。
- `location`：必填，最多 100 字。
- `startTime`：必填，必须早于 `endTime`。
- `endTime`：必填。
- `signupDeadline`：可空；不为空时应早于或等于 `startTime`。
- `capacity`：可空；不为空时必须大于 0。
- `createPost`：是否同步创建频道帖子，默认 `true`。
- `pinPost`：同步创建帖子时是否置顶，只有频道管理员可设置，默认 `false`。
- `createChat`：是否同时创建活动群聊，默认 `true`。创建失败不得回滚活动或讨论帖；响应返回 `chatStatus=NOT_CREATED`，发起人可稍后补建。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": 401,
    "channelId": 11,
    "channelName": "期末互助频道",
    "organizerId": 2,
    "organizerName": "遥遥",
    "linkedPostId": 301,
    "title": "离散数学考前答疑",
    "description": "集中讲解图论、递推和历年题。",
    "location": "信息学部 2 教 204",
    "startTime": "2026-07-15T19:00:00+08:00",
    "endTime": "2026-07-15T21:00:00+08:00",
    "signupDeadline": "2026-07-15T18:00:00+08:00",
    "capacity": 60,
    "participantCount": 0,
    "status": "PUBLISHED",
    "joined": false,
    "full": false,
    "ended": false,
    "canManage": true,
    "createdAt": "2026-07-10T10:00:00+08:00",
    "updatedAt": "2026-07-10T10:00:00+08:00"
  }
}
```

副作用：

- 如果 `createPost=true`，后端同步创建频道帖子，帖子标题建议为 `[活动] {title}`。
- 通知频道成员：`CHANNEL_EVENT_CREATED`。

### 4.3 获取活动详情

```http
GET /api/v1/channel-events/{eventId}
```

权限：

- 频道成员可查看。
- 频道管理员可查看完整报名列表。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "event": {
      "id": 401,
      "channelId": 11,
      "channelName": "期末互助频道",
      "organizerId": 2,
      "organizerName": "遥遥",
      "linkedPostId": 301,
      "title": "离散数学考前答疑",
      "description": "集中讲解图论、递推和历年题。",
      "location": "信息学部 2 教 204",
      "startTime": "2026-07-15T19:00:00+08:00",
      "endTime": "2026-07-15T21:00:00+08:00",
      "signupDeadline": "2026-07-15T18:00:00+08:00",
      "capacity": 60,
      "participantCount": 28,
      "status": "PUBLISHED",
      "joined": true,
      "full": false,
      "ended": false,
      "canManage": true,
      "createdAt": "2026-07-10T10:00:00+08:00",
      "updatedAt": "2026-07-10T10:00:00+08:00"
    },
    "participants": [
      {
        "userId": 1,
        "nickname": "珞珈同学",
        "joinedAt": "2026-07-10T10:05:00+08:00"
      }
    ]
  }
}
```

### 4.4 更新活动

```http
PUT /api/v1/channel-events/{eventId}
```

权限：

- 频道管理员可调用。

请求：

```json
{
  "title": "离散数学考前答疑",
  "description": "增加树、图和递推专题。",
  "location": "信息学部 2 教 305",
  "startTime": "2026-07-15T19:30:00+08:00",
  "endTime": "2026-07-15T21:30:00+08:00",
  "signupDeadline": "2026-07-15T18:30:00+08:00",
  "capacity": 80,
  "syncLinkedPost": true
}
```

说明：

- 第一版使用全量更新，前端提交完整字段。
- `syncLinkedPost=true` 时，同步更新关联频道帖子的标题和正文摘要。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": 401,
    "channelId": 11,
    "channelName": "期末互助频道",
    "organizerId": 2,
    "organizerName": "遥遥",
    "linkedPostId": 301,
    "title": "离散数学考前答疑",
    "description": "增加树、图和递推专题。",
    "location": "信息学部 2 教 305",
    "startTime": "2026-07-15T19:30:00+08:00",
    "endTime": "2026-07-15T21:30:00+08:00",
    "signupDeadline": "2026-07-15T18:30:00+08:00",
    "capacity": 80,
    "participantCount": 28,
    "status": "PUBLISHED",
    "joined": true,
    "full": false,
    "ended": false,
    "canManage": true,
    "createdAt": "2026-07-10T10:00:00+08:00",
    "updatedAt": "2026-07-10T11:20:00+08:00"
  }
}
```

副作用：

- 通知已报名成员：`CHANNEL_EVENT_UPDATED`。

### 4.5 取消活动

```http
DELETE /api/v1/channel-events/{eventId}
```

权限：

- 频道管理员可调用。

说明：

- 第一版不物理删除活动，后端将状态改为 `CANCELLED`。
- 关联帖子不删除，后端在帖子详情和活动信息中标记“活动已取消”。频道成员仍可阅读和评论，用于公开答疑与后续说明。
- 活动群聊不删除、不冻结，仍保留成员与历史记录；后续协调或群聊解散由活动发起人单独决定。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": 401,
    "status": "CANCELLED"
  }
}
```

副作用：

- 通知已报名成员：`CHANNEL_EVENT_CANCELLED`。

## 5. 活动讨论与活动群聊 API v1.1

活动具有两个互不替代的讨论入口：

| 入口 | 关联字段 | 可访问用户 | 用途 |
| --- | --- | --- | --- |
| 公开讨论帖 | `linkedPostId` | 已加入频道的成员 | 活动咨询、答疑、公开补充信息 |
| 活动群聊 | `conversationId` | 发起人、已报名成员 | 集合、临时调整、后续协调 |

活动详情接口仍是唯一的入口状态来源；前端依据 `linkedPostId` 显示“讨论答疑”，依据 `chatStatus` 与 `canEnterChat` 显示活动群聊按钮。

### 5.1 活动详情新增字段

`GET /api/v1/channel-events/{eventId}` 的 `event` 对象新增：

```json
{
  "linkedPostId": 301,
  "conversationId": 501,
  "chatStatus": "ACTIVE",
  "chatMemberCount": 29,
  "canEnterChat": true,
  "canManageDiscussion": true,
  "canManageChat": true
}
```

- `canManageDiscussion`、`canManageChat` 仅活动发起人为 `true`，频道其他管理员不可替代发起人删除讨论帖或解散群聊。
- `conversationId` 可直接交给既有 `GET /conversations/{conversationId}/messages` 与聊天页打开会话。

### 5.2 补建活动群聊

```http
POST /api/v1/channel-events/{eventId}/chat
```

权限：仅活动发起人。

请求：

```json
{
  "name": "离散数学考前答疑 · 活动群"
}
```

规则：

- 仅在 `chatStatus=NOT_CREATED` 时允许补建。
- 发起人自动入群；所有当前已报名成员自动入群。
- 群聊创建不受普通“仅好友可建群”限制，但仍应检查成员存在且未被封禁。
- `name` 可空，默认 `{活动标题} · 活动群`，最长 50 字。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "conversationId": 501,
    "name": "离散数学考前答疑 · 活动群",
    "status": "ACTIVE",
    "memberCount": 29
  }
}
```

### 5.3 加入/取消报名时的群聊联动

既有报名接口保留路径，但响应补充群聊状态：

```http
POST /api/v1/channel-events/{eventId}/join
DELETE /api/v1/channel-events/{eventId}/join
```

加入成功响应：

```json
{
  "joined": true,
  "participantCount": 29,
  "capacity": 60,
  "full": false,
  "conversationId": 501,
  "chatJoined": true
}
```

规则：

- `chatStatus=ACTIVE` 时，报名成功后后端必须自动将用户加入活动群聊。
- 取消报名时后端自动移出活动群聊，响应 `chatJoined=false`；群聊中写入系统记录，但不公开用户隐私信息以外的内容。
- `chatStatus=NOT_CREATED` 时，报名仍成功，`conversationId=null`、`chatJoined=false`。
- 群聊成员与活动报名成员保持一致，发起人始终保留在群内且不重复计数。

### 5.4 删除活动讨论帖

```http
DELETE /api/v1/channel-events/{eventId}/discussion-post
```

权限：仅活动发起人。

规则：

- 仅删除该活动自动关联的频道帖子及其评论，不删除活动本身。
- 删除后将 `linkedPostId` 设为 `null`；活动详情不再显示“讨论答疑”入口。
- 如活动原本未创建讨论帖，返回 `40400`，消息为“活动讨论帖不存在”。
- 此接口不允许删除用户自行发布、但标题恰好相同的帖子。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": { "eventId": 401, "linkedPostId": null }
}
```

### 5.5 解散活动群聊

```http
DELETE /api/v1/channel-events/{eventId}/chat
```

权限：仅活动发起人。

规则：

- 解散不是物理删除：后端保留群聊和消息记录以便审计，但所有普通成员无法再进入或发送消息。
- 活动的 `conversationId` 清空，`chatStatus` 变为 `DISSOLVED`，活动详情显示“活动群聊已解散”。
- 活动和关联讨论帖不受影响；已取消活动同样可以解散群聊。
- 该操作不可恢复；如需再次建群，需由发起人创建一个新的活动或后续单独提供“新建后续群聊”能力。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": { "eventId": 401, "conversationId": 501, "status": "DISSOLVED" }
}
```

### 5.6 通用聊天接口的约束扩展

既有接口保持不变：

```http
GET /api/v1/conversations
GET /api/v1/conversations/{conversationId}/messages
POST /api/v1/conversations/{conversationId}/messages
```

- 活动群聊在会话列表中增加 `sourceType=CHANNEL_EVENT`、`sourceId={eventId}`、`readOnly=false` 字段，普通群聊的 `sourceType=MANUAL`。
- `DISSOLVED` 活动群聊不出现在普通成员会话列表；发起人可在“已解散群聊”记录中查看历史。
- 对已解散活动群聊发送消息返回 `40900`，消息为“活动群聊已解散”。

## 6. 活动报名接口

### 5.1 加入活动

```http
POST /api/v1/channel-events/{eventId}/join
```

权限：

- 仅频道成员可加入。

业务规则：

- 活动状态必须是 `PUBLISHED`。
- 活动未结束。
- 当前时间未超过 `signupDeadline`。
- 如果设置了 `capacity`，报名人数不能超过上限。
- 重复加入返回当前报名状态，不重复增加人数。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "joined": true,
    "participantCount": 29,
    "capacity": 60,
    "full": false
  }
}
```

### 5.2 取消加入活动

```http
DELETE /api/v1/channel-events/{eventId}/join
```

权限：

- 仅已加入活动的频道成员可取消。

业务规则：

- 已取消、已结束活动不允许取消加入。
- 第一版默认允许用户在活动开始前取消加入。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "joined": false,
    "participantCount": 28,
    "capacity": 60,
    "full": false
  }
}
```

### 5.3 获取报名成员

```http
GET /api/v1/channel-events/{eventId}/participants?page=1&size=50
```

权限：

- 频道管理员可调用。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "userId": 1,
        "nickname": "珞珈同学",
        "joinedAt": "2026-07-10T10:05:00+08:00"
      }
    ],
    "page": 1,
    "size": 50,
    "total": 1
  }
}
```

## 7. 个人日历接口

### 6.1 获取我的日历活动

```http
GET /api/v1/calendar/events?from=2026-07-01T00:00:00+08:00&to=2026-07-31T23:59:59+08:00&status=UPCOMING
```

权限：

- 当前登录用户。

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `from` | datetime | 否 | 起始时间；为空默认当前月第一天 |
| `to` | datetime | 否 | 结束时间；为空默认当前月最后一天 |
| `status` | string | 否 | `UPCOMING`、`PAST`、`CANCELLED`，为空表示全部 |

说明：

- 只返回当前用户已加入的活动。
- 第一版按 `startTime ASC` 排序。

响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "id": 401,
      "channelId": 11,
      "channelName": "期末互助频道",
      "organizerId": 2,
      "organizerName": "遥遥",
      "linkedPostId": 301,
      "title": "离散数学考前答疑",
      "description": "集中讲解图论、递推和历年题。",
      "location": "信息学部 2 教 204",
      "startTime": "2026-07-15T19:00:00+08:00",
      "endTime": "2026-07-15T21:00:00+08:00",
      "signupDeadline": "2026-07-15T18:00:00+08:00",
      "capacity": 60,
      "participantCount": 28,
      "status": "PUBLISHED",
      "joined": true,
      "full": false,
      "ended": false,
      "canManage": false,
      "createdAt": "2026-07-10T10:00:00+08:00",
      "updatedAt": "2026-07-10T10:00:00+08:00"
    }
  ]
}
```

## 8. 错误码与边界

沿用现有 `ErrorCode`：

| 场景 | code | message 建议 |
| --- | --- | --- |
| 未登录 | `40100` | 未登录或 Token 过期 |
| 非频道成员访问活动 | `40302` | 未加入频道 |
| 非管理员发布、编辑、取消活动 | `40300` | 仅频道管理员可以执行该操作 |
| 活动不存在 | `40400` | 活动不存在 |
| 活动已取消 | `40900` | 活动已取消 |
| 活动已结束 | `40900` | 活动已结束 |
| 超过报名截止时间 | `40900` | 活动报名已截止 |
| 名额已满 | `40900` | 活动名额已满 |
| 时间参数不合法 | `40000` | 活动时间设置不合法 |
| 非发起人删除讨论帖/解散群聊 | `40300` | 仅活动发起人可以执行该操作 |
| 活动群聊不存在 | `40400` | 活动群聊不存在 |
| 活动群聊已解散 | `40900` | 活动群聊已解散 |

## 9. 建议数据库表

```sql
CREATE TABLE IF NOT EXISTS channel_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    channel_id BIGINT NOT NULL,
    organizer_id BIGINT NOT NULL,
    linked_post_id BIGINT NULL,
    conversation_id BIGINT NULL,
    chat_status VARCHAR(20) NOT NULL DEFAULT 'NOT_CREATED',
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    start_time DATETIME(3) NOT NULL,
    end_time DATETIME(3) NOT NULL,
    signup_deadline DATETIME(3) NULL,
    capacity INT NULL,
    participant_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_channel_event_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_event_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_channel_event_post FOREIGN KEY (linked_post_id) REFERENCES channel_posts(id) ON DELETE SET NULL,
    CONSTRAINT fk_channel_event_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
    CONSTRAINT chk_channel_event_status CHECK (status IN ('PUBLISHED', 'CANCELLED')),
    CONSTRAINT chk_channel_event_chat_status CHECK (chat_status IN ('NOT_CREATED', 'ACTIVE', 'DISSOLVED')),
    INDEX idx_channel_event_channel_start (channel_id, start_time),
    INDEX idx_channel_event_status_start (status, start_time)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS channel_event_participants (
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'JOINED',
    joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    cancelled_at DATETIME(3) NULL,
    PRIMARY KEY (event_id, user_id),
    CONSTRAINT fk_event_participant_event FOREIGN KEY (event_id) REFERENCES channel_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_participant_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_event_participant_status CHECK (status IN ('JOINED', 'CANCELLED')),
    INDEX idx_event_participant_user_status (user_id, status, joined_at)
) ENGINE=InnoDB;
```

## 10. 前端接入建议

建议新增 `src/api/events.js`：

```js
export function getChannelEvents(channelId, params) {}
export function createChannelEvent(channelId, payload) {}
export function getChannelEvent(eventId) {}
export function updateChannelEvent(eventId, payload) {}
export function cancelChannelEvent(eventId) {}
export function joinChannelEvent(eventId) {}
export function leaveChannelEvent(eventId) {}
export function getChannelEventParticipants(eventId, params) {}
export function getCalendarEvents(params) {}
export function createEventChat(eventId, payload) {}
export function dissolveEventChat(eventId) {}
export function deleteEventDiscussionPost(eventId) {}
```

页面接入顺序：

1. 在 `ChannelDetailPage.jsx` 的活动 Tab 接入 `GET /channels/{channelId}/events`。
2. 频道管理员显示“发布活动”按钮，接入 `POST /channels/{channelId}/events`。
3. 活动卡片接入加入/取消加入。
4. 在活动详情同时显示“讨论答疑”和“活动群聊”入口；报名成功后自动进入活动群聊成员集。
5. 发起人提供补建群聊、删除讨论帖、解散群聊的独立管理入口。
6. 新增个人日历页，接入 `GET /calendar/events`。
