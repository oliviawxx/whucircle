# WHU Circle 本地 MySQL

当前 SQL 目录负责创建数据库结构和可重复执行的示例数据。用户、笔记、通知和隐私设置 API 已提供 MySQL Repository。

## 本机实例

- MySQL：`D:\sql\mysql-9.7.1-winx64`
- 服务名：`MySQL`
- 地址：`127.0.0.1:3306`
- 数据库：`whu_circle`
- 应用账号：`whu_circle@localhost`

本机密码保存在 `backend/.env`，该文件已被 Git 忽略，不应提交。

## 初始化

在 PowerShell 中执行：

```powershell
cd D:\whu-circle-prototype\backend
$env:MYSQL_PWD="你的 root 密码"
& "D:\sql\mysql-9.7.1-winx64\bin\mysql.exe" -u root -h 127.0.0.1 -P 3306 --protocol=tcp --default-character-set=utf8mb4 < sql\001_schema.sql
Remove-Item Env:MYSQL_PWD
```

PowerShell 对 `<` 重定向支持有限时，可以使用：

```powershell
$env:MYSQL_PWD="你的 root 密码"
Get-Content -Raw -Encoding utf8 sql\001_schema.sql |
  & "D:\sql\mysql-9.7.1-winx64\bin\mysql.exe" -u root -h 127.0.0.1 -P 3306 --protocol=tcp --default-character-set=utf8mb4
Remove-Item Env:MYSQL_PWD
```

`001_schema.sql` 和 `002_seed.sql` 均可重复执行，现有表不会被删除。示例用户密码在 SQL 中使用 `{BCrypt}` 占位，后端首次以 `mysql` Profile 启动时会转换为 BCrypt 哈希；示例账号密码为 `example123`。

## 检查

```powershell
$env:MYSQL_PWD="你的应用账号密码"
& "D:\sql\mysql-9.7.1-winx64\bin\mysql.exe" -u whu_circle -h 127.0.0.1 -P 3306 --protocol=tcp -e "USE whu_circle; SHOW TABLES;"
Remove-Item Env:MYSQL_PWD
```

如果需要完全重建本地数据库，先人工确认数据不再需要，再由 root 用户删除 `whu_circle` 后重新执行脚本。建表脚本本身不会执行删除操作。
