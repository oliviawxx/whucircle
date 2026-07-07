# WHU Circle 后端

这是与当前前端展示版对应的 REST API。默认使用 `mock` Profile，数据保存在内存中，不需要先安装 MySQL。

## 快速启动

要求：JDK 17 或更高版本、Maven 3.9.x。

```powershell
cd backend
mvn spring-boot:run
```

启动后可访问：

- 健康检查：<http://127.0.0.1:8080/api/v1/health>
- Swagger：<http://127.0.0.1:8080/swagger-ui/index.html>
- OpenAPI JSON：<http://127.0.0.1:8080/v3/api-docs>

Swagger 右上角 `Authorize` 填写 `demo-access-token`，不需要手动添加 `Bearer`。

## 联调账号

```text
邮箱：student@whu.edu.cn
密码：example123
固定验证码：123456
固定 Token：demo-access-token
```

除登录、注册、验证码和健康检查外，请求都需要：

```http
Authorization: Bearer demo-access-token
```

## 测试

```powershell
mvn test
```

当前集成测试覆盖登录、鉴权、笔记可见性、社交圈、频道预览限制和频道密码错误。

## 登录、注册与个人资料接口

```text
POST /api/v1/auth/email-code       发送注册验证码
POST /api/v1/auth/register         校内邮箱注册
POST /api/v1/auth/login            校内邮箱和密码登录
GET  /api/v1/auth/me               获取当前登录用户摘要
GET  /api/v1/users/me/profile      获取可编辑个人资料
PUT  /api/v1/users/me/profile      更新个人资料
```

允许注册和登录的邮箱域名由 `whu-circle.auth.allowed-email-domains` 配置，当前为 `whu.edu.cn`。密码使用 BCrypt 哈希保存。

## 使用 QQ 邮箱发送验证码

QQ 邮箱在这里是 SMTP 发件账号，不是注册邮箱，也不是邮件转发。收件人仍然必须使用武汉大学校内邮箱。

1. 登录 QQ 邮箱，在账号与安全设置中开启 SMTP 服务并生成授权码。
2. 复制 `.env.example` 中的变量名称，在本机设置真实值。
3. `MAIL_AUTH_CODE` 填授权码，不填 QQ 登录密码。
4. 同时启用 `mock` 数据和 `smtp` 邮件 Profile：

```powershell
$env:MAIL_USERNAME="你的QQ号@qq.com"
$env:MAIL_AUTH_CODE="QQ邮箱生成的授权码"
$env:MAIL_FROM=$env:MAIL_USERNAME
mvn spring-boot:run "-Dspring-boot.run.profiles=mock,smtp"
```

默认 `mock` 模式不发送邮件，固定验证码为 `123456`。不要把 `.env`、QQ 邮箱授权码或服务器密码提交到 GitHub。

## 目录职责

```text
controller/       HTTP 路由和参数接收
service/          可见性、关系、频道和聊天等业务规则
repository/       与存储方式无关的数据接口
repository/mock/  当前可运行的内存实现
domain/           核心业务对象和枚举
dto/              请求与响应对象
security/         Bearer Token 解析和当前用户
config/           CORS、Swagger、拦截器注册
common/           统一响应、分页、错误码和异常处理
```

数据库接入时保留 Controller、DTO 和 Service，新增 `repository/mysql/` 实现 Repository 接口。

## MySQL 容器

数据库成员可以先复制环境变量示例，再启动 MySQL 8.4：

```powershell
Copy-Item .env.example .env
docker compose up -d
docker compose ps
```

当前 `mysql` Profile 只预留连接配置，尚未加入 JPA 驱动和 Repository 实现。完成数据库代码前不要切换 Profile。
