# WHU Circle MinIO 共享图片存储联调说明

这份文档给小组成员说明：加入 MinIO 之后，图片不再只保存在某一台后端机器的 `uploads/images` 目录里，而是统一保存到组长电脑上的共享对象存储中。这样几台电脑联调时，大家看到的笔记图片地址是同一个。

## 1. 当前联调结构

```text
队友浏览器
  ↓
队友本机前端 127.0.0.1:5173
  ↓ /api 代理
队友本机后端 127.0.0.1:8080
  ↓
组长 MySQL 3306        保存用户、笔记、评论、图片 URL
组长 MinIO 9000        保存图片文件
```

组长电脑负责长期运行：

- MySQL：保存业务数据。
- MinIO：保存图片文件。

队友电脑负责运行：

- 前端 Vite。
- 后端 Spring Boot。

## 2. 组长电脑需要启动什么

### 2.1 启动 MySQL

如果 MySQL 服务已经安装，可以在管理员 PowerShell 中启动：

```powershell
Start-Service MySQL
```

如果使用项目里的本地 MySQL 目录，可以临时启动：

```powershell
Start-Process -FilePath "D:\sql\mysql-9.7.1-winx64\bin\mysqld.exe" `
  -ArgumentList @("--basedir=D:\sql\mysql-9.7.1-winx64","--datadir=D:\sql\mysql-9.7.1-winx64\data","--port=3306","--console") `
  -WorkingDirectory "D:\sql\mysql-9.7.1-winx64"
```

检查：

```powershell
netstat -ano | findstr 3306
```

看到 `LISTENING` 表示 MySQL 已经启动。

### 2.2 启动 MinIO

MinIO 当前目录：

```text
D:\minio
```

启动：

```powershell
powershell -ExecutionPolicy Bypass -File D:\minio\start-minio.ps1
```

检查：

```powershell
netstat -ano | findstr 9000
netstat -ano | findstr 9001
```

也可以访问：

```text
http://127.0.0.1:9000/minio/health/live
http://127.0.0.1:9001
```

MinIO 控制台账号和密码在：

```text
D:\minio\minio.env
```

当前 bucket：

```text
whu-circle
```

图片公开访问前缀示例：

```text
http://10.135.9.161:9000/whu-circle
```

注意：如果组长电脑的校园网 IP 变化，`10.135.9.161` 也会变化，需要重新告诉队友新的地址。更稳定的做法是使用 Tailscale IP 或内网穿透域名。

## 3. 组长电脑防火墙和端口

组长电脑需要允许这些入站端口：

```text
3306  MySQL
9000  MinIO API 和图片访问
9001  MinIO 控制台
```

管理员 PowerShell 示例：

```powershell
New-NetFirewallRule -DisplayName "WHU Circle MinIO API 9000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 9000
New-NetFirewallRule -DisplayName "WHU Circle MinIO Console 9001" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 9001
```

如果队友只需要看图和上传图，通常只需要开放 `9000`。`9001` 是管理控制台，最好只给组长自己使用。

## 4. 队友电脑后端配置

队友需要在 `backend/.env` 中配置连接组长的 MySQL 和 MinIO。

示例：

```env
DB_URL=jdbc:mysql://组长可访问地址:3306/whu_circle?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
DB_USERNAME=whu_circle
DB_PASSWORD=向组长获取

STORAGE_TYPE=s3
S3_ENDPOINT=http://组长可访问地址:9000
S3_BUCKET=whu-circle
S3_ACCESS_KEY=向组长获取
S3_SECRET_KEY=向组长获取
S3_PUBLIC_BASE_URL=http://组长可访问地址:9000/whu-circle
```

如果大家在同一个校园网，可以先用组长当前 WLAN 地址：

```env
S3_ENDPOINT=http://10.135.9.161:9000
S3_PUBLIC_BASE_URL=http://10.135.9.161:9000/whu-circle
```

重要：`S3_PUBLIC_BASE_URL` 必须是队友浏览器也能访问的地址，不能写 `127.0.0.1`。`127.0.0.1` 只代表每个人自己的电脑。

## 5. 队友电脑启动后端

进入后端目录：

```powershell
cd D:\whu-circle-prototype\backend
```

启动 MySQL profile：

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
```

检查：

```text
http://127.0.0.1:8080/api/v1/health
```

正常返回中应该能看到：

```json
{
  "profile": "mysql",
  "status": "UP"
}
```

## 6. 队友电脑启动前端

进入项目根目录：

```powershell
cd D:\whu-circle-prototype
```

启动：

```powershell
npm run dev
```

访问：

```text
http://127.0.0.1:5173
```

登录测试账号：

```text
student@whu.edu.cn
example123
```

## 7. 图片测试方式

### 7.1 直接测试 MinIO 图片是否可访问

在队友浏览器里打开一张 MinIO 图片，例如：

```text
http://10.135.9.161:9000/whu-circle/notes/seed-assets/note-101-campus-walk.jpg
```

如果能看到图片，说明队友电脑可以访问组长 MinIO。

### 7.2 在网站里测试

1. 组长启动 MySQL 和 MinIO。
2. 队友启动后端和前端。
3. 队友打开 `http://127.0.0.1:5173`。
4. 登录 `student@whu.edu.cn / example123`。
5. 进入主页，查看带图片的笔记。

如果网站接口正常但图片不显示，优先检查：

- 队友浏览器能不能直接打开 MinIO 图片 URL。
- `S3_PUBLIC_BASE_URL` 是否写成了 `127.0.0.1`。
- 组长防火墙是否放行 `9000`。
- 组长 MinIO 是否还在运行。
- 组长电脑 IP 是否变化。

## 8. 当前注意事项

- MinIO 只解决图片文件共享；笔记、评论、用户等业务数据仍然在 MySQL。
- 数据库里保存的是图片 URL，不保存图片二进制内容。
- MinIO 的写入密钥只应该放在后端 `.env`，不要写到前端代码，也不要提交到 Git。
- 如果将来使用内网穿透域名，建议统一把 `S3_ENDPOINT` 和 `S3_PUBLIC_BASE_URL` 换成穿透域名，避免校园网 IP 变化。
