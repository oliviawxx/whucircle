# WHU Circle 群聊管理 API v1

通用群聊管理接口复用既有 `/api/v1/conversations` 会话模型。仅 `GROUP` 会话可调用；私聊不显示管理侧栏，也不能使用下列接口。

## 权限

- 全部群成员：读取群信息、退出群聊。
- 群主：修改群名称、移除成员、转让群主、解散群聊。
- 群主不能直接退出，需先转让群主或解散群聊。
- 解散为逻辑解散，消息保留，成员不能再访问或发送消息。

## 接口

```http
GET    /api/v1/conversations/{conversationId}/group
PUT    /api/v1/conversations/{conversationId}/group/name
DELETE /api/v1/conversations/{conversationId}/group/members/{userId}
DELETE /api/v1/conversations/{conversationId}/group/members/me
PUT    /api/v1/conversations/{conversationId}/group/owner
DELETE /api/v1/conversations/{conversationId}/group
```

### 群详情

```json
{
  "id": 21,
  "name": "期末互助小组",
  "ownerId": 1,
  "status": "ACTIVE",
  "memberCount": 3,
  "mineOwner": true,
  "members": [{ "userId": 1, "nickname": "珞珈同学", "owner": true, "mine": true }]
}
```

### 改名与转让

```json
PUT /api/v1/conversations/21/group/name
{ "name": "期末互助小组 2" }

PUT /api/v1/conversations/21/group/owner
{ "userId": 6 }
```

两者均返回更新后的群详情。移除成员同样返回群详情；退出和解散返回 `{ "conversationId": 21, "status": "ACTIVE" }` 或 `{ "conversationId": 21, "status": "DISSOLVED" }`。
