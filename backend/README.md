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
