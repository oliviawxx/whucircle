# WHU Circle 前端原型

这是 WHU Circle（武大校园圈）的网页端前端原型，用于小组讨论页面结构、排版风格和基础交互效果。

当前版本主要展示：

- 左侧导航栏
- 经典蓝、樱花粉、东湖绿、夜樱紫主题切换
- 动态广场
- 发布动态输入框
- 动态图片展示
- 点赞交互
- 推荐好友
- 校园发现
- 隐私快捷设置
- 私信与群聊抽屉
- 基础响应式布局

## 1. 需要先安装的软件

所有成员本机需要安装：

- Git
- Node.js LTS
- VS Code（推荐）

官方下载地址：

- Git: https://git-scm.com/downloads/win
- Node.js: https://nodejs.org/en/download
- VS Code: https://code.visualstudio.com/download

安装完成后，在 PowerShell 中检查：

```bash
git --version
node -v
npm -v
```

能看到版本号就说明安装成功。

## 2. 拉取项目

在自己想保存项目的位置打开 PowerShell，例如：

```bash
cd D:\Projects
```

然后拉取 GitHub 仓库：

```bash
git clone https://github.com/oliviawxx/whucircle.git
cd whucircle
```

如果本机没有 D 盘，也可以放在文档目录：

```bash
cd C:\Users\你的用户名\Documents
git clone https://github.com/oliviawxx/whucircle.git
cd whucircle
```

## 3. 安装依赖

进入项目目录后执行：

```bash
npm install
```

这个命令会根据 `package.json` 下载前端运行需要的依赖。

## 4. 本机预览

安装依赖后执行：

```bash
npm run dev
```

启动成功后，终端会显示一个本地地址，通常是：

```text
http://127.0.0.1:5173
```

用浏览器打开这个地址，就可以看到当前前端原型。

如果终端提示：

```text
Port 5173 is in use, trying another one...
Local: http://127.0.0.1:5174/
```

说明 `5173` 端口已经被另一个本地服务占用。此时应该打开终端实际显示的新地址，例如：

```text
http://127.0.0.1:5174/
```

## 5. 打包检查

如果想确认项目能正常构建，可以执行：

```bash
npm run build
```

构建成功后会生成 `dist` 文件夹。这个文件夹是构建产物，不需要提交到 GitHub。

## 6. 常见问题

### 6.1 npm install 很慢

可以换一个网络环境后重试，或者使用国内镜像：

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 6.2 端口被占用

如果 `5173` 端口被占用，可以使用：

```bash
npm run dev -- --port 5174
```

然后打开终端提示的新地址。

### 6.3 页面打不开

先确认终端里的开发服务器还在运行。如果关闭了终端，需要重新执行：

```bash
npm run dev
```

## 7. 小组协作建议

- `main` 分支保持可运行版本。
- 日常开发先新建自己的功能分支。
- 不要提交 `node_modules`、`dist`、`.env` 等本地文件。
- 修改页面风格前，先在小组群里说明修改目标。
- 每次提交尽量只包含一类改动。

常用提交信息示例：

```text
feat: add prototype homepage
style: adjust feed layout
docs: update preview guide
fix: fix mobile layout
```
