USE whu_circle;

INSERT INTO users (id, email, password_hash, nickname, avatar_url, college, grade, bio) VALUES
(1, 'student@whu.edu.cn', '{BCrypt}', '小张', '', '新闻与传播学院', '2024级', '记录校园生活和课程项目。'),
(2, 'wind@whu.edu.cn', '{BCrypt}', '珞珈山下的风', '', '计算机学院', '2023级', '喜欢散步和摄影。'),
(3, 'cat@whu.edu.cn', '{BCrypt}', '东湖边的猫', '', '外国语言文学学院', '2024级', '寻找学习搭子。'),
(4, 'orange@whu.edu.cn', '{BCrypt}', '一只小橘子', '', '测绘学院', '2022级', '周末出行记录。'),
(5, 'noodle@whu.edu.cn', '{BCrypt}', '热干面观察员', '', '经济与管理学院', '2023级', '认真吃饭，认真记录。'),
(6, 'lin@whu.edu.cn', '{BCrypt}', '林深时见鹿', '', '文学院', '2024级', '')
ON DUPLICATE KEY UPDATE nickname=VALUES(nickname), college=VALUES(college), grade=VALUES(grade), bio=VALUES(bio);

INSERT IGNORE INTO user_follows (follower_id, followed_id) VALUES
(1,2),(2,1),(1,3),(1,5),(5,1),(1,6),(6,1);

INSERT IGNORE INTO privacy_settings (user_id) SELECT id FROM users;

INSERT INTO notes (id, author_id, title, content, visibility, like_count, comment_count) VALUES
(101,2,'傍晚从樱顶走到湖边，光线刚刚好','想把今天的散步路线存一下。','PUBLIC',128,1),
(102,3,'求一个期末复习搭子','晚上在工学部图书馆复习。','PUBLIC',45,1),
(103,4,'磨山云海真的值得早起','六点到山顶的时候雾还没散。','PUBLIC',76,0),
(104,5,'今日食堂窗口记录','桂园二楼新出的鸡腿饭不错。','FRIENDS',63,0),
(105,1,'课程项目分工备忘','先定接口和页面，再开工。','PRIVATE',0,0)
ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content), visibility=VALUES(visibility);

INSERT IGNORE INTO note_tags (note_id,tag) VALUES (101,'校园生活'),(101,'摄影'),(102,'学习'),(102,'互助'),(103,'出行'),(103,'摄影'),(104,'食堂'),(105,'项目');
INSERT IGNORE INTO note_likes (note_id,user_id) VALUES (101,1);
INSERT IGNORE INTO note_saves (note_id,user_id) VALUES (102,1);
INSERT IGNORE INTO comments (id,note_id,author_id,content) VALUES (1001,101,3,'这个路线真的很适合晚上散步。'),(1002,102,1,'我今晚也在，可以一起自习。');

INSERT INTO channels (id,name,join_type,password_hash,administrator_id,announcement,member_count) VALUES
(11,'期末互助频道','PUBLIC',NULL,2,'置顶资料请先看公告。',3),
(12,'校园摄影社','PUBLIC',NULL,3,'本周主题：校园里的蓝色时刻。',3),
(13,'二手交换站','PASSWORD','whu2026',5,'交易请保留聊天记录。',1)
ON DUPLICATE KEY UPDATE name=VALUES(name),announcement=VALUES(announcement);
INSERT IGNORE INTO channel_members (channel_id,user_id,role) VALUES (11,1,'MEMBER'),(11,2,'ADMIN'),(11,3,'MEMBER'),(12,1,'MEMBER'),(12,3,'ADMIN'),(12,4,'MEMBER'),(13,5,'ADMIN');
INSERT IGNORE INTO channel_posts (id,channel_id,author_id,title,content,pinned,like_count,reply_count) VALUES
(301,11,2,'高数 A2 历年题整理','资料链接会持续更新。',TRUE,46,1),(302,11,6,'离散数学重点','先收集章节。',FALSE,31,0),(304,12,3,'樱顶日落机位集合','欢迎补充样片。',TRUE,52,0);
INSERT IGNORE INTO channel_replies (id,post_id,author_id,content) VALUES (3001,301,1,'收到，谢谢整理。');

INSERT IGNORE INTO conversations (id,type,name,last_message) VALUES (21,'GROUP','期末互助小组','聊天这里先做 HTTP 接口。'),(22,'PRIVATE','林深时见鹿','我把频道规则草稿发你了。');
INSERT IGNORE INTO conversation_members (conversation_id,user_id) VALUES (21,1),(21,2),(21,6),(22,1),(22,6);
INSERT IGNORE INTO messages (id,conversation_id,sender_id,content) VALUES (501,21,6,'今晚先把资料目录定下来。'),(502,21,1,'可以，我负责频道逻辑。'),(504,22,6,'我把频道规则草稿发你了。');
INSERT IGNORE INTO message_read_status (message_id,user_id) VALUES (501,1),(501,6),(502,1),(504,6);

INSERT IGNORE INTO notifications (id,user_id,type,title,content,target_id,is_read) VALUES
(1,1,'NOTE_LIKE','笔记收到点赞','林深时见鹿赞了你的笔记',105,FALSE),(2,1,'NOTE_COMMENT','笔记收到评论','东湖边的猫评论了你的笔记',105,FALSE);
