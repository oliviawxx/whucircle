# WHU Circle 开发环境配置说明

本文档用于统一三名成员的开发环境，避免出现“我这里能跑、你那里跑不了”的问题。建议所有安装路径尽量使用英文目录，不要放在带空格、中文或特殊符号较多的路径下。

推荐项目本地路径：

```text
D:\Projects\whu-circle
```

如果没有 D 盘，也可以使用：

```text
C:\Users\你的用户名\Documents\Projects\whu-circle
```

## 1. 大家都要安装的工具

### 1.1 Git

作用：

- 用于代码版本管理。
- 用于从 GitHub 拉取代码、提交代码、切换分支。

官方下载地址：

- https://git-scm.com/downloads/win

推荐安装位置：

```text
C:\Program Files\Git
```

安装步骤：

1. 打开官网，下载 Windows 版本安装包。
2. 双击安装包。
3. 安装选项大部分保持默认。
4. 遇到默认编辑器选择时，可以选择 VS Code。
5. 安装完成后打开 PowerShell，输入：

```bash
git --version
```

如果能显示版本号，说明安装成功。

首次配置：

```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub邮箱"
```

### 1.2 GitHub 账号

作用：

- 用于托管项目代码。
- 用于成员协作、分支管理、Pull Request 合并。

官网地址：

- https://github.com/

配置步骤：

1. 三名成员都注册 GitHub 账号。
2. 组长创建项目仓库，例如：

```text
whu-circle
```

3. 组长进入仓库 Settings，邀请另外两名成员加入协作。
4. 所有人把仓库 clone 到本地项目目录。

示例：

```bash
cd D:\Projects
git clone 仓库地址
cd whu-circle
```

### 1.3 GitHub Desktop（可选但推荐）

作用：

- 适合 Git 新手用图形界面查看改动、提交代码、切换分支。
- 不会替代 Git，但能降低操作难度。

官方下载地址：

- https://desktop.github.com/download/

推荐安装位置：

```text
C:\Users\你的用户名\AppData\Local\GitHubDesktop
```

说明：

- GitHub Desktop 默认安装在用户目录，保持默认即可。
- 安装后登录自己的 GitHub 账号。
- 通过 File -> Clone repository 克隆项目仓库。

### 1.4 VS Code

作用：

- 编写前端代码。
- 编辑 Markdown 文档、SQL 文件、配置文件。
- 查看 Git 改动。

官方下载地址：

- https://code.visualstudio.com/download

推荐安装位置：

```text
C:\Users\你的用户名\AppData\Local\Programs\Microsoft VS Code
```

安装步骤：

1. 下载 Windows User Installer x64。
2. 安装时建议勾选：

```text
Add to PATH
Register Code as an editor
Add "Open with Code" action
```

3. 安装完成后打开 PowerShell，检查：

```bash
code --version
```

推荐扩展：

```text
Chinese (Simplified) Language Pack
Prettier - Code formatter
ESLint
GitLens
Markdown All in One
```

### 1.5 Node.js

作用：

- 运行 Vue 前端项目。
- 提供 npm 包管理器，用于安装前端依赖。

官方下载地址：

- https://nodejs.org/en/download

推荐版本：

```text
Node.js LTS
```

当前官网显示的 LTS 版本是：

```text
v24.18.0 LTS
```

推荐安装位置：

```text
C:\Program Files\nodejs
```

安装步骤：

1. 下载 Windows Installer。
2. 双击安装，保持默认路径。
3. 确认安装选项中包含 npm。
4. 安装完成后打开新的 PowerShell，检查：

```bash
node -v
npm -v
```

如果能显示版本号，说明安装成功。

### 1.6 JDK

作用：

- 运行和编译 Spring Boot 后端项目。

官方下载地址：

- https://adoptium.net/temurin/releases/

推荐版本：

```text
JDK 21 LTS
```

推荐安装位置：

```text
C:\Program Files\Eclipse Adoptium\jdk-21
```

安装步骤：

1. 打开 Adoptium 官网。
2. 选择：

```text
Version: JDK 21 - LTS
Operating System: Windows
Architecture: x64
Package Type: JDK
Installer: .msi
```

3. 安装时建议勾选自动配置 JAVA_HOME。
4. 安装完成后打开新的 PowerShell，检查：

```bash
java -version
```

如果显示 Java 21 相关版本，说明安装成功。

### 1.7 Maven

作用：

- 管理 Java 后端项目依赖。
- 编译和运行 Spring Boot 项目。

官方下载地址：

- https://maven.apache.org/download.cgi

推荐版本：

```text
Apache Maven 3.9.16
```

推荐安装位置：

```text
C:\dev\apache-maven-3.9.16
```

安装步骤：

1. 下载 Binary zip archive。
2. 解压到：

```text
C:\dev\apache-maven-3.9.16
```

3. 配置系统环境变量：

```text
MAVEN_HOME = C:\dev\apache-maven-3.9.16
```

4. 在 Path 中添加：

```text
%MAVEN_HOME%\bin
```

5. 打开新的 PowerShell，检查：

```bash
mvn -v
```

如果能显示 Maven 版本和 Java 版本，说明安装成功。

