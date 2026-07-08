USE whu_circle;

SET @schema_name = DATABASE();

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT ''USER''',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = @schema_name AND table_name = 'users' AND column_name = 'role'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''ACTIVE''',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = @schema_name AND table_name = 'users' AND column_name = 'status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE channels ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''ACTIVE''',
        'SELECT 1'
    )
    FROM information_schema.columns
    WHERE table_schema = @schema_name AND table_name = 'channels' AND column_name = 'status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO users (id, email, password_hash, nickname, avatar_url, college, grade, bio, role, status) VALUES
(99, 'admin@whu.edu.cn', '$2a$10$yBvFn9fll.gGR2cCmChx0uRxSWZ9Bz/EoNIHNNCJSOjQ7E/f02fke', '全站管理员', '', '平台管理组', '管理员', '负责内容治理、账号和频道管理。', 'ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    nickname = VALUES(nickname),
    avatar_url = VALUES(avatar_url),
    college = VALUES(college),
    grade = VALUES(grade),
    bio = VALUES(bio),
    role = VALUES(role),
    status = VALUES(status);
