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
全站管理员：admin@whu.edu.cn / example123
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
POST /api/v1/auth/reset-password   邮箱验证码重置密码
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
repository/mysql/ 全部业务 Repository 的 MySQL 实现
domain/           核心业务对象和枚举
dto/              请求与响应对象
security/         Bearer Token 解析和当前用户
config/           CORS、Swagger、拦截器注册
common/           统一响应、分页、错误码和异常处理
```

Controller、DTO 和 Service 在 mock/MySQL 两种模式下保持同一套接口格式。

## 本地 MySQL

本机已使用现有 MySQL 服务初始化 `whu_circle` 数据库。数据库只监听本机 `3306` 端口，项目使用账号为 `whu_circle`，密码保存在被 Git 忽略的 `.env` 中。

数据库结构位于：

```text
sql/001_schema.sql  24 张业务表、索引、约束和外键
sql/002_seed.sql    可重复执行的用户、笔记、频道、聊天示例数据
sql/003_admin_migration.sql  已有数据库补充全站管理员所需字段和演示账号
sql/README.md       初始化、检查和重建说明
```

检查本机数据库：

```powershell
$env:MYSQL_PWD="你的应用账号密码"
& "D:\sql\mysql-9.7.1-winx64\bin\mysql.exe" `
  -u whu_circle -h 127.0.0.1 -P 3306 --protocol=tcp `
  -e "USE whu_circle; SHOW TABLES;"
Remove-Item Env:MYSQL_PWD
```

### 当前数据库接入进度

已使用 MySQL 持久化：账号与登录令牌、注册验证码、个人资料、关注与拉黑、笔记、标签、图片、评论、点赞、收藏、通知、隐私设置、频道及帖子、聊天及已读状态、举报和推荐反馈。使用 `mysql` Profile 时，现有业务 API 不再依赖进程内数据，后端重启后数据仍然保留。

`mock` Profile 仍保留内存实现，供不安装数据库时快速预览和运行自动化测试；其接口格式与 MySQL 模式一致。

本机启动：

```powershell
cd D:\whu-circle-prototype\backend
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

测试账号为 `student@whu.edu.cn`，密码为 `example123`。全站管理员账号为 `admin@whu.edu.cn`，密码同为 `example123`。

如果数据库是在全站管理员功能之前初始化的，请在执行最新 `002_seed.sql` 前先执行 `sql/003_admin_migration.sql`，它会为旧表补充账号角色、账号状态和频道状态字段。

### 队友使用 Docker

安装并启动 Docker Desktop 后：

```powershell
git pull origin main
cd backend
Copy-Item .env.example .env
docker compose up -d
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

首次创建 Docker 数据卷时会自动执行 `sql/001_schema.sql` 和 `sql/002_seed.sql`。如果数据卷已经存在，MySQL 不会重复自动初始化；需要人工执行脚本或删除不再需要的旧数据卷后重建。

`docker-compose.yml` 作为其他成员未来创建独立本地 MySQL 的可选方案保留；当前展示电脑直接使用已安装的 MySQL 服务，不依赖 Docker。