### 1.8 MySQL

作用：

- 作为项目数据库。
- 存储用户、动态、评论、点赞、好友、消息等数据。

官方下载地址：

- https://dev.mysql.com/downloads/mysql/

推荐版本：

```text
MySQL 8.4 LTS
```

说明：

- 官网可能会显示更新的 9.x LTS 版本。
- 为了教程资料和兼容性更稳定，本项目建议统一使用 MySQL 8.4 LTS。

推荐安装位置：

```text
C:\Program Files\MySQL\MySQL Server 8.4
```

安装步骤：

1. 下载 MySQL Community Server 或 MySQL Installer。
2. 安装时选择 Server 类型。
3. 设置 root 密码，并记录在自己本地，不要提交到 GitHub。
4. 保持默认端口：

```text
3306
```

5. 安装完成后检查：

```bash
mysql --version
```

建议创建项目数据库：

```sql
CREATE DATABASE whu_circle DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.9 Apifox 或 Postman

作用：

- 编写接口文档。
- 测试后端接口。
- 前后端联调时确认请求参数和返回结果。

推荐使用 Apifox：

- https://apifox.com/

备选工具 Postman：

- https://www.postman.com/downloads/

推荐安装位置：

```text
C:\Users\你的用户名\AppData\Local\Apifox
```

或保持默认安装位置。

配置步骤：

1. 注册账号。
2. 新建团队或项目：

```text
WHU Circle
```

3. 新建接口分组：

```text
认证模块
用户模块
动态模块
评论模块
点赞模块
好友模块
消息模块
隐私设置模块
```

4. 统一接口返回格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 2. 前端负责人需要额外配置

### 2.1 VS Code 前端扩展

作用：

- 提高 Vue 项目开发效率。
- 自动格式化代码。
- 检查 JavaScript 和 Vue 语法问题。

需要安装：

```text
Vue - Official
ESLint
Prettier - Code formatter
Auto Rename Tag
Path Intellisense
```

安装步骤：

1. 打开 VS Code。
2. 点击左侧 Extensions。
3. 搜索扩展名称并安装。
4. 安装后重启 VS Code。

### 2.2 Vue 前端项目运行环境

作用：

- 启动和开发网页端项目。

官方文档：

- https://vuejs.org/guide/quick-start.html
- https://vite.dev/guide/

前端项目创建命令：

```bash
cd D:\Projects\whu-circle
npm create vue@latest frontend
cd frontend
npm install
npm run dev
```

创建项目时建议选择：

```text
Add TypeScript? No
Add JSX Support? No
Add Vue Router? Yes
Add Pinia? Yes
Add Vitest? No
Add End-to-End Testing? No
Add ESLint? Yes
Add Prettier? Yes
```

运行成功后，浏览器打开终端提示的地址，通常是：

```text
http://localhost:5173
```

### 2.3 前端负责人主要检查项

每次拉取代码后检查：

```bash
cd frontend
npm install
npm run dev
```

提交代码前检查：

```bash
npm run build
```

如果 build 失败，先不要提交到 dev 分支。

## 3. 后端负责人需要额外配置

### 3.1 IntelliJ IDEA

作用：

- 编写 Spring Boot 后端代码。
- 管理 Maven 依赖。
- 调试接口和后端业务逻辑。

官方下载地址：

- https://www.jetbrains.com/idea/download/

推荐版本：

```text
IntelliJ IDEA Community Edition
```

说明：

- Community Edition 免费，足够完成 Spring Boot 基础开发。
- 如果有学生认证或学校授权，也可以使用 Ultimate。

推荐安装位置：

```text
C:\Program Files\JetBrains\IntelliJ IDEA Community Edition
```

安装步骤：

1. 下载 IntelliJ IDEA Community Edition。
2. 安装时勾选：

```text
Add launchers dir to PATH
.java
.xml
.md
```

3. 打开 IDEA。
4. 在 Settings 中确认 JDK 选择为 JDK 21。
5. 打开 backend 项目，等待 Maven 自动下载依赖。

### 3.2 Spring Boot 项目创建

作用：

- 创建后端项目骨架。

官方创建网站：

- https://start.spring.io/

建议配置：

```text
Project: Maven
Language: Java
Spring Boot: 3.5.x stable
Group: edu.whu
Artifact: whu-circle-backend
Name: whu-circle-backend
Package name: edu.whu.circle
Packaging: Jar
Java: 21
```

建议添加依赖：

```text
Spring Web
Spring Validation
MySQL Driver
Lombok
```

如果后续使用 Spring Security，再添加：

```text
Spring Security
```

下载后放到：

```text
D:\Projects\whu-circle\backend
```

后端运行命令：

```bash
cd D:\Projects\whu-circle\backend
mvn spring-boot:run
```

默认访问地址：

```text
http://localhost:8080
```

### 3.3 后端负责人主要检查项

每次拉取代码后检查：

```bash
cd backend
mvn clean package
```

运行项目：

```bash
mvn spring-boot:run
```

如果后端启动失败，先检查：

```text
JDK 版本
Maven 是否可用
MySQL 是否启动
application.yml 数据库账号密码是否正确
```

## 4. 数据库与测试负责人需要额外配置

### 4.1 数据库管理工具

作用：

- 查看数据库表。
- 执行建表 SQL。
- 插入和检查测试数据。
- 辅助设计表结构。

推荐工具任选一个：

```text
DBeaver
MySQL Workbench
DataGrip
```

DBeaver 官网：

- https://dbeaver.io/download/

MySQL Workbench 通常可以随 MySQL Installer 一起安装。

DataGrip 官网：

- https://www.jetbrains.com/datagrip/

推荐：

- 如果想免费，用 DBeaver。
- 如果已经有 JetBrains 学生授权，可以用 DataGrip。

推荐安装位置：

```text
C:\Program Files\DBeaver
```

配置步骤：

1. 打开数据库管理工具。
2. 新建 MySQL 连接。
3. Host 填：

```text
localhost
```

4. Port 填：

```text
3306
```

5. Username 填：

```text
root
```

6. Password 填安装 MySQL 时设置的密码。
7. 测试连接成功后，创建或选择数据库：

```text
whu_circle
```

### 4.2 SQL 文件管理

作用：

- 保证所有人的数据库结构一致。
- 数据库改动可以被 Git 记录。

建议在项目中维护：

```text
sql
├─ 001_create_tables.sql
├─ 002_insert_test_data.sql
└─ README.md
```

要求：

- 每次改表结构，必须修改 SQL 文件。
- 不要只在自己本地数据库里改表。
- SQL 文件需要提交到 GitHub。

### 4.3 接口测试配置

作用：

- 验证后端接口是否符合接口文档。
- 给前端提供可参考的请求示例。

建议在 Apifox 中维护：

```text
WHU Circle API
├─ 认证模块
├─ 用户模块
├─ 动态模块
├─ 评论模块
├─ 点赞模块
├─ 好友模块
├─ 消息模块
└─ 隐私设置模块
```

每个接口至少写清楚：

```text
请求方法
接口路径
请求参数
请求示例
返回示例
错误情况
```

示例：

```text
POST /api/auth/login
```

返回示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "jwt-token",
    "userId": 1
  }
}
```

