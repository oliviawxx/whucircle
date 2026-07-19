# WHU Circle（武大校园圈）

WHU Circle 是一个校园社交媒体平台的初步完整版原型，当前重点是本地演示和前后端联调。项目包含 React + Vite 前端、Spring Boot 后端和 MySQL 初始化脚本。

## 当前进度

- 登录、注册、邮箱验证码、找回密码页面已接入后端接口。
- 主页笔记瀑布流、笔记详情、评论、点赞、收藏、搜索、用户搜索和标签筛选已接入接口。
- 社交圈、关注/好友关系、好友可见内容已接入接口。
- 频道列表、加入频道、频道帖子、帖子详情、回复、点赞、置顶、公告和管理员申请已接入接口。
- 频道管理员体系：管理员控制台、申请/邀请/审批流程已接入。
- 聊天列表、好友私聊、群聊、发送消息和已读标记已接入接口。
- 通知弹层、隐私设置（8 项）、举报入口已接入接口。
- 个性化推荐：首页混合推荐笔记、用户、频道，基于多因子评分算法。
- 图片上传：本地开发存储于 `uploads/images`；团队联调通过 MinIO 对象存储共享。
- 全站管理面板：用户/频道封禁解封、删除违规笔记/帖子。
- MySQL 版本已准备建表脚本、演示数据脚本和迁移脚本，队友拉取后可以在本机初始化同样的数据环境。

## 项目结构

```text
whu-circle-prototype/
├─ src/                         前端源码
├─ backend/                     Spring Boot 后端
│  ├─ src/main/java/com/whucircle/
│  └─ sql/                      MySQL 建表和演示数据
├─ docs/                        项目文档
│  ├─ design/                   当前系统设计说明书
│  ├─ api/                      API 与联调约定
│  ├─ guides/                   数据库、MinIO 等过程文档
│  ├─ report/                   实践报告模板及 Markdown 转换版
│  ├─ screenshots/              联调与问题截图
│  └─ archive/                  早期方案和历史版本归档
├─ logs/                        本地运行日志归档
├─ README.md                    项目启动和协作说明
└─ Makefile                     前后端统一构建入口
```

完整文档导航见 [`docs/README.md`](docs/README.md)。

## 本地环境

- Node.js：建议使用当前 LTS 版本。
- npm：随 Node.js 安装。
- JDK：17 或以上。
- Maven：3.9 或以上。
- MySQL：8.0 或以上。本机演示使用数据库 `whu_circle`。

## 数据库初始化

后端 MySQL 脚本在 `backend/sql`：

- `001_schema.sql`：创建数据库、表结构和应用账号。
- `002_seed.sql`：写入可重复执行的演示数据，不会清空真实注册账号。

PowerShell 示例：

```powershell
cd D:\whu-circle-prototype\backend
$env:MYSQL_PWD="你的 root 密码"
Get-Content -Raw -Encoding utf8 sql\001_schema.sql | mysql -u root -h 127.0.0.1 -P 3306 --protocol=tcp --default-character-set=utf8mb4
Get-Content -Raw -Encoding utf8 sql\002_seed.sql | mysql -u root -h 127.0.0.1 -P 3306 --protocol=tcp --default-character-set=utf8mb4
Remove-Item Env:MYSQL_PWD
```

如果本机没有把 MySQL 加入 PATH，把 `mysql` 改成实际路径，例如：

```powershell
& "D:\sql\mysql-9.7.1-winx64\bin\mysql.exe"
```

## 后端配置

后端读取环境变量连接数据库。推荐在 `backend/.env` 中保存本机配置，`.env` 已被 Git 忽略，不要提交。

示例：

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=whu_circle
DB_USERNAME=whu_circle
DB_PASSWORD=你的本机数据库密码
```

邮箱验证码有两种模式：

- `mysql`：本地联调用，验证码会由后端返回，方便测试。
- `mysql,smtp`：真实邮箱发送，需要配置 SMTP 环境变量。

## 启动项目

需要开两个 PowerShell 窗口。

后端窗口：

```powershell
cd D:\whu-circle-prototype\backend
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

前端窗口：

```powershell
cd D:\whu-circle-prototype
npm install
npm run dev
```

访问地址：

- 前端页面：http://127.0.0.1:5173
- 后端健康检查：http://127.0.0.1:8080/api/v1/health
- Swagger 接口页：http://127.0.0.1:8080/swagger-ui/index.html

前端通过 Vite 代理把 `/api` 请求转发到 `http://127.0.0.1:8080`。所以前端和后端必须同时启动，页面里的接口才会正常返回。

## 终止项目

如果是在终端里手动启动的，进入对应窗口按：

```powershell
Ctrl+C
```

如果忘记哪个窗口在运行，可以按端口停止：

```powershell
$ports = @(5173, 8080)
$listeners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $ports -contains $_.LocalPort }
$processIds = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($processId in $processIds) { Stop-Process -Id $processId -Force }
```

## 检查命令

### 使用 Makefile 统一构建

项目根目录提供 `Makefile`，用于统一执行前端 Vite 构建和后端 Maven 构建。

Windows 首次使用时安装 GNU Make：

```powershell
winget install --id GnuWin32.Make --exact
```

安装完成后重新打开 PowerShell，在项目根目录执行：

```powershell
cd D:\whu-circle-prototype
make
```

默认的 `make` 等价于 `make build`，依次执行：

1. 检查 Node.js、npm、JDK 和 Maven。
2. 使用 Vite 编译前端，产物写入 `dist/`。
3. 使用 Maven 编译并打包后端，产物写入 `backend/target/`。

常用目标：

```powershell
make install        # 安装并预下载前后端依赖
make build          # 构建前端和后端
make test           # 运行后端自动化测试
make clean          # 删除构建产物
make frontend-dev   # 启动前端开发服务器
make backend-dev    # 从 backend/.env 加载配置并启动后端
make help           # 查看命令说明
```

`make build` 只执行编译和打包，不要求 MySQL、MinIO 或前后端服务已经启动；`make backend-dev` 使用 MySQL Profile，启动前需要保证数据库和 `backend/.env` 配置可用。

前端构建：

```powershell
cd D:\whu-circle-prototype
npm run build
```

后端测试：

```powershell
cd D:\whu-circle-prototype\backend
mvn test
```

## 协作注意

- 拉取代码后先执行 `npm install`，再启动前端。
- 数据库只初始化本机，不需要连接组长电脑的数据库。
- 不要提交 `backend/.env`、本地日志、数据库密码和邮箱授权码。
- 开发页面时尽量通过 `src/api` 中已有方法调用后端，避免在组件里直接写完整接口地址。
- 如果接口字段需要调整，先更新 `docs/api/WHU_Circle_后端API开发清单.md`，再修改前后端代码。
