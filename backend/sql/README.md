# WHU Circle 本地 MySQL 说明

`backend/sql` 目录用于初始化本地演示数据库。

## 文件说明

- `001_schema.sql`：创建 `whu_circle` 数据库、业务表和应用账号。
- `002_seed.sql`：写入演示用户、笔记、频道、聊天、通知等数据。

## 初始化顺序

```powershell
cd D:\whu-circle-prototype\backend
$env:MYSQL_PWD="你的 root 密码"
Get-Content -Raw -Encoding utf8 sql\001_schema.sql | mysql -u root -h 127.0.0.1 -P 3306 --protocol=tcp --default-character-set=utf8mb4
Get-Content -Raw -Encoding utf8 sql\002_seed.sql | mysql -u root -h 127.0.0.1 -P 3306 --protocol=tcp --default-character-set=utf8mb4
Remove-Item Env:MYSQL_PWD
```

如果 MySQL 没有加入 PATH，把 `mysql` 替换为本机实际路径，例如：

```powershell
& "D:\sql\mysql-9.7.1-winx64\bin\mysql.exe"
```

## 本地联调账号

应用连接数据库建议使用 `whu_circle` 账号。具体密码放在 `backend/.env`，不要提交到 Git。

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=whu_circle
DB_USERNAME=whu_circle
DB_PASSWORD=你的本机数据库密码
```

## 注意

- 每位成员在自己的电脑上初始化自己的 MySQL。
- 演示数据脚本可以重复执行。
- 脚本不会清空真实注册账号，但会更新固定 demo id 的演示数据。
- 如果要完全重建数据库，请先确认本机数据不再需要，再手动删除 `whu_circle` 后重新执行脚本。