## 5. 统一协作配置

### 5.1 Git 分支规则

建议使用：

```text
main：稳定展示版本
dev：日常联调版本
feature/xxx：个人功能开发分支
```

示例：

```text
feature/frontend-login
feature/backend-auth
feature/database-schema
feature/post-module
feature/message-module
```

### 5.2 日常代码流程

每次开始写代码前：

```bash
git checkout dev
git pull
git checkout -b feature/你的功能名
```

写完后：

```bash
git status
git add .
git commit -m "feat: add login page"
git push origin feature/你的功能名
```

然后在 GitHub 上创建 Pull Request，合并到 dev。

### 5.3 提交信息格式

建议使用：

```text
feat: 新增功能
fix: 修复问题
docs: 修改文档
style: 样式调整
refactor: 代码重构
sql: 修改数据库脚本
test: 测试相关
```

示例：

```text
feat: add email register api
feat: add post list page
fix: fix duplicate like issue
docs: update api document
sql: add user table
```

### 5.4 组内必须同步的事项

以下事情不能自己悄悄改：

```text
数据库表结构变化
接口路径变化
接口请求参数变化
接口返回字段变化
登录 token 传递方式变化
文件上传路径变化
公共组件或公共工具函数变化
```

### 5.5 每日同步模板

每个人每天在群里发三句话：

```text
今天完成：
遇到问题：
下一步：
```

示例：

```text
今天完成：登录页面静态布局
遇到问题：验证码接口还没联调
下一步：接入注册接口并处理表单校验
```

## 6. 最终检查清单

每个人配置完成后，应能通过以下检查。

全员：

```bash
git --version
node -v
npm -v
java -version
mvn -v
mysql --version
```

前端：

```bash
cd frontend
npm install
npm run dev
```

后端：

```bash
cd backend
mvn clean package
mvn spring-boot:run
```

数据库：

```sql
SHOW DATABASES;
USE whu_circle;
SHOW TABLES;
```

接口测试：

```text
能在 Apifox 或 Postman 中成功请求后端测试接口。
```

## 7. 官方资料链接

- Git for Windows: https://git-scm.com/downloads/win
- GitHub: https://github.com/
- GitHub Desktop: https://desktop.github.com/download/
- VS Code: https://code.visualstudio.com/download
- Node.js: https://nodejs.org/en/download
- Vue Quick Start: https://vuejs.org/guide/quick-start.html
- Vite Guide: https://vite.dev/guide/
- Eclipse Temurin JDK: https://adoptium.net/temurin/releases/
- Apache Maven: https://maven.apache.org/download.cgi
- MySQL Community Server: https://dev.mysql.com/downloads/mysql/
- Spring Initializr: https://start.spring.io/
- Spring Boot System Requirements: https://docs.spring.io/spring-boot/system-requirements.html
- IntelliJ IDEA: https://www.jetbrains.com/idea/download/
- Apifox: https://apifox.com/
- Postman: https://www.postman.com/downloads/
- DBeaver: https://dbeaver.io/download/
