# WHU Circle（武大校园圈）

WHU Circle 是面向武汉大学学生的网页端社交媒体项目。仓库目前同时包含 React 前端展示版和可运行的 Spring Boot REST API。

## 项目结构

```text
src/          React + Vite 前端原型
backend/      Spring Boot 后端 API
WHU_Circle_后端API开发清单.md  接口、分工与联调文档
```

## 前端预览

要求：Node.js LTS。

```powershell
npm install
npm run dev
```

浏览器打开终端显示的地址，通常是 <http://127.0.0.1:5173>。

## 后端启动

要求：JDK 17+、Maven 3.9.x。

```powershell
cd backend
mvn spring-boot:run
```

默认不连接数据库。Swagger 地址为 <http://127.0.0.1:8080/swagger-ui/index.html>，联调 Token 为 `demo-access-token`。

详细账号、接口代码位置、三人分工与联调步骤见
[后端 API 开发与联调文档](WHU_Circle_后端API开发清单.md)。

## 协作规则

1. 开始开发前执行 `git pull origin main`。
2. 每人使用自己的功能分支，例如 `feature/frontend-api`、`feature/mysql-repository`。
3. 一个提交只处理一类改动，不提交 `node_modules/`、`dist/`、`backend/target/` 或 `.env`。
4. 合并前至少执行本人负责部分的构建或测试。
